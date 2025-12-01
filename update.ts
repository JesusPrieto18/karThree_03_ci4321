// scripts/update.ts
// Ejecutar con:
//   npx ts-node update.ts
// o compilar con tsc y luego:
//   node dist/update.js

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITIGNORE_PATH = path.join(__dirname, '.', '.gitignore');
const TEXTURES_JSON_PATH = path.join(__dirname, '.', 'textures.json');

interface TexturesConfig {
  [key: string]: string;
}

function main(): void {
  // 1. Leer .gitignore
  if (!fs.existsSync(GITIGNORE_PATH)) {
    console.error('.gitignore no encontrado en la carpeta raíz');
    process.exit(1);
  }
  const gitignoreContent = fs.readFileSync(GITIGNORE_PATH, 'utf8');
  const gitignoreLines = gitignoreContent.split(/\r?\n/);

  // 2. Leer textures.json
  if (!fs.existsSync(TEXTURES_JSON_PATH)) {
    console.error('textures.json no encontrado en la carpeta raíz');
    process.exit(1);
  }
  const texturesJsonRaw = fs.readFileSync(TEXTURES_JSON_PATH, 'utf8');
  const texturesConfig: TexturesConfig = JSON.parse(texturesJsonRaw);

  // 3. Obtener todas las rutas del JSON y normalizar slashes
  let texturePaths = Object.values(texturesConfig)
    .filter((v): v is string => typeof v === 'string')
    .map((p) => p.replace(/\\/g, '/')); // convertir "\" a "/"

  // Eliminar duplicados
  texturePaths = Array.from(new Set(texturePaths));

  // 4. Buscar la línea que ignora src/textures
  let indexIgnoreTextures = gitignoreLines.findIndex(
    (line) => line.trim() === '!src/textures/'
  );

  // Si no existe, la añadimos al final
  //if (indexIgnoreTextures === -1) {
  //  indexIgnoreTextures = gitignoreLines.length;
  //  gitignoreLines.push('src/textures');
  //}

  // 5. Construir líneas de excepción: !ruta
  const existingLines = new Set(gitignoreLines);
  const exceptionLines = texturePaths
    .map((p) => `!${p}`)
    .filter((line) => !existingLines.has(line)); // evitar duplicados

  if (exceptionLines.length === 0) {
    console.log('No hay nuevas rutas para agregar a .gitignore');
    return;
  }

  // 6. Insertar las excepciones justo debajo de "src/textures"
  gitignoreLines.splice(indexIgnoreTextures + 1, 0, ...exceptionLines);

  // 7. Escribir de vuelta el archivo
  fs.writeFileSync(GITIGNORE_PATH, gitignoreLines.join('\n'), 'utf8');

  console.log(`Se agregaron ${exceptionLines.length} excepciones a .gitignore:`);
  exceptionLines.forEach((l) => console.log('  ' + l));
}

main();
