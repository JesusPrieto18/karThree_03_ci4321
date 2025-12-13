import * as THREE from 'three';
import { scene } from '../scene';
import { kart } from '../utils/initializers';

/**
 * Rain - High Performance Weather System.
 * * Simulates a dense rainstorm using a single Points object and direct buffer manipulation.
 * * Includes synchronized ambient audio.
 */
export class Rain {

    // --- Visual Components ---
    private geometry: THREE.BufferGeometry;
    private material: THREE.PointsMaterial;
    private particles: THREE.Points; // The single mesh containing all drops
    private count: number;           // Total particle count
    private isRaining: boolean = false; // Master toggle

    // --- Audio Components ---
    private listener: THREE.AudioListener = new THREE.AudioListener();
    private rainSound: THREE.Audio | null = null;

    // --- Physics Simulation Data (SoA) ---
    // We only need vertical velocity for simple rain
    private velocities: Float32Array; 

    // --- Simulation Bounds ---
    private height: number = 200; // Ceiling height
    private spread: number = 400; // X/Z spread area

    /**
     * Initializes the rain system.
     * @param count Number of drops to simulate. Default 15,000 provides dense coverage.
     */
    constructor(count: number = 15000) {
        this.count = count;
        this.geometry = new THREE.BufferGeometry();

        // 1. DATA INITIALIZATION (SoA)
        // Allocate memory for positions (x,y,z per drop) and velocities
        const positions = new Float32Array(this.count * 3); 
        this.velocities = new Float32Array(this.count);     

        // 2. PARTICLE SPAWNING
        for (let i = 0; i < this.count; i++) {
            // Random start position within the defined volume
            positions[i * 3] = (Math.random() - 0.5) * this.spread;     // X
            positions[i * 3 + 1] = Math.random() * this.height;         // Y
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.spread; // Z

            // Randomized fall speed for natural variation
            this.velocities[i] = -0.1 - Math.random() * 0.1; 
        }

        // Upload data to GPU
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // 3. VISUAL SETUP
        this.material = new THREE.PointsMaterial({
            color: 0xfafafa,        // Almost white
            size: 0.1,              // Small dots
            transparent: true,
            opacity: 0.4,           // Semi-transparent
            depthWrite: false,      // Prevent Z-fighting with other transparent objects
            blending: THREE.AdditiveBlending, // Makes drops glow slightly against dark backgrounds
        });

        this.particles = new THREE.Points(this.geometry, this.material);
        this.particles.visible = false; // Start hidden
        scene.add(this.particles);

        // 4. AUDIO SETUP
        const audioLoader = new THREE.AudioLoader();
        this.rainSound = new THREE.Audio(this.listener);
        
        // Load ambient loop asynchronously
        audioLoader.load('src/effects/rain-01.mp3', (buffer) => {
            this.rainSound!.setBuffer(buffer);
            this.rainSound!.setLoop(true); // Enable continuous looping
            this.rainSound!.setVolume(0.3); // Background volume
        });
    }

    /**
     * Main Physics Loop.
     * Moves every drop downward and handles recycling logic.
     * @param deltaTime Timestamp (unused here as velocity is per-frame constant, but good practice).
     */
    public animate(deltaTime: number): void {
        
        if (!this.isRaining) return;
       
        // Direct access to the raw position buffer
        const positions = this.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < this.count; i++) {
            // --- PHYSICS UPDATE ---
            // Apply vertical velocity to Y coordinate
            positions[i * 3 + 1] += this.velocities[i];

            // --- RECYCLING LOGIC (Teleport) ---
            // If drop falls below ground (Y < 0)
            if (positions[i * 3 + 1] < 0) {
                // Reset to ceiling height
                positions[i * 3 + 1] = 30; 

                // OPTIMIZATION TRICK:
                // Respawn the drop specifically around the Player's Kart.
                // This ensures we don't waste particles rendering rain far away.
                positions[i * 3] = kart.getBody().position.x + (Math.random() - 0.5) * 200; 
                positions[i * 3 + 2] = kart.getBody().position.z + (Math.random() - 0.5) * 200; 
            }
        }

        // Flag buffer as dirty so Three.js re-uploads it to GPU
        this.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Toggles the rain system (Visuals + Audio).
     */
    public rainingOn(): void {
        this.isRaining = !this.isRaining;

        if (this.isRaining) {
            // Enable Visuals
            this.particles.visible = true;
            
            // Start Audio (if loaded and not already playing)
            if (this.rainSound && this.rainSound.buffer && !this.rainSound.isPlaying) {
                this.rainSound.play();
            }
        } else {
            // Disable Visuals
            this.particles.visible = false;
            
            // Stop Audio
            if (this.rainSound && this.rainSound.isPlaying) {
                this.rainSound.stop();
            }
        }
    }
}