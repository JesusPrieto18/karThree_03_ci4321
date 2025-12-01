import * as THREE from 'three';
import { scene } from './scene';
import {solidWithWire, reflectDirection, disposeMesh } from './utils/utils';
import { Shuriken } from './shuriken';
import type {Proyectils, StaticObjects } from './models/colisionClass';
import { collisionObserver } from './utils/colliding';
import { Coffee } from './coffee';
import { Bomb } from './bomb';
import { getTexture } from './utils/textureManager';
import { setPowerUpType, setPowerUpCount, showFloatingPoints, addPoints } from './hud';


/**
 * Kart - visual and gameplay representation of the player's kart.
 *
 * Responsibilities / workflow:
 *  - Build the kart visual (chassis, body parts, wheels) and add it to the scene.
 *  - Expose helpers to get body/wheels and to control position/rotation.
 *  - Manage movement state (speed, steering) and boost lifecycle.
 *  - Manage power-ups: create, store, launch and clean up projectiles/consumables.
 *  - Integrate with the collision observer by registering itself on construction.
 *
 * Notes:
 *  - Many fields are public for quick iteration (speed, maxSpeed). Consider using getters/setters
 *    if stricter encapsulation is required later.
 */
export class Kart {
  private kart = new THREE.Group();

  private kartChassis: THREE.Group;
  private wheelAxisGroup: THREE.Group;
  private wheelsFrontAxis: THREE.Group;
  private wheelsBackAxis: THREE.Group;

  // Movement state (public for easy access from controls)
  public speed = 0;
  private originalMaxSpeed = 0.3;
  public maxSpeed = 0.3;
  public turnSpeed = 0.02;
  public steeringAngle = 0;
  public maxSteering = 0.15 // steering limit
  public steeringSpeed = 0.02; // steering speed

  // Boost / turbo state
  private boostActive = false;        // is boost currently active?
  private boostFalloff = false;       // is boost returning to normal?
  private boostEndTime = 0;           // timestamp (ms) when boost should end

  // Boost tuning parameters
  private boostedMaxSpeed = 0.8;      // max speed allowed during boost
  private falloffRate = 0.002;        // rate at which maxSpeed falls back to normal

  // Power-up state
  private powerUps: number = -1;
  private isActivatePowerUps: boolean = false;
  private powerUpsList: THREE.Group = new THREE.Group(); // visual holder for active power-ups
  private proyectilesList: Proyectils[] = []; // stored projectile instances (not yet launched)
  private proyectilLaunched: Map<number, Proyectils> = new Map();  // projectiles that have been launched
  private countProyectilesLaunched: number = 0;
  /**
   * Constructor - builds the kart's visual components (chassis, extras, wheels),
   * adds the kart to the global scene and registers it with the collision observer.
   */
  constructor() {
    const height = 1;
    const length = 2;
    const width = 4.5;

    // Build chassis geometry and material, then wrap with helper that provides a visible wire
    const body = new THREE.BoxGeometry(length, height, width);
    body.translate(0, height / 3, 0);
    const material_color = 0xF7EA48;
    const material_color_dark = 0x1D252D;
    const textureLoader = new THREE.TextureLoader(); 
    
    // Textures for the kart 
    const yellowTexture = getTexture("kar.yellowTexture");
    yellowTexture.wrapS = THREE.RepeatWrapping;
    yellowTexture.wrapT = THREE.RepeatWrapping;
    yellowTexture.repeat.set(length+1, height+1)

    const yellowTextureNormal = getTexture("kar.yellowNormal");
    yellowTextureNormal.wrapS = THREE.RepeatWrapping;
    yellowTextureNormal.wrapT = THREE.RepeatWrapping;
    yellowTextureNormal.repeat.set(length+1, height+1)

    const blackTexture = getTexture("kar.blackTexture");
    const blackTextureNormal = getTexture("kar.blackNormal");
    
    this.kartChassis = solidWithWire(body, material_color, false, undefined,undefined, yellowTexture, yellowTextureNormal);
    this.kartChassis.name = "kartChassis";

    // Set material karTChassis
    
    // Decorative elements (hood, trims, lights, windows, exhaust) added to the chassis
    let capo = new THREE.CylinderGeometry(6.3,9,4.3,4); // decorative hood
    let material_capo = new THREE.MeshStandardMaterial({ color:material_color, map: yellowTexture, normalMap: yellowTextureNormal, roughness: 0.3, metalness: 0.8});
    let mesh_capo = new THREE.Mesh(capo, material_capo);
    mesh_capo.rotation.y = Math.PI / 4;
    mesh_capo.scale.set(0.15,0.15,0.15);
    mesh_capo.position.set(0,1.1,-0.7);
    this.kartChassis.add(mesh_capo);

    let tope = new THREE.BoxGeometry(0.6,0.2,1);
    let material_tope = new THREE.MeshStandardMaterial({color:material_color, map: yellowTexture, normalMap: yellowTextureNormal, roughness: 0.3, metalness: 0.8});
    let mesh_tope = new THREE.Mesh(tope, material_tope);
    mesh_tope.position.set(0,0.8,0.8);
    mesh_tope.rotateX(Math.PI/16);
    this.kartChassis.add(mesh_tope);

    let tope_left = new THREE.BoxGeometry(0.2,0.2,1);
    let material_tope_left = new THREE.MeshStandardMaterial({ color: material_color_dark, map: blackTexture, normalMap: blackTextureNormal,roughness: 20.0, metalness: 1 });
    let mesh_tope_left = new THREE.Mesh(tope_left, material_tope_left);
    mesh_tope_left.position.set(-0.3,0.8001,0.8);
    mesh_tope_left.rotateX(Math.PI/16);
    this.kartChassis.add(mesh_tope_left);

    let tope_right = new THREE.BoxGeometry(0.2,0.2,1);
    let material_tope_right = new THREE.MeshStandardMaterial({ color: material_color_dark, map: blackTexture, normalMap: blackTextureNormal,roughness: 20.0, metalness: 1 });
    let mesh_tope_right = new THREE.Mesh(tope_right, material_tope_right);
    mesh_tope_right.position.set(0.3,0.8001,0.8);
    mesh_tope_right.rotateX(Math.PI/16);
    this.kartChassis.add(mesh_tope_right);

    let Franja_derecha = new THREE.BoxGeometry(0.4,0.4,4.49);
    let material_Franja_derecha = new THREE.MeshStandardMaterial({ color: material_color_dark, map: blackTexture, normalMap: blackTextureNormal,roughness: 20.0, metalness: 1 });
    let mesh_Franja_derecha = new THREE.Mesh(Franja_derecha, material_Franja_derecha);
    mesh_Franja_derecha.position.set(-0.4,0.64,0);
    this.kartChassis.add(mesh_Franja_derecha);

    let Franja_izquierda = new THREE.BoxGeometry(0.4,0.4,4.49);
    let material_Franja_izquierda = new THREE.MeshStandardMaterial({ color: material_color_dark, map: blackTexture, normalMap: blackTextureNormal,roughness: 20.0, metalness: 1 });
    let mesh_Franja_izquierda = new THREE.Mesh(Franja_izquierda, material_Franja_izquierda);
    mesh_Franja_izquierda.position.set(0.4,0.64,0);
    this.kartChassis.add(mesh_Franja_izquierda);
      
    let color_gris = 0x555555;
    const metalTexture = getTexture("kar.metalTexture");
    const metalTextureNormal = getTexture("kar.metalNormal");
    let parachoques = new THREE.BoxGeometry(2.09,0.3,0.45);
    let material_parachoques = new THREE.MeshStandardMaterial({ color: color_gris, map: metalTexture, normalMap: metalTextureNormal, roughness: 1.0, metalness: 1.0 });
    let mesh_parachoques = new THREE.Mesh(parachoques, material_parachoques);
    mesh_parachoques.position.set(0,0.2,2.09);
    this.kartChassis.add(mesh_parachoques);

    let luces_delanteras = new THREE.BoxGeometry(0.4,0.2,0.1);
    let material_luces_delanteras = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFAA, emissiveIntensity: 1 });
    let mesh_luces_delanteras = new THREE.Mesh(luces_delanteras, material_luces_delanteras);
    mesh_luces_delanteras.position.set(-0.5,0.6,2.21);
    this.kartChassis.add(mesh_luces_delanteras);

    let mesh_luces_delanteras2 = new THREE.Mesh(luces_delanteras, material_luces_delanteras);
    mesh_luces_delanteras2.position.set(0.5,0.6,2.21);
    this.kartChassis.add(mesh_luces_delanteras2);

    const ventanaTexture = getTexture("kar.windowTexture");
    const ventanaTextureNormal = getTexture("kar.windowNormal");
    let color_ventana = 0x3F4444;
    let ventana_frontal = new THREE.CylinderGeometry(6.3,9,4.2,4); // window shapes
    let material_ventana = new THREE.MeshStandardMaterial({ color:color_ventana, map: ventanaTexture, normalMap:ventanaTextureNormal });
    let mesh_ventanaFrontal = new THREE.Mesh(ventana_frontal, material_ventana);
    mesh_ventanaFrontal.rotation.y = Math.PI / 4;
    mesh_ventanaFrontal.scale.set(0.125,0.125,0.125);
    mesh_ventanaFrontal.position.set(0,1.12,-0.55);
    this.kartChassis.add(mesh_ventanaFrontal);

    let ventana_trasera = new THREE.CylinderGeometry(6.3,9,4.2,4);
    let mesh_ventanaTrasera = new THREE.Mesh(ventana_trasera, material_ventana);
    mesh_ventanaTrasera.rotation.y = Math.PI / 4;
    mesh_ventanaTrasera.scale.set(0.125,0.125,0.125);
    mesh_ventanaTrasera.position.set(0,1.12,-0.85);
    this.kartChassis.add(mesh_ventanaTrasera);

    let ventana_lateral_izquierda = new THREE.CylinderGeometry(6.3,9,4.2,4);
    let mesh_ventanaLateralIzquierda = new THREE.Mesh(ventana_lateral_izquierda, material_ventana);
    mesh_ventanaLateralIzquierda.rotation.y = Math.PI / 4;
    mesh_ventanaLateralIzquierda.scale.set(0.125,0.125,0.125);
    mesh_ventanaLateralIzquierda.position.set(-0.15,1.12,-0.7);
    this.kartChassis.add(mesh_ventanaLateralIzquierda);

    let ventana_lateral_derecha = new THREE.CylinderGeometry(6.3,9,4.2,4);
    let mesh_ventanaLateralDerecha = new THREE.Mesh(ventana_lateral_derecha, material_ventana);
    mesh_ventanaLateralDerecha.rotation.y = Math.PI / 4;
    mesh_ventanaLateralDerecha.scale.set(0.125,0.125,0.125);
    mesh_ventanaLateralDerecha.position.set(0.15,1.12,-0.7);
    this.kartChassis.add(mesh_ventanaLateralDerecha);


    let tubo_escape = new THREE.CylinderGeometry(0.1,0.1,0.4);
    let material_tubo_escape = new THREE.MeshStandardMaterial({ color: color_gris, map: metalTexture, normalMap: metalTextureNormal, roughness: 1.0, metalness: 1.0});
    let mesh_tubo_escape = new THREE.Mesh(tubo_escape, material_tubo_escape);
    mesh_tubo_escape.rotation.x = Math.PI / 2;
    mesh_tubo_escape.position.set(-0.5,0.2,-2.15);
    this.kartChassis.add(mesh_tubo_escape);


    // Assemble kart group and add helper axes for debugging
    this.kart.add(this.kartChassis);
    this.kart.position.set(0, 0.7,-3);
    //this.kart.add(new THREE.AxesHelper(3));

    // Wheels and axes setup
    this.wheelAxisGroup = new THREE.Group();
    const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
    const wheelTexture = getTexture("kar.wheelTexture");
    const wheelTextureNormal = getTexture("kar.wheelNormal");
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, map:wheelTexture, normalMap:wheelTextureNormal });
    
    const wheelPositionsFront = [
      [-1.3, -0.2, -1.2],
      [1.3, -0.2, -1.2]
    ];
    const wheelPositionsBack = [
      [-1.3, -0.2, 1.3],
      [1.3, -0.2, 1.3]
    ];
    this.wheelsFrontAxis = new THREE.Group();
    this.wheelsBackAxis = new THREE.Group();
    
    const bodyAxisFront = new THREE.BoxGeometry(3, 0.1, 0.1);
    const bodyAxisBack = new THREE.BoxGeometry(3, 0.1, 0.1);
    
    const frontAxis = solidWithWire(bodyAxisFront, 0x0000ff, false);
    const backAxis = solidWithWire(bodyAxisBack, 0x0000ff, false);
    
    frontAxis.position.set(0, -0.2, -1.2);
    backAxis.position.set(0, -0.2, 1.3);
    
    this.wheelsFrontAxis.add(frontAxis);
    this.wheelsBackAxis.add(backAxis);
    
    this.wheelAxisGroup.add(this.wheelsFrontAxis);
    this.wheelAxisGroup.add(this.wheelsBackAxis);

    // Create wheel meshes and attach them to the corresponding axes
    wheelPositionsFront.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      this.wheelsFrontAxis.add(wheel);
    });

    wheelPositionsBack.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      this.wheelsBackAxis.add(wheel);
    });

    this.kart.add(this.wheelAxisGroup);
    scene.add(this.kart);

    // Register kart for collision checks
    collisionObserver.addColisionObject(this);
  };

  /** getBody - return the root Group representing the kart */
  public getBody(): THREE.Group {
    return this.kart;
  };

  /** getWheelsFrontAxis - return front wheels group for visual updates */
  public getWheelsFrontAxis(): THREE.Group {
    return this.wheelsFrontAxis;
  };

  /** getWheelsBackAxis - return rear wheels group for visual updates */
  public getWheelsBackAxis(): THREE.Group {
    return this.wheelsBackAxis;
  };

  /** getWheelAxisGroup - return the whole wheel axis assembly */
  public getWheelAxisGroup(): THREE.Group {
    return this.wheelAxisGroup;
  };

  /** getPowerUpsList - return the group containing active power-up visuals */
  public getPowerUpsList(): THREE.Group {
    return this.powerUpsList;
  };

  /** setX 
   * - move kart's X position in world space 
   * @param x: new X position in world coordinates.
   * */
  public setX(x: number): void {
    this.kart.position.x = x;
  }

  /** setZ 
   * - move kart's Z position in world space 
   * @param z: new Z position in world coordinates.
   * */
  public setZ(z: number): void {
    this.kart.position.z = z;
  }
  
  /** getBoostActive - query whether boost is active */
  public getBoostActive(): boolean {
    return this.boostActive;
  }

  /** getBoostFalloff - query whether boost is in falloff phase */
  public getBoostFalloff(): boolean {
    return this.boostFalloff;
  }
  /** setRotation 
   * - set the kart's orientation in world space 
   * @param x rotation around X axis (radians)
   * @param y rotation around Y axis (radians)
   * @param z rotation around Z axis (radians)
   * */
  public setRotation(x: number, y: number, z: number): void {
    this.kart.rotation.set(x, y, z);
  }

  /**
   * setPowerUps - create and attach power-up instances depending on the chosen count.
   * - If there is already an active power-up set, the call is ignored.
   * - For projectile power-ups (shuriken, bomb) instances are created, stored in proyectilesList
   *   and their meshes are added to powerUpsList for visual display.
   * - For consumable power-ups (coffee) meshes are added to the visual list and no projectile
   *   instances are stored.
   *  @param count: number indicating which power-up(s) to create.
   */
  public setPowerUps(count: number): void {
    if (this.powerUpsList.children.length === 0 && this.isActivatePowerUps) this.isActivatePowerUps = false;
    if (!this.isActivatePowerUps) {
      this.powerUps = count;
      this.isActivatePowerUps = true;

      this.powerUpsList.position.copy(this.kart.position);
      console.log(this.powerUpsList.position);
    const powerUpPoints: { [key: number]: number } = {
      0: 100,  // 1 shuriken
      1: 200,  // 2 shurikens
      2: 300,  // 3 shurikens
      3: 150,  // bomba
      4: 100,  // 1 café
      5: 200,  // 2 cafés
      6: 300   // 3 cafés
    };
    
    const pointsEarned = powerUpPoints[count] || 100;

      switch (this.powerUps) {
        case 0:
          setPowerUpType("shuriken");
          setPowerUpCount(1);
          // Activate a single shuriken
          const shuriken1_case0 = new Shuriken();
          shuriken1_case0.parent = this;
          shuriken1_case0.setPosition(0,0,-3);

          // Store instance and add its mesh to the power-up group
          this.proyectilesList.push(shuriken1_case0);
          this.powerUpsList.add(shuriken1_case0.getBody());

          // Set index for launched projectiles tracking
          shuriken1_case0.setIndex(this.countProyectilesLaunched);
          this.countProyectilesLaunched++;
          break;
        case 1:
          setPowerUpType("shuriken");
          setPowerUpCount(2);
          // Activate two shurikens
          const shuriken1_case1 = new Shuriken();
          const shuriken2_case1 = new Shuriken();

          shuriken1_case1.parent = this;
          shuriken2_case1.parent = this;

          shuriken1_case1.setX(-3);
          shuriken2_case1.setX(3);

          // Store instances and add meshes
          this.proyectilesList.push(shuriken1_case1, shuriken2_case1);
          this.powerUpsList.add(shuriken1_case1.getBody(), shuriken2_case1.getBody());

          // Set indices for launched projectiles tracking
          shuriken1_case1.setIndex(this.countProyectilesLaunched);
          this.countProyectilesLaunched++;
          shuriken2_case1.setIndex(this.countProyectilesLaunched);
          this.countProyectilesLaunched++;

          break;
        case 2:
          setPowerUpType("shuriken");
          setPowerUpCount(3);
          // Activate three shurikens
          const shuriken1_case2 = new Shuriken();
          const shuriken2_case2 = new Shuriken();
          const shuriken3_case2 = new Shuriken();
          
          shuriken1_case2.parent = this;
          shuriken2_case2.parent = this;
          shuriken3_case2.parent = this;

          shuriken1_case2.setZ(-4);
          shuriken2_case2.setPosition(3,0,1);
          shuriken3_case2.setPosition(-3,0,1);

          // Store instances and add meshes
          this.proyectilesList.push(shuriken1_case2, shuriken2_case2, shuriken3_case2);
          this.powerUpsList.add(shuriken1_case2.getBody(), shuriken2_case2.getBody(), shuriken3_case2.getBody());

          // Set indices for launched projectiles tracking
          shuriken1_case2.setIndex(this.countProyectilesLaunched);
          this.countProyectilesLaunched++;
          shuriken2_case2.setIndex(this.countProyectilesLaunched);
          this.countProyectilesLaunched++;
          shuriken3_case2.setIndex(this.countProyectilesLaunched);
          this.countProyectilesLaunched++;

          break;
        case 3:
          // Activate bomb
          console.log("Bomba activada");
          setPowerUpType("bomb");
          setPowerUpCount(1);
          const bomb = new Bomb();
          bomb.setPosition(0,0.5,-4);
          this.proyectilesList.push(bomb);
          this.powerUpsList.add(bomb.getBody());

          // Set index for launched projectiles tracking
          bomb.setIndex(this.countProyectilesLaunched);
          this.countProyectilesLaunched++;
          break;
        case 4:
          // Activate coffee (speed consumable)
          console.log("Cafe activado");
          setPowerUpType("coffee");
          setPowerUpCount(1);
          const coffee1_case4 = new Coffee();
          coffee1_case4.setPosition(0, 0, -3);
          this.powerUpsList.add(coffee1_case4.getBody());
          break;
        case 5:
          setPowerUpType("coffee");
          setPowerUpCount(2);
          // Activate two coffees
          console.log("Dos cafes activados");
          const coffee1_case5 = new Coffee();
          const coffee2_case5 = new Coffee();

          coffee1_case5.setX(-3);
          coffee2_case5.setX(3);

          this.powerUpsList.add(coffee1_case5.getBody(), coffee2_case5.getBody());
          break;
        case 6:
          // Activate three coffees
          setPowerUpType("coffee");
          setPowerUpCount(3);
          console.log("Tres cafes activados");
          const coffee1_case6 = new Coffee();
          const coffee2_case6 = new Coffee();
          const coffee3_case6 = new Coffee();
          
          coffee1_case6.setZ(-4);
          coffee2_case6.setPosition(3,0,1);
          coffee3_case6.setPosition(-3,0,1);

          this.powerUpsList.add(coffee1_case6.getBody(), coffee2_case6.getBody(), coffee3_case6.getBody());
          break;
      }
      showFloatingPoints(this.kart.position, pointsEarned);
      addPoints(pointsEarned);
      scene.add(this.powerUpsList);

    } else {
      console.log("Ya tienes un power up activo");
    }
  }

  /**
   * launchPowerUps - triggered to launch / consume the stored power-ups.
   * - For projectile types (shuriken, bomb): take last stored projectile, add it back to the scene,
   *   initialize its velocity and mark it as launched. Move instance from proyectilesList to proyectilLaunched.
   * - For consumable types (coffee): remove visual and activate boost effect.
   *
   * Important:
   *  - Using pop() on powerUpsList.children removes the mesh from the visual list.
   *  - The code relies on matching the popped mesh to the corresponding instance in proyectilesList.
   */
  public launchPowerUps(): void {
    if (this.isActivatePowerUps && this.powerUpsList.children.length > 0) {
      console.log("Lanzando power ups");
      switch (this.powerUps) {
        case 0:
        case 1:
        case 2:
        case 3:
          // Get the last power-up mesh (visual) and find its instance index
          const powerUpMesh = this.powerUpsList.children.pop();
          const index = this.proyectilesList.findIndex((proy) => proy.getBody() === powerUpMesh);

          const proyectil = this.proyectilesList[index];

          proyectil.addScene();

          if(proyectil instanceof Shuriken){
            proyectil.setVelocity(this.kart);
          }
          proyectil.setLaunched(true);
          // If it's a bomb, give an initial velocity vector
          if (proyectil instanceof Bomb) {
            proyectil.setDirection(this.kart)
            proyectil.setVelocity(
              new THREE.Vector3(
                Math.sin(this.kart.rotation.y) * 5, // forward
                4, // slight upward component
                Math.cos(this.kart.rotation.y) * 5
              )
            );
          } else {
            proyectil.setVelocity(this.kart);
          }

          // Move instance from proyectilesList to proyectilLaunched
          //this.proyectilLaunched.push(this.proyectilesList.pop()!);
          this.proyectilLaunched.set(proyectil.getIndex(), proyectil);
          //this.proyectilesList.splice(index, 1);
          console.log("Proyectil lanzado");

          break;
        case 4:
        case 5:
        case 6:
          this.powerUpsList.children.pop();
          console.log("Lanzando cafe");
          this.activateSpeedBoost(performance.now(), 3000);
          break;
      }
      // Update HUD with current power-up type and count
      console.log(this.powerUpsList.children.length);
    } 
    setPowerUpCount(this.powerUpsList.children.length);
    // If visual list empty, reset power-up state
    if (this.powerUpsList.children.length === 0 && this.isActivatePowerUps) {
      this.isActivatePowerUps = false;
      this.powerUps = -1;
      console.log("No tienes power ups ");
      setPowerUpCount(0);
      setPowerUpType("none");
    }
  }

  /**
   * removeProyectilFromList - remove a projectile instance by index from the stored list.
   * - Called by projectiles when they are destroyed and report their parent index.
   */
  public removeProyectilFromList(index: number): void {
    this.proyectilesList.splice(index, 1);
    console.log("Proyectil removido de la lista");
  }

  public removeProyectilFromMap(index: number): void {
    this.proyectilLaunched.delete(index);
    console.log("Proyectil removido de la lista");
  }
  /**
   * activateSpeedBoost - enable a temporary speed boost.
   * @param now: current timestamp in ms (performance.now()).
   * @param durationMs: how long the boost lasts.
   *  
   * Workflow:
   *  - Set boostActive, update maxSpeed to boostedMaxSpeed and schedule boost end time.
   *  - Ensure current speed is at least the new max so the boost feels immediate.
   */
  public activateSpeedBoost(now: number, durationMs: number = 3000) {
    this.boostActive = true;
    this.boostFalloff = false;

    this.maxSpeed = this.boostedMaxSpeed; // raise the speed cap
    this.boostEndTime = now + durationMs;

    // Optional: if current speed is below the new cap, lift it to the cap
    if (this.speed < this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
  }

  /**
   * clearPowerUps - remove all power-up visuals and clear stored projectile instances.
   * - Also reset activation flags.
   */
  public clearPowerUps(): void {
    while (this.powerUpsList.children.length) {
      const child = this.powerUpsList.children.pop()!;      
      this.powerUpsList.remove(child);
      disposeMesh(child);

      const proyectil = this.proyectilesList.pop()!;
      collisionObserver.addObjectToRemove(proyectil)
    }
    collisionObserver.removeSelectedObjects();
    this.isActivatePowerUps = false;
    this.powerUps = -1;
    console.log("Power ups limpiados");
  }


  /**
   * updateBoost - manage boost lifecycle and gradual falloff.
   * @param nowMs: current timestamp in milliseconds.
   * - Should be called each frame with current timestamp (ms).
   * - When boost time ends, begin falloff and gradually reduce maxSpeed back to original.
   * - Ensure current speed never exceeds the current cap.
   */
  public updateBoost(nowMs: number) {
    // Check if boost should end
    if (this.boostActive && nowMs >= this.boostEndTime) {
      this.boostActive = false;
      this.boostFalloff = true;
    }

    // Falloff phase: lower maxSpeed gradually
    if (this.boostFalloff) {
      // decrease maxSpeed slowly
      this.maxSpeed -= this.falloffRate;

      // clamp back to original max and stop falloff when reached
      if (this.maxSpeed <= this.originalMaxSpeed) {
        this.maxSpeed = this.originalMaxSpeed;
        this.boostFalloff = false;
      }

      // IMPORTANT: ensure current speed does not exceed new cap
      if (this.speed > this.maxSpeed) {
        this.speed = this.maxSpeed;
      }
    }
  }

  /**
   * animatePowerUps - per-frame visual updates for attached power-up visuals and launched projectiles.
   * - Rotates/animates power-up container to match cart orientation or spin depending on type.
   * - Advances launched projectiles (bombs are updated with physics; shurikens moved forward).
   *
   * @param deltaTime: frame time in seconds (optional, default ~1/60).
   */
  public animatePowerUps(deltaTime: number = 0.016): void {
    if (this.isActivatePowerUps) {
      this.powerUpsList.children.forEach((powerUp) => {
        powerUp.rotation.y -= 0.01;
      });
    }

    // Adjust how the power-ups container is oriented depending on active power-up type
    switch (this.powerUps) {
      case 0:
      case 3:
      case 4:
        this.powerUpsList.rotation.copy(this.kart.rotation);
        break;
      case 1:
      case 2:
      case 5:
      case 6:
        this.powerUpsList.rotation.y -= 0.01;
        break;
      default:
          break;
    }

    // Keep the visual holder at the kart position
    this.powerUpsList.position.copy(this.kart.position);
    
    // Advance launched projectiles: call update for bombs (physics) and simple movement for others
    for (let [, proyectil] of this.proyectilLaunched) {
      //console.log(proyectil);
      if (proyectil instanceof Bomb) {
            proyectil.update(deltaTime); // gravity, explosion, etc.
      } else {
        proyectil.moveForward(0.9);
        proyectil.rotateY(0.1);
      }      
    };
    
  }

}

