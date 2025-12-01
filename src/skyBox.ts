import * as THREE from 'three';
import { scene } from './scene';
import { getTexture } from './utils/textureManager';

export class SkyBox {
    private skyBoxMesh: THREE.Mesh;
    private faceTextures: THREE.Texture[] = [];
    // Cada celda del atlas (4 x 3)
    private GRID_COLS = 4;
    private GRID_ROWS = 3;

    // Orden Three: [ +X, -X, +Y, -Y, +Z, -Z ]
    private FACE_CELLS = [
        { row: 1, col: 2 }, // +X (right)
        { row: 1, col: 0 }, // -X (left)
        { row: 0, col: 1 }, // +Y (up)
        { row: 2, col: 1 }, // -Y (down)
        { row: 1, col: 1 }, // +Z (front)
        { row: 1, col: 3 }, // -Z (back)
    ];

    constructor() {
        this.createFacesFromAtlas();
        const materials = this.faceTextures.map(tex =>
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })
        );

        const skyGeo = new THREE.BoxGeometry(1000, 1000, 1000);
        this.skyBoxMesh = new THREE.Mesh(skyGeo, materials);
        scene.add(this.skyBoxMesh);
    }

    private createFacesFromAtlas(): void{
        const atlas = getTexture("sky.cubemapr");

        atlas.wrapS = THREE.ClampToEdgeWrapping;
        atlas.wrapT = THREE.ClampToEdgeWrapping;
        
        for (const cell of this.FACE_CELLS) {
            const tex = atlas.clone();
            tex.needsUpdate = true;

            // Cada cara ocupa 1/4 horizontal y 1/3 vertical del atlas
            tex.repeat.set(1 / this.GRID_COLS, 1 / this.GRID_ROWS);

            // row se cuenta desde arriba, pero en UV el origen está abajo
            const { row, col } = cell;
            tex.offset.set( col / this.GRID_COLS, 1 - (row + 1) / this.GRID_ROWS);

            this.faceTextures.push(tex);
        }

    }

    public getMesh(): THREE.Mesh {
        return this.skyBoxMesh;
    }

    public animate(): void {
        // Rotación lenta alrededor del eje Y
        this.skyBoxMesh.rotation.y += 0.0005;
    }
}