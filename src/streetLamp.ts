import * as THREE from 'three';
import { scene } from './scene';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { dayNightCycle } from './utils/initializers';

/**
 * Represents a Street Light object in the game world.
 * It combines a visual 3D mesh (loaded from a GLTF file) with a functional 
 * Three.js SpotLight. The light intensity automatically reacts to the 
 * global Day/Night cycle states.
 */
export class StreetLight {
    // A container group to hold the light, the target, and the 3D mesh together
    private group: THREE.Group;
    
    // The actual light source component
    private spotLight: THREE.SpotLight;
    
    // An invisible object used to define where the spotlight points (direction)
    private targetObject: THREE.Object3D;

    /**
     * Creates a new Street Light at the specified coordinates.
     * @param x The X position in the world.
     * @param z The Z position in the world.
     */
    constructor(x: number = 0 , z: number = 0) {
        this.group = new THREE.Group();

        // 1. Configure the Light Source
        // White light with intensity 7
        this.spotLight = new THREE.SpotLight(0xffffff, 7);
        this.spotLight.position.set(x, 7, z); // Positioned high up (7 units)
        this.spotLight.angle = Math.PI / 3;   // Cone angle (approx 60 degrees)
        this.spotLight.penumbra = 0.2;        // Soft edges of the light cone
        this.spotLight.decay = 0.1;           // How light dims over distance
        this.spotLight.distance = 30;         // Max range of the light

        this.group.add(this.spotLight);

        // 2. Configure the Target
        // Create an invisible target at ground level (y=0) to aim the light downwards
        this.targetObject = new THREE.Object3D();
        this.targetObject.position.set(x, 0, z);
        this.group.add(this.targetObject);
        
        // Link the spotlight to point at this target
        this.spotLight.target = this.targetObject;
        
        // 3. Load the Visual Mesh
        const loader = new GLTFLoader();
        loader.load('public/imports/low_poly_street_light/scene.gltf', (gltf) => {
            // Offset the model slightly (z-5) to align the mesh with the light source position
            gltf.scene.position.set(x, 0, z - 5);
            this.group.add(gltf.scene);
        });

        // Add the entire assembly to the main scene
        scene.add(this.group);
    }
    
    /**
     * Rotates the entire street light assembly around the Y axis.
     * Useful for orienting the mesh to face the road.
     * @param angle Angle in radians.
     */
    public rotateY(angle: number): void {
        this.group.rotateY(angle);
    }

    /**
     * Updates the light state based on the Day/Night cycle.
     * @param now Current timestamp (unused here but standard for animate loops).
     */
    public animate(): void {
        // Retrieve the current state from the global cycle manager
        let isDay = dayNightCycle.getIsDay();

        switch (isDay) {
            case 0: // STATE: Day
                // Turn off the light
                this.spotLight.intensity = 0;
                break;

            case 1: // STATE: Night
                // Turn on the light
                this.spotLight.intensity = 7;
                break;

            case 2: // STATE: Automatic (Dynamic)
                // Check the sun's elevation. If <= 0 (horizon/below), turn on.
                if (dayNightCycle.getSunHeight() <= 0) {
                    this.spotLight.intensity = 7; 
                } else {
                    this.spotLight.intensity = 0;
                }
                break;
        }
    }
}