import * as THREE from 'three';
import { scene, sunLight } from './scene';
import { skyBox } from './utils/initializers';
import { timeMode } from './controls';

/**
 * Manages the global environmental lighting and celestial movement.
 * Responsibilities:
 * - Orbit the main DirectionalLight (Sun) around the scene.
 * - Modulate AmbientLight intensity and color (Warm for day, Blue for night).
 * - Synchronize with the SkyBox to show day/night textures.
 * - Handle manual overrides (Forced Day/Night) for debugging or gameplay phases.
 */
export class DayNightCycle {

    private ambientLight: THREE.AmbientLight; 
    
    // Orbital mechanics properties
    private angle: number = 0;   // Current position in radians
    private speed: number = 0.2; // Speed of the day passing
    private lastTime?: number;   // Helper for Delta Time calculation
    
    // Mode State: 
    // 0 = Forced Day
    // 1 = Forced Night
    // 2 = Automatic Cycle
    private isDay: number = 2; 
    
    private sunHeight: number = 0; // Sine of the angle (Y position)

    /**
     * Constructor: Sets up the secondary lighting (Ambient) which prevents
     * shadows from being pitch black.
     */
    constructor() {
        // Create soft fill light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(this.ambientLight);
    }

    /**
     * Main update loop.
     * @param deltaTime Timestamp from requestAnimationFrame.
     */
    public animate(deltaTime: number) {
        // --- 1. Delta Time Calculation ---
        if (this.lastTime === undefined) this.lastTime = deltaTime;
        
        let deltaMs = deltaTime - this.lastTime;
        deltaMs = Math.min(deltaMs, 100); // Clamp to prevent jumping if tab is inactive
        this.lastTime = deltaTime;
        
        // --- 2. Orbital Physics ---
        // Increment angle based on time
        this.angle += this.speed * (deltaMs * 0.001);

        // Calculate Cartesian coordinates for circular orbit (Radius = 500)
        const radius = 500; 
        sunLight.position.x = Math.cos(this.angle) * radius;
        sunLight.position.y = Math.sin(this.angle) * radius; // Y determines Day/Night
        
        // Ensure sun always points to the center of the map
        sunLight.lookAt(0, 0, 0);

        // Calculate height factor (-1 to 1)
        this.sunHeight = Math.sin(this.angle);

        // --- 3. Mode Handling (Manual vs Automatic) ---
        // 'timeMode' is likely a boolean flag from 'controls' enabling/disabling overrides
        if (timeMode) {
            // Check state using Modulo 3
            if (this.isDay % 3 == 0){
                this.updateSunLightColor(1); // Pass 1.0 (High Noon) -> Forced Day
            } else if (this.isDay % 3 == 1){
                this.updateSunLightColor(0); // Pass 0.0 (Horizon/Below) -> Forced Night
            } else {    
                this.updateSunLightColor(this.sunHeight); // Pass calculated height -> Automatic
            }
        } else {
            // Default behavior if controls are disabled
            this.updateSunLightColor(this.sunHeight);
        }
    }

    /**
     * Updates the visual properties of lights and skybox based on sun height.
     * @param sunHeight Value indicating sun elevation. >0 is Day, <=0 is Night.
     */
    private updateSunLightColor(sunHeight: number): void {
        if (sunHeight > 0) {
            // --- DAY STATE ---
            
            // Sun intensity scales with height (dimmer at sunrise/sunset, bright at noon)
            // Clamped at 0.1 minimum to ensure it's not pitch black at dawn
            sunLight.intensity = Math.max(0.1, sunHeight); 
            
            // Notify SkyBox to show Day texture
            skyBox.setTime(sunHeight);

            // Ambient Light: Bright and slightly warm/white
            this.ambientLight.color.setHSL(0.1, 0.5, 0.6); 
            this.ambientLight.intensity = 0.6;
        } else {
            // --- NIGHT STATE ---
            
            // Turn off the Sun (Directional Light)
            sunLight.intensity = 0; 
            
            // Notify SkyBox to show Night texture
            skyBox.setTime(sunHeight);
            
            // Ambient Light: Dim and Blue (Moonlight simulation)
            this.ambientLight.color.setHSL(0.6, 0.5, 0.1); 
            this.ambientLight.intensity = 0.2; // Dark shadows allowing headlights to pop
        }
    }

    // --- Getters & Setters ---

    /**
     * Changes the cycle mode.
     * @param number 0: Force Day, 1: Force Night, 2: Auto
     */
    public changeDayTime(number: number): void {
        this.isDay = number;
    }

    public getIsDay(): number {
        return this.isDay;
    }

    public getSunLightAngle(): number {
        return this.angle;
    }

    public getSunHeight(): number {
        return this.sunHeight;
    }
}