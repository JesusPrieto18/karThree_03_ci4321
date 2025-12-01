import * as THREE from 'three';
import { aabbIntersects, solidWithWire, resolvePenetrationObstacles } from './utils/utils';
import { scene } from './scene';
import type { CollisionClassName } from './models/colisionClass';
import { Shuriken } from './shuriken';
import { collisionObserver } from './utils/colliding';
import { Kart } from './kart';
import { Bomb } from './bomb';
import { getTexture } from './utils/textureManager';

/**
 * TrafficCone - builds a visual traffic cone composed of a cone + base + white bands.
 * - Registers itself with the global scene.
 * - Optionally registers with the global collision observer so collisions are detected.
 * - Exposes helpers to get/set position and to respond to collisions.
 */
export class TrafficCone {
    private trafficCone = new THREE.Group();

    /**
     * Constructor
     * @param addColision whether to register this instance in the collision observer
     */
    constructor(addColision: boolean = true) {
        this.buildTrafficCone(addColision);
    }

    /**
     * buildTrafficCone - construct the cone visual and add it to the scene.
     * Steps:
     *  1. Create the orange cone geometry and add a wire/solid helper.
     *  2. Create the black rectangular base.
     *  3. Add three white ring/band cylinders for the cone markings.
     *  4. Scale and position the assembled Group, add to scene and optionally register for collisions.
     */
    private buildTrafficCone(addColision: boolean): void {
        // Texture
        const aoTexture = getTexture('trafficCone.ao');
        const textureNormal = getTexture('trafficCone.normal');
        
        // Traffic cone body
        const coneHeight = 2;
        const coneRadius = 0.5;
        const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 8);
        const coneColor = 0xff0000;

        const cone = solidWithWire(coneGeometry, coneColor, false, undefined, aoTexture, undefined, textureNormal);
        this.trafficCone.add(cone);

        // Black base block
        const baseHeight = 0.2;
        const baseLength = 1.2;
        const baseThickness = 1.2;
        const baseGeometry = new THREE.BoxGeometry(baseLength, baseHeight, baseThickness);
        const baseColor = 0x2c2c2c;

        const base = solidWithWire(baseGeometry, baseColor, false, undefined, aoTexture, undefined, textureNormal);
        base.position.set(0, -1, 0);
        this.trafficCone.add(base);

        // Lower white band
        const markerHeight = 0.3;
        const markerGeometry = new THREE.CylinderGeometry(0.35, 0.42, markerHeight, 8);
        const markerColor = 0xe0d8d8;
        const marker = solidWithWire(markerGeometry, markerColor, false, undefined, aoTexture, undefined, textureNormal);
        marker.position.set(0, -0.5, 0);

        // Middle white band
        const markerGeometry2 = new THREE.CylinderGeometry(0.22, 0.31, markerHeight, 8);
        const marker2 = solidWithWire(markerGeometry2, markerColor, false, undefined, aoTexture, undefined, textureNormal);
        marker2.position.set(0, 0, 0);

        // Upper white band
        const markerGeometry3 = new THREE.CylinderGeometry(0.09, 0.19, markerHeight, 8);
        const marker3 = solidWithWire(markerGeometry3, markerColor, false, undefined, aoTexture, undefined, textureNormal);
        marker3.position.set(0, 0.5, 0);

        this.trafficCone.add(marker, marker2, marker3);
        scene.add(this.trafficCone);

        // Scale down and lift so the cone sits visually correct
        this.trafficCone.scale.set(0.5, 0.5, 0.5);
        this.trafficCone.position.set(0, (baseHeight + coneHeight) * 0.5 / 2, 0);

        // Add a small axes helper for debugging orientation when needed
        //this.trafficCone.add(new THREE.AxesHelper(2));

        // Register for collision checks if requested
        if (addColision) {
            collisionObserver.addColisionObject(this);
        }
    }

    /** getBody - returns the Group representing the traffic cone */
    public getBody(): THREE.Group {
        return this.trafficCone;
    }

    /** setPosition - set the world position of the traffic cone group */
    public setPosition(x: number, y: number, z: number): void {
        this.trafficCone.position.set(x, y, z);
    }

    public setX(x: number): void {
        this.trafficCone.position.x = x;
    }

    public setY(y: number): void {
        this.trafficCone.position.y = y;
    }

    public setZ(z: number): void {
        this.trafficCone.position.z = z;
    }

    /**
     * isColliding - collision callback invoked by the collision system.
     * - If hit by a Shuriken (or a launched Bomb) the cone is removed from the scene and marked for cleanup.
     * - If a Kart collides, resolve penetration, reduce kart speed and mark the kart as crashed by this obstacle.
     */
    public isColliding(target: CollisionClassName): void {
        if (target instanceof Shuriken || (target instanceof Bomb && target.getLaunched())) {
            if (aabbIntersects(this.trafficCone, target.getBody())) {
                console.log("COLISION CON SHURIKEN DESDE TRAFFIC CONE");
                scene.remove(this.trafficCone);
                collisionObserver.addObjectToRemove(this);
            }
        }

        if (target instanceof Kart) {
            if (aabbIntersects(this.trafficCone, target.getBody())) {
                console.log("COLISION CON KART DESDE TRAFFIC CONE");
                // Resolve overlap and apply a speed penalty to the kart
                resolvePenetrationObstacles(target, this, 0.01);
                target.speed *= 0.5;
            }
        }
    }

}