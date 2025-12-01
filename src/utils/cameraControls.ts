// src/utils/cameraControls.ts

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createCameraControls(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  const controls = new OrbitControls(camera, renderer.domElement);

  // Configuración básica de los controles
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;  // mover cámara
  controls.enableZoom = true; // hacer zoom
  controls.rotateSpeed = 0.05   // velocidad de giro

  return controls;
}
