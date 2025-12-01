import { updateCameraRig, updateControls } from '../controls';
import { scene, camera, renderer, dir, controls} from '../scene';
import { collisionObserver } from './colliding';    
import { kart, listPowerUps, decorators } from './initializers';
import { updateHUD, renderHUD } from '../hud';

export function animate(now: number): void {

  animateDir(now);
  scene.updateMatrixWorld(true);
  updateHUD(now);
  kart.updateBoost(now)
  updateCameraRig()
  updateControls();
  kart.animatePowerUps();
  for (const pu of listPowerUps) {
    pu.animate();
  };
  for (const dec of decorators) {
    dec.animate();
  }
  collisionObserver.checkCollision();
  requestAnimationFrame(animate);
  
  renderer.render(scene, camera);
  renderHUD();
}

function animateDir(now: number): void {
  const seconds = now * 0.001;
  // params: ajusta radius / height / speed 
  const radius = 80;
  const height = 40;
  const speed = 0.1; // rad/s
  // orbita circular de la luz alrededor del origen
  dir.position.set(Math.cos(seconds * speed) * radius, height, Math.sin(seconds * speed) * radius);
  // asegurar que la luz apunte al origen
  dir.target.position.set(0, 0, 0);
  dir.target.updateMatrixWorld();
}