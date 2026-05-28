import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function BrokenClock({ position, scale, seed }) {
  const groupRef = useRef();
  const dialRef = useRef();
  const hourHandRef = useRef();
  const minuteHandRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Floating group drift
    groupRef.current.position.y = position[1] + Math.sin(time * 0.35 + seed) * 0.5;
    groupRef.current.position.x = position[0] + Math.cos(time * 0.18 + seed) * 0.3;

    // Outer dial drifts and rolls
    if (dialRef.current) {
      dialRef.current.rotation.x += 0.05 * delta;
      dialRef.current.rotation.y += 0.08 * delta;
      dialRef.current.position.z = Math.sin(time * 0.5 + seed) * 0.2;
    }

    // Hands drift apart along Z and rotate at erratic speeds
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z += 0.15 * delta;
      hourHandRef.current.position.x = Math.sin(time * 0.4 + seed) * 0.3;
      hourHandRef.current.position.y = Math.cos(time * 0.3 + seed) * 0.2;
      hourHandRef.current.position.z = 0.4 + Math.sin(time * 0.2 + seed) * 0.4;
    }

    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z += 0.35 * delta;
      minuteHandRef.current.position.x = -Math.cos(time * 0.45 + seed) * 0.3;
      minuteHandRef.current.position.y = Math.sin(time * 0.25 + seed) * 0.2;
      minuteHandRef.current.position.z = -0.4 - Math.cos(time * 0.3 + seed) * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Outer clock ring (torus) */}
      <mesh ref={dialRef}>
        <torusGeometry args={[1.5, 0.06, 16, 64]} />
        <meshPhysicalMaterial
          color="#8fa9ff"
          roughness={0.25}
          metalness={0.8}
          transmission={0.3}
          thickness={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Hour hand (box) */}
      <mesh ref={hourHandRef} position={[0, 0, 0.2]}>
        <boxGeometry args={[0.08, 0.8, 0.03]} />
        <meshStandardMaterial
          color="#d1d5db"
          roughness={0.5}
          metalness={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Minute hand (box) */}
      <mesh ref={minuteHandRef} position={[0, 0, -0.2]}>
        <boxGeometry args={[0.06, 1.2, 0.02]} />
        <meshStandardMaterial
          color="#a2bcfc"
          roughness={0.5}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Glowing splinters representing "shattered timelines"
function TimelineSplinter({ start, end, color, seed }) {
  const lineRef = useRef();

  useFrame((state) => {
    if (!lineRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Wave the line in space
    lineRef.current.position.y = Math.sin(time * 0.3 + seed) * 0.3;
    lineRef.current.rotation.z = Math.cos(time * 0.1 + seed) * 0.15;
  });

  const points = useMemo(() => {
    return [new THREE.Vector3(...start), new THREE.Vector3(...end)];
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line ref={lineRef} geometry={lineGeometry}>
      <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.4} />
    </line>
  );
}

export default function TimeVoidScene({ section }) {
  const clocks = useMemo(() => [
    { id: 1, position: [-3, 1.5, -3], scale: [0.7, 0.7, 0.7], seed: 10 },
    { id: 2, position: [3, -1.0, -4], scale: [0.9, 0.9, 0.9], seed: 45 },
    { id: 3, position: [-1, -2.5, -2], scale: [0.5, 0.5, 0.5], seed: 80 }
  ], []);

  const splinters = useMemo(() => [
    { id: 1, start: [-6, 0, -5], end: [-2, 2, -4], color: "#8fa9ff", seed: 2 },
    { id: 2, start: [1, -2, -3], end: [5, -1, -5], color: "#5e43f3", seed: 12 },
    { id: 3, start: [-3, -1, -6], end: [2, 1, -6], color: "#00e1ff", seed: 22 }
  ], []);

  if (section !== 4) return null;

  return (
    <group>
      {/* Broken clocks */}
      {clocks.map((c) => (
        <BrokenClock
          key={c.id}
          position={c.position}
          scale={c.scale}
          seed={c.seed}
        />
      ))}

      {/* Timeline splinters */}
      {splinters.map((s) => (
        <TimelineSplinter
          key={s.id}
          start={s.start}
          end={s.end}
          color={s.color}
          seed={s.seed}
        />
      ))}
      
      {/* Volumetric center void light */}
      <pointLight
        position={[0, 0, -2]}
        intensity={0.6}
        color="#5e43f3"
        distance={10}
      />
    </group>
  );
}
