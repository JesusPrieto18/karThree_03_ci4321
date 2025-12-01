import * as THREE from 'three';
import { solidWithWire } from './utils/utils';
import { scene } from './scene';
import { getTexture } from './utils/textureManager';

/**
 * Coffee - builds a small coffee cup composed of primitive geometries.
 * The Coffee class encapsulates a THREE.Group that contains the cup body,
 * a handle and the coffee surface. Use getBody() to retrieve the group,
 * and the setPosition / setX / setY / setZ helpers to place it in the world.
 */
export class Coffee {   
    // Root group that contains all parts of the coffee object
    private coffeeMesh: THREE.Group = new THREE.Group();

    constructor() {
        // Texture loader 
        const cupTexture = getTexture('coffee.cupTexture');
        const cupNormalTexture = getTexture('coffee.cupNormalTexture');

        // Build the cup as a cylinder
        // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
        const cupGeometry = new THREE.CylinderGeometry(1, 1, 1.5, 32);
        const cupColor = 0xffffff;
        const cup = solidWithWire(cupGeometry, cupColor, false, undefined, undefined, cupTexture, cupNormalTexture);
        // Raise cup so its bottom sits at y = 0
        cup.position.y = 1.5 / 2;

        // Build the handle using a partial torus (half torus)
        // TorusGeometry(radius, tube, radialSegments, tubularSegments, arc)
        const handleGeometry = new THREE.TorusGeometry(0.4, 0.1, 16, 100, Math.PI);
        const handle = solidWithWire(handleGeometry, cupColor, false, undefined, undefined, cupTexture, cupNormalTexture);
        // Position the handle to the side and rotate so it attaches to the cup
        handle.position.set(1, 1.5 / 2, 0);
        handle.rotation.z = -Math.PI / 2;

        // Build the visible coffee surface as a thin cylinder
        const coffeeGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 32);
        const coffeeColor = 0x6f4e37; // Brown color for coffee
        const coffee = solidWithWire(coffeeGeometry, coffeeColor, false);
        // Slightly below the cup rim
        coffee.position.y = 1.41;

        // Compose the parts into the root group
        this.coffeeMesh.add(cup);
        this.coffeeMesh.add(handle);
        this.coffeeMesh.add(coffee);
        
        // Scale the whole group to a convenient size for the scene
        this.coffeeMesh.scale.set(0.35, 0.35, 0.35);

        // Add the composed group to the global scene
        scene.add(this.coffeeMesh);
    }

    /**
     * getBody - returns the root Group containing the coffee parts.
     * Use this to add further transforms or for collision checks.
     */
    public getBody(): THREE.Group {
        return this.coffeeMesh;
    }

    /**
     * setPosition - set the world position of the root Group.
     * @param x X coordinate
     * @param y Y coordinate
     * @param z Z coordinate
     */
    public setPosition(x: number, y: number, z: number): void {
        this.coffeeMesh.position.set(x, y, z);
    }

    /**
     * setX - set only the X component of the group's position.
     * @param x X coordinate
     */
    public setX(x: number): void {
        this.coffeeMesh.position.x = x;
    }

    /**
     * setY - set only the Y component of the group's position.
     * @param y Y coordinate
     */
    public setY(y: number): void {
        this.coffeeMesh.position.y = y;
    }
    
    /**
     * setZ - set only the Z component of the group's position.
     * @param z Z coordinate
     */
    public setZ(z: number): void {
        this.coffeeMesh.position.z = z;
    }
}