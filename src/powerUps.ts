import * as THREE from 'three';
import { scene } from './scene';
import { Box } from './box';
import { aabbIntersects } from './utils/utils';
import { collisionObserver } from './utils/colliding';
import { kart } from './utils/initializers';
import type { CollisionClassName } from './models/colisionClass';
import { Kart } from './kart';

/**
 * PowerUp - represents a collectible power-up in the world.
 * - Encapsulates a THREE.Group that contains a Box decorative mesh.
 * - Registers itself with the collision observer so collisions can be detected.
 * - When collected by a Kart, it assigns a random power-up and removes itself.
 */
export class PowerUp {
    // Root group that represents the power-up in the scene
    private powerUp = new THREE.Group();
    // Decorative content (Box) placed inside the group
    private box: Box;

    /**
     * Constructor - builds visual representation and registers the object for collisions.
     * Steps:
     *  1. Create a Box decorative mesh and add it to the group's root.
     *  2. Add the group to the global scene to make it visible.
     *  3. Register this instance in the global collision observer so it can be checked.
     */
    constructor() {
        this.box = new Box();
        this.powerUp.add(this.box.getBody());
        scene.add(this.powerUp);
        collisionObserver.addColisionObject(this);
    }

    /**
     * getBody - returns the THREE.Group used in the scene.
     * Use this to read position, rotation or to remove the visual representation.
     */
    public getBody(): THREE.Group {
        return this.powerUp;
    }
    
    /**
     * setPowerUp - choose a random power-up index and assign it to the global kart.
     * - Picks an integer in [0..6] (rounded).
     * - Calls kart.setPowerUps to apply the chosen effect.
     * - Logs the selected power-up index for debugging.
     */
    public setPowerUp(): void {
        const x = Math.round(Math.random() * 6);
        kart.setPowerUps(x);
        console.log(x);
    } 

    /**
     * setPosition - place the power-up group at the given world coordinates.
     * @param x world X
     * @param y world Y
     * @param z world Z
     */
    public setPosition(x: number, y: number, z: number): void { 
        this.powerUp.position.set(x, y, z);
    }
    
    /**
     * animate - simple per-frame visual update for the power-up.
     * - Makes the internal Box float (sinusoidal Y) and slowly rotate for visibility.
     * - Call this from your main animation loop for each power-up instance.
     */
    public animate(): void {
      // Vertical bobbing effect
      this.box.getBody().position.y = Math.sin(Date.now() * 0.002) * 0.5 + 0.55;
      // Slow spin for visual feedback
      this.box.getBody().rotation.y += 0.01;
    }
    
    /**
     * isColliding - called by the collision system when a collision candidate is tested.
     * - If the collider is a Kart and bounding-box intersects the box mesh, it triggers collection:
     *    1. Assigns a random power-up to the kart.
     *    2. Removes the power-up group's visuals from the scene.
     *    3. Unregisters this instance from the collision observer to stop further checks.
     *
     * @param object Candidate collider (expected to be a Kart or other static object)
     */
    public isColliding(object: CollisionClassName): void {
        if (object instanceof Kart && aabbIntersects(object.getBody(), this.box.getBody())) {
            console.log("COLLISION WITH POWER UP");
            this.setPowerUp();
            scene.remove(this.powerUp);
            collisionObserver.addObjectToRemove(this);
        }
    }

}