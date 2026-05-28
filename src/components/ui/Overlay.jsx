import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ArrowRight, RotateCcw, ArrowLeft } from 'lucide-react';
import { CONFIG } from '../../config';
import audioEngine from '../../utils/audioEngine';

export default function Overlay({ section, setSection, activeMemory, setActiveMemory }) {
  const [isMuted, setIsMuted] = useState(false);
  const [canGoNext, setCanGoNext] = useState(true);

  // Mute button handler
  const handleToggleMute = () => {
    const nextMuteState = audioEngine.toggleMute();
    setIsMuted(nextMuteState);
  };

  // Move to next chapter, triggering audio transition
  const handleNext = () => {
    if (section >= 5) return;
    audioEngine.playClick();
    const nextSec = section + 1;
    setSection(nextSec);
    // Play the unique musical chord associated with the new chapter
    audioEngine.playSectionChord(nextSec);
    audioEngine.setEnergy(nextSec);
    setActiveMemory(null); // clear zoomed orb
  };
  const handlePreview = () => {
    if (section > 1) {
      // Go back one section
      audioEngine.playClick();
      audioEngine.playSectionChord(section - 1);
      audioEngine.setEnergy(section - 1);
      setSection(section - 1);
    } else {
      // At the first section, restart the experience
      handleRestart();
      audioEngine.playClick();
    }
  };

  // "Let Go" climax trigger
  const handleLetGo = () => {
    audioEngine.playClick();
    setSection(6);
    audioEngine.setEnergy(6); // triggers slow fade out of music to silence
  };

  // Restart the experience
  const handleRestart = () => {
    window.location.reload();
  };

  // Prevent immediate scrolling/clicking to avoid skipping transitions
  useEffect(() => {
    setCanGoNext(false);
    const timer = setTimeout(() => setCanGoNext(true), 1500);
    return () => clearTimeout(timer);
  }, [section]);

  // CSS transitions for text fades
  const textVariant = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, y: -15, transition: { duration: 1.0 } }
  };

  // Letter lines stagger effect
  const containerStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.8,
        delayChildren: 0.5,
      }
    }
  };

  const itemFade = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 0.8, x: 0, transition: { duration: 1.2, ease: "easeOut" } }
  };

  return (
    <div className="absolute inset-0 w-full h-full z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12 select-none">
      
      {/* 1. HEADER OVERLAY */}
      <div className="w-full flex justify-between items-center z-20 pointer-events-auto">

        {/* Audio Mute button */}
        <AnimatePresence>
          {section > 0 && section < 6 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleToggleMute}
              className="flex items-center gap-2 p-2.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/15 text-white/50 hover:text-white transition-all duration-300 pointer-events-auto"
              onMouseEnter={() => audioEngine.playHover()}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 2. MAIN NARRATIVE AREA */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-12">
        <AnimatePresence mode="wait">
          
          {/* SECTION 1: INTRO SCENE */}
          {section === 1 && (
            <motion.div
              key="sec1"
              variants={textVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center max-w-2xl"
            >
              <h2 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-white mb-6 text-glow">
                Happy Birthday, {CONFIG.birthdayName}.
              </h2>
              <p className="font-sans text-sm md:text-base font-light text-slate-400 tracking-wider leading-relaxed mb-2">
                {CONFIG.birthdayDate}
              </p>
              <p className="font-sans text-sm md:text-base font-light text-slate-400 tracking-wider leading-relaxed">
                {CONFIG.missYou}
              </p>
              <p className="font-sans text-sm md:text-base font-light text-slate-400 tracking-wider leading-relaxed">
                No matter how far life moves,
                <br />some moments remain weightless.
              </p>
            </motion.div>
          )}

          {/* SECTION 2: MEMORY CONSTELLATION */}
          {section === 2 && (
            <motion.div
              key="sec2"
              variants={textVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center max-w-xl"
            >
              {!activeMemory ? (
                <>
                  <h2 className="font-serif text-2xl md:text-3xl font-light tracking-wider text-slate-200 mb-3 text-glow">
                    Memory Constellation
                  </h2>
                  <p className="font-sans text-xs md:text-sm font-light text-slate-400 tracking-widest leading-relaxed uppercase">
                    Floating memory fragments drift through space.
                    <br />Click to focus.
                  </p>
                </>
              ) : (
                <div className="pointer-events-auto">
                  {/* Subtle click indicator */}
                  <motion.button
                    onClick={() => setActiveMemory(null)}
                    className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] font-mono tracking-widest uppercase transition-all duration-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onMouseEnter={() => audioEngine.playHover()}
                  >
                    Return to Orbit
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* SECTION 3: THE UNSENT LETTER */}
          {section === 3 && (
            <motion.div
              key="sec3"
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 1 } }}
              className="w-full max-w-2xl text-left md:pl-8 flex flex-col gap-6"
            >
              {CONFIG.letterLines.map((line, i) => (
                <motion.p
                  key={i}
                  variants={itemFade}
                  className={`font-serif text-sm md:text-lg italic font-light leading-relaxed ${
                    i === CONFIG.letterLines.length - 1 ? 'text-space-cyan text-glow-cyan' : 'text-slate-300'
                  }`}
                >
                  {line}
                </motion.p>
              ))}
            </motion.div>
          )}

          {/* SECTION 4: TIME VOID */}
          {section === 4 && (
            <motion.div
              key="sec4"
              variants={textVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center max-w-xl"
            >
              <h2 className="font-serif text-2xl md:text-3xl font-light italic tracking-wider text-slate-300 mb-4 text-glow">
                “Some chapters end quietly.”
              </h2>
              <p className="font-sans text-xs md:text-sm font-light text-slate-400 tracking-wider leading-relaxed">
                Clocks drift apart, timelines shatter,
                <br />and the echoes of yesterday slowly fade into dust.
              </p>
            </motion.div>
          )}

          {/* SECTION 5: FINAL SCENE (CLIMAX) */}
          {section === 5 && (
            <motion.div
              key="sec5"
              variants={textVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center max-w-xl flex flex-col items-center gap-8"
            >
              <div className="space-y-4">
                <h2 className="font-serif text-3xl md:text-5xl font-light tracking-wide text-white text-glow">
                  Happy Birthday.
                </h2>
                <p className="font-serif text-base md:text-xl italic font-light text-slate-300 tracking-wider">
                  Take care of the universe inside you.
                </p>
              </div>

              {/* Let Go Button */}
              <motion.button
                onClick={handleLetGo}
                className="group relative pointer-events-auto px-10 py-4 overflow-hidden rounded-full border border-space-cyan/30 bg-space-cyan/[0.02] hover:bg-space-cyan/[0.08] hover:border-space-cyan/50 shadow-[0_0_20px_rgba(0,225,255,0.05)] transition-all duration-700 mt-4"
                initial={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onMouseEnter={() => audioEngine.playHover()}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-space-cyan/10 to-transparent transition-transform duration-1000 ease-out" />
                <span className="font-sans text-[11px] font-semibold tracking-[0.3em] text-space-cyan text-glow-cyan uppercase">
                  Let Go
                </span>
                <ArrowLeft size={12} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {/* SECTION 6: END SCREEN (LET GO STATE) */}
          {section === 6 && (
            <motion.div
              key="sec6"
              className="text-center flex flex-col items-center gap-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 6.0, duration: 3.0 }}
            >
              <h2 className="font-serif text-xl md:text-2xl font-light italic tracking-widest text-slate-400 text-glow">
                Thank you for existing.
              </h2>
              
              {/* Subtle Restart Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                whileHover={{ opacity: 0.8 }}
                onClick={handleRestart}
                className="pointer-events-auto mt-8 flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-white transition-opacity duration-300"
              >
                <RotateCcw size={10} /> Re-enter
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 3. NAVIGATION CONTROLLERS */}
      <div className="w-full flex justify-between items-center z-20">

        {/* Continue button */}
        <AnimatePresence>
          {section > 0 && section < 5 && (
            <div className="flex space-x-2">
              <motion.button
                key="nextBtn"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                disabled={!canGoNext}
                onClick={handleNext}
                className={`pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/10 text-white/50 hover:text-white transition-all duration-300 ${!canGoNext ? 'opacity-30 cursor-not-allowed' : ''}`}
                onMouseEnter={() => canGoNext && audioEngine.playHover()}
              >
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  {section === 1 ? "Begin Journey" : "Continue"}
                </span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                key="previewBtn"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                disabled={!canGoNext}
                onClick={handlePreview}
                className={`pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/10 text-white/50 hover:text-white transition-all duration-300 ${!canGoNext ? 'opacity-30 cursor-not-allowed' : ''}`}
                onMouseEnter={() => canGoNext && audioEngine.playHover()}
              >
                <span className="text-[10px] font-mono tracking-widest uppercase">
                  {"Preview"}
                </span>
                <ArrowLeft size={12} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
