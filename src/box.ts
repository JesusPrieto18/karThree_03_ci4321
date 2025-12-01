import * as THREE from 'three';
import { getTexture } from './utils/textureManager';
/**
 * Box - builds a decorative box composed of planes and small bars.
 * The Box class encapsulates a THREE.Group that contains multiple Mesh children.
 * Use getBody() to retrieve the Group for adding to the scene, and setPosition(...) to move it.
 */
export class Box {
    // The root Group that holds all parts of the box
    private body: THREE.Group = new THREE.Group();
    // optional name passed to constructor (not strictly required)
    private name?: string; 
    
    /**
     * Constructor - builds the box geometry and materials, then composes them into the body group.
     * @param name Optional name for identification.
     */
    constructor(name?: string) {
      this.name = name;

      // A central cube mesh (unused in final composition, left here for reference)
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = 0.5; // Keep cube above ground (if used)

      // Texture faces

      const aoTexture = getTexture('box.faceAo');
      const texture = getTexture('box.faceTexture');
      const textureNormal = getTexture('box.faceNormal');
      
      // Create top face (plane) - red
      let gemetriP1 = new THREE.PlaneGeometry(1, 1);
      let materialP1 = new THREE.MeshStandardMaterial({ color: 0xBA0C2F, side: THREE.DoubleSide, map: texture, normalMap: textureNormal, aoMap: aoTexture });
      let plane1 = new THREE.Mesh(gemetriP1, materialP1);
      plane1.position.set(0, 1.1, 0);
      plane1.rotation.x = Math.PI / 2;
      // Add the top face to the body
      this.body.add(plane1); // Top

      // Create bottom face (plane) - blue
      let gemetriP2 = new THREE.PlaneGeometry(1, 1);
      let materialP2 = new THREE.MeshStandardMaterial({ color: 0x5e5ee4, side: THREE.DoubleSide, map: texture, normalMap: textureNormal, aoMap: aoTexture });
      let plane2 = new THREE.Mesh(gemetriP2, materialP2);
      plane2.position.set(0, 0.1, 0);
      plane2.rotation.x = Math.PI / 2;
      this.body.add(plane2); // Bottom

      // Create right face (plane) - green
      let gemetriP3 = new THREE.PlaneGeometry(1, 1);
      let materialP3 = new THREE.MeshStandardMaterial({ color: 0x56bd56ff, side: THREE.DoubleSide, map: texture, normalMap: textureNormal, aoMap: aoTexture });
      let plane3 = new THREE.Mesh(gemetriP3, materialP3);
      plane3.position.set(0.5, 0.6, 0);
      plane3.rotation.y = Math.PI / 2;
      this.body.add(plane3); // Right

      // Create left face (plane) - yellow
      let gemetriP4 = new THREE.PlaneGeometry(1, 1);
      let materialP4 = new THREE.MeshStandardMaterial({ color: 0xe4e480ff, side: THREE.DoubleSide, map: texture, normalMap: textureNormal, aoMap: aoTexture });
      let plane4 = new THREE.Mesh(gemetriP4, materialP4);
      plane4.position.set(-0.5, 0.6, 0);
      plane4.rotation.y = -Math.PI/2;
      this.body.add(plane4); // Left
      
      // Create front face (plane) - magenta
      let gemetriP5 = new THREE.PlaneGeometry(1, 1);
      let materialP5 = new THREE.MeshStandardMaterial({ color: 0xda82daff, side: THREE.DoubleSide, map: texture, normalMap: textureNormal, aoMap: aoTexture });
      let plane5 = new THREE.Mesh(gemetriP5, materialP5);
      plane5.position.set(0, 0.6, 0.5);
      plane5.rotation.y = 0;
      this.body.add(plane5); // Front

      // Create back face (plane) - cyan
      let gemetriP6 = new THREE.PlaneGeometry(1, 1);
      let materialP6 = new THREE.MeshStandardMaterial({ color: 0x5edadaff, side: THREE.DoubleSide, map: texture, normalMap: textureNormal, aoMap: aoTexture });
      let plane6 = new THREE.Mesh(gemetriP6, materialP6);
      plane6.position.set(0, 0.6, -0.5);
      plane6.rotation.y = Math.PI;
      this.body.add(plane6); // Back
      
      // Color for the wooden-like bars
      let colorBar = 0x63472d;
      const aoTextureBar = getTexture('box.barAo');
      const textureBar = getTexture('box.barTexture');
      const textureNormalBar = getTexture('box.barNormal');
      
      // Four vertical corner bars (small box geometries) - positions marked for corners
      let gemetriC1 = new THREE.BoxGeometry(0.2, 1.2, 0.2);
      let materialC1 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube1 = new THREE.Mesh(gemetriC1, materialC1);
      cube1.position.set(0.5, 0.6, 0.5);
      this.body.add(cube1); // front-right corner
      
      let gemetriC2 = new THREE.BoxGeometry(0.2, 1.2, 0.2);
      let materialC2 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar});
      let cube2 = new THREE.Mesh(gemetriC2, materialC2);
      cube2.position.set(-0.5, 0.6, 0.5);
      this.body.add(cube2); // front-left corner

      let gemetriC3 = new THREE.BoxGeometry(0.2, 1.2, 0.2);
      let materialC3 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar});
      let cube3 = new THREE.Mesh(gemetriC3, materialC3);
      cube3.position.set(0.5, 0.6, -0.5);
      this.body.add(cube3); // back-right corner

      let gemetriC4 = new THREE.BoxGeometry(0.2, 1.2, 0.2);
      let materialC4 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube4 = new THREE.Mesh(gemetriC4, materialC4);
      cube4.position.set(-0.5, 0.6, -0.5);
      this.body.add(cube4); // back-left corner

      // Top front thin bar
      let gemetriC5 = new THREE.BoxGeometry(1.2, 0.2, 0.2);
      let materialC5 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube5 = new THREE.Mesh(gemetriC5, materialC5);
      cube5.position.set(0, 1.1, 0.5);
      this.body.add(cube5); // top front

      // Top back thin bar
      let gemetriC6 = new THREE.BoxGeometry(1.2, 0.2, 0.2);
      let materialC6 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube6 = new THREE.Mesh(gemetriC6, materialC6);
      cube6.position.set(0, 1.1, -0.5);
      this.body.add(cube6); // top back
      
      // Top right thin bar
      let gemetriC7 = new THREE.BoxGeometry(0.2, 0.2, 1.2);
      let materialC7 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube7 = new THREE.Mesh(gemetriC7, materialC7);
      cube7.position.set(0.5, 1.1, 0);
      this.body.add(cube7); // top right
      
      // Top left thin bar
      let gemetriC8 = new THREE.BoxGeometry(0.2, 0.2, 1.2);
      let materialC8 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar  });
      let cube8 = new THREE.Mesh(gemetriC8, materialC8);
      cube8.position.set(-0.5, 1.1, 0);
      this.body.add(cube8); // top left

      // Bottom front thin bar
      let gemetriC9 = new THREE.BoxGeometry(1.2, 0.2, 0.2);
      let materialC9 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube9 = new THREE.Mesh(gemetriC9, materialC9);
      cube9.position.set(0, 0.1, 0.5);
      this.body.add(cube9); // bottom front

      // Bottom back thin bar
      let gemetriC10 = new THREE.BoxGeometry(1.2, 0.2, 0.2);
      let materialC10 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube10 = new THREE.Mesh(gemetriC10, materialC10);
      cube10.position.set(0, 0.1, -0.5);
      this.body.add(cube10); // bottom back

      // Bottom right thin bar
      let gemetriC11 = new THREE.BoxGeometry(0.2, 0.2, 1.2);
      let materialC11 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube11 = new THREE.Mesh(gemetriC11, materialC11);
      cube11.position.set(0.5, 0.1, 0);
      this.body.add(cube11); // bottom right

      // Bottom left thin bar
      let gemetriC12 = new THREE.BoxGeometry(0.2, 0.2, 1.2);
      let materialC12 = new THREE.MeshStandardMaterial({ color: colorBar, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cube12 = new THREE.Mesh(gemetriC12, materialC12);
      cube12.position.set(-0.5, 0.1, 0);
      this.body.add(cube12); // bottom left

      // Cross color for decorative X shapes
      let colorCruz = 0xff7f50;

      // Decorative X pieces on each side (rotate and position accordingly)
      let gemetriX1 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX1 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX1 = new THREE.Mesh(gemetriX1, materialX1);
      cubeX1.position.set(0.5, 0.6, 0);
      cubeX1.rotateX(Math.PI/4);
      this.body.add(cubeX1); // right side

      let gemetriX1_2 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX1_2 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX1_2 = new THREE.Mesh(gemetriX1_2, materialX1_2);
      cubeX1_2.position.set(0.5, 0.6, 0);
      cubeX1_2.rotateX(-Math.PI/4);
      this.body.add(cubeX1_2); // right side

      let gemetriX2 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX2 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX2 = new THREE.Mesh(gemetriX2, materialX2);
      cubeX2.position.set(-0.5, 0.6, 0);
      cubeX2.rotateX(Math.PI/4);
      this.body.add(cubeX2); // left side

      let gemetriX2_2 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX2_2 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX2_2 = new THREE.Mesh(gemetriX2_2, materialX2_2);
      cubeX2_2.position.set(-0.5, 0.6, 0);
      cubeX2_2.rotateX(-Math.PI/4);
      this.body.add(cubeX2_2); // left side

      let gemetriX3 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX3 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX3 = new THREE.Mesh(gemetriX3, materialX3);
      cubeX3.position.set(0, 0.6, 0.5);
      cubeX3.rotateZ(Math.PI/4);
      this.body.add(cubeX3); // front side

      let gemetriX3_2 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX3_2 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX3_2 = new THREE.Mesh(gemetriX3_2, materialX3_2);
      cubeX3_2.position.set(0, 0.6, 0.5);
      cubeX3_2.rotateZ(-Math.PI/4);
      this.body.add(cubeX3_2); // front side

      let gemetriX4 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX4 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX4 = new THREE.Mesh(gemetriX4, materialX4);
      cubeX4.position.set(0, 0.6, -0.5);
      cubeX4.rotateZ(Math.PI/4);
      this.body.add(cubeX4); // back side

      let gemetriX4_2 = new THREE.BoxGeometry(0.1, 1.2, 0.1);
      let materialX4_2 = new THREE.MeshStandardMaterial({ color: colorCruz, map: textureBar, normalMap: textureNormalBar, aoMap: aoTextureBar });
      let cubeX4_2 = new THREE.Mesh(gemetriX4_2, materialX4_2);
      cubeX4_2.position.set(0, 0.6, -0.5);
      cubeX4_2.rotateZ(-Math.PI/4);
      this.body.add(cubeX4_2); // back side

      // Slightly raise the whole body so it sits on the ground and apply a small uniform scale
      this.body.position.y += 0.2;
      this.body.scale.set(0.9, 0.9, 0.9);
    }

    /**
     * getBody - returns the root Group containing the box parts.
     */
    public getBody(): THREE.Group {
      return this.body;
    }

    /**
     * setPosition - sets the position of the root Group in world coordinates.
     * @param x X coordinate
     * @param y Y coordinate
     * @param z Z coordinate
     */
    public setPosition(x: number, y: number, z: number): void {
      this.body.position.set(x, y, z);
    }   
  
}