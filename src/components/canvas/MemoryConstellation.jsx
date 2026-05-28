import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import audioEngine from '../../utils/audioEngine';
import { CONFIG } from '../../config';

// Sub-component for the particle explosion when clicking an orb
function ParticleExplosion({ position, color, onComplete }) {
  const pointsRef = useRef();
  const count = 40;
  
  // Generate random explosion velocities
  const [positions, velocities] = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];

      // Sphere expansion velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 2.0 + Math.random() * 4.0;

      vel[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
      vel[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
      vel[i * 3 + 2] = speed * Math.cos(phi);
    }
    return [pos, vel];
  }, [position]);

  const ageRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    ageRef.current += delta;
    
    // Dissolve over 1.2 seconds
    if (ageRef.current > 1.2) {
      onComplete();
      return;
    }

    const pos = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx] += velocities[idx] * delta;
      pos[idx + 1] += velocities[idx + 1] * delta;
      pos[idx + 2] += velocities[idx + 2] * delta;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.material.opacity = 1.0 - (ageRef.current / 1.2);
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
        color={color}
        size={0.15}
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main Constellation Component
export default function MemoryConstellation({ section, onSelectMemory, activeMemory }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [explosions, setExplosions] = useState([]);
  const groupRef = useRef();

  const MEMORIES = CONFIG.memories
  // Rotate the whole memory field slowly
  useFrame((state) => {
    if (!groupRef.current || section >= 5) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.05;
  });

  // Trigger click, zoom-in, audio strike, and particle burst
  const handleOrbClick = (mem) => {
    audioEngine.playClick();
    onSelectMemory(mem);
    
    // Add particle explosion at orb position
    setExplosions((prev) => [
      ...prev,
      { id: Date.now(), position: mem.coords, color: mem.color }
    ]);
  };

  const handlePointerOver = (id) => {
    setHoveredId(id);
    audioEngine.playHover();
  };

  const handlePointerOut = () => {
    setHoveredId(null);
  };

  if (section !== 2) return null;

  return (
    <group ref={groupRef}>
      {MEMORIES.map((mem) => {
        const isHovered = hoveredId === mem.id;
        const isSelected = activeMemory?.id === mem.id;
        const scale = isSelected ? 1.5 : isHovered ? 1.3 : 1.0;

        return (
          <group key={mem.id} position={mem.coords}>
            {/* Glowing memory orb */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                handleOrbClick(mem);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                handlePointerOver(mem.id);
              }}
              onPointerOut={handlePointerOut}
              scale={[scale, scale, scale]}
            >
              <sphereGeometry args={[0.25, 32, 32]} />
              <meshPhysicalMaterial
                color={mem.color}
                emissive={mem.color}
                emissiveIntensity={isHovered ? 2.5 : 1.2}
                roughness={0.1}
                metalness={0.1}
                transmission={0.6}
                thickness={0.5}
              />
            </mesh>

            {/* Dynamic Orbit Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.35, 0.38, 32]} />
              <meshBasicMaterial
                color={mem.color}
                transparent
                opacity={isHovered ? 0.8 : 0.25}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* 3D Holographic Glass Card on Hover */}
            {/* Always show fragment card */}
              <Html
                position={[0, 0.7, 0]}
                center
                distanceFactor={7}
                style={{
                  pointerEvents: 'auto',
                  transition: 'opacity 0.4s ease',
                  opacity: 1,
                }}
              >
                <div className="glass-card px-4 py-3 rounded-lg w-56 text-left border border-white/10 select-none shadow-2xl backdrop-blur-md">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-space-cyan mb-1" style={{ color: mem.color }}>
                    {mem.title}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {mem.fragment}
                  </p>
                </div>
              </Html>

          </group>
        );
      })}

      {/* Render active explosions */}
      {explosions.map((exp) => (
        <ParticleExplosion
          key={exp.id}
          position={exp.position}
          color={exp.color}
          onComplete={() => {
            setExplosions((prev) => prev.filter((e) => e.id !== exp.id));
          }}
        />
      ))}
    </group>
  );
}
