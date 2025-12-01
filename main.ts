import {initScene} from './src/scene.ts';
import {createConeSquare, createFourWalls, createHeartCones, 
         createKart, createMultiplePowerUpsRandom, createPowerUp, createTrafficCone, 
         createUSB, createGround, createHollowSquare, createSkyBox} from './src/utils/initializers.ts';
import { setupControls} from './src/controls.ts';
import { animate } from './src/utils/animation.ts';
import { preloadTexturesFromConfig} from './src/utils/textureManager.ts';   
import { initHUD } from './src/hud.ts';

async function main() {
    await preloadTexturesFromConfig();
    initScene();
    createSkyBox();
    createGround();
    createHollowSquare(120, 28);
    setupControls();
    initHUD();
    createFourWalls(150,10);
    createFourWalls(20, 10, false);
    createKart();   
    createMultiplePowerUpsRandom(20);
    createUSB();
    //createHeartCones();
    //createConeSquare(10, 0, 0, 60, 4);
    createConeSquare(30, 0, 0, 125, 4);
    animate(performance.now());
};

main().catch((err) => {
  console.error('Error inesperado en main():', err);
});