import * as THREE from 'three';
import { scene, sunLight } from './scene';
import { skyBox } from './utils/initializers';
import { timeMode } from './controls';

export class DayNightCycle {

    private ambientLight: THREE.AmbientLight; // O HemisphereLight
    private angle: number = 0;
    private speed: number = 0.2; // Velocidad del ciclo
    private lastTime?: number;
    private isDay: number = 2; // 0: noche, 1: día, 2: automático

    constructor() {

        // Creamos una luz ambiental si no existe, para controlar el tono de la sombra
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(this.ambientLight);
    }

    public animate(deltaTime: number) {
        if (this.lastTime === undefined) this.lastTime = deltaTime;
        
        let deltaMs = deltaTime - this.lastTime;
        deltaMs = Math.min(deltaMs, 100); // clamp para evitar saltos grandes
        this.lastTime = deltaTime;
        
        // 1. Incrementar el ángulo
        this.angle += this.speed * (deltaMs * 0.001);

        // 2. Calcular nueva posición (Orbitar en el eje Z o X según tu eje 'arriba')
        // Asumiendo que Y es arriba en tu mundo:
        const radius = 500; // Ajusta según el tamaño de tu mapa
        sunLight.position.x = Math.cos(this.angle) * radius;
        sunLight.position.y = Math.sin(this.angle) * radius;
        
        // Hacer que la luz mire siempre al centro (o al kart)
        sunLight.lookAt(0, 0, 0);

        // 3. Calcular la fase del día (0 a 1) basándonos en la altura del sol (Y)
        // Si Y > 0 es día, si Y < 0 es noche.
        const sunHeight = Math.sin(this.angle);

        if (timeMode) {
            if (this.isDay % 3 == 0){
                this.updateSunLightColor(1); // Forzar día
            } else if (this.isDay % 3 == 1){
                this.updateSunLightColor(0); // Forzar noche

            } else {    
                this.updateSunLightColor(sunHeight); // Normal
            }
        } else {
            this.updateSunLightColor(sunHeight);
        }
    }

    private updateSunLightColor(sunHeight: number): void {
        if (sunHeight > 0) {
            // --- DÍA ---
            // Intensidad plena cuando está alto, tenue al atardecer
            sunLight.intensity = Math.max(0.1, sunHeight); 
            skyBox.setTime(sunHeight);

            // Color ambiental blanco/cálido
            this.ambientLight.color.setHSL(0.1, 0.5, 0.6); 
            this.ambientLight.intensity = 0.6;
        } else {
            // --- NOCHE ---
            // Apagamos el sol (o lo dejamos muy tenue como luna)
            sunLight.intensity = 0; 
            skyBox.setTime(sunHeight);
            // Color ambiental Azul Oscuro (Efecto noche)
            this.ambientLight.color.setHSL(0.6, 0.5, 0.1); // Azul
            this.ambientLight.intensity = 0.2; // Muy oscuro, aquí es donde brillarán los faros
        }
    }

    public changeDayTime(number: number): void {
        this.isDay = number;
    }

    public getSunLightAngle(): number {
        return this.angle;
    }
}