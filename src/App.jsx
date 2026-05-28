import React, { useState } from 'react';
import CinematicCanvas from './components/canvas/CinematicCanvas';
import LandingScreen from './components/ui/LandingScreen';
import Overlay from './components/ui/Overlay';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [section, setSection] = useState(0);
  const [activeMemory, setActiveMemory] = useState(null);

  const handleStart = () => {
    setSection(1);
  };

  const handleBackgroundClick = (e) => {
    // If the user clicks the empty space in section 2 while zooming in on an orb, return to orbit
    if (section === 2 && activeMemory) {
      setActiveMemory(null);
    }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black select-none"
      onClick={handleBackgroundClick}
    >
      {/* 3D WebGL Canvas Layer */}
      <CinematicCanvas 
        section={section} 
        activeMemory={activeMemory} 
        onSelectMemory={setActiveMemory} 
      />

      {/* DOM Narrative Overlay Layer */}
      <Overlay 
        section={section} 
        setSection={setSection} 
        activeMemory={activeMemory} 
        setActiveMemory={setActiveMemory}
      />

      {/* Complete darkness audio-unlocking Landing Layer */}
      <LandingScreen onStart={handleStart} />

      {/* Cinematic dark radial vignette overlay */}
      <div className="absolute inset-0 cinematic-vignette pointer-events-none z-30" />
      
      {/* Slow curtain fade-to-black overlay during Section 6 Let Go climax */}
      <AnimatePresence>
        {section === 6 && (
          <motion.div 
            className="absolute inset-0 bg-black z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 5.0, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
