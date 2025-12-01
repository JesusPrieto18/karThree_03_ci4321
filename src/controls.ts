import { kart } from './utils/initializers';
import { calculateWheelRotation} from './utils/utils';
import { camera } from './scene.ts';
import * as THREE from 'three';
import { updateVelocity } from './hud.ts';

/**
 * Input state map: stores whether a key is currently pressed.
 */
const keys: Record<string, boolean> = {};

/**
 * Camera distance/height settings and interpolated current values.
 * - normalCameraDistance: default distance behind the kart.
 * - turboCameraDistance: distance used while boosting.
 * - currentCameraDistance/currentCameraHeight: interpolated values used each frame.
 */
let normalCameraDistance = 5;   // normal distance behind the kart
let turboCameraDistance = 8;    // distance when turbo is active
let currentCameraDistance = 5;  // interpolated distance per frame
let normalCameraHeight = 2;
let turboCameraHeight = 2.8;
let currentCameraHeight = 2;

/**
 * cameraMode: which camera preset is active (0 or 1).
 * rMode: submode / orientation flip (0 or 1). Example:
 *  - 0: third-person behind
 *  - 1: first-person or alternative orientation
 * godMode: a cheat mode that enables rapid power-up granting.
 */
let cameraMode: number = 0;
let rMode: number = 0; // 0: third-person, 1: first-person
let godMode: boolean = false;

/**
 * setupControls - register keyboard listeners and populate the `keys` state map.
 * Also handle toggle keys for camera mode, reverse mode and godMode.
 */
export function setupControls(): void {
  // Track key down/up state
  window.addEventListener('keydown', e => keys[e.key] = true);
  window.addEventListener('keyup', e => keys[e.key] = false);

  // Toggle camera mode when 'c' is pressed
  window.addEventListener('keypress', function (e) {
    if (e.key === 'c' || e.key === 'C') {
      cameraMode = (cameraMode + 1) % 2; // Toggle between 0 and 1
      changeCameraPosition(cameraMode, rMode);
    }
  });

  // Toggle reverse/first-person submode when 'b' is pressed
  window.addEventListener('keypress', e => {
    if (e.key === 'b' || e.key === 'B') {
      rMode = (rMode + 1) % 2; // Toggle between 0 and 1
      changeCameraPosition(cameraMode, rMode);
    }
  });

  // Toggle godMode when 'g' is pressed
  window.addEventListener('keypress', e => {
    if (e.key === 'g' || e.key === 'G') {
      console.log("Tecla G presionada");
      if (godMode) {
        console.log("GodMode desactivado");
      } else {
        console.log("GodMode activado");
      }
      godMode = !godMode;
    }
  });
}

/**
 * updateControls - main per-frame input processing.
 * - Applies acceleration / braking to kart.speed.
 * - Updates steering angle and applies rotation while moving.
 * - Handles power-up launch input.
 * - If godMode is active, allows immediate power-up assignment via number keys.
 * - Updates kart world position based on rotation and speed.
 * - Rotates wheel meshes according to speed and wheel radius.
 * - Updates camera position and orientation each frame.
 */
export function updateControls(): void {
  // Accelerate / brake
  if (keys['ArrowDown']) kart.speed = Math.max(-kart.maxSpeed/2, kart.speed - 0.005);
  if (keys['ArrowUp']) kart.speed = Math.min(kart.maxSpeed, kart.speed + 0.005);
  if (!keys['ArrowUp'] && !keys['ArrowDown']) kart.speed *= 0.95;
  updateVelocity(kart.speed, kart.maxSpeed);

  // Steering: adjust steeringAngle and rotate kart body when moving
  if (keys['ArrowRight']) {
    kart.steeringAngle = Math.max(kart.steeringAngle - kart.steeringSpeed, -kart.maxSteering);
    if (keys['ArrowUp'] || keys['ArrowDown']) {
      // Rotate the kart around Y based on speed ratio
      kart.getBody().rotation.y -= kart.turnSpeed * (kart.speed / kart.maxSpeed);
    }
  }
  if (keys['ArrowLeft']) {
    kart.steeringAngle = Math.min(kart.steeringAngle + kart.steeringSpeed, kart.maxSteering);
    if (keys['ArrowUp'] || keys['ArrowDown']) {
      kart.getBody().rotation.y += kart.turnSpeed * (kart.speed / kart.maxSpeed);
    }
  }
  // Gradually return steering to center when no left/right pressed
  if (!keys['ArrowLeft'] && !keys['ArrowRight']) {
    kart.steeringAngle *= 0.8;
  }

  // Launch power-ups when space is pressed (single activation per keypress)
  if (keys[' ']) {
    kart.launchPowerUps();
    keys[' '] = false;
  }

  // GodMode: bind number keys to give specific power-ups instantly
  if (godMode) {
    if (keys['0']) { kart.setPowerUps(0); keys['0'] = false; }
    if (keys['1']) { kart.setPowerUps(1); keys['1'] = false; }
    if (keys['2']) { kart.setPowerUps(2); keys['2'] = false; }
    if (keys['3']) { kart.setPowerUps(3); keys['3'] = false; }
    if (keys['4']) { kart.setPowerUps(4); keys['4'] = false; }
    if (keys['5']) { kart.setPowerUps(5); keys['5'] = false; }
    if (keys['6']) { kart.setPowerUps(6); keys['6'] = false; }
    if (keys['-']) { kart.clearPowerUps(); }
  }

  // Move kart forward in the world according to its rotation.y and speed
  kart.getBody().position.x += Math.sin(kart.getBody().rotation.y) * kart.speed;
  kart.getBody().position.z += Math.cos(kart.getBody().rotation.y) * kart.speed;

  // Rotate wheels visually based on translational speed.
  // Uses wheel.userData.radius if available, otherwise defaults to 0.3.
  kart.getWheelsFrontAxis().children.forEach((wheel) => {
    const rotationDirection = 1;
    const radius = wheel.userData.radius ?? 0.3;
    wheel.rotation.x += calculateWheelRotation(kart.speed, radius, rotationDirection);
  });
  kart.getWheelsBackAxis().children.forEach((wheel) => {
    const rotationDirection = 1;
    const radius = wheel.userData.radius ?? 0.3;
    wheel.rotation.x += calculateWheelRotation(kart.speed, radius, rotationDirection);
  });

  // Apply steering angle to the back axis used as visual reference for wheel orientation
  kart.getWheelsBackAxis().rotation.y = kart.steeringAngle;

  // Update camera position/orientation based on current cameraMode and rMode
  
  changeCameraPosition(cameraMode, rMode);
  if (cameraMode === 0) {
    // In third-person camera mode make camera look at the kart position
    camera.lookAt(kart.getBody().position);
  }
}

/**
 * changeCameraPosition - set camera world position and rotation according to modes.
 * - cameraMode 0: third-person view (behind or in front depending on rMode).
 * - cameraMode 1: close / first-person-like view with optional flip (rMode).
 *
 * Parameters are optionally undefined for safety, but expected to be 0 or 1.
 */
const changeCameraPosition = (cameraMode: number | undefined, rMode: number | undefined) => {
  if (cameraMode === 0) {
    // Third-person view (behind the kart)
    const distanceBehind = currentCameraDistance;
    const height = currentCameraHeight;
    if (rMode === 0) {
      // Place camera behind the kart
      camera.position.x = kart.getBody().position.x - Math.sin(kart.getBody().rotation.y) * distanceBehind;
      camera.position.z = kart.getBody().position.z - Math.cos(kart.getBody().rotation.y) * distanceBehind;
      camera.position.y = kart.getBody().position.y + height;
    } else if (rMode === 1) {
      // Place camera in front of the kart (reverse)
      camera.position.x = kart.getBody().position.x + Math.sin(kart.getBody().rotation.y) * distanceBehind;
      camera.position.z = kart.getBody().position.z + Math.cos(kart.getBody().rotation.y) * distanceBehind;
      camera.position.y = kart.getBody().position.y + height;
    }
  } else if (cameraMode === 1) {
    // Close / cockpit-like camera
    const height = 1.5;
    const forwardOffset = 0.2;
    camera.position.x = kart.getBody().position.x + Math.sin(kart.getBody().rotation.y) * forwardOffset;
    camera.position.z = kart.getBody().position.z + Math.cos(kart.getBody().rotation.y) * forwardOffset;
    camera.position.y = kart.getBody().position.y + height;

    if (rMode === 0) {
      // First-person view with a Y-rotation flip to match expected orientation
      camera.rotation.y = kart.getBody().rotation.y + Math.PI;
    } else if (rMode === 1) {
      camera.rotation.y = kart.getBody().rotation.y;
    }

    // Lock X/Z rotations to keep camera level
    camera.rotation.x = 0;
    camera.rotation.z = 0;
  }
}

/**
 * updateCameraRig - smooth interpolation (lerp) of camera distance and height
 * depending on kart boost state. Call this each frame to gradually change camera.
 */
export function updateCameraRig() {
  // Choose target distance/height based on boost state
  let targetDistance = normalCameraDistance;
  let targetHeight = normalCameraHeight;

  if (kart.getBoostActive()) {
    targetDistance = turboCameraDistance;
    targetHeight = turboCameraHeight;
  } else if (kart.getBoostFalloff()) {
    // Returning to normal after boost
    targetDistance = normalCameraDistance;
    targetHeight = normalCameraHeight;
  }

  // Smoothly interpolate current values towards targets (approx. 5% per frame)
  currentCameraDistance = THREE.MathUtils.lerp(currentCameraDistance, targetDistance, 0.05);
  currentCameraHeight = THREE.MathUtils.lerp(currentCameraHeight, targetHeight, 0.05);
}