import * as THREE from 'three';
import { getTexture } from '../../src/utils/textureManager';
import { scene } from '../../src/scene';
import { lerp } from 'three/src/math/MathUtils.js';

/**
 * Clouds - Dynamic Weather & Storm Manager.
 * * Orchestrates the visual and audio elements of a thunderstorm.
 * * Manages rotating cloud layers and a procedural lightning system using scattered PointLights.
 */
export class Clouds {
    // --- Visual Layers ---
    private group: THREE.Group;  // Primary cloud layer
    private group2: THREE.Group; // Secondary cloud layer (for parallax depth)
    private cloudTextures: THREE.MeshStandardMaterial[] = []; // Stores materials for potential reuse/updates

    // --- Animation State ---
    private lastTime: number | undefined = undefined; // Timestamp helper for delta time
    private isRaining: boolean = false; // Master toggle for the entire system
    private rotationSpeed: number = 0.01; // Base rotation speed for the cloud ring

    // --- Lightning System Properties ---
    private flashLights: THREE.PointLight[] = []; // Pool of 12 invisible lights used for lightning
    private thunderActive: boolean = false;       // State flag: Is a flash sequence currently happening?
    private thunderDuration: number = 0;          // Time remaining in the current flash sequence
    private thunderWaitTime: number = 10 + Math.random() * 10; // Countdown timer to the next random event
    private maxFlashPower: number = 8000;         // Peak intensity for the lightning lights

    // --- Audio Properties ---
    // Listener usually comes from the camera, but a new one is instantiated here as per implementation
    private listener: THREE.AudioListener = new THREE.AudioListener(); 
    private thunderSound: THREE.Audio | null = null;
    
    // Flag to ensure the sound effect triggers exactly once per lightning event
    private soundPlayedForEvent: boolean = false;

    /**
     * Constructor: Initializes the 3D cloud structure, the lightning light pool, and loads audio.
     */
    constructor() {
        this.group = new THREE.Group();
        this.group2 = new THREE.Group();

        // 1. LIGHTNING POOL INITIALIZATION
        const numLights = 12; // Number of distinct flash points

        for (let i = 0; i < numLights; i++) {
            // Create a blue-ish PointLight (Distance 800, Decay 1.7)
            const flash = new THREE.PointLight( 0x0738da, 0, 800, 1.7); 
            
            // Randomly position the light within a volume above the player/track
            flash.position.set(
                (Math.random() - 0.5) * 500, // X spread
                40 + Math.random() * 10,     // Y Height (just above cloud meshes)
                (Math.random() - 0.5) * 500  // Z spread
            );
            flash.power = 0; // Start dormant (invisible)
            
            this.flashLights.push(flash);
            this.group.add(flash); // Add to group so lights rotate with the storm system
        }

        // 2. CLOUD MESH GENERATION
        // Load textures via manager
        const texture = getTexture("clouds.texture");
        const texture2 = getTexture("clouds2.texture");
        const texture3 = getTexture("clouds3.texture");

        // Define geometries for cloud planes
        const cloudGeo = new THREE.PlaneGeometry(500,200);
        const cloudGeo2 = new THREE.PlaneGeometry(400,200);
        
        // Define materials (Standard Material reacts to scene lighting)
        // depthWrite: false is CRITICAL for transparent objects to render without occlusion artifacts
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const cloudMaterial2 = new THREE.MeshStandardMaterial({
            map: texture2,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const cloudMaterial3 = new THREE.MeshStandardMaterial({
            map: texture3,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.cloudTextures.push(cloudMaterial, cloudMaterial2, cloudMaterial3); 
        
        // Procedural Generation Loop
        // Creates a ring/wall of cloud planes around the center
        let pos = 200;
        for(let p=0; p<12; p++) {
            let cloud = new THREE.Mesh(cloudGeo, this.cloudTextures[p % 3]);
            let cloud2 = new THREE.Mesh(cloudGeo, this.cloudTextures[p % 3]);
            let cloud3 = new THREE.Mesh(cloudGeo2, this.cloudTextures[p % 3]);
            let cloud4 = new THREE.Mesh(cloudGeo2, this.cloudTextures[p % 3]);
            
            if (p % 2 == 0) {
                // Configuration for Even indices (Outer Ring)
                cloud.position.set(0, 50, lerp(pos, pos+p*2+1, Math.random()) + p*2);
                cloud.material.opacity = 0.6;

                cloud2.position.set(0, 50, lerp(-pos, -(pos+p*2+1), Math.random())- p*2);
                cloud2.material.opacity = 0.6;
                
                cloud3.rotation.y = Math.PI/2;
                cloud3.position.set(lerp(pos, pos+p*2+1, Math.random()) + p*2, 40, 0);
                cloud3.material.opacity = 0.6;
                
                cloud4.rotation.y = Math.PI/2;
                cloud4.position.set(lerp(-pos, -(pos+p*2+1), Math.random()) - p*2, 40, 0);
                cloud4.material.opacity = 0.6;

                this.group.add(cloud, cloud2, cloud3, cloud4)
            } else {
                // Configuration for Odd indices (Inner Ring/Variation)
                cloud.position.set(0, 50, 200 + p*2);
                cloud.material.opacity = 0.6;

                cloud2.position.set(0, 50, -200 - p*2);
                cloud2.material.opacity = 0.6;
                
                cloud3.rotation.y = Math.PI/2;
                cloud3.position.set(200 + p*2, 40, 0);
                cloud3.material.opacity = 0.6;
                
                cloud4.rotation.y = Math.PI/2;
                cloud4.position.set(-200 - p*2, 40, 0);
                cloud4.material.opacity = 0.6;
                
                // Scale variations for inner clouds
                cloud.scale.set(0.4,0.4,0.4);
                cloud2.scale.set(0.4,0.4,0.4);
                cloud3.scale.set(0.3,0.3,0.3);
                cloud4.scale.set(0.3,0.3,0.3);

                this.group2.add(cloud, cloud2, cloud3, cloud4)
            };
            
            pos = pos + p*2 +5;
        }

        // Rotate secondary group for visual variety
        this.group2.rotateY(Math.PI/4);
        
        // Hide on start (requires manual activation via setRaining)
        this.group.visible = false;
        this.group2.visible = false;
        scene.add(this.group, this.group2);
        
        // 3. AUDIO SYSTEM INITIALIZATION
        const audioLoader = new THREE.AudioLoader();
        this.thunderSound = new THREE.Audio(this.listener);
        
        // Load the thunder sound file asynchronously
        audioLoader.load('pubilc/effects/thunder-sound-effect.mp3', (buffer) => {
            this.thunderSound!.setBuffer(buffer);
            this.thunderSound!.setLoop(false); // Play once per event
            this.thunderSound!.setVolume(0.8); // High volume for impact
        });

    }
    
    /**
     * Main Animation Loop. Called every frame by the game engine.
     * Handles rotation physics and the Thunder State Machine.
     * @param deltaTime Timestamp in milliseconds.
     */
    public animate(deltaTime: number): void {
        // --- Delta Time Calculation ---
        if (this.lastTime === undefined) this.lastTime = deltaTime;
        let deltaMs = deltaTime - this.lastTime;
        deltaMs = Math.min(deltaMs, 100); // Clamp to avoid large jumps
        this.lastTime = deltaTime;
        const deltaS = deltaMs * 0.001; // Convert to seconds

        // Optimization: Exit immediately if weather system is inactive
        if (!this.isRaining) return; 

        // 1. CLOUD ROTATION PHYSICS
        // Rotate the two cloud groups at different speeds to create a parallax effect
        this.group.rotation.y += this.rotationSpeed * deltaS;
        this.group2.rotation.y += (this.rotationSpeed / 2) * deltaS; 
    
        // 2. THUNDER STATE MACHINE
        
        // STATE: WAITING (Cooldown phase)
        if (!this.thunderActive) {
                this.thunderWaitTime -= deltaS;

                if (this.thunderWaitTime <= 0) {
                    // Trigger new lightning event
                    this.thunderActive = true;
                    // Random duration for the storm surge (0.4s to 1.6s)
                    this.thunderDuration = 0.4 + Math.random() * 1.2; 
                    this.soundPlayedForEvent = false; // Reset audio flag
                }
        }

        // STATE: ACTIVE (Flashing phase)
        if (this.thunderActive) {
            this.thunderDuration -= deltaS;

            // Trigger Audio (Once per event start)
            if (!this.soundPlayedForEvent && this.thunderSound && this.thunderSound.buffer) {
                this.thunderSound.play();
                this.soundPlayedForEvent = true; 
            }

            if (this.thunderDuration > 0) {
                // STROBE EFFECT: Randomly modulate light intensity
                this.flashLights.forEach(light => {
                    // 30% chance per frame for a light to "spike" in brightness
                    if (Math.random() > 0.7) {
                        light.power = this.maxFlashPower * (0.5 + Math.random() * 0.5); 
                    }
                    
                    // DECAY: Fade out light rapidly using linear interpolation
                    light.power = lerp(light.power, 0, deltaS * 30); 
                });
                
            } else {
                // END EVENT: Reset state
                this.thunderActive = false;
                this.thunderWaitTime = 5 + Math.random() * 15; // Set new random cooldown (5-20s)
                
                // Ensure complete blackout of lightning lights
                this.flashLights.forEach(light => {
                    light.power = 0;
                });
            }
        }
    }

    /**
     * Toggles the active state of the storm system.
     * @param rain Optional boolean to force state. If undefined, toggles current state.
     */
    public setRaining(): void{
        this.isRaining = !this.isRaining;

        if(this.isRaining) {
            // Show clouds
            this.group.visible = true;
            this.group2.visible = true;
        } else {
            // Hide clouds and disable effects
            this.group.visible = false;
            this.group2.visible = false;
        }
    }
}