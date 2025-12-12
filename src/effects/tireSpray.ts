import * as THREE from 'three';
import { scene } from '../scene';
import { Kart } from '../kart';

/**
 * TireSpray - simple particle system that emits smoke/dust from the rear
 * of the kart when accelerating violently.
 *
 * Implementation notes:
 * - Uses a Points buffer (SoA) for good performance.
 * - Each particle stores position, velocity, age and lifetime.
 * - Call `burst(intensity)` to emit a small burst of particles.
 */
export class TireSpray {
  private count: number;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;

  private positions: Float32Array;
  private velocities: Float32Array;
  private ages: Float32Array;
  private lifetimes: Float32Array;
  private sizes: Float32Array;

  private kart: Kart;

  private nextIndex = 0; // ring buffer index for emission

  private lastTime = 0;
  private visible: boolean = true;

  constructor(kart: Kart, count = 600) {
    this.kart = kart;
    this.count = count;
    this.geometry = new THREE.BufferGeometry();

    this.positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);
    this.ages = new Float32Array(this.count);
    this.lifetimes = new Float32Array(this.count);
    this.sizes = new Float32Array(this.count);

    // initialize with dead particles (age > lifetime)
    for (let i = 0; i < this.count; i++) {
      this.ages[i] = 9999;
      this.lifetimes[i] = 0;
      this.sizes[i] = 0;
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -9999;
      this.positions[i * 3 + 2] = 0;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    this.material = new THREE.PointsMaterial({
      color: 0x111111,
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  // Emit a burst of particles. intensity is a positive number (0..1+)
  public burst(intensity: number) {
    const amount = Math.min(this.count / 6, Math.round(10 + intensity * 120));

    for (let i = 0; i < amount; i++) {
      const idx = this.nextIndex;

      // spawn position: slightly behind the kart
      const pos = this.kart.getBody().position.clone();
      const rot = this.kart.getBody().rotation.y;
      const behind = new THREE.Vector3(-Math.sin(rot), 0, -Math.cos(rot)).multiplyScalar(1.6);
      pos.add(behind);
      // small random offset
      pos.x += (Math.random() - 0.5) * 0.6;
      pos.y += 0.1 + Math.random() * 0.2;
      pos.z += (Math.random() - 0.5) * 0.6;

      // initial velocity: backward + upward + side noise
      const speed = 1.2 + Math.random() * 0.6 + intensity * 1.5;
      const vx = -Math.sin(rot) * (0.3 * speed) + (Math.random() - 0.5) * 0.5;
      const vy = 0.4 + Math.random() * 0.6 + intensity * 0.6;
      const vz = -Math.cos(rot) * (0.3 * speed) + (Math.random() - 0.5) * 0.5;

      this.positions[idx * 3] = pos.x;
      this.positions[idx * 3 + 1] = pos.y;
      this.positions[idx * 3 + 2] = pos.z;

      this.velocities[idx * 3] = vx;
      this.velocities[idx * 3 + 1] = vy;
      this.velocities[idx * 3 + 2] = vz;

      this.ages[idx] = 0;
      this.lifetimes[idx] = 0.6 + Math.random() * 0.8;
      this.sizes[idx] = 8 + Math.random() * 8 + intensity * 8;

      this.nextIndex = (this.nextIndex + 1) % this.count;
    }

    // mark attributes as changed
    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;
  }

  // Simple animate called from main loop. 'now' is performance.now() timestamp.
  public animate(now: number): void {
    if (!this.lastTime) this.lastTime = now;
    const dt = Math.min(0.05, (now - this.lastTime) * 0.001);
    this.lastTime = now;

    const positions = this.positions;
    const velocities = this.velocities;
    const ages = this.ages;
    const lifetimes = this.lifetimes;
    const sizes = this.sizes;

    let anyAlive = false;

    for (let i = 0; i < this.count; i++) {
      if (ages[i] >= lifetimes[i]) continue;
      ages[i] += dt;
      const t = ages[i] / lifetimes[i];

      // Integrate position
      positions[i * 3] += velocities[i * 3] * dt;
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;

      // gravity & drag
      velocities[i * 3 + 1] -= 1.6 * dt; // gravity
      velocities[i * 3] *= 0.995; // slight drag
      velocities[i * 3 + 2] *= 0.995;

      // sizes shrink over life
      sizes[i] = sizes[i] * (1 - 0.6 * dt);

      if (ages[i] < lifetimes[i]) anyAlive = true;
      else sizes[i] = 0; // reset size when dead
    }

    // update attributes once per frame
    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.size as THREE.BufferAttribute).needsUpdate = true;

    // Hide points when none alive to avoid extra render cost
    this.points.visible = anyAlive && this.visible;
  }

  public setVisible(v: boolean) { this.visible = v; this.points.visible = v; }
}

export default TireSpray;
