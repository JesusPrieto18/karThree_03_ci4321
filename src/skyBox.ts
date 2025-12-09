import * as THREE from 'three';
import { scene } from './scene';
import { getTexture } from './utils/textureManager';

export class SkyBox {
    private skyBoxMeshDay: THREE.Mesh;
    private skyBoxMeshNight: THREE.Mesh;
    private faceTextureDay: THREE.Texture[] = [];
    private faceTextureNight: THREE.Texture[] = [];
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
        const materialDay = this.faceTextureDay.map(tex =>
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );

        const materialNight = this.faceTextureNight.map(tex =>
            new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
        );

        const skyGeo = new THREE.BoxGeometry(1000, 1000, 1000);
        this.skyBoxMeshDay = new THREE.Mesh(skyGeo, materialDay);
        this.skyBoxMeshNight = new THREE.Mesh(skyGeo, materialNight);
        this.skyBoxMeshNight.scale.set(1.01, 1.01, 1.01); // Slightly larger to avoid z-fighting
        scene.add(this.skyBoxMeshDay);
        scene.add(this.skyBoxMeshNight);
    }

    private createFacesFromAtlas(): void{
        const atlasDay = getTexture("sky.cubemapDay"); 
        const atlasNight = getTexture("sky.cubemapNight");

        atlasDay.wrapS = THREE.ClampToEdgeWrapping;
        atlasDay.wrapT = THREE.ClampToEdgeWrapping;
        
        atlasNight.wrapS = THREE.ClampToEdgeWrapping;
        atlasNight.wrapT = THREE.ClampToEdgeWrapping;

        for (const cell of this.FACE_CELLS) {
            const texD = atlasDay.clone();
            const texN = atlasNight.clone();
            
            texD.needsUpdate = true;
            texN.needsUpdate = true;
            
            // Cada cara ocupa 1/4 horizontal y 1/3 vertical del atlas
            texD.repeat.set(1 / this.GRID_COLS, 1 / this.GRID_ROWS);
            texN.repeat.set(1 / this.GRID_COLS, 1 / this.GRID_ROWS);
            // row se cuenta desde arriba, pero en UV el origen está abajo
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

    public setTime(number: number,): void {
        this.skyBoxMeshDay.visible = number > 0? true : false;
    }

    public animate(deltaTime: number): void {
        // Rotación lenta alrededor del eje Y
        this.skyBoxMeshDay.rotation.y += 0.0005;
        this.skyBoxMeshNight.rotation.y += 0.0005;
    }
}