import * as THREE from 'three';
import { scene } from './scene';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { dayNightCycle } from './utils/initializers';

export class StreetLight {
    private group: THREE.Group;
    private spotLight: THREE.SpotLight;
    private targetObject: THREE.Object3D;

    constructor(x: number = 0 , z: number = 0) {
        this.group = new THREE.Group();

        this.spotLight = new THREE.SpotLight(0xffffff, 7);
        this.spotLight.position.set(x, 7, z); // 0,7,25
        this.spotLight.angle = Math.PI / 3;
        this.spotLight.penumbra = 0.2;
        this.spotLight.decay = 0.1;
        this.spotLight.distance = 30;

        this.group.add(this.spotLight);

        this.targetObject = new THREE.Object3D();
        this.targetObject.position.set(x, 0, z); // 0,7,25
        this.group.add(this.targetObject);
        this.spotLight.target = this.targetObject;
        
        const helper = new THREE.SpotLightHelper(this.spotLight);
        //this.group.add(helper);

        const loader = new GLTFLoader();
        loader.load('src/imports/low_poly_street_light/scene.gltf', (gltf) => {
            gltf.scene.position.set(x,0,z-5); // 0,0,20
            //gltf.scene.scale.set(1.5,1.2,1.5);
            //gltf.scene.rotation.y += angleY;
            this.group.add(gltf.scene);
            
        });
        scene.add(this.group);
    }
    
    public rotateY(angle: number): void {
        this.group.rotateY(angle);
    }

    public animate(now: number): void {
        // Animation logic can be added here if needed
        let isDay = dayNightCycle.getIsDay();
        switch (isDay) {
            case 0: // Dia
                this.spotLight.intensity = 0;
                break;
            case 1: // Noche
                this.spotLight.intensity = 7;
                break;
            case 2: // Automático
                if (dayNightCycle.getSunHeight() <= 0) {
                    this.spotLight.intensity = 7; 
                } else {
                    this.spotLight.intensity = 0;
                }
                break;
        }
    }
}
