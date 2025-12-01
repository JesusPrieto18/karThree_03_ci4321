import * as THREE from "three";
import type { CollisionClassName, ReflectObjects, StaticObjects } from "../models/colisionClass";
import { Shuriken } from "../shuriken";
import type { roughness } from "three/tsl";

/**
 * Utility functions used across the project.
 *
 * Responsibilities / workflow:
 *  - Provide helpers to create a solid mesh with an optional wireframe overlay.
 *  - Provide AABB collision helpers that compute world-space bounding boxes for Mesh and Group.
 *  - Provide helper math for projectile reflection, penetration resolution and movement directions.
 *
 * Keep functions small and focused so they can be composed by game objects when needed.
 */

// ---------- utilities ----------

/**
 * solidWithWire - create a Group that contains a solid Mesh and optionally a wireframe overlay.
 * Parameters:
 *  - geometry: geometry to use for both solid and wire mesh.
 *  - color: base color for the solid material.
 *  - transparent: when true, add a wireframe overlay mesh (useful for debugging/visual style).
 *  - wireColor: color used for the wireframe material.
 *
 * Returns a Group with one or two children (solid, [wire]).
 */
export function solidWithWire(
  geometry: THREE.BufferGeometry,
  color?: number,
  transparent = true,
  wireColor = 0x111111,
  aoMap?: THREE.Texture,
  texture?: THREE.Texture,
  normalTexture?: THREE.Texture,
  roughnessTexture?: THREE.Texture,
  displacementTexture?: THREE.Texture,
  metalnessTexture?: THREE.Texture,
  roughness = 0.3, 
  metalness = 0.8
): THREE.Group {
  const group = new THREE.Group();
  const solid = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, 
      aoMap: aoMap, map: texture, normalMap: normalTexture, roughnessMap: roughnessTexture, roughness: roughness, 
      displacementMap: displacementTexture, metalnessMap: metalnessTexture, metalness: metalness,  })
  );
  //solid.castShadow = true;
  if (transparent) {
    // wireframe overlay (same geometry, different material)
    const wire = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color: wireColor, wireframe: true, depthTest: false })
    );
    // Slightly enlarge wire to avoid z-fighting with the solid mesh
    wire.scale.set(1.001, 1.001, 1.001);
    group.add(solid, wire);
  } else {
    group.add(solid);
  }
  return group;
}

// ---------- AABB collision helpers ----------

/**
 * localBoxCache - cache of computed local-space bounding boxes per geometry.
 * We cache Box3 per BufferGeometry to avoid recomputing expensive bounding boxes every frame.
 */
const localBoxCache = new WeakMap<THREE.BufferGeometry, THREE.Box3>();

/**
 * getLocalBox - return a cached clone of the geometry's local bounding box.
 * If not available, compute and store it in the cache.
 *
 * Note: returns an immutable copy so callers can transform it freely.
 */
function getLocalBox(mesh: THREE.Mesh): THREE.Box3 {
  const geo = mesh.geometry as THREE.BufferGeometry;
  let box = localBoxCache.get(geo);
  if (!box) {
    if (!geo.boundingBox) geo.computeBoundingBox();
    // store an immutable copy of the local bounding box
    box = geo.boundingBox!.clone();
    localBoxCache.set(geo, box);
  }
  return box;
}

/**
 * invalidateLocalBox - call this when you modify the vertex positions of a geometry
 * (attributes.position). It forces recomputation and updates the cached box.
 */
function invalidateLocalBox(mesh: THREE.Mesh) {
  const geo = mesh.geometry as THREE.BufferGeometry;
  geo.computeBoundingBox();
  localBoxCache.set(geo, geo.boundingBox!.clone());
}

/**
 * worldAABB_Mesh - compute the world-space AABB for a Mesh by transforming the cached local box
 * with the mesh's world matrix.
 */
function worldAABB_Mesh(mesh: THREE.Mesh): THREE.Box3 {
  // clone local box and transform to world space
  return getLocalBox(mesh).clone().applyMatrix4(mesh.matrixWorld);
}

/**
 * worldAABB_Group - compute a combined world-space AABB for a Group by traversing its meshes
 * and unioning their world AABBs. Returns an empty Box3 if the group contains no meshes.
 */
function worldAABB_Group(group: THREE.Group): THREE.Box3 {
  const out = new THREE.Box3();
  let hasAny = false;
  group.traverse(obj => {
    if ((obj as any).isMesh) {
      const w = worldAABB_Mesh(obj as THREE.Mesh);
      out.union(w);
      hasAny = true;
    }
  });
  return hasAny ? out : out.makeEmpty();
}

/**
 * aabbIntersects - high-level AABB intersection test between two Object3D instances.
 * Workflow:
 *  1) Ensure world matrices are up to date for both objects.
 *  2) Compute world-space AABB for each (mesh vs group handled).
 *  3) Return whether the two boxes intersect.
 */
export function aabbIntersects(a: THREE.Object3D, b: THREE.Object3D) {
  // ensure world matrices are current
  a.updateMatrixWorld(true);
  b.updateMatrixWorld(true);

  const boxA = (a as any).isMesh ? worldAABB_Mesh(a as THREE.Mesh)
                                 : worldAABB_Group(a as THREE.Group);
  const boxB = (b as any).isMesh ? worldAABB_Mesh(b as THREE.Mesh)
                                 : worldAABB_Group(b as THREE.Group);

  return boxA.intersectsBox(boxB);
}

/**
 * calculateWheelRotation - compute the angular rotation increment for a wheel given
 * translational speed, wheel radius and a direction multiplier.
 * Returns the rotation (radians) to apply per unit step used by callers.
 */
export function calculateWheelRotation(speed: number, radius: number, direction: number): number {
    return (speed / (radius * Math.PI * 2)) * direction;
}

/**
 * getMovementDirectionWorld - determine the current movement direction (unit vector) in world space
 * for objects that can be reflected. Workflow:
 *  - If the object is a projectile (Shuriken), use its velocity vector (preferred).
 *  - Otherwise, fall back to the object's forward direction (+Z in local space) transformed to world.
 */
export function getMovementDirectionWorld(obj: ReflectObjects): THREE.Vector3 {
  // Case 1: the object has its own velocity (projectile)
  if (obj instanceof Shuriken) {
    const vel = obj.getVelocity(); // world-space velocity
    if (vel.lengthSq() > 0.000001) {
      return vel.normalize();
    }
  }

  // Case 2: fallback style for Kart-like objects (use local +Z as forward)
  const body = obj.getBody();
  const forwardLocal = new THREE.Vector3(0, 0, 1);
  const qWorld = body.getWorldQuaternion(new THREE.Quaternion());
  return forwardLocal.applyQuaternion(qWorld).normalize();
}

/**
 * getObjectForwardWorld - return the object's forward direction (+Z local) transformed into world space.
 * This is commonly used as the 'normal' or facing direction for static objects like walls.
 */
export function getObjectForwardWorld(object: CollisionClassName): THREE.Vector3 {
  const body = object.getBody();
  const forwardLocal = new THREE.Vector3(0, 0, 1); // object's forward in local space
  const qWorld = body.getWorldQuaternion(new THREE.Quaternion());
  return forwardLocal.applyQuaternion(qWorld).normalize();
}

/**
 * getPushDirection - compute a normalized vector pointing from objectA towards objectB in world space.
 * Useful for resolving simple pushes away from obstacles.
 */
export function getPushDirection(objectA: CollisionClassName, objectB: CollisionClassName): THREE.Vector3 {
  // direction from A to B
  const posA = objectA.getBody().getWorldPosition(new THREE.Vector3());
  const posB = objectB.getBody().getWorldPosition(new THREE.Vector3());
  return posB.sub(posA).normalize();
}

/**
 * reflectDirection - compute the reflection of a moving object's direction vector against a static object's
 * facing direction (treated as a surface normal).
 *
 * Workflow:
 *  - Get the incoming movement direction (v).
 *  - Get the static object's forward vector (n) and ensure it faces the incoming vector.
 *  - Compute reflected vector using R = V - 2*(V·N)*N and return it normalized.
 */
export function reflectDirection(reflectObject: ReflectObjects, staticObject: StaticObjects): THREE.Vector3 {
  
  const v = getMovementDirectionWorld(reflectObject).clone(); // incoming direction
  let n = getObjectForwardWorld(staticObject).clone();    // surface "normal" in world

  // Ensure the normal faces the incoming direction.
  // If dot(v, n) > 0 then n points roughly the same way as v => invert it.
  if (v.dot(n) > 0) {
    n.multiplyScalar(-1);
  }

  // Reflection formula
  const dot = v.dot(n);
  return v.sub(n.multiplyScalar(2 * dot)).normalize();  
}

/**
 * resolvePenetrationKart - gently push a moving object (usually a Kart) out of penetration
 * with a static object by moving its world position a small amount along the static normal,
 * then converting that world position back into the object's parent's local space.
 *
 * This avoids leaving the object stuck overlapping the obstacle.
 */
export function resolvePenetrationKart(reflect: ReflectObjects, staticObject: StaticObjects, strength = 0.05) {
  const staticNormalWorld = getObjectForwardWorld(staticObject); // normal of the obstacle in world space
  // current world position of the moving object
  const worldPos = reflect.getBody().getWorldPosition(new THREE.Vector3());
  // nudge it a bit outside along the normal
  worldPos.addScaledVector(staticNormalWorld, strength);
  // convert back to local coordinates of the object's parent
  const parent = reflect.getBody().parent!;
  reflect.getBody().position.copy(parent.worldToLocal(worldPos.clone()));
}

/**
 * resolvePenetrationProyectil - similar to resolvePenetrationKart but tailored for projectiles.
 * Workflow:
 *  - Compute real arrival direction (v) using movement or velocity.
 *  - Compute obstacle normal (n) and ensure it faces the incoming direction.
 *  - Nudge the projectile's world position a small amount along n and apply back to local coords.
 */
export function resolvePenetrationProyectil(
  reflect: ReflectObjects,
  staticObject: StaticObjects,
  strength = 0.05
) {
  const body = reflect.getBody();

  // actual arrival direction, not visual rotation
  const v = getMovementDirectionWorld(reflect).clone();

  // obstacle normal
  let n = getObjectForwardWorld(staticObject).clone();

  // invert normal if it's pointing the same way as the incoming vector
  if (v.dot(n) > 0) {
    n.multiplyScalar(-1);
  }

  // push slightly outwards
  const worldPos = body.getWorldPosition(new THREE.Vector3());
  worldPos.addScaledVector(n, strength);

  // convert back to parent's local coordinates
  const parent = body.parent!;
  body.position.copy(parent.worldToLocal(worldPos.clone()));
}

/**
 * resolvePenetrationObstacles - resolve penetration between a moving object (reflect)
 * and an obstacle (obstacles) by pushing the moving object away along the horizontal push direction.
 *
 * Workflow:
 *  - Compute a push direction from obstacle -> reflect (ignore vertical component).
 *  - Ensure the push direction is non-zero.
 *  - Nudge the reflect object's world position by 'strength' along that direction and convert back to local.
 */
export function resolvePenetrationObstacles(
  reflect: ReflectObjects,
  obstacles: StaticObjects,
  strength = 0.05
) {
  const pushDir = getPushDirection(obstacles, reflect); // cone -> kart
  const worldPos = reflect.getBody().getWorldPosition(new THREE.Vector3());
 
  // ZERO OUT vertical component to keep push in XZ plane:
  pushDir.y = 0;

  // Ensure not a zero vector (avoids NaN)
  if (pushDir.lengthSq() === 0) {
    return; // exactly aligned in XZ, avoid NaN
  }

  // move it slightly away from the cone
  worldPos.addScaledVector(pushDir, strength);

  // convert back into the kart parent's local space
  const parent = reflect.getBody().parent!;
  reflect.getBody().position.copy(parent.worldToLocal(worldPos.clone()));
}

/**
 * disposeMesh - utility to dispose geometry and material resources of a Mesh.
 * Call this when removing a mesh from the scene to avoid memory leaks.
 * Parameters:
 *  - obj: Object3D to dispose (cast to Mesh internally).
 */

export function disposeMesh(obj: THREE.Object3D) {
  const mesh = obj as THREE.Mesh;
  if (mesh.geometry) mesh.geometry.dispose();
  if (Array.isArray(mesh.material)) mesh.material.forEach(m => (m as THREE.Material).dispose());
  else if (mesh.material) (mesh.material as THREE.Material).dispose();
}