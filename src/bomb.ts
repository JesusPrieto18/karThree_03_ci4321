import * as THREE from 'three';
import { scene } from './scene';
import { collisionObserver } from './utils/colliding';
import { aabbIntersects } from './utils/utils';
import type { CollisionClassName } from './models/colisionClass';
import { TrafficCone } from './trafficCone';
import { Walls } from './walls';
import { getTexture } from './utils/textureManager';

/**
 * Bomb - simple throwable explosive with fuse, gravity, timer and explosion behavior.
 *
 * Responsibilities / workflow:
 *  - Construct visual mesh (sphere) with a fuse and add to the scene.
 *  - Register with the global collision observer to receive collision callbacks.
 *  - Accept an initial velocity and direction, update motion under gravity, and count down a fuse.
 *  - When timer reaches zero or on impactful collision, trigger explosion visual/cleanup and notify observer.
 */
export class Bomb {
  private mesh: THREE.Mesh;
  private fuse: THREE.Mesh;
  private name?: string;
  private loader = new THREE.TextureLoader();
  // explosion animation state
  private explosionElapsed: number = 0;
  private explosionDuration: number = 5.0; // seconds to grow
  private explosionTargetScale: number = 9;
  private explosionStartScale: number = 0.1;
  private cleanupScheduled: boolean = false;
  // Movement and physics state
  private direction: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private gravity: number = 9.8; // simulated gravity constant
  private timer: number = 3; // seconds until explosion
  private exploded: boolean = false;
  private launched: boolean = false;
  private index: number = -1;

  constructor(name?: string) {
    this.name = name;

    // Textures
    
    const aoTexture = getTexture('bomb.ao');
    const texture = getTexture('bomb.texture');
    const textureNormal = getTexture('bomb.normal');

    // Main bomb body (sphere)
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({metalness: 0.6, roughness: 0.4, aoMap: aoTexture, map: texture, normalMap: textureNormal });
    this.mesh = new THREE.Mesh(geometry, material);

    if (this.name) this.mesh.name = this.name;

    // --- Fuse visual (small cylinder) ---
    const fuseGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8);
    const fuseMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff6600, emissiveIntensity: 1 });
    this.fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
    
    // Place the fuse slightly above the bomb surface
    this.fuse.position.set(0, 0.6, 0);
    this.mesh.add(this.fuse);
    //this.mesh.add(new THREE.AxesHelper(3));
    
    // Add bomb to scene and register for collisions
    scene.add(this.mesh);
    collisionObserver.addColisionObject(this);
  }

  /** Ensure the bomb mesh is added to the scene (safe to call if it was removed). */
  public addScene(): void {
    scene.add(this.mesh);
  }

  /** Remove the bomb mesh from the scene (visual cleanup). */
  public deleteScene(): void {
    scene.remove(this.mesh);
  }

  /** getBody - return the THREE.Mesh used by the collision system. */
  public getBody(): THREE.Mesh {
    return this.mesh;
  }

  public setLaunched(launched: boolean): void {
    this.launched = launched;
  }

  public getLaunched(): boolean {
    return this.launched;
  }

  /**
   * setDirection - set bomb spawn position and initial facing using a reference object.
   * Workflow:
   *  - Read the world forward direction from the provided object.
   *  - Compute a start position offset a bit in front of that object.
   *  - Place the bomb at that start position and store the direction for movement.
   *
   * @param object Object3D used as reference (e.g. kart)
   */
  public setDirection(object: THREE.Object3D): void {
    const dir = new THREE.Vector3(0, 1, 2);
    object.getWorldDirection(dir);

    const pos = new THREE.Vector3();
    object.getWorldPosition(pos);

    // Offset forward from the reference (adjust for object size)
    const offsetDistance = 2;
    const offset = dir.clone().multiplyScalar(offsetDistance);

    // Spawn position in front of the reference object
    const startPos = pos.clone().add(offset);
    this.mesh.position.copy(startPos);

    this.direction.copy(dir);
    console.log('getWorldDirection:', dir);
  }

  /** moveForward - translate the bomb along its current direction by the given distance. */
  public moveForward(distance: number): void {
    this.mesh.position.addScaledVector(this.direction, distance);
  }

  /** rotateY - rotate the visual mesh around Y axis (for simple visual spin). */
  public rotateY(angleRad: number): void {
    this.mesh.rotation.y += angleRad;
  }

  /** setVelocity - assign an initial linear velocity vector to the bomb (used when thrown). */
  public setVelocity(initialVelocity: THREE.Vector3): void {
    this.velocity.copy(initialVelocity);
  }

  /**
   * updateFuse - per-frame visual update for the fuse.
   * - Changes fuse color/emissive intensity as the timer counts down.
   * - Optionally shortens the fuse scale for a burning effect.
   */
  private updateFuse(deltaTime: number): void {
    const fuseMat = this.fuse.material as THREE.MeshStandardMaterial;
    // Normalize timer to [0..1] where 1 is full time remaining and 0 is expired
    const t = Math.max(0, this.timer / 3);
    // Shift color slightly from orange toward red as time runs out
    fuseMat.color.setHSL(0.1 + (1 - t) * 0.1, 1, 0.5);
    fuseMat.emissiveIntensity = 1 + (1 - t) * 4;
    // Visual shortening of the fuse over time
    this.fuse.scale.y = t * 1;
  }

  /**
   * update - per-frame physics and timer update.
   * Workflow:
   *  - Apply gravity to vertical velocity.
   *  - Integrate position using velocity and deltaTime.
   *  - Update fuse visuals and decrement the fuse timer.
   *  - Trigger explode() when timer reaches zero.
   *
   * @param deltaTime seconds elapsed since last frame
   */
  public update(deltaTime: number): void {
    // If exploded -> animate explosion over time (frame-by-frame)
    if (this.exploded) {
      // animate growth from explosionStartScale -> explosionTargetScale
      if (this.explosionElapsed < this.explosionDuration) {
        this.explosionElapsed += deltaTime;
        const t = Math.min(1, this.explosionElapsed / this.explosionDuration);
        const s = THREE.MathUtils.lerp(this.explosionStartScale, this.explosionTargetScale, t);
        this.mesh.scale.set(s, s, s);
        this.mesh.rotateY(0.02)
        const mat = this.mesh.material as THREE.MeshStandardMaterial;
        mat.opacity = THREE.MathUtils.lerp(1, 0, t); // fade out while grows
        console.log(mat.opacity)
      } else if (!this.cleanupScheduled) {
        // finished animation: remove and ask observer to cleanup
        scene.remove(this.mesh);
        collisionObserver.addObjectToRemove(this);
        this.cleanupScheduled = true;
      }
      return;
    }

    // Pre-explosion physics & visuals
    this.velocity.y -= this.gravity * deltaTime * 0.3;
    this.mesh.position.addScaledVector(this.velocity, deltaTime);
    this.updateFuse(deltaTime);
    this.timer -= deltaTime;
    if (this.timer <= 0) {
      this.explode();
      // don't call updateExplosion() or setTimeout here
    }
  
  }
  
  /**
   * explode - handle explosion effects and schedule cleanup.
   * Workflow:
   *  - Mark as exploded to avoid repeated triggers.
   *  - Change visual appearance and scale to indicate explosion.
   *  - Schedule removal from scene and collision observer after a short delay.
   */
  private explode(): void {
    if (this.exploded) return;
    this.exploded = true;
    this.explosionElapsed = 0;
    this.cleanupScheduled = false;
    this.explosionStartScale = 0.1;
    this.mesh.remove(this.fuse); // remove fuse visual
    // Visual feedback: change color and expand
    const mat = this.mesh.material as THREE.MeshStandardMaterial;
    const texture = getTexture('bomb.lava.texture');
    const textureNormal = getTexture('bomb.lava.normal');
    
    //mat.color.set(0xff4400);
    mat.map = texture;
    mat.normalMap = textureNormal;
    mat.opacity = 1;
    mat.transparent = true;
    // opcional: hacer que brille
    mat.emissive.setHex(0xFF7F32);
    mat.emissiveIntensity = 0.5;
    mat.needsUpdate = true;
    const explosion = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z);
    
    // Simple instantaneous visual expansion (could be animated)
   this.mesh.scale.set(this.explosionStartScale, this.explosionStartScale, this.explosionStartScale);
    
    console.log('Bomb exploded at:', explosion);
  }
  
  /**
   * setIndex - assign an index to identify this bomb in parent's launched projectiles list.
   */
  public setIndex(index: number): void {
    this.index = index;
  }

  public getIndex(): number {
    return this.index;
  }

  /**
   * isColliding - called by the collision system with a candidate object.
   * Behavior:
   *  - If the bomb is launched and intersects a TrafficCone or Walls, trigger explosion.
   *
   * @param target Candidate object provided by the collision observer
   */
  public isColliding(target: CollisionClassName): void {
    if (this.exploded) return;

    if (target instanceof TrafficCone && this.getLaunched()){ 
      if(aabbIntersects(this.mesh, target.getBody())){
        console.log('💣 Collision with TrafficCone');
        this.explode();
      }
    }
    
    else if (target instanceof Walls && this.getLaunched() ) {
      if(aabbIntersects(this.mesh, target.getBody())) {
        console.log('Collision with wall');
        this.explode();
      };
    };
  }

  /** getPosition - return a copy of the bomb's current world position. */
  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  /** setPosition - set the bomb's world position. */
  public setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }
}