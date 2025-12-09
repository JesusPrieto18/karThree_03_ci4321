import * as THREE from 'three';
import { getTexture } from './utils/textureManager';
import { scene } from './scene';

export class City {
    public group: THREE.Group;

    constructor(width: number, height: number, depth: number) {
        this.group = new THREE.Group();
        
        // Material y geometría base
        const texture = getTexture("city.texture");
        texture.needsUpdate = true;
        
        const material = new THREE.MeshStandardMaterial({ map: texture, transparent:true, side: THREE.DoubleSide, depthWrite: false });
        const wallGeometry = new THREE.PlaneGeometry(width, height);

        // Pared frontal
        const frontWall = new THREE.Mesh(wallGeometry, material);
        frontWall.position.set(0, height / 2, 3*depth/4);
        // Pared trasera
        const backWall = new THREE.Mesh(wallGeometry, material);
        backWall.position.set(0, height / 2, -3*depth/4);
        backWall.rotateY(Math.PI);

        // Pared izquierda
        const leftWall = new THREE.Mesh(wallGeometry, material);
        leftWall.position.set(-width / 2, height / 2, 0);
        leftWall.rotateY(-Math.PI / 2);

        // Pared derecha
        const rightWall = new THREE.Mesh(wallGeometry, material);
        rightWall.position.set(width / 2, height / 2, 0);
        rightWall.rotateY(Math.PI / 2);

        // Añadir al grupo
        this.group.add(frontWall, backWall, leftWall, rightWall);
        
        scene.add(this.group);
    }

}