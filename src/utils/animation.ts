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
  try { kart.animatePowerUps(); } catch (e) { console.error('Error animating kart powerUps', e); }
  try { kart.animateHeadlights(); } catch (e) { console.error('Error animating kart headlights', e); }
  for (const pu of listPowerUps) {
    try { pu.animate(); } catch (e) { console.error('Error animating powerUp', e); }
  };
  for (const dec of decorators) {
    try { if (dec && typeof dec.animate === 'function') dec.animate(now); }
    catch (e) { console.error('Error animating decorator', e); }
  }
  collisionObserver.checkCollision();
  requestAnimationFrame(animate);
  
  renderer.render(scene, camera);
  renderHUD();
}
