import climaxSong from '../assets/Climax.mp3';

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.reverbNode = null;
    this.ambientGain = null;
    this.ambientOscs = [];
    this.ambientFilters = [];
    this.lfo = null;
    this.muted = false;
    this.volume = 0.5;
    this.initialized = false;
    this.currentChordIndex = 0;
    this.bgAudio = null;
    this.bgSource = null;

    // Chords defined as MIDI notes:
    // 0: Cmin9 (C2, G2, D3, Eb3, Bb3) - Loneliness & Silence
    // 1: Abmaj9 (Ab1, Eb2, Bb2, C3, G3) - Nostalgia
    // 2: Fm9 (F1, C2, G2, Ab2, Eb3) - Distance
    // 3: Bb11 (Bb1, F2, C3, D3, Ab3) - Passing Time
    // 4: Cmaj9 (C2, G2, D3, E3, B3) - Warmth & Resolution
    // 5: Gsus4 (G1, D2, G2, C3, D3) - Transition
    this.chords = [
      [36, 48, 55, 59, 62, 64], // Cmaj9 (climax)
    ];
  }

  // Convert MIDI note to frequency
  midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // Generate procedural reverb impulse response (lush hall)
  createReverbBuffer(duration = 5.0, decay = 2.5) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const percent = i / length;
        // White noise with exponential decay
        const noise = Math.random() * 2 - 1;
        channelData[i] = noise * Math.pow(1 - percent, decay);
      }
    }
    return buffer;
  }

  init() {
    if (this.initialized) return;

    // Standard web audio context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Lush Reverb
    this.reverbNode = this.ctx.createConvolver();
    const reverbBuffer = this.createReverbBuffer(6.0, 3.0);
    if (reverbBuffer) {
      this.reverbNode.buffer = reverbBuffer;
    }
    this.reverbNode.connect(this.masterGain);

    // Direct path for chimes and reverb mix
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.dryGain.connect(this.masterGain);

    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.wetGain.connect(this.reverbNode);

    // Ambient gain node
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
    // Ambient flows primarily through the reverb for massive space
    this.ambientGain.connect(this.reverbNode);
    this.ambientGain.connect(this.dryGain);

    // Initialize background audio element with loop enabled
    this.bgAudio = new Audio(climaxSong);
    this.bgAudio.loop = true;
    this.bgAudio.crossOrigin = "anonymous";

    // Connect audio element source directly to master gain for background music only
    this.bgSource = this.ctx.createMediaElementSource(this.bgAudio);
    this.bgSource.connect(this.masterGain);

    this.initialized = true;
  }

  start() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Play background song
    if (this.bgAudio) {
      this.bgAudio.play().catch(e => console.log("Audio playback start error:", e));
    }
        // No intro chord; only background music
  }

  startAmbientDrone() {
    // Ambient drone disabled; only background music plays.
  }

  // Tweak synth parameters dynamically based on the story section (0 to 5)
  setEnergy(level) {
    // No dynamic energy adjustments; only background music plays.
    // Optionally, you could control master volume here if needed.
  }

  // Play a soft, beautiful piano chime for interaction triggers
  playKeyStrike(freq, duration = 4.0, volume = 0.4) {
    // Disabled: no key strike sounds
    return;
  }

  // Play a cinematic chord mapping to the scene transitions
  playSectionChord(index) {
    // Disabled: no section chords played
    return;
  }

  // Quick soft chime for button and card hovers
  playHover() {
    // Disabled: no hover sounds
    return;
  }

  // Click chime
  playClick() {
    // Disabled: no click sounds
    return;
  }

  setMute(state) {
    this.muted = state;
    if (this.masterGain) {
      const time = this.ctx ? this.ctx.currentTime : 0;
      this.masterGain.gain.linearRampToValueAtTime(state ? 0 : this.volume, time + 0.5);
    }
  }

  toggleMute() {
    this.setMute(!this.muted);
    return this.muted;
  }
}

const audioEngine = new AudioEngine();
export default audioEngine;
