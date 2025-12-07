import { updateCameraRig, updateControls } from '../controls';
import { scene, camera, renderer, sunLight, controls} from '../scene';
import { collisionObserver } from './colliding';    
import { kart, listPowerUps, decorators } from './initializers';
import { updateHUD, renderHUD } from '../hud';

export function animate(now: number): void {

  //animateDir(now);
  scene.updateMatrixWorld(true);
  updateHUD(now);
  kart.updateBoost(now)
  updateCameraRig()
  updateControls();
  kart.animatePowerUps();
  kart.animateHeadlights();
  for (const pu of listPowerUps) {
    pu.animate();
  };
  for (const dec of decorators) {
    dec.animate(now);
  }
  collisionObserver.checkCollision();
  requestAnimationFrame(animate);
  
  renderer.render(scene, camera);
  renderHUD();
}
