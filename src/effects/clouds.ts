import * as THREE from 'three';
import { getTexture } from '../utils/textureManager';
import { scene } from '../scene';
import { lerp } from 'three/src/math/MathUtils.js';
import { rain } from '../utils/initializers';

export class Clouds {
    private group: THREE.Group;
    private group2: THREE.Group;
    private cloudTextures: THREE.MeshStandardMaterial[] = [];
    private lastTime: number | undefined = undefined;
    private isRaining: boolean = false;
    // Control de la rotación y desplazamiento (mantener las propiedades anteriores)
    private rotationSpeed: number = 0.01; 

    // --- NUEVAS PROPIEDADES PARA EL TRUENO ---
    private flashLights: THREE.PointLight[] = []; // Array para guardar todas las luces estáticas
    private thunderActive: boolean = false;
    private thunderDuration: number = 0; // Duración restante del evento
    private thunderWaitTime: number = 10 + Math.random() * 10; // Tiempo de espera inicial (segundos)
    private maxFlashPower: number = 8000; // Máxima potencia individual (ajustar)
    
    // --- NUEVAS PROPIEDADES DE AUDIO ---
    private listener: THREE.AudioListener = new THREE.AudioListener(); // Necesitamos pasar el listener
    private thunderSound: THREE.Audio | null = null;
    
    // Bandera para evitar que se reproduzca el sonido varias veces durante un flash
    private soundPlayedForEvent: boolean = false;

    constructor() {
        this.group = new THREE.Group();
        this.group2 = new THREE.Group();

        // ----------------------------------------------------
        // LÓGICA DE CREACIÓN DE LUCES ESTÁTICAS (NUEVO)
        // ----------------------------------------------------
        const numLights = 12; // Número de puntos de luz para simular la descarga

        for (let i = 0; i < numLights; i++) {
            const flash = new THREE.PointLight( 0x0738da, 0, 800, 1.7); // Color azul claro, 0 power
            
            // Posicionamiento aleatorio en una caja grande encima de las nubes
            flash.position.set(
                (Math.random() - 0.5) * 500, // Rango X: -250 a 250
                40 + Math.random() * 10,    // Rango Y: 40 a 50 (encima de las nubes)
                (Math.random() - 0.5) * 500  // Rango Z: -250 a 250
            );
            flash.power = 0; // Inicia apagada
            this.flashLights.push(flash);
            this.group.add(flash); // Añadir al grupo de rotación si quieres que roten con las nubes
        }

        //scene.add(flashHelper);
        //300,100,300
        // Material y geometría base
        const texture = getTexture("clouds.texture");
        const texture2 = getTexture("clouds2.texture");
        const texture3 = getTexture("clouds3.texture");

        const cloudGeo = new THREE.PlaneGeometry(500,200);
        const cloudGeo2 = new THREE.PlaneGeometry(400,200);
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
        let pos = 200;
        for(let p=0; p<12; p++) {

            let cloud = new THREE.Mesh(cloudGeo, this.cloudTextures[p % 3]);
            let cloud2 = new THREE.Mesh(cloudGeo, this.cloudTextures[p % 3]);
            let cloud3 = new THREE.Mesh(cloudGeo2, this.cloudTextures[p % 3]);
            let cloud4 = new THREE.Mesh(cloudGeo2, this.cloudTextures[p % 3]);
            if (p %2 ==0) {
                cloud.position.set(
                    0,//lerp(-30, 30, Math.random()) + p, //Math.random()*800 -400,
                    50, //lerp(50, 75, Math.random()),//100/2,
                    lerp(pos, pos+p*2+1, Math.random()) + p*2//Math.random()*150
                );
                cloud.material.opacity = 0.6;

                cloud2.position.set(
                    0,//lerp(-30, 30, Math.random()) + p, //Math.random()*800 -400,
                    50,//lerp(50, 75, Math.random()),//100/2,
                    lerp(-pos, -(pos+p*2+1), Math.random())- p*2//Math.random()*150
                );
                cloud2.material.opacity = 0.6;
                
                cloud3.rotation.y = Math.PI/2;
                cloud3.position.set(
                    lerp(pos, pos+p*2+1, Math.random()) + p*2, //Math.random()*800 -400,
                    40,//lerp(40, 65, Math.random()),//100/2,
                    0,//lerp(-15, 15, Math.random())+ p//Math.random()*150
                );
                cloud3.material.opacity = 0.6;
                
                cloud4.rotation.y = Math.PI/2;
                cloud4.position.set(
                    lerp(-pos, -(pos+p*2+1), Math.random()) - p*2 , //Math.random()*800 -400,
                    40,//lerp(40, 65, Math.random()),//100/2,
                    0,//lerp(-15, 15, Math.random())+ p//Math.random()*150
                );
                cloud4.material.opacity = 0.6;

                this.group.add(cloud, cloud2, cloud3, cloud4)
            } else {
                cloud.position.set(
                    0,//lerp(-30, 30, Math.random()) + p, //Math.random()*800 -400,
                    50, //lerp(50, 75, Math.random()),//100/2,
                    200 + p*2//Math.random()*150
                );
                cloud.material.opacity = 0.6;

                cloud2.position.set(
                    0,//lerp(-30, 30, Math.random()) + p, //Math.random()*800 -400,
                    50,//lerp(50, 75, Math.random()),//100/2,
                    -200 - p*2//Math.random()*150
                );
                cloud2.material.opacity = 0.6;
                
                cloud3.rotation.y = Math.PI/2;
                cloud3.position.set(
                    200 + p*2, //Math.random()*800 -400,
                    40,//lerp(40, 65, Math.random()),//100/2,
                    0,//lerp(-15, 15, Math.random())+ p//Math.random()*150
                );
                cloud3.material.opacity = 0.6;
                
                cloud4.rotation.y = Math.PI/2;
                cloud4.position.set(
                    -200 - p*2 , //Math.random()*800 -400,
                    40,//lerp(40, 65, Math.random()),//100/2,
                    0,//lerp(-15, 15, Math.random())+ p//Math.random()*150
                );
                cloud4.material.opacity = 0.6;
                cloud.scale.set(0.4,0.4,0.4);
                cloud2.scale.set(0.4,0.4,0.4);
                cloud3.scale.set(0.3,0.3,0.3);
                cloud4.scale.set(0.3,0.3,0.3);
                this.group2.add(cloud, cloud2, cloud3, cloud4)
            };
            
            pos = pos + p*2 +5;
        }
        this.group2.rotateY(Math.PI/4);
        this.group.visible = false;
        this.group2.visible = false;
        scene.add(this.group, this.group2);
        
        // ----------------------------------------------------
        // LÓGICA DE CARGA DE SONIDO (NUEVO)
        // ----------------------------------------------------
        const audioLoader = new THREE.AudioLoader();
        this.thunderSound = new THREE.Audio(this.listener);
        
        // ¡IMPORTANTE! Reemplaza 'ruta/a/trueno.mp3' con la ruta real de tu archivo
        audioLoader.load('src/effects/thunder-sound-effect.mp3', (buffer) => {
            this.thunderSound!.setBuffer(buffer);
            this.thunderSound!.setLoop(false); // No se repite
            this.thunderSound!.setVolume(0.8); // Volumen
        });

    }
    
    public animate(deltaTime: number): void {
        // Cálculo de deltaS (su lógica, la cual es CORRECTA)
        if (this.lastTime === undefined) this.lastTime = deltaTime;
        let deltaMs = deltaTime - this.lastTime;
        deltaMs = Math.min(deltaMs, 100); 
        this.lastTime = deltaTime;
        const deltaS = deltaMs * 0.001;

        if (!this.isRaining) return; // No animar nubes si no está lloviendo

        // 1. ROTACIÓN Y SCROLLING (Añadir la lógica de desplazamiento de la respuesta anterior)
        this.group.rotation.y += this.rotationSpeed * deltaS;
        this.group2.rotation.y += (this.rotationSpeed / 2) * deltaS; // Rota un grupo diferente
    
        if (!this.thunderActive) {
                // --- FASE DE ESPERA ---
                this.thunderWaitTime -= deltaS;

                if (this.thunderWaitTime <= 0) {
                    this.thunderActive = true;
                    this.thunderDuration = 0.4 + Math.random() * 1.2; // Flash dura entre 0.4s y 1.2s
                    this.soundPlayedForEvent = false; // Resetear la bandera al iniciar nuevo evento
                }
        }

        if (this.thunderActive) {
            // --- FASE DE FLASH/PARPADEO ---
            this.thunderDuration -= deltaS;

            if (!this.soundPlayedForEvent && this.thunderSound && this.thunderSound.buffer) {
                // El método play() solo funciona si el usuario ya ha interactuado con la página (p.ej., un clic).
                this.thunderSound.play();
                this.soundPlayedForEvent = true; // Marcar como reproducido para este evento
            }

            if (this.thunderDuration > 0) {
                
                // 1. Efecto Parpadeo Erático
                this.flashLights.forEach(light => {
                    // Hay 30% de probabilidad de que una luz individual parpadee en este frame
                    if (Math.random() > 0.7) {
                        // La luz se activa con una potencia aleatoria, creando picos irregulares
                        light.power = this.maxFlashPower * (0.5 + Math.random() * 0.5); 
                    }
                    
                    // 2. Desvanecimiento: Todas las luces se atenúan rápidamente
                    // Usamos lerp para forzar el apagado en cada frame
                    light.power = lerp(light.power, 0, deltaS * 30); 
                });
                
            } else {
                // --- FIN DEL EVENTO ---
                this.thunderActive = false;
                this.thunderWaitTime = 5 + Math.random() * 15; // Próximo trueno en 5 a 20 segundos
                
                // Asegurarse de que todas las luces estén completamente apagadas
                this.flashLights.forEach(light => {
                    light.power = 0;
                });
            }
        }
        
    }

    public setRaining(rain?:boolean): void{
        this.isRaining = !this.isRaining;

        if(this.isRaining) {
            this.group.visible = true;
            this.group2.visible = true;
        } else {
            this.group.visible = false;
            this.group2.visible = false;
        }
    }
}