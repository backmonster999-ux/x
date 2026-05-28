import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';

import CameraRig from './CameraRig';
import SpaceParticles from './SpaceParticles';
import FloatingElements from './FloatingElements';
import MemoryConstellation from './MemoryConstellation';
import UnsentLetterScene from './UnsentLetterScene';
import TimeVoidScene from './TimeVoidScene';

export default function CinematicCanvas({ section, activeMemory, onSelectMemory }) {
  // Mobile adaptive flags
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-space-dark">
      <Canvas
        gl={{
          powerPreference: "high-performance",
          antialias: !isMobile,
          alpha: false,
          stencil: false,
          depth: true,
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        {/* Cinematic deep space background color */}
        <color attach="background" args={["#030307"]} />

        {/* Ambient lighting */}
        <ambientLight intensity={0.15} />

        {/* Soft fill lights */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.4}
          color="#a2bcfc"
        />
        <pointLight
          position={[-8, 4, 3]}
          intensity={0.6}
          color="#5e43f3"
          distance={15}
        />
        <pointLight
          position={[8, -4, 2]}
          intensity={0.5}
          color="#00e1ff"
          distance={15}
        />

        <Suspense fallback={null}>
          {/* Custom Camera Controller & Rigging */}
          <CameraRig section={section} activeMemory={activeMemory} />

          {/* Unified Drifting Starfield / Soul Embers */}
          <SpaceParticles section={section} />

          {/* Floaters: Paper sheets and Glass crystals */}
          <FloatingElements section={section} />

          {/* Section 2: Interactive Memory Orbs */}
          <MemoryConstellation
            section={section}
            onSelectMemory={onSelectMemory}
            activeMemory={activeMemory}
          />

          {/* Section 3: Floating Unsent Letter */}
          <UnsentLetterScene section={section} />

          {/* Section 4: Broken Time dials */}
          <TimeVoidScene section={section} />

          {/* Cinematic Post-Processing Composers */}
          <EffectComposer disableNormalPass>
            {/* Soft, photorealistic background camera blur */}
            <DepthOfField
              focusDistance={isMobile ? 0.05 : 0.02}
              focalLength={isMobile ? 0.03 : 0.045}
              bokehScale={isMobile ? 2.5 : 4.0}
            />
            {/* Dreamcore bloom effect */}
            <Bloom
              intensity={isMobile ? 0.8 : 1.4}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.8}
              mipmapBlur
            />
            {/* Film school vignette shading */}
            <Vignette
              offset={0.25}
              darkness={1.05}
              eskil={false}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
