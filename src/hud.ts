import * as THREE from 'three';
import { renderer, camera } from './scene';
import { getTexture } from './utils/textureManager';

let hudScene: THREE.Scene | null = null;
let hudCamera: THREE.OrthographicCamera | null = null;

let atlasTexture: THREE.Texture | null = null;
const ATLAS_TILE = 64;
const ATLAS_COLS = 14;
const ATLAS_ROWS = 1;

let powerUpMesh: THREE.Mesh | null = null;
let puCountMesh: THREE.Mesh | null = null;
let scoreMesh: THREE.Mesh | null = null;
let puDigitMeshes: THREE.Mesh[] = [];
let scoreDigitMeshes: THREE.Mesh[] = [];
let tachDigitMeshes: THREE.Mesh[] = [];

let points = 0;

type HUDPopup = { group: THREE.Group; start: number; duration: number; startY: number; vx: number; vy: number; meshes: THREE.Mesh[] };
let activePopups: HUDPopup[] = [];

type PowerUpType = 'none' | 'shuriken' | 'coffee' | 'bomb';

// Cargar textura PNG
function loadAtlasTexture(path: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      path,
      (texture) => {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.flipY = true;
        resolve(texture);
      },
      undefined,
      (err) => reject(err)
    );
  });
}

// Crear sprite desde atlas con soporte para múltiples filas
function makeSpriteFromAtlas(tileIndex: number, size: number) {
  const geom = new THREE.PlaneGeometry(size, size);
  
  // Calcular coordenadas UV considerando filas
  const u0 = (tileIndex % ATLAS_COLS) / ATLAS_COLS;
  const u1 = u0 + 1 / ATLAS_COLS;
  const row = Math.floor(tileIndex / ATLAS_COLS);
  const v1 = 1 - (row / ATLAS_ROWS);
  const v0 = v1 - (1 / ATLAS_ROWS);
  
  const uvs = new Float32Array([
    u0, v1,
    u1, v1,
    u0, v0,
    u1, v0
  ]);
  
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  const mat = new THREE.MeshBasicMaterial({ 
    map: atlasTexture, 
    transparent: true,
    alphaTest: 0.1
  });
  return new THREE.Mesh(geom, mat);
}

// Crear mesh para dígitos
function makeDigitMesh(tileIndex: number, size: number) {
  const geom = new THREE.PlaneGeometry(size, size);
  
  // Calcular coordenadas UV considerando filas
  const u0 = (tileIndex % ATLAS_COLS) / ATLAS_COLS;
  const u1 = u0 + 1 / ATLAS_COLS;
  const row = Math.floor(tileIndex / ATLAS_COLS);
  const v1 = 1 - (row / ATLAS_ROWS);
  const v0 = v1 - (1 / ATLAS_ROWS);
  
  const uvs = new Float32Array([
    u0, v1, u1, v1, u0, v0, u1, v0
  ]);
  
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  const mat = new THREE.MeshBasicMaterial({ 
    map: atlasTexture, 
    transparent: true,
    alphaTest: 0.1
  });
  const mesh = new THREE.Mesh(geom, mat);
  return mesh;
}

// Actualizar UVs de un mesh existente
function setMeshTileUV(mesh: THREE.Mesh, tileIndex: number) {
  if (!mesh.geometry) return;
  
  const u0 = (tileIndex % ATLAS_COLS) / ATLAS_COLS;
  const u1 = u0 + 1 / ATLAS_COLS;
  const row = Math.floor(tileIndex / ATLAS_COLS);
  const v1 = 1 - (row / ATLAS_ROWS);
  const v0 = v1 - (1 / ATLAS_ROWS);
  
  const uvs = new Float32Array([
    u0, v1, u1, v1, u0, v0, u1, v0
  ]);
  
  (mesh.geometry as THREE.BufferGeometry).setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  (mesh.geometry as THREE.BufferGeometry).attributes.uv.needsUpdate = true;
}

// Establecer valor en dígitos
function setDigitMeshesValue(meshes: THREE.Mesh[], value: number) {
  const digits = Math.max(0, Math.floor(value)).toString().split('').map(d => parseInt(d));
  
  for (let i = 0; i < meshes.length; i++) {
    const pos = meshes.length - 1 - i;
    const mes = meshes[pos];
    const digit = digits.length - 1 - i >= 0 ? digits[digits.length - 1 - i] : 0;
    const tileIndex = 4 + (digit % 10);
    setMeshTileUV(mes, tileIndex);
  }
}

// Inicializar HUD
export async function initHUD() {
  if (hudScene) return;
  
  const W = window.innerWidth;
  const H = window.innerHeight;
  
  hudScene = new THREE.Scene();
  hudCamera = new THREE.OrthographicCamera(0, W, H, 0, -10, 10);

  try {
    // Cargar el atlas PNG - ajusta la ruta según tu proyecto
    atlasTexture = getTexture("hud") //await loadAtlasTexture('../src/hud_atlas.png');
    atlasTexture.magFilter = THREE.NearestFilter;
    atlasTexture.minFilter = THREE.NearestFilter;
    atlasTexture.flipY = true;
    
    console.log('Atlas texture loaded successfully');
  } catch (e) {
    console.error('Failed to load atlas texture', e);
    
    // Crear una textura de fallback roja para debugging
    const fallbackData = new Uint8Array([255, 0, 0, 255]);
    atlasTexture = new THREE.DataTexture(fallbackData, 1, 1, THREE.RGBAFormat);
    atlasTexture.needsUpdate = true;
    console.warn('Using fallback texture');
  }

  // Icono de power-up (posición inferior izquierda)
  powerUpMesh = makeSpriteFromAtlas(0, 48);
  powerUpMesh.position.set(12 + 24, H - 12 - 24, 0);
  hudScene.add(powerUpMesh);

  // Contador de power-ups (2 dígitos)
  const puGroup = new THREE.Group();
  const puTens = makeDigitMesh(4, 18);
  const puUnits = makeDigitMesh(4, 18);
  puTens.position.set(12 + 48 + 8 + 60 - 12, H - 12 - 14, 0);
  puUnits.position.set(12 + 48 + 8 + 60 + 12, H - 12 - 14, 0);
  puGroup.add(puTens);
  puGroup.add(puUnits);
  puDigitMeshes = [puTens, puUnits];
  puCountMesh = puGroup as any as THREE.Mesh;
  hudScene.add(puGroup);

  // Puntuación (6 dígitos, esquina superior derecha)
  const scoreGroup = new THREE.Group();
const maxScoreDigits = 6;
const digitSize = 18;
const spacing = digitSize;
const rightMargin = 96; // Aumentado de 12 a 24
const bottomMargin = 24; // Aumentado de 12 a 24

for (let i = 0; i < maxScoreDigits; i++) {
  const dm = makeDigitMesh(4, digitSize);
  const x = W - rightMargin - (maxScoreDigits * spacing) / 2 + i * spacing + spacing / 2;
  dm.position.set(x, H - bottomMargin - digitSize / 2, 0);
  scoreGroup.add(dm);
}
  scoreMesh = scoreGroup as any as THREE.Mesh;
  hudScene.add(scoreGroup);
  scoreDigitMeshes = scoreGroup.children as unknown as THREE.Mesh[];

  // Tacómetro digital (3 dígitos en posición central inferior)
  const tachGroup = new THREE.Group();
  const tachDigits = 3;
  const tachSize = 20;
  const tachSpacing = tachSize + 4;
  
  for (let i = 0; i < tachDigits; i++) {
    const dm = makeDigitMesh(4, tachSize);
    dm.position.set(
      W / 2 + (i - (tachDigits - 1) / 2) * tachSpacing,
      H - 12 - tachSize / 2,
      0
    );
    tachGroup.add(dm);
  }
  
  tachDigitMeshes = tachGroup.children as unknown as THREE.Mesh[];
  hudScene.add(tachGroup);

  // Manejar redimensionado de ventana
  window.addEventListener('resize', () => {
    if (!hudCamera) return;
    
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    hudCamera.left = 0;
    hudCamera.right = w;
    hudCamera.top = h;
    hudCamera.bottom = 0;
    hudCamera.updateProjectionMatrix();
    
    // Reposicionar elementos
    if (powerUpMesh) powerUpMesh.position.set(12 + 24, h - 12 - 24, 0);
    if (puCountMesh) puCountMesh.position.set(12 + 48 + 8 + 60, h - 12 - 14, 0);
    if (scoreMesh) scoreMesh.position.set(w - 12 - 110, h - 12 - 22, 0);
    
    // Reposicionar tacómetro digital
    tachDigitMeshes.forEach((dm, i) => {
      dm.position.set(
        w / 2 + (i - (tachDigits - 1) / 2) * tachSpacing,
        h - 12 - tachSize / 2,
        0
      );
    });
  });
}

// Mostrar puntos flotantes
export function showFloatingPoints(worldPos: THREE.Vector3, value: number, duration: number = 1000) {
  if (!hudScene || !hudCamera || !camera) return;
  
  const v = worldPos.clone().project(camera);
  if (v.z > 1 || v.z < -1) return;
  
  const W = window.innerWidth;
  const H = window.innerHeight;
  const sx = (v.x + 1) * 0.5 * W;
  const sy = (1 - (v.y + 1) * 0.25) * H;

  const text = Math.max(0, Math.floor(value)).toString();
  const group = new THREE.Group();
  const size = 18;
  const spacing = size + 2;
  const digits = text.split('').map(d => parseInt(d));
  const meshes: THREE.Mesh[] = [];
  
  for (let i = 0; i < digits.length; i++) {
    const dm = makeDigitMesh(4 + (digits[i] % 10), size);
    dm.material = (dm.material as THREE.Material).clone();
    (dm.material as THREE.MeshBasicMaterial).transparent = true;
    dm.position.set((i - (digits.length - 1) / 2) * spacing, 0, 0);
    group.add(dm);
    meshes.push(dm);
  }
  
  group.position.set(sx, sy, 0);
  hudScene.add(group);
  activePopups.push({ 
    group, 
    start: performance.now(), 
    duration, 
    startY: sy, 
    vx: 0, 
    vy: -30, 
    meshes 
  });
}

export function clearFloatingPopups() {
  if (!hudScene) return;
  for (const p of activePopups) { 
    hudScene.remove(p.group); 
  }
  activePopups = [];
}

export function updateHUD(now: number) {
  if (!hudScene) return;
  
  const next: HUDPopup[] = [];
  for (const p of activePopups) {
    const elapsed = now - p.start;
    const t = Math.min(1, elapsed / p.duration);
    p.group.position.y = p.startY + p.vy * t;
    const alpha = 1 - t;
    
    for (const m of p.meshes) { 
      (m.material as THREE.MeshBasicMaterial).opacity = alpha; 
    }
    
    if (t < 1) next.push(p);
    else hudScene.remove(p.group);
  }
  
  activePopups = next;
}

// Establecer tipo de power-up visual
export function setPowerUpType(t: PowerUpType) {
  if (!powerUpMesh) return;
  
  const map: { [k: string]: number } = { 
    none: 0, 
    shuriken: 1, 
    coffee: 2, 
    bomb: 3, 
  };
  
  const idx = map[t] || 0;
  setMeshTileUV(powerUpMesh, idx);
}

// Actualizar mediante etiqueta de texto
export function updatePowerUpsLabel(text: string) {
  if (!puDigitMeshes || puDigitMeshes.length === 0) return;
  
  if (text === 'BOOST') { 
    setPowerUpType('coffee'); 
    return; 
  }
  
  if (text === 'none') { 
    setPowerUpType('none'); 
    setPowerUpCount(0); 
    return; 
  }
  
  const n = parseInt(text);
  if (!isNaN(n)) { 
    setPowerUpCount(n); 
  }
}

// Establecer contador de power-ups
export function setPowerUpCount(n: number) {
  if (!puDigitMeshes || puDigitMeshes.length === 0) return;
  setDigitMeshesValue(puDigitMeshes, Math.max(0, n));
}

// Actualizar velocidad (tacómetro digital)
export function updateVelocity(v: number, maxSpeed = 1) {
  const speedDisplay = Math.round(Math.abs(v) * 1000);
  if (tachDigitMeshes && tachDigitMeshes.length) {
    setDigitMeshesValue(tachDigitMeshes, speedDisplay);
  }
}

// Puntuación
export function setPoints(n: number) {
  points = n;
  if (!scoreDigitMeshes || scoreDigitMeshes.length === 0) return;
  setDigitMeshesValue(scoreDigitMeshes, Math.max(0, n));
}

export function addPoints(n: number) { 
  setPoints(points + n); 
}

// Renderizar HUD
export function renderHUD(){ 
  if(!hudScene || !hudCamera || !renderer) return; 
  
  // Guardar el estado actual del renderer
  const currentAutoClear = renderer.autoClear;
  const currentAutoClearColor = renderer.autoClearColor;
  const currentAutoClearDepth = renderer.autoClearDepth;
  
  // Configurar para renderizado HUD
  renderer.autoClear = false;
  renderer.autoClearColor = false;
  renderer.autoClearDepth = true; // Solo limpiar depth buffer
  
  // Renderizar HUD
  renderer.clearDepth(); // Limpiar solo el buffer de profundidad
  renderer.render(hudScene, hudCamera);
  
  // Restaurar estado original
  renderer.autoClear = currentAutoClear;
  renderer.autoClearColor = currentAutoClearColor;
  renderer.autoClearDepth = currentAutoClearDepth;
}

// Limpiar recursos
export function destroyHUD() {
  if (!hudScene) return;
  
  hudScene = null;
  hudCamera = null;
  
  if (atlasTexture) {
    atlasTexture.dispose();
  }
  
  atlasTexture = null;
  powerUpMesh = null;
  puCountMesh = null;
  scoreMesh = null;
  puDigitMeshes = [];
  scoreDigitMeshes = [];
  tachDigitMeshes = [];
}