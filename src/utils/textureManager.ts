// src/utils/textureManager.ts
import * as THREE from 'three';
import texturesJson from '../../textures.json'; 

/**
 * Type alias for the logical names used in the game code (e.g., "kart.yellowTexture").
 */
export type TextureKey = string; 

/**
 * Interface representing the structure of textures.json.
 * Maps a logical Key -> File Path.
 */
export interface TextureConfig {
  [key: string]: string; 
}

// Load configuration from the external JSON file
const TEXTURES_CONFIG: TextureConfig = texturesJson;

const loader = new THREE.TextureLoader();

// Primary Cache: Stores fully loaded THREE.Texture objects, accessible by their logical Key.
const keyToTexture = new Map<TextureKey, THREE.Texture>();

// Secondary Cache (Deduplication): Maps File Paths to active Promises.
// This prevents triggering multiple network requests for the same file.
const pathToTexturePromise = new Map<string, Promise<THREE.Texture>>();


/**
 * Internal Helper: Loads a texture from a specific URL/Path.
 * * Implements 'Request Deduplication': Checks if a load for this path is already in progress.
 * @param path Relative path to the image file.
 * @returns A Promise that resolves with the loaded THREE.Texture.
 */
function loadTextureByPath(path: string): Promise<THREE.Texture> {

  // Check cache to see if this file is already being loaded
  const existing = pathToTexturePromise.get(path);
  if (existing) return existing;

  // Create a new load operation
  const promise = new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      path,
      (tex) => {
        tex.needsUpdate = true; // Flag GPU to upload texture data
        resolve(tex);
      },
      undefined,
      (event) => {
        console.error(`Error loading texture: ${path}`, event);
        reject(event);
      }
    );
  });

  // Store the promise immediately to block duplicate requests
  pathToTexturePromise.set(path, promise);
  return promise;
}

/**
 * System Initializer: Preloads ALL textures defined in the JSON config.
 * * This must be awaited before the game scene is initialized.
 * * Filters for valid image formats (jpg, png) and loads them in parallel.
 */
export async function preloadTexturesFromConfig(): Promise<void> {
  const entries = Object.entries(TEXTURES_CONFIG);

  // Filter keys to only include 2D image formats (ignoring .hdr or other metadata)
  const textureEntries = entries.filter(([_, path]) =>
    /\.(jpg|jpeg|png)$/i.test(path)
  );

  // Map every entry to a load promise
  const tasks = textureEntries.map(async ([key, path]) => {
    const tex = await loadTextureByPath(path);
    // Once loaded, map the Logical Key to the Result
    keyToTexture.set(key, tex);
  });

  // Wait for all downloads to finish
  await Promise.all(tasks);
}

/**
 * Synchronous Accessor: Retrieves a loaded texture by its Logical Key.
 * * Usage: const map = getTexture("city.wall");
 * @param key The string key defined in textures.json.
 * @throws Error if the texture was not preloaded or the key doesn't exist.
 */
export function getTexture(key: TextureKey): THREE.Texture {
  const tex = keyToTexture.get(key);
  if (!tex) {
    throw new Error(
      `TextureManager: Texture not found for key "${key}". ` +
      `Did you call preloadTexturesFromConfig() before starting the game?`
    );
  }
  return tex;
}