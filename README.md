# karThree_03_ci4321
Un pequeño prototipo 3D desarrollado con **Three.js** que simula un kart con físicas simples, colisiones, power-ups y proyectiles (como bombas y shurikens).  
Desarrollado por Jesús Prieto y Jesús Cuéllar **The Yisus Team** en la materia **CI4321 Computación Gráfica I** de la Universidad Simón Bólivar.

---

## Instalación y ejecución
Seguir las instrucciones y ejecutar el comando correspondiente.
### 1. Clonar el repositorio y entrar al directorio
- 1. Clonar el repositorio:
```bash
git clone https://github.com/JesusPrieto18/karThree_03_ci4321.git
cd karThree_03_ci4321
```
- 2. Entrar al directorio:
```bash
cd karThree_03_ci4321
```
- Instalar git (Linux);
```bash
sudo apt-get update
sudo apt-get install git
```
- Instalar git (Windows):
Otras alternativas en:
https://git-scm.com/book/es/v2/Inicio---Sobre-el-Control-de-Versiones-Instalación-de-Git

### 2. Instalar dependencias
Asegúrate de tener **Node.js v18** o superior. (Si no lo tienes, descárgalo desde: https://nodejs.org)

```bash
npm install
```

### 4. Hacer el build del proyecto 
Este paso no es necesario si se usa el modo de ejecución directo. 
```bash
npm run build
```

### 5. Ejecutar
Para modo desarrollo se debe hacer el build (Paso anterior). 
Se recomienda usar el modo directo.
- **Desarrollo**  
```bash
npm run dev
```
- **Directo**
```bash
npx vite
```
### 6. Abrir en el navegador
Por defecto el servidor se abre en  
http://localhost:5173

## Power-Ups y proyectiles

- **Shuriken**: Gira y avanza en línea recta hasta colisionar.  
- **Bomb**: Se lanza, cae con gravedad, tiene una mecha visual y explota tras 3 segundos o al tocar el suelo, parades o conos.
- **Cafe**: Da energia y aumenta la aceleración del carro por aproximadamente 2 segundos. 

---

## Cámaras

El juego soporta **dos modos de cámara**:
1. **Tercera persona** (detrás del kart)
2. **Primera persona** (desde dentro del kart mirando el horizonte)

Se alternan con la tecla `C`.

---

## Controles

| Tecla | Acción |
|-------|--------|
| **Flecha arriba** | Acelerar |
| **Flecha abajo**| Retroceder |
| **Flecha izquierda** | Girar a la izquierda |
| **Flecha derecha** | Girar a la derecha |
| **C** | Cambiar cámara |
| **B** | Alternar con vista reversa |
| **V** | Control total de la cámara |
| **Espacio** | Usar PowerUp|

---

### Controles Modo God

| Tecla | Acción |
|-------|--------|
| **G** | Activar/Desactivar Modo Dios |
| **0** | Shuriken |
| **1**| Shuriken Doble |
| **2** |Shuriken Triple|
| **3** | Bomba |
| **4** | Cafe |
| **5** | Cafe Doble |
| **6** | Cafe Triple |
|**Minus (-)**| Elimina el PowerUp Cargado para elegir otro |
---

### Controles Modo Time

| Tecla | Acción |
|-------|--------|
| **T** | Activar/Desactivar Modo tiempo |
| **0** | Dia |
| **1**| Noche |
| **2** |Automatico|
| **3** |Nublado|
| **4** |Lluvia|
---
### Sistema de Puntación

El sistema de puntuación para esta entrega se basa en sumar puntos cuando se carga un PowerUp. Solo se suma puntos en el instante que se adquiere el PowerUp y sin tener un PowerUp activo.

| Puntuación | PowerUp |
|-------|--------|
| **100** | Shuriken |
| **200**| Shuriken Doble |
| **300** |Shuriken Triple|
| **150** | Bomba |
| **100** | Cafe |
| **200** | Cafe Doble |
| **300** | Cafe Triple |

---
## Sistema de colisiones

El proyecto usa un **Collision Observer** central que mantiene una lista de objetos registrables (`CollisionClassName`):

- Cada objeto (`Kart`, `Walls`, `Bomb`, etc.) implementa `isColliding(target)`.
- El observador compara todos los pares y llama el método respectivo si sus AABB se intersectan.
- Ejemplo:
  ```ts
  if (aabbIntersects(bomb, wall)) {
    bomb.explode()};
      
  ```

---
## Arquitectura
Archivos principales de la arquitectura del proyecto. 

```bash
|── node_modules/                # Dependencias instaladas por npm
|── src/                         # Código fuente principal del juego
│   ├── effects/                 # Efectos visuales y ambientales
│   │   ├── clouds.ts            # Lógica y renderizado de nubes animadas
│   │   ├── rain.ts              # Lógica y renderizado de lluvia
        ├── tireSpray.ts         # Lógica del efecto tireSpray
│   ├── imports/                 # Modelos y texturas importados de terceros
│   │   ├── low_poly_street_light/           # Faroles low poly
│   ├── models/                  # Clases base y de colisión
│   │   └── colisionClass.ts     # Clase base para objetos colisionables
│   ├── textures/                # Texturas organizadas por tipo
│   │   ├── Hud/                 # Texturas para la interfaz HUD
│   │   ├── Kar/                 # Texturas y descripciones para el kart
│   │   │   ├── metal_0065_description.txt
│   │   │   ├── metal_0065_keywords.txt
│   │   │   ├── plastic_0022_description.txt
│   │   │   ├── plastic_0022_keywords.txt
│   │   ├── PowerUps/           # Texturas para power-ups
│   │   │   ├── Bomb/
│   │   │   ├── Coffee/
│   │   │   ├── Shuriken/
│   │   ├── Resource Boy - Cloud Textures/   # Texturas de nubes
│   │   │   └── License.txt
│   │   ├── Sky/                 # Cielos y cubemaps
│   │   │   ├── autumn_hill_view_1k.hdr
│   │   │   ├── License.txt
│   │   │   └── Cubemap/
│   │   ├── StacticObjects/      # Texturas para objetos estáticos
│   │   │   ├── Conne/
│   │   │   ├── Ground/
│   │   │   ├── PowerBox/
│   │   │   ├── RaceTrack/
│   │   │   ├── Usb/
│   │   │   └── Walls/
│   ├── utils/                   # Utilidades y lógica auxiliar
│   │   ├── animation.ts         # Loop de animación principal
│   │   ├── cameraControls.ts    # Control de cámara y vistas
│   │   ├── colliding.ts         # Lógica del patrón Observer para colisiones
│   │   ├── initializers.ts      # Inicialización de objetos y escena
│   │   ├── textureManager.ts    # Gestión y carga de texturas
│   │   ├── utils.ts             # Funciones utilitarias generales
│   ├── bomb.ts                  # Clase Bomb: proyectil con gravedad y temporizador
│   ├── box.ts                   # Obstáculos tipo caja
│   ├── city.ts                  # Escenografía de ciudad de fondo
│   ├── coffee.ts                # Power-up tipo café (aumenta velocidad)
│   ├── controls.ts              # Manejo de controles del jugador
│   ├── dayNightCycle.ts         # Ciclo día/noche y luz ambiental
│   ├── ground.ts                # Lógica y renderizado del suelo
│   ├── hud.ts                   # Interfaz HUD y puntos
│   ├── kart.ts                  # Lógica y modelo del kart principal
│   ├── powerUps.ts              # Lógica de power-ups recogibles
│   ├── raceTrack.ts             # Clase RaceTrack: pista y colisiones
│   ├── scene.ts                 # Configuración de la escena principal
│   ├── shuriken.ts              # Clase Shuriken: proyectil giratorio
│   ├── shurikenInfo.ts          # Datos de geometría del shuriken
│   ├── skyBox.ts                # Renderizado del skybox
│   ├── streetLamp.ts            # Lámparas de calle
│   ├── trafficCone.ts           # Obstáculo tipo cono
│   ├── usb.ts                   # Objeto USB decorativo
│   ├── walls.ts                 # Muros y límites de la pista
│
|── .gitignore                   # Archivos y carpetas ignorados por git
|── index.html                   # HTML principal del juego
|── LICENSE                      # Licencia del proyecto (MIT)
|── main.ts                      # Punto de entrada: inicializa y ejecuta el juego
|── package-lock.json            # Lockfile de dependencias npm
|── package.json                 # Configuración y dependencias del proyecto
|── README.md                    # Documentación principal
|── style.css                    # Estilos CSS para la interfaz
|── textures.json                # Configuración de texturas
|── tsconfig.json                # Configuración de TypeScript
|── update.ts                    # Lógica de actualización general para el textures.json
```
```
## Tecnologías usadas
- ThreeJS
- TypeScript
- Vite
- NodeJS