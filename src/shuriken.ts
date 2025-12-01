import * as THREE from 'three';
import { scene } from './scene';
import { vertices, faces, colors } from './shurikenInfo';
import { collisionObserver } from './utils/colliding';
import { aabbIntersects, reflectDirection, resolvePenetrationProyectil } from './utils/utils';
import { TrafficCone } from './trafficCone';
import { Walls } from './walls';
import type { CollisionClassName } from './models/colisionClass';
import type { Kart } from './kart';

/**
 * Shuriken - a small throwable projectile used as a power-up.
 *
 * Responsibilities:
 *  - Build and expose a mesh to the scene.
 *  - Maintain velocity, state (launched/crashed) and bounce count.
 *  - Register itself with the global collision observer and respond to collisions.
 *  - Provide helpers to position, move and dispose the visual mesh.
 */
export class Shuriken {
  // Visual mesh for the shuriken
  private mesh: THREE.Mesh;
  // Optional name used for debugging / lookup
  private name?: string;
  // Movement direction and speed stored as a velocity vector
  private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, -1);
  // State flags
  private crashed: boolean = false;
  private launched: boolean = false;
  // Number of times the shuriken has bounced against walls
  private bounces: number = 0;
  // Index to identify this shuriken in parent's launched projectiles list
  private index: number = -1;
  // Optional back-reference to the kart that launched it
  public parent: Kart | undefined = undefined;

  /**
   * Constructor - builds geometry/material, adds the mesh to the scene and
   * registers this instance with the collision observer.
   * @param name optional string to set mesh.name for debugging
   */
  constructor(name?: string) {
    this.name = name;
    const geometry = this.buildGeometry();
    /*
    const loader = new THREE.TextureLoader();
    const aoTexture = loader.load('src\\textures\\PowerUps\\Shuriken\\metal_0080_ao_1k.jpg');
    aoTexture.wrapS = THREE.RepeatWrapping;
    aoTexture.wrapT = THREE.RepeatWrapping;
    aoTexture.repeat.set(10, 10);
    const texture = loader.load('src\\textures\\\PowerUps\\Shuriken\\metal_0080_color_1k.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10,10)
    const textureNormal = loader.load('src\\textures\\PowerUps\\Shuriken\\metal_0080_normal_directx_1k.png');
    textureNormal.wrapS = THREE.RepeatWrapping;
    textureNormal.wrapT = THREE.RepeatWrapping;
    textureNormal.repeat.set(10,10)
    */
    const material = new THREE.MeshStandardMaterial({vertexColors: true });
    this.mesh = new THREE.Mesh(geometry, material);
    if (this.name) this.mesh.name = this.name;
    this.mesh.scale.set(0.1, 0.1, 0.1);
    scene.add(this.mesh);
    // Register for collision checks
    collisionObserver.addColisionObject(this);
    // Add a small helper to visualize local axes while debugging
    //this.mesh.add(new THREE.AxesHelper(3));
  }

  /**
   * getBody - return the THREE.Mesh representing this shuriken.
   */
  public getBody(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * addScene - ensure the mesh is attached to the scene (safe to call if removed).
   */
  public addScene(): void {
    scene.add(this.mesh);
  }

  /**
   * deleteScene - remove the mesh from the scene visual graph.
   * Note: does not automatically dispose geometry/materials here.
   */
  public deleteScene(): void {
    scene.remove(this.mesh);
  }

  /**
   * getVelocity - returns a clone of the internal velocity vector.
   * Clone prevents external code from mutating the internal state directly.
   */
  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  /**
   * setVelocity - orient and position the shuriken to match a given Object3D.
   * - Uses the object's world forward direction to set the shuriken direction.
   * - Moves the shuriken to the object's world position (spawn point).
   *
   * @param object reference object whose forward direction and position are used
   */
  public setVelocity(object: THREE.Object3D): void {
      const shurikenDirection = new THREE.Vector3(0, 0, -1);
      object.getWorldDirection(shurikenDirection);

      const shurikenWorldPosition = new THREE.Vector3();
      object.getWorldPosition(shurikenWorldPosition);
      this.mesh.position.copy(shurikenWorldPosition);

      // store direction as velocity (caller may scale later)
      this.velocity = shurikenDirection;
  }

  /**
   * buildGeometry - constructs a BufferGeometry from shared vertex/index/color arrays,
   * computes normals and returns the geometry ready for a mesh.
   */
  private buildGeometry(): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(faces);
    geometry.computeVertexNormals();
    return geometry;
  }

  /**
   * Position helpers - get/set position or individual axes.
   */
  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
  public setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }
  public setX(x: number): void {
    this.mesh.position.x = x;
  }
  public setY(y: number): void {
    this.mesh.position.y = y;
  }
  public setZ(z: number): void {
    this.mesh.position.z = z;
  }

  /**
   * Small movement helpers to adjust the mesh position directly.
   */
  public moveX(delta: number): void {
    this.mesh.position.x += delta;
  }
  public moveY(delta: number): void {
    this.mesh.position.y += delta;
  }
  public moveZ(delta: number): void {
    this.mesh.position.z += delta;
  }

  /**
   * rotateY - rotate the visual mesh around its Y axis.
   * @param angleRad angle in radians to add to current rotation.y
   */
  public rotateY(angleRad: number): void {
    this.mesh.rotation.y += angleRad;
  };

  /**
   * moveForward - translate along the current velocity vector.
   * @param distance scalar distance to move in the velocity direction
   */
  public moveForward(distance: number): void {
    this.mesh.position.addScaledVector(this.velocity, distance);
  }

  /**
   * setCrashed - return whether the shuriken is marked as crashed.
   */
  public setCrashed(): boolean {
    return this.crashed;
  }

  /**
   * setLaunched / getLaunched - set and query the launched flag.
   * setLaunched logs the change for debugging.
   */
  public setLaunched(launched: boolean): void {
    console.log("Shuriken lanzado:", launched);
    this.launched = launched;
  }
  public getLaunched(): boolean {
    return this.launched;
  }

  /**
   * getBounces - returns how many times the shuriken has bounced.
   */
  public getBounces(): number {
    return this.bounces;
  }

  /**
   * setIndex / getIndex - set and get the index used to identify this shuriken
   * in the parent's launched projectiles list.
   */

  public setIndex(index: number): void {
    this.index = index;
  }

  public getIndex(): number {
    return this.index;
  }

  /**
   * isColliding - collision callback used by the collision system.
   * - reacts to TrafficCone collisions by removing the shuriken from its parent list
   *   and scheduling this instance for observer removal.
   * - reacts to Walls collisions when launched:
   *   * resolves penetration to avoid sticking,
   *   * reflects the velocity vector with some energy loss,
   *   * increments bounces and removes the shuriken after too many bounces.
   *
   * @param target collision candidate (TrafficCone, Walls, etc.)
   */
  public isColliding(target: CollisionClassName): void {
    if (target instanceof TrafficCone) {
      if (aabbIntersects(this.mesh, target.getBody())) {
        console.log("COLISION CON TRAFFIC CONE DESDE SHURIKEN");
        if (this.mesh.parent) {
          // remove from parent's children and notify parent kart to remove projectile reference
          let index = this.mesh.parent.children.indexOf(this.mesh);
          this.parent?.removeProyectilFromList(index);
          this.mesh.parent.remove(this.mesh);
        } else {
          this.deleteScene();
          this.parent?.removeProyectilFromMap(this.index);
        }
        // schedule this shuriken instance for removal from collision observer arrays
        collisionObserver.addObjectToRemove(this);
      }
    } else if (target instanceof Walls && this.getLaunched()) {
      if (aabbIntersects(this.mesh, target.getBody())) {
        console.log("COLISION CON WALL");

        // Resolve penetration to avoid overlaps, then reflect velocity
        resolvePenetrationProyectil(this, target);
        const speed = this.velocity.length(); // preserve current speed magnitude
        const reflectedDir = reflectDirection(this, target); // unit vector of new direction
        // apply energy loss factor (0.8) and set new velocity
        this.velocity.copy(reflectedDir.multiplyScalar(speed * 0.8));
        this.bounces += 1;

        // remove after too many bounces to free resources / stop infinite ricochet
        if (this.bounces > 2) {
          scene.remove(this.mesh);
          collisionObserver.addObjectToRemove(this);
        }
      }
    } 
  }

}