import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import audioEngine from '../../utils/audioEngine';

export default function LandingScreen({ onStart }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const handleStart = () => {
    setHasStarted(true);
    // Initialize & start Web Audio engine
    audioEngine.init();
    audioEngine.setMute(!audioEnabled);
    audioEngine.start();
    
    // Call the parent start transition
    onStart();
  };

  return (
    <AnimatePresence>
      {!hasStarted && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black select-none px-6"
          exit={{ opacity: 0 }}
          transition={{ duration: 2.0, ease: [0.25, 1, 0.5, 1] }}
        >
          {/* Subtle Ambient Music Toggle in Corner */}
          <div className="absolute top-8 right-8 z-50 flex items-center gap-2">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-300"
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase hidden md:inline">
              {audioEnabled ? "Sound On" : "Muted"}
            </span>
          </div>

          {/* Tiny glowing particle in the center */}
          <div className="relative flex items-center justify-center w-32 h-32 mb-12">
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-white text-glow"
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{
                scale: [1, 2.5, 1],
                opacity: [0.3, 0.9, 0.3],
                boxShadow: [
                  '0 0 10px rgba(255,255,255,0.5)',
                  '0 0 30px rgba(94,67,243,0.8)',
                  '0 0 10px rgba(255,255,255,0.5)',
                ],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Outer halo */}
            <motion.div
              className="absolute w-12 h-12 rounded-full border border-white/5 bg-white/[0.01]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Fading narrative quote */}
          <motion.div
            className="text-center max-w-lg mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 2.5, ease: 'easeOut' }}
          >
            <h1 className="font-serif text-xl md:text-2xl text-white/80 font-light italic tracking-wider leading-relaxed text-glow">
              “Some people become a universe.”
            </h1>
          </motion.div>

          {/* Start CTA */}
          <motion.button
            onClick={handleStart}
            className="group relative px-8 py-3.5 overflow-hidden rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-500"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 1.5, ease: 'easeOut' }}
            onMouseEnter={() => audioEngine.initialized && audioEngine.playHover()}
          >
            {/* Glowing border hover line */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out" />
            
            <span className="font-sans text-[11px] font-medium tracking-[0.25em] text-white/70 group-hover:text-white uppercase transition-colors duration-300">
              Tune In & Enter
            </span>
          </motion.button>

          {/* Ambient Hint */}
          <motion.p
            className="absolute bottom-10 text-[9px] font-mono tracking-widest text-white/20 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.0 }}
          >
            Best experienced with headphones
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
