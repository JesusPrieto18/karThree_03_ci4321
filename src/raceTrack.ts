import * as THREE from 'three';
import { scene } from './scene';
import { collisionObserver } from './utils/colliding';
import { aabbIntersects } from './utils/utils';
import type { CollisionClassName } from './models/colisionClass';
import { Bomb } from './bomb';
import { getTexture } from './utils/textureManager';

/**
 * RaceTrack
 *
 * Encapsulates a ground plane used as the racing track.
 * - Adds itself to the global scene.
 * - Registers with the global collision observer so collisions with projectiles
 *   or other objects can be detected.
 *
 * Constructor parameters:
 *  - width / length: size of the track plane.
 *  - color: base color of the track surface.
 */

/**
 * Ground
 *
 * Encapsulates a ground plane.
 * - Adds itself to the global scene.
 * - Registers with the global collision observer so collisions with projectiles
 *   or other objects can be detected.
 *
 * Constructor parameters:
 *  - width / length: size of the track plane.
 *  - color: base color of the track surface.
 */
export class RaceTrack {
  private group = new THREE.Group();

  /**
   * Build a horizontal plane and register it in the scene + collision system.
   * @param size plane width (X axis)
   * @param thickness plane thickness (Z axis)
   * @param color material color for the track
   */
  constructor(size: number = 1, thickness: number = 0.05, color: number = 0x222222) {
        
    const texture = getTexture('raceTrack.texture');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10);

    const textureNormal = getTexture('raceTrack.normal');
    textureNormal.wrapS = THREE.RepeatWrapping;
    textureNormal.wrapT = THREE.RepeatWrapping;
    textureNormal.repeat.set(1, 10);

    const mat = new THREE.MeshStandardMaterial({side: THREE.DoubleSide, map: texture, normalMap: textureNormal });

    const horizontalGeo = new THREE.PlaneGeometry(thickness, size); // top/bottom
    const verticalGeo = new THREE.PlaneGeometry(thickness, size);   // left/right
    
    const top = new THREE.Mesh(horizontalGeo, mat);
    const bottom = new THREE.Mesh(horizontalGeo, mat);

    const left = new THREE.Mesh(verticalGeo, mat);
    const right = new THREE.Mesh(verticalGeo, mat);

    // Put all plane around origin
    top.position.set(0,  size / 2 - thickness / 2, 0);
    top.rotation.z = Math.PI/2;
    top.position.z += 0.02; // slight offset to avoid z-fighting

    bottom.position.set(0, -size / 2 + thickness / 2, 0);
    bottom.rotation.z = Math.PI/2;
    bottom.position.z += 0.02; // slight offset to avoid z-fighting

    left.position.set(-size / 2 + thickness / 2, 0, 0);
    left.rotation.z = -Math.PI;

    right.position.set( size / 2 - thickness / 2, 0, 0);
    right.rotation.z = -Math.PI;
    
    this.group.add(top, bottom, left, right);
    this.group.receiveShadow = true;

    // Rotate the group to be horizontal (lay flat on the XZ plane)
    this.group.rotation.x = -Math.PI / 2;
    // Slight offset to avoid z-fighting with other ground elements
    this.group.position.y = 0.02;
    // Add visual mesh to the global scene
    scene.add(this.group);
    // Register this object for collision checks
    collisionObserver.addColisionObject(this);
  }

  /**
   * getBody - return the underlying THREE.Mesh for external use (positioning, queries).
   */
  public getBody(): THREE.Group {
    return this.group;
  }

  /**
   * isColliding - called by the collision system when testing collisions.
   * Example behavior: if a launched Bomb intersects the track, trigger the bomb's explosion.
   *
   * @param target Candidate object to test against (expected to be types like Bomb).
   */
  public isColliding(target: CollisionClassName): void {
    // Only react to launched Bomb instances
    if (target instanceof Bomb && target.getLaunched()) {
      const bombBody = target.getBody();
      if (aabbIntersects(this.group, bombBody)) {
        console.log('Bomb touched the ground (RaceTrack)');
        // Call explode() if the bomb provides that method
        target['explode']?.();
      }
    }
  }

  /**
   * deleteScene - remove the track mesh from the scene and mark for collision cleanup.
   * Use this when you want to remove the track and unregister it from collisions.
   */
  public deleteScene(): void {
    scene.remove(this.group);
    // Mark for removal in the collision observer so it no longer participates in checks
    collisionObserver.addObjectToRemove(this);
  }
}
