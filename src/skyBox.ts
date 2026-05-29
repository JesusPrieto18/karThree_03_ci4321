import * as THREE from 'three';
import { scene } from './scene';
import { getTexture } from './utils/textureManager';

/**
 * Manages the SkyBox background of the scene.
 * Instead of using 6 separate images, this implementation slices a single "Atlas" 
 * image (Cubemap layout) into 6 distinct textures using UV mapping.
 * It maintains two separate meshes (Day and Night) to allow for switching.
 */
export class SkyBox {
    private skyBoxMeshDay: THREE.Mesh;
    private skyBoxMeshNight: THREE.Mesh;
    
    // Arrays to hold the sliced textures for each face of the cube
    private faceTextureDay: THREE.Texture[] = [];
    private faceTextureNight: THREE.Texture[] = [];

    // --- Atlas Configuration ---
    // The source image is a grid containing the 6 faces. 
    // Standard Cross Layout usually fits in a 4x3 grid.
    private GRID_COLS = 4;
    private GRID_ROWS = 3;

    // Mapping Three.js Cube Face Order indices [0..5] to grid coordinates {row, col}
    // Order: [ +X (Right), -X (Left), +Y (Top), -Y (Bottom), +Z (Front), -Z (Back) ]
    private FACE_CELLS = [
        { row: 1, col: 2 }, // +X (right)
        { row: 1, col: 0 }, // -X (left)
        { row: 0, col: 1 }, // +Y (up)
        { row: 2, col: 1 }, // -Y (down)
        { row: 1, col: 1 }, // +Z (front)
        { row: 1, col: 3 }, // -Z (back)
    ];

    /**
     * Initializes the SkyBox geometry and materials.
     */
    constructor() {
        // 1. Process the texture atlas to create individual face textures
        this.createFacesFromAtlas();

        // 2. Create materials for each face (Basic material, unlit)
        // DoubleSide is used to ensure the texture is visible from inside the cube
        const materialDay = this.faceTextureDay.map(tex =>
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );

        const materialNight = this.faceTextureNight.map(tex =>
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );

        // 3. Create Geometry (Huge box to encompass the world)
        const skyGeo = new THREE.BoxGeometry(1000, 1000, 1000);
        
        this.skyBoxMeshDay = new THREE.Mesh(skyGeo, materialDay);
        this.skyBoxMeshNight = new THREE.Mesh(skyGeo, materialNight);
        
        // Anti-Z-Fighting Trick: Scale the Night mesh slightly larger than Day.
        // Since they occupy the same position, this ensures they don't flicker.
        this.skyBoxMeshNight.scale.set(1.01, 1.01, 1.01); 
        
        scene.add(this.skyBoxMeshDay);
        scene.add(this.skyBoxMeshNight);
    }

    /**
     * Slices the single Atlas image into 6 distinct texture objects using UV Offset and Repeat.
     */
    private createFacesFromAtlas(): void{
        // Retrieve source images
        const atlasDay = getTexture("sky.cubemapDay"); 
        const atlasNight = getTexture("sky.cubemapNight");

        // Prevent wrapping artifacts at the edges of the faces
        atlasDay.wrapS = THREE.ClampToEdgeWrapping;
        atlasDay.wrapT = THREE.ClampToEdgeWrapping;
        
        atlasNight.wrapS = THREE.ClampToEdgeWrapping;
        atlasNight.wrapT = THREE.ClampToEdgeWrapping;

        // Iterate through the 6 defined faces
        for (const cell of this.FACE_CELLS) {
            // Clone the texture so we can have independent UV offsets for each face
            const texD = atlasDay.clone();
            const texN = atlasNight.clone();
            
            texD.needsUpdate = true;
            texN.needsUpdate = true;
            
            // UV Scaling: Each face is 1/4th wide and 1/3rd high
            texD.repeat.set(1 / this.GRID_COLS, 1 / this.GRID_ROWS);
            texN.repeat.set(1 / this.GRID_COLS, 1 / this.GRID_ROWS);
            
            // UV Offset Calculation:
            // "row" is counted from Top-Left, but UV coordinates start at Bottom-Left.
            // Therefore, Y offset is: 1 - (row + 1) / totalRows
            const { row, col } = cell;
            
            texD.offset.set( col / this.GRID_COLS, 1 - (row + 1) / this.GRID_ROWS);
            texN.offset.set( col / this.GRID_COLS, 1 - (row + 1) / this.GRID_ROWS);
            
            this.faceTextureDay.push(texD);
            this.faceTextureNight.push(texN);
        }
    }

    public getMeshDay(): THREE.Mesh {
        return this.skyBoxMeshDay;
    }

    public getMeshNight(): THREE.Mesh {
        return this.skyBoxMeshNight;
    }

    /**
     * Toggles the visibility of the day skybox based on the sun's position or state.
     * @param number Indicator value (positive = Day, negative/zero = Night)
     */
    public setTime(number: number,): void {
        // If > 0, show Day mesh. If not, hide Day mesh (revealing the Night mesh behind it)
        this.skyBoxMeshDay.visible = number > 0 ? true : false;
    }

    /**
     * Rotates the skybox slowly to simulate planetary rotation.
     * @param deltaTime Time elapsed since last frame.
     */
    public animate(): void {
        // Slow Y-axis rotation
        this.skyBoxMeshDay.rotation.y += 0.0005;
        this.skyBoxMeshNight.rotation.y += 0.0005;
    }
}