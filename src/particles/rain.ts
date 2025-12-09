import * as THREE from 'three';
import { scene } from '../scene';
import { kart } from '../utils/initializers';

export class Rain {

    private geometry: THREE.BufferGeometry;
    private material: THREE.PointsMaterial;
    private particles: THREE.Points;
    private count: number;
    
    // SoA: Estructura de Arrays
    private velocities: Float32Array; // Guardamos la velocidad Y de cada gota

    // Límites de la caja de lluvia
    private height: number = 200; // Altura desde donde caen
    private spread: number = 400; // Qué tan ancho es el área de lluvia

    constructor(count: number = 15000) {
        this.count = count;
        this.geometry = new THREE.BufferGeometry();

        // 1. Arrays de Datos (SoA)
        const positions = new Float32Array(this.count * 3); // x, y, z por cada gota
        this.velocities = new Float32Array(this.count);     // solo velocidad vertical (y)

        // 2. Inicialización
        for (let i = 0; i < this.count; i++) {
            // Posición aleatoria en el mundo
            positions[i * 3] = (Math.random() - 0.5) * this.spread;     // X
            positions[i * 3 + 1] = Math.random() * this.height;         // Y (altura aleatoria inicial)
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.spread; // Z

            // Velocidad aleatoria: Entre -1 y -3 unidades por frame (muy rápido)
            // Variar esto hace que la lluvia se sienta con profundidad
            this.velocities[i] = -0.1 - Math.random()* 0.1; 
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // 3. Material
        // Usamos un color gris azulado y transparente
        //const loader = new THREE.TextureLoader();
        // Tip: Busca en google "rain drop texture png" para un mejor efecto
        
        this.material = new THREE.PointsMaterial({
            color: 0xfafafa,
            size: 0.1,
            transparent: true,
            opacity: 0.4,
            depthWrite: false, // Importante para transparencias
            blending: THREE.AdditiveBlending,
            //map: loader.load('src/textures/rain2.jpg') // Descomenta si tienes textura
        });

        this.particles = new THREE.Points(this.geometry, this.material);
        scene.add(this.particles);
    }

    // 4. El Loop de Animación (Donde ocurre la magia del SoA)
    public animate(deltaTime: number): void {
        // Obtenemos acceso directo al array de posiciones en memoria
        const positions = this.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < this.count; i++) {
            // --- ACTUALIZAR FÍSICA ---
            
            // Accedemos a Y (índice i*3 + 1) y sumamos su velocidad
            // positions[i*3 + 1] es la coordenada Y actual
            // this.velocities[i] es cuánto debe bajar
            positions[i * 3 + 1] += this.velocities[i];

            // --- LÓGICA DE RECICLAJE (La cinta transportadora) ---
            
            // Si toca el suelo...
            if (positions[i * 3 + 1] < 0) {
                // ...La enviamos al cielo
                positions[i * 3 + 1] = 30; // Altura del cielo

                // TRUCO: Reposicionamos la gota ALREDEDOR DEL KART
                // Así siempre llueve donde está el jugador
                positions[i * 3] = kart.getBody().position.x + (Math.random() - 0.5) * 200; // Rango X
                positions[i * 3 + 2] = kart.getBody().position.z + (Math.random() - 0.5) * 200; // Rango Z
            }
        }

        // ¡CRÍTICO! Decirle a Three.js que los puntos se movieron
        this.geometry.attributes.position.needsUpdate = true;
    }
}