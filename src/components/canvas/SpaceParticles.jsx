import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createGlowTexture } from '../../utils/textureGenerator';

export default function SpaceParticles({ section }) {
  const pointsRef = useRef();
  const count = window.innerWidth < 768 ? 600 : 2000; // mobile-responsive density

  // Procedural texture for soft round particles
  const texture = useMemo(() => createGlowTexture(), []);

  // Generate initial particle properties
  const [positions, speeds, scales, randomPhases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count * 3);
    const scl = new Float32Array(count);
    const phase = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Distribute particles in a spherical/cloud structure
      const r = 10 + Math.random() * 25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Drift speed
      spd[i * 3] = (Math.random() - 0.5) * 0.05;
      spd[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      spd[i * 3 + 2] = (Math.random() - 0.5) * 0.05;

      // Scale variation
      scl[i] = 0.08 + Math.random() * 0.22;

      // Random phases for noise math
      phase[i * 3] = Math.random() * 100;
      phase[i * 3 + 1] = Math.random() * 100;
      phase[i * 3 + 2] = Math.random() * 100;
    }

    return [pos, spd, scl, phase];
  }, [count]);

  // Keep track of opacity and scale factors for transitions
  const stateRef = useRef({
    dissolve: 1.0,
    activeSection: 0,
  });

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const time = state.clock.getElapsedTime();

    // Smoothly update section states
    const targetDissolve = section === 6 ? 0.0 : 1.0;
    stateRef.current.dissolve += (targetDissolve - stateRef.current.dissolve) * delta * 1.5;

    // Apply dissolve to points material
    if (pointsRef.current.material) {
      pointsRef.current.material.opacity = 0.65 * stateRef.current.dissolve;
      pointsRef.current.material.needsUpdate = true;
    }

    const pos = posAttr.array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const phX = randomPhases[idx];
      const phY = randomPhases[idx + 1];
      const phZ = randomPhases[idx + 2];

      if (section === 6) {
        // Dissolve / Let Go: Disperse particles outwards rapidly
        pos[idx] += (pos[idx] > 0 ? 1 : -1) * delta * 12.0 * (speeds[idx] + 0.1);
        pos[idx + 1] += (pos[idx + 1] > 0 ? 1 : -1) * delta * 12.0 * (speeds[idx + 1] + 0.1);
        pos[idx + 2] += (pos[idx + 2] > 0 ? 1 : -1) * delta * 12.0 * (speeds[idx + 2] + 0.1);
      } else if (section === 5) {
        // Section 5 (Final Scene / Climax): Souls rise upwards into the stars
        pos[idx] += Math.sin(time * 0.5 + phX) * delta * 0.4;
        // Strong vertical upward movement
        pos[idx + 1] += delta * (1.2 + Math.abs(speeds[idx + 1]) * 4.0);
        pos[idx + 2] += Math.cos(time * 0.5 + phZ) * delta * 0.4;

        // Loop rising particles back to the bottom when they go too high
        if (pos[idx + 1] > 25) {
          pos[idx + 1] = -25;
          pos[idx] = (Math.random() - 0.5) * 35;
          pos[idx + 2] = (Math.random() - 0.5) * 35;
        }
      } else if (section === 4) {
        // Section 4 (Time Void): Shattered timelines, swirl in a black-hole-like vortex
        // Rotate around Y axis
        const x = pos[idx];
        const z = pos[idx + 2];
        const angle = delta * (0.15 + scales[i] * 0.8);
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Spin
        pos[idx] = x * cosA - z * sinA;
        pos[idx + 2] = x * sinA + z * cosA;

        // Drift inwards/outwards gently + vertical noise
        pos[idx + 1] += Math.sin(time * 1.5 + phY) * delta * 0.8;
      } else {
        // Standard sections (Intro, Memories, Letter): Calm anti-gravity drifting
        pos[idx] += Math.sin(time * 0.2 + phX) * delta * 0.2 + speeds[idx] * delta * 2.0;
        pos[idx + 1] += Math.cos(time * 0.2 + phY) * delta * 0.2 + speeds[idx + 1] * delta * 2.0;
        pos[idx + 2] += Math.sin(time * 0.25 + phZ) * delta * 0.2 + speeds[idx + 2] * delta * 2.0;

        // Bounds check (gentle boxing to stay in range)
        if (Math.abs(pos[idx]) > 30) pos[idx] *= -0.95;
        if (Math.abs(pos[idx + 1]) > 30) pos[idx + 1] *= -0.95;
        if (Math.abs(pos[idx + 2]) > 30) pos[idx + 2] *= -0.95;
      }
    }

    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.015; // slow spin of the entire system
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a2bcfc"
        size={window.innerWidth < 768 ? 0.08 : 0.12}
        transparent
        opacity={0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={texture}
      />
    </points>
  );
}
