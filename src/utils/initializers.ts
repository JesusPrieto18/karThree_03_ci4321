import { PowerUp } from "../powerUps";
import { Kart } from "../kart";
import { TrafficCone } from "../trafficCone";
import { Walls } from "../walls";
import { USB } from "../usb";
import { Ground } from "../ground";
import { RaceTrack } from "../raceTrack";
import { SkyBox } from "../skyBox";
import { DayNightCycle } from "../dayNightCycle";
import { Rain } from "../effects/rain";
import { City } from "../city";
import { Clouds } from "../effects/clouds";
import { StreetLight } from "../streetLamp";

/*
 * Initialization module - factory helpers to create scene entities.
 * Exports:
 *  - kart: global Kart instance (created via createKart)
 *  - listPowerUps: array of active PowerUp instances
 *  - trafficCones: decorative/obstacle cones created by helpers
 *  - decorators: miscellaneous decorative objects (USB, signs, etc.)
 *
 * The helper functions below place objects into the global scene by using
 * their constructors and simple setters. They are intended for quick scene
 * composition during development.
 */

// Global instances / collections created by helpers
export let kart: Kart;
export let skyBox: SkyBox;
export let listPowerUps: PowerUp[] = [];
export let trafficCones: TrafficCone[] = []; // list of traffic cones (obstacles/decorators)
export let decorators: any[] = []; // generic list for decorative objects
export let dayNightCycle: DayNightCycle;
export let rain: Rain;
export let clouds: Clouds;

/**
 * createKart - instantiate and position the player's kart.
 * Typical usage: call once during scene setup.
 */
export function createKart(): void {
  kart = new Kart();
  kart.setZ(25);
  kart.setRotation(0, Math.PI, 0);
}

/**
 * createPowerUp - create a single PowerUp and place it at a default location.
 * The created instance is added to the listPowerUps array for later management.
 */
export function createPowerUp(): void {
  const pu = new PowerUp();
  pu.setPosition(0, 0, 10);
  listPowerUps.push(pu);
}

/**
 * createTrafficCone - create a single traffic cone and place it at Z=5.
 * The instance is stored in the trafficCones array for potential later use.
 */
export function createTrafficCone(): void {
  const tc = new TrafficCone();
  tc.setZ(5);
  trafficCones.push(tc);
}

/** createWall - convenience helper to create a single wall (defaults used). */
export function createWall(): void {
  const walls = new Walls();
}

/**
 * createFourWalls - create four walls forming a rectangular boundary.
 * Parameters:
 *  - wallLengthParam, wallHeightParam: size of each wall.
 *  - inside: if true, walls are placed so their inner faces point inward.
 *
 * The helper creates four Walls and positions/rotates them to form a box.
 */
export function createFourWalls(wallLengthParam: number = 150, wallHeightParam: number = 10, inside: boolean = true): void {

  const wall1 = new Walls(wallLengthParam, wallHeightParam); // top wall
  const wall2 = new Walls(wallLengthParam, wallHeightParam); // bottom wall
  const wall3 = new Walls(wallLengthParam, wallHeightParam); // right wall
  const wall4 = new Walls(wallLengthParam, wallHeightParam); // left wall
  if (inside) {
    wall1.setPosition(0,0, -wall1.getLength()/2);
    wall2.setPosition(0,0, wall2.getLength()/2);
    wall3.setPosition(wall3.getLength()/2,0,0);
    wall4.setPosition(-wall4.getLength()/2,0,0);
  } else {
    wall1.setPosition(0,0, wall1.getLength()/2);
    wall2.setPosition(0,0, -wall2.getLength()/2);
    wall3.setPosition(-wall3.getLength()/2,0,0);
    wall4.setPosition(wall4.getLength()/2,0,0);
  }

  wall2.setRotation(0, Math.PI, 0);
  wall3.setRotation(0, -Math.PI/2, 0)
  wall4.setRotation(0, Math.PI/2, 0);

}

/**
 * createMultiplePowerUpsRandom - create `count` PowerUps at unique random X,Z positions.
 * - Positions are generated inside [min, max] (defaults in generateUniquePositions).
 * - Y is set to 0.5 by default; adjust if necessary.
 */
export function createMultiplePowerUpsRandom(count = 10): void {
  const positions = generateUniquePositions(count, -75, 75);
  for (const pos of positions) {
    const pu = new PowerUp();
    pu.setPosition(pos.x, 0.5, pos.z); // adjust Y if needed
    listPowerUps.push(pu);
  }
}

/**
 * generateUniquePositions - helper that returns `count` unique (x,z) positions
 * in the integer range [min, max]. Throws if the requested count exceeds the grid.
 */
function generateUniquePositions(count: number, min = 25, max = 125): { x: number; z: number }[] {
  const set = new Set<string>();
  const out: { x: number; z: number }[] = [];
  const range = max - min + 1;
  if (count > range * range) throw new Error('Range too small for requested unique positions');

  while (out.length < count) {
    const x = Math.round(Math.random() * (max - min) + min);
    const z = Math.round(Math.random() * (max - min) + min);
    const key = `${x},${z}`;
    if (!set.has(key)) {
      set.add(key);
      out.push({ x, z });
    }
  }
  return out;
}

/**
 * createConeLine - create a line of `count` TrafficCone instances.
 * - startX, startZ: starting position for the first cone.
 * - spacing: distance between cones.
 * - axis: 'x' or 'z' determines line direction.
 * - reverse: if true the line extends in the negative direction along the chosen axis.
 *
 * Created cones are pushed into trafficCones array.
 */
export function createConeLine(
  count: number = 10,
  startX: number = 0,
  startZ: number = 0,
  spacing: number = 5,
  axis: 'x' | 'z' = 'x',
  reverse: boolean = false
): void {
  const dir = reverse ? -1 : 1;

  for (let i = 0; i < count; i++) {
    const tc = new TrafficCone();
    const offset = dir * i * spacing;
    if (axis === 'x') {
      tc.setX(startX + offset);
      tc.setZ(startZ);
    } else {
      tc.setX(startX);
      tc.setZ(startZ + offset);
    }
    trafficCones.push(tc);
  }

}

export function createUSB(): void {
  let usb = new USB();
  decorators.push(usb);
}

/**
 * createHeartCones - create `count` TrafficCone instances arranged in a heart shape.
 * - centerX/centerZ: center of the heart on the XZ plane.
 * - scale: scales the parametric heart curve to adjust size.
 * - Cones are created with addColision = false so they are purely decorative.
 */
export function createHeartCones(
  count: number = 60,
  centerX: number = 0,
  centerZ: number = 0,
  scale: number = 0.6
): void {
  // Parametric heart curve (2D). t ∈ [0, 2π]
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    // parametric equations: x = 16 sin^3 t, y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t
    const sx = Math.sin(t);
    const cx = Math.cos(t);
    const xRaw = 16 * Math.pow(sx, 3);
    const zRaw = 13 * cx - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    const x = centerX + xRaw * scale;
    const z = centerZ + zRaw * scale;

    const tc = new TrafficCone(false); // No collision for decoration
    tc.setPosition(x, 0, z);
    trafficCones.push(tc);
  }
}

/**
 * createConeSquare - create a square frame of cones centered at (centerX, centerZ).
 * - countPerSide: number of cones per side (minimum 2, corners included).
 * - sideLength: length of each side of the square.
 * - y: vertical position for cones (default 0).
 */
export function createConeSquare(
  countPerSide: number = 8,
  centerX: number = 0,
  centerZ: number = 0,
  sideLength: number = 20,
  y: number = 0
): void {
  const n = Math.max(2, Math.floor(countPerSide));
  const half = sideLength / 2;
  const spacing = sideLength / (n - 1);

  // generate positions along the 4 sides (without duplicating corners)
  const positions: { x: number; z: number }[] = [];

  // top side (left -> right)
  for (let i = 0; i < n; i++) {
    positions.push({ x: centerX - half + i * spacing, z: centerZ - half });
  }
  // right side (top -> bottom) exclude top corner
  for (let i = 1; i < n; i++) {
    positions.push({ x: centerX + half, z: centerZ - half + i * spacing });
  }
  // bottom side (right -> left) exclude bottom-right corner
  for (let i = 1; i < n; i++) {
    positions.push({ x: centerX + half - i * spacing, z: centerZ + half });
  }
  // left side (bottom -> top) exclude bottom-left and top-left corners
  for (let i = 1; i < n - 1; i++) {
    positions.push({ x: centerX - half, z: centerZ + half - i * spacing });
  }

  for (const pos of positions) {
    const tc = new TrafficCone(true);
    tc.setX(pos.x);
    tc.setZ(pos.z);
    trafficCones.push(tc);
  }
}

/**
 * createGround - Factory function for the Game World Floor.
 * Initializes the main Ground plane with a default size of 150x150 units.
 * This serves as the physics collider and visual base for the kart.
 */
export function createGround(){
  const ground = new Ground(150,150);
}

/**
 * createHollowSquare - Factory function for the Race Track.
 * Generates the drivable area boundaries.
 * It creates a "Hollow Square" geometry (outer walls and inner walls) 
 * to define the circuit layout.
 * * @param size Side length of the square track.
 * @param thickness Width of the road (distance between inner and outer wall).
 */
export function createHollowSquare(size?: number, thickness?: number){
  const group = new RaceTrack(size, thickness);
}

/**
 * createSkyBox - Environment Initializer.
 * Instantiates the dual-mesh SkyBox (Day/Night versions) and adds it 
 * to the `decorators` list to handle its slow rotation animation.
 */
export function createSkyBox(): void {
  skyBox = new SkyBox();
  decorators.push(skyBox);
}

/**
 * createDayNightCycle - Lighting Manager Initializer.
 * Sets up the global lighting controller (Sun orbit, ambient light color).
 * It is added to `decorators` so its `animate(deltaTime)` method is called 
 * every frame to update the sun's position.
 */
export function createDayNightCycle(): void {
  dayNightCycle = new DayNightCycle();
  decorators.push(dayNightCycle);
}

/**
 * createRain - Weather System Initializer.
 * Instantiates the Rain particle system with a high particle count (30,000)
 * for a dense storm effect. Registered to `decorators` to animate the falling drops.
 */
export function createRain(): void {
  rain = new Rain(30000);
  decorators.push(rain)
}

/**
 * createCity - Scenery Initializer.
 * Constructs the surrounding city skyline walls to enclose the game world.
 * * @param width Width of the city perimeter.
 * @param height Height of the building textures.
 * @param depth Depth (Z-axis) of the city perimeter.
 */
export function createCity(width: number, height: number, depth: number): void {
  const city = new City(width, height, depth);
}

/**
 * createClouds - Atmosphere Initializer.
 * Creates the dynamic cloud layer, including the lightning/thunder system.
 * Added to `decorators` to handle cloud scrolling, rotation, and lightning flashes.
 */
export function createClouds(): void {
  clouds = new Clouds();
  decorators.push(clouds);
}

/**
 * createStreetLight - Prop Placement Utility.
 * Procedurally instantiates and places multiple Street Light objects around the map.
 * * Responsibilities:
 * 1. Instantiation: Creates lights at specific coordinates.
 * 2. Orientation: Rotates lights (using `rotateY`) to face the correct road sections.
 * 3. Registration: Adds all lights to the `decorators` list so they can react 
 * to the Day/Night cycle (turning on/off automatically).
 */
export function createStreetLight(): void {
  // North/South Lights
  const streetLight = new StreetLight(0,35);
  const streetLight2 = new StreetLight(-30,35);
  const streetLight3 = new StreetLight(30,35);

  // Opposing/Rotated Lights
  const streetLight4 = new StreetLight(0,35);
  const streetLight5 = new StreetLight(-30,35);
  const streetLight6 = new StreetLight(30,35);
  streetLight4.rotateY(Math.PI);
  streetLight5.rotateY(Math.PI);
  streetLight6.rotateY(Math.PI);

  // Side Lights
  const streetLight7 = new StreetLight(0,35);
  const streetLight8 = new StreetLight(0,35);
  streetLight7.rotateY(Math.PI / 2);
  streetLight8.rotateY(-Math.PI / 2);
  
  // Register all lights for updates
  decorators.push(streetLight, streetLight2, streetLight3, streetLight4, streetLight5, streetLight6, streetLight7, streetLight8);
}