import * as THREE from 'three';
import { getTexture } from './utils/textureManager';
import { scene } from './scene';

/**
 * City - Background Scenery Manager.
 * * Creates a "box" of flat planes surrounding the play area to simulate a distant city skyline.
 * It uses transparent textures to allow the SkyBox to show through the gaps in buildings.
 */
export class City {
    // Main container group
    public group: THREE.Group;

    /**
     * Constructs the City environment.
     * @param width The width (X-axis) of the city perimeter.
     * @param height The height (Y-axis) of the city walls.
     * @param depth The depth (Z-axis) base unit for the city perimeter.
     */
    constructor(width: number, height: number, depth: number) {
        this.group = new THREE.Group();
        
        // 1. Texture Setup
        // Retrieve the city skyline texture (likely a PNG with transparency)
        const texture = getTexture("city.texture");
        texture.needsUpdate = true; // Ensure texture is uploaded to GPU
        
        // 2. Material Setup
        // MeshStandardMaterial allows the city to react to the Day/Night lighting cycle.
        const material = new THREE.MeshStandardMaterial({ 
            map: texture, 
            transparent: true,     // Enable alpha channel (see-through gaps between buildings)
            side: THREE.DoubleSide,// Render both sides (visible from inside and outside)
            depthWrite: false      // CRITICAL: Renders this object but doesn't write to Z-Buffer.
                                   // Prevents transparent pixels from occluding objects behind them (like clouds).
        });

        // 3. Geometry Setup
        // A simple flat plane used for all 4 walls
        const wallGeometry = new THREE.PlaneGeometry(width, height);

        // 4. Wall Positioning (Creating the perimeter)

        // Front Wall (+Z direction)
        const frontWall = new THREE.Mesh(wallGeometry, material);
        // Note: Multiplier 3*depth/4 pushes the walls out to create a large rectangular arena
        frontWall.position.set(0, height / 2, 3 * depth / 4);
        
        // Back Wall (-Z direction)
        const backWall = new THREE.Mesh(wallGeometry, material);
        backWall.position.set(0, height / 2, -3 * depth / 4);
        backWall.rotateY(Math.PI); // Rotate 180 deg to face inward

        // Left Wall (-X direction)
        const leftWall = new THREE.Mesh(wallGeometry, material);
        leftWall.position.set(-width / 2, height / 2, 0);
        leftWall.rotateY(-Math.PI / 2); // Rotate -90 deg to face inward

        // Right Wall (+X direction)
        const rightWall = new THREE.Mesh(wallGeometry, material);
        rightWall.position.set(width / 2, height / 2, 0);
        rightWall.rotateY(Math.PI / 2); // Rotate 90 deg to face inward

        // 5. Assembly
        this.group.add(frontWall, backWall, leftWall, rightWall);
        
        // Add to the main scene
        scene.add(this.group);
    }

}