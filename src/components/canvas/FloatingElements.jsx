import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function GlassShard({ position, scale, speed, seed }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Smooth anti-gravity floating
    meshRef.current.position.y = position[1] + Math.sin(time * 0.4 + seed) * 0.8;
    meshRef.current.position.x = position[0] + Math.cos(time * 0.2 + seed) * 0.4;
    meshRef.current.position.z = position[2] + Math.sin(time * 0.3 + seed) * 0.4;

    // Slow tumbling rotation
    meshRef.current.rotation.x += speed.x * delta;
    meshRef.current.rotation.y += speed.y * delta;
    meshRef.current.rotation.z += speed.z * delta;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      {/* High-quality glassmorphic transmission material */}
      <meshPhysicalMaterial
        color="#c8d6ff"
        transmission={0.9}
        roughness={0.15}
        metalness={0.1}
        thickness={1.2}
        ior={1.5}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function FloatingPaper({ position, scale, speed, seed }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // Floating drift
    meshRef.current.position.y = position[1] + Math.cos(time * 0.3 + seed) * 0.6;
    meshRef.current.position.x = position[0] + Math.sin(time * 0.15 + seed) * 0.3;

    // Swaying rotation (paper-like wave)
    meshRef.current.rotation.x = Math.sin(time * 0.5 + seed) * 0.2 + speed.x * time * 0.1;
    meshRef.current.rotation.y = time * speed.y * 0.15;
    meshRef.current.rotation.z = Math.cos(time * 0.3 + seed) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[1.2, 1.6, 2, 2]} />
      <meshStandardMaterial
        color="#faf9f5"
        roughness={0.9}
        metalness={0.0}
        side={THREE.DoubleSide}
        transparent
        opacity={0.65}
      />
    </mesh>
  );
}

export default function FloatingElements({ section }) {
  const isMobile = window.innerWidth < 768;
  const elementCount = isMobile ? 6 : 14;

  // Generate randomized positions, scales, and rotation speeds
  const elements = useMemo(() => {
    const list = [];
    for (let i = 0; i < elementCount; i++) {
      const type = i % 2 === 0 ? 'glass' : 'paper';
      list.push({
        id: i,
        type,
        position: [
          (Math.random() - 0.5) * 22, // width spread
          (Math.random() - 0.5) * 12 + 2, // height spread
          (Math.random() - 0.5) * 15 - 4, // depth spread
        ],
        scale: type === 'glass' 
          ? [0.3 + Math.random() * 0.4, 0.4 + Math.random() * 0.7, 0.3 + Math.random() * 0.4]
          : [0.4 + Math.random() * 0.3, 0.4 + Math.random() * 0.3, 0.01],
        speed: {
          x: (Math.random() - 0.5) * 0.15,
          y: (Math.random() - 0.5) * 0.15,
          z: (Math.random() - 0.5) * 0.15,
        },
        seed: Math.random() * 100,
      });
    }
    return list;
  }, [elementCount]);

  // Smooth fade-out of elements on Final sections or Let Go
  const opacityRef = useRef({ val: 1 });
  useFrame((_, delta) => {
    const target = section >= 5 ? 0.0 : 1.0;
    opacityRef.current.val += (target - opacityRef.current.val) * delta * 2.0;
  });

  if (opacityRef.current.val < 0.01) return null;

  return (
    <group>
      {elements.map((el) => (
        el.type === 'glass' ? (
          <GlassShard
            key={el.id}
            position={el.position}
            scale={el.scale}
            speed={el.speed}
            seed={el.seed}
          />
        ) : (
          <FloatingPaper
            key={el.id}
            position={el.position}
            scale={el.scale}
            speed={el.speed}
            seed={el.seed}
          />
        )
      ))}
    </group>
  );
}
