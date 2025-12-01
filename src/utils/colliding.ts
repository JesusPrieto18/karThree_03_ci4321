import type { CollisionClassName } from '../models/colisionClass';
import { Kart } from '../kart';

/**
 * Colliding - simple collision manager / observer.
 *
 * Responsibilities / workflow:
 *  - Keep a list of objects that participate in collision checks (colisionObjects).
 *  - Allow objects to be flagged for removal (objectsRemove) to avoid mutating
 *    the main array while iterating.
 *  - Provide a per-frame checkCollision() that calls isColliding on each object
 *    with all other registered objects.
 *
 * Notes:
 *  - Objects registered must implement the CollisionClassName interface which exposes
 *    an isColliding(...) method and a getBody() accessor used by collision helpers.
 *  - Removal is deferred via addObjectToRemove and applied after the full check
 *    to avoid index / iteration problems.
 */
export class Colliding {
    // Array of active objects to test for collisions
    private colisionObjects: CollisionClassName[] = [];
    // Set of objects pending removal (deferred to avoid modifying the array during iteration)
    private objectsRemove: Set<CollisionClassName> = new Set();

    /**
     * addColisionObject - register an object so it will be included in future collision checks.
     * @param object object implementing CollisionClassName
     */
    public addColisionObject(object: CollisionClassName): void {
        this.colisionObjects.push(object);
    }
    
    /**
     * removeColisionObject - remove an object from active collision checks immediately.
     * Safe to call from outside; also used by removeSelectedObjects to finalize deferred removals.
     * @param object object to remove
     */
    public removeColisionObject(object: CollisionClassName): void {
        const index = this.colisionObjects.indexOf(object);
        if (index !== -1) {
            this.colisionObjects.splice(index, 1);
        }
    }

    /**
     * addObjectToRemove - mark an object for deferred removal after the current check cycle.
     * This prevents modifying the colisionObjects array while it is being iterated.
     * @param object object to mark for removal
     */
    public addObjectToRemove(object: CollisionClassName): void {
        this.objectsRemove.add(object);
    }

    /**
     * removeSelectedObjects - actually remove all objects that were previously marked.
     * Called at the end of checkCollision to finalize cleanup.
     */
    public removeSelectedObjects(): void {
        for (const obj of this.objectsRemove) {
            this.removeColisionObject(obj);
        }
        this.objectsRemove.clear();
    }

    /**
     * checkCollision - iterate over all registered objects and call their isColliding method
     * passing each other object as candidate. Removal of objects that requested deletion
     * is applied after the full iteration.
     *
     * Workflow details:
     *  - Outer loop selects object A.
     *  - Inner loop calls objectA.isColliding(objectB) for every B != A.
     *  - There is a small filter that currently skips calls when objA is an instance of Kart.
     *    (Depending on design, you may want to invert that logic or ensure both sides
     *     implement the correct response.)
     */
    public checkCollision(): void {
        for (let i = 0; i < this.colisionObjects.length; i++) {
            const objA = this.colisionObjects[i];
            // objA will be tested against every other registered object
            for (let j = 0; j < this.colisionObjects.length; j++) {
                if (i === j) continue;

                const objB = this.colisionObjects[j];

                // Skip calling isColliding when objA is a Kart.
                // This preserves a design where non-Kart objects actively test collisions
                // against others and Karts react when they are passed as targets.
                // If you prefer symmetric checks, remove this guard.
                if (objA instanceof Kart) {
                    continue;
                }

                // Delegate collision response to the object itself.
                // Each registered object decides how to handle collisions with the candidate.
                objA.isColliding(objB);
            }
        }
        // After iterating all pairs, remove any objects that were scheduled for deletion.
        this.removeSelectedObjects();
    }
}

export const collisionObserver = new Colliding();