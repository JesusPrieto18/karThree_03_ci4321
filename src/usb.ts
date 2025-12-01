import * as THREE from 'three';
import { solidWithWire } from './utils/utils';
import { scene } from './scene';
import { getTexture } from './utils/textureManager';

/**
 * USB - builds a decorative 3D sign composed of simple box primitives.
 *
 * Responsibilities / workflow:
 *  - Construct letter shapes (U, S, B) from BoxGeometry parts.
 *  - Compose parts into a root THREE.Group (usbMesh).
 *  - Add the group to the global scene so it is rendered.
 *  - Expose helpers to set position, get position and run a simple animation.
 *
 * Implementation notes:
 *  - The visual is built from many small meshes to approximate letters.
 *  - solidWithWire helper is used to create a mesh with a solid material and optional wireframe.
 *  - The group is kept as a single root so it can be moved or removed easily.
 */
export class USB {
    // Root group that contains all parts of the USB sign
    private usbMesh: THREE.Group = new THREE.Group();

    /**
     * Constructor - builds the letter components and adds them to the scene.
     * Steps:
     *  1. Create geometry and materials for each component.
     *  2. Position each part relative to the root group.
     *  3. Add all parts to the root group and then add the group to the scene.
     */
    constructor() {
        // Texture
        const aoTexture = getTexture("usb.ao");
        const texture = getTexture("usb.texture");
        const textureNormal = getTexture("usb.normal");
        // Base color for the letters
        //const materialColor = 0x0000ff;

        // --- Letter U construction (composed from two vertical bars and a base) ---
        const verticalBarGeo = new THREE.BoxGeometry(2, 10, 1);
        const rightU = solidWithWire(verticalBarGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        rightU.position.set(-8, 15, 0.01);
        this.usbMesh.add(rightU);

        const leftU = solidWithWire(verticalBarGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        leftU.position.set(-14, 15, 0.01);
        this.usbMesh.add(leftU);

        const baseUGeo = new THREE.BoxGeometry(6, 2, 1);
        const baseU = solidWithWire(baseUGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        baseU.position.set(-11, 10, 0);
        this.usbMesh.add(baseU);

        // --- Letter S construction (top, middle, bottom bars + side bars) ---
        const longBarGeo = new THREE.BoxGeometry(9, 2, 1);
        const topS = solidWithWire(longBarGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        topS.position.set(0, 19, 0.01);
        this.usbMesh.add(topS);

        const middleS = solidWithWire(longBarGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        middleS.position.set(0, 14.5, 0);
        this.usbMesh.add(middleS);

        const bottomS = solidWithWire(longBarGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        bottomS.position.set(0, 10, 0);
        this.usbMesh.add(bottomS);

        const smallBarGeo = new THREE.BoxGeometry(2, 5, 1);
        const leftS = solidWithWire(smallBarGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        leftS.position.set(-4.5, 16.75, 0);
        this.usbMesh.add(leftS);

        const rightS = solidWithWire(smallBarGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        rightS.position.set(4.5, 12.25, 0.01);
        this.usbMesh.add(rightS);

        // --- Letter B construction (vertical bar + three horizontal bars + inner small pieces) ---
        const verticalBGeo = new THREE.BoxGeometry(2, 10, 1);
        const leftB = solidWithWire(verticalBGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        leftB.position.set(8, 14.5, 0.01);
        this.usbMesh.add(leftB);

        const horizontalBGeo = new THREE.BoxGeometry(6, 2, 1);
        const topB = solidWithWire(horizontalBGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        topB.position.set(11, 19, 0);
        this.usbMesh.add(topB);

        const middleB = solidWithWire(horizontalBGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        middleB.position.set(11, 14.5, 0);
        this.usbMesh.add(middleB);

        const bottomB = solidWithWire(horizontalBGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        bottomB.position.set(11, 10, 0);
        this.usbMesh.add(bottomB);

        const innerSmallGeo = new THREE.BoxGeometry(1, 2.8, 1);
        const innerRightBTop = solidWithWire(innerSmallGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        innerRightBTop.position.set(14, 18, 0);
        this.usbMesh.add(innerRightBTop);

        const innerRightBTopMiddle = solidWithWire(innerSmallGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        innerRightBTopMiddle.position.set(15, 17, 0);
        this.usbMesh.add(innerRightBTopMiddle);

        const innerRightBTopBottom = solidWithWire(innerSmallGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        innerRightBTopBottom.position.set(14, 16, 0);
        this.usbMesh.add(innerRightBTopBottom);

        const innerLeftBTop = solidWithWire(innerSmallGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        innerLeftBTop.position.set(14, 12.25, 0);
        this.usbMesh.add(innerLeftBTop);

        const innerLeftBBottomMiddle = solidWithWire(innerSmallGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        innerLeftBBottomMiddle.position.set(15, 11.5, 0);
        this.usbMesh.add(innerLeftBBottomMiddle);

        const innerLeftBBottom = solidWithWire(innerSmallGeo, undefined, false, undefined, aoTexture, texture, textureNormal);
        innerLeftBBottom.position.set(14, 11, 0);
        this.usbMesh.add(innerLeftBBottom);

        // Add the assembled group to the global scene so it will be rendered
        scene.add(this.usbMesh);
    }

    /**
     * setPosition - sets the world position of the USB sign root group.
     * @param x world X coordinate
     * @param y world Y coordinate
     * @param z world Z coordinate
     */
    public setPosition(x: number, y: number, z: number): void {
        this.usbMesh.position.set(x, y, z);
    }

    /**
     * getPosition - returns the group's current position vector.
     * Useful for alignment, collision checks or camera focusing.
     */
    public getPosition(): THREE.Vector3 {
        return this.usbMesh.position;
    }

    /**
     * animate - simple per-frame visual update.
     * - Adds a small vertical bobbing for a floating effect.
     * - Applies a slow rotation around Y for subtle motion.
     * Call this from the main animation loop if desired.
     */
    public animate(): void {
      this.usbMesh.position.y = Math.sin(Date.now() * 0.002) * 0.5 + 0.55;
      this.usbMesh.rotation.y += 0.001;
    }
}