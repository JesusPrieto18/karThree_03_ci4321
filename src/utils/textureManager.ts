// src/utils/textureManager.ts
import * as THREE from 'three';
import texturesJson from '../../textures.json'; 


export type TextureKey = string; // por ejemplo "usb.texture", "wall.normal", etc.

export interface TextureConfig {
  [key: string]: string; // key → path
}

const TEXTURES_CONFIG: TextureConfig = texturesJson;

const loader = new THREE.TextureLoader();

// Cache principal: key del JSON → textura
const keyToTexture = new Map<TextureKey, THREE.Texture>();

// Cache secundario para NO recargar el mismo path si se repite
const pathToTexturePromise = new Map<string, Promise<THREE.Texture>>();


/**
 * Carga una textura por path, con cache por path.
 */
function loadTextureByPath(path: string): Promise<THREE.Texture> {

  const existing = pathToTexturePromise.get(path);
  if (existing) return existing;

  const promise = new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      path,
      (tex) => {
        tex.needsUpdate = true;
        resolve(tex);
      },
      undefined,
      (event) => {
        console.error(`❌ Error cargando textura: ${path}`, event);
        reject(event);
      }
    );
  });

  pathToTexturePromise.set(path, promise);
  return promise;
}

/**
 * Preload de todas las texturas DEFINIDAS en el config (solo jpg/png),
 * y las deja accesibles por key mediante getTexture().
 */
export async function preloadTexturesFromConfig(): Promise<void> {
  const entries = Object.entries(TEXTURES_CONFIG);

  // Filtrar solo texturas 2D (ignoramos .hdr por ejemplo)
  const textureEntries = entries.filter(([_, path]) =>
    /\.(jpg|jpeg|png)$/i.test(path)
  );

  const tasks = textureEntries.map(async ([key, path]) => {
    const tex = await loadTextureByPath(path);
    keyToTexture.set(key, tex);
  });

  await Promise.all(tasks);
}

/**
 * Obtiene una textura por la key del JSON (ej: "usb.texture").
 * Asume que preloadTexturesFromConfig() ya fue llamado antes.
 */
export function getTexture(key: TextureKey): THREE.Texture {
  const tex = keyToTexture.get(key);
  if (!tex) {
    throw new Error(
      `TextureManager: no se encontró textura para la key "${key}". ` +
      `¿Llamaste a preloadTexturesFromConfig() antes?`
    );
  }
  return tex;
}
