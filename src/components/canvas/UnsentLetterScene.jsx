import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CONFIG } from '../../config';
import textureGenerator from '../../utils/textureGenerator';
import imgPerson from '../../assets/img-person.webp';

export default function UnsentLetterScene({ section }) {
  const meshRef = useRef();
  const geoRef = useRef();
  const memoryRefs = useRef([]);
  const timerRef = useRef();

  // Initialise THREE.Timer once
  useEffect(() => {
    timerRef.current = new THREE.Timer();
    // Optional: handle page visibility automatically
    timerRef.current.connect(document);
  }, []);

  // Load the person image texture
  const texture = useTexture(imgPerson);

  useFrame((state) => {
    if (!meshRef.current || section !== 3) return;
    // Update timer with the current timestamp (state.clock.elapsedTime gives seconds)
    timerRef.current.update(state.clock.elapsedTime);
    const time = timerRef.current.getElapsed();

    // Floating position displacement
    meshRef.current.position.y = Math.sin(time * 0.4) * 0.3;
    meshRef.current.position.x = Math.cos(time * 0.2) * 0.1;

    // Wind-like waving animation: modify the plane vertices dynamically to simulate paper curves
    if (geoRef.current) {
      const posAttr = geoRef.current.attributes.position;
      const pos = posAttr.array;
      for (let i = 0; i < posAttr.count; i++) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        // Offset along Z (depth) using a combination of sine waves
        pos[i * 3 + 2] = Math.sin(x * 0.5 + time) * 0.08 + Math.cos(y * 0.5 + time * 1.2) * 0.05;
      }
      posAttr.needsUpdate = true;
      geoRef.current.computeVertexNormals();
    }

    // Slow cinematic drift orientation
    meshRef.current.rotation.y = -Math.PI / 6 + Math.sin(time * 0.15) * 0.08;
    meshRef.current.rotation.x = Math.PI / 12 + Math.cos(time * 0.12) * 0.05;
  });

  if (section !== 3) return null;

  return (
    <group position={[1.5, 0.2, -1.5]}>
      {/* Floating 3D Paper mesh */}
      <mesh ref={meshRef}>
        <planeGeometry ref={geoRef} args={[3.2, 4.2, 10, 10]} />
        <meshPhysicalMaterial
          map={texture}
          color="#ffffff"
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
          shadowSide={THREE.DoubleSide}
          transmission={0.05} // lower transmission so image is clear
          thickness={0.1}
        />
      </mesh>
      {/* Memory fragments floating */}
      {CONFIG.memories.map((mem, idx) => (
        <mesh key={mem.id} position={[
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 2
        ]} ref={el => (memoryRefs.current[idx] = el)}>
          <planeGeometry args={[1.5, 0.5]} />
          <meshBasicMaterial color="white" transparent opacity={0.6} />
          <Html distanceFactor={10}>
            <div style={{ color: mem.color, fontSize: '0.12rem', textAlign: 'center' }}>{mem.fragment}</div>
          </Html>
        </mesh>
      ))}
      {/* Subtle paper glow backing */}
      <pointLight
        position={[0, 0, -1.0]}
        intensity={0.4}
        color="#a2bcfc"
        distance={6}
      />
    </group>
  );
}
