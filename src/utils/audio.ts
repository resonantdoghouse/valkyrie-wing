let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientGain: GainNode | null = null;

let activeSoundItems: { stop: () => void }[] = [];
let currentAmbientType: 'BAR' | 'BRIEFING' | 'QUARTERS' | null = null;
let isMuted = false;
let ambientVolume = 0.25;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create master gain for all audio
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.8, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);
    
    // Create ambient gain specifically for background loops
    ambientGain = audioCtx.createGain();
    ambientGain.gain.setValueAtTime(ambientVolume, audioCtx.currentTime);
    ambientGain.connect(masterGain);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const setMuteAmbient = (mute: boolean) => {
  isMuted = mute;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.8, audioCtx.currentTime);
  }
};

export const setAmbientVolume = (vol: number) => {
  ambientVolume = Math.max(0, Math.min(1, vol));
  if (ambientGain && audioCtx) {
    ambientGain.gain.setValueAtTime(ambientVolume, audioCtx.currentTime);
  }
};

export const getAudioState = () => {
  return { isMuted, ambientVolume };
};

// Play sound effects
export const playLaserSound = () => {
  initAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'square';
  
  // Frequency sweep for "pew"
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.1);
  
  // Volume envelope
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  
  osc.connect(gainNode);
  if (masterGain) {
    gainNode.connect(masterGain);
  } else {
    gainNode.connect(audioCtx.destination);
  }
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

export const playExplosionSound = () => {
  initAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  
  // Low frequency rumble
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.8);
  
  // Volume envelope
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
  
  osc.connect(gainNode);
  if (masterGain) {
    gainNode.connect(masterGain);
  } else {
    gainNode.connect(audioCtx.destination);
  }
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.8);
};

export const playLightClickSound = () => {
  initAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
  osc.frequency.setValueAtTime(2400, audioCtx.currentTime + 0.01);
  
  gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
  
  osc.connect(gainNode);
  if (masterGain) {
    gainNode.connect(masterGain);
  } else {
    gainNode.connect(audioCtx.destination);
  }
  osc.start();
  osc.stop(audioCtx.currentTime + 0.04);
};

export const playChimeSound = () => {
  initAudio();
  if (!audioCtx) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;
  const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
  
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const delay = i * 0.07;
    
    osc.type = 'sine';
    osc.frequency.value = f;
    
    gainNode.gain.setValueAtTime(0.008, now + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.35);
    
    osc.connect(gainNode);
    if (masterGain) {
      gainNode.connect(masterGain);
    } else {
      gainNode.connect(ctx.destination);
    }
    osc.start(now + delay);
    osc.stop(now + delay + 0.4);
  });
};

export const stopAmbientSound = () => {
  activeSoundItems.forEach(item => {
    try {
      item.stop();
    } catch (e) {
      // Ignore if already stopped
    }
  });
  activeSoundItems = [];
  currentAmbientType = null;
};

// Create a buffer filled with brownian/pink noise for natural, warm acoustics
function createBrownianNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // Gain compensation
  }
  return buffer;
}

// Create a buffer filled with gentle white noise
function createNoiseBuffer(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// Warm, soothing vessel interior engine & ventilation ambience
function startEngineRumble(ctx: AudioContext, dest: AudioNode) {
  // 1. Soft brownian noise for gentle air circulation and vessel life support hum
  const noiseBuf = createBrownianNoiseBuffer(ctx);
  const noiseSource = ctx.createBufferSource();
  const noiseFilter = ctx.createBiquadFilter();
  const noiseGain = ctx.createGain();

  noiseSource.buffer = noiseBuf;
  noiseSource.loop = true;

  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 105; // Soft warm air hum
  noiseFilter.Q.value = 0.5;

  noiseGain.gain.value = 0.025; // Gentle, comforting level

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);

  noiseSource.start();

  // 2. Very quiet, clean sub-bass sine wave (warm vessel core idle, no buzz)
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();

  subOsc.type = 'sine';
  subOsc.frequency.value = 42; // Low gentle vibration
  subGain.gain.value = 0.007; // Very subtle presence

  subOsc.connect(subGain);
  subGain.connect(dest);
  subOsc.start();

  activeSoundItems.push({
    stop: () => {
      try { noiseSource.stop(); } catch(e){}
      try { subOsc.stop(); } catch(e){}
    }
  });
}

// Generates occasional, soft background computer blips and processing clicks
function startComputerChamberAmbience(ctx: AudioContext, dest: AudioNode) {
  let isCancelled = false;

  const triggerComputerSound = () => {
    if (isCancelled || !audioCtx || currentAmbientType === null) return;
    const now = ctx.currentTime;
    const rand = Math.random();
    
    if (rand < 0.4) {
      // 2 quick soft data chirps
      const count = 2;
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const delay = i * 0.05;
        const dur = 0.02;
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400 + Math.random() * 300, now + delay);
        
        gain.gain.setValueAtTime(0.001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + delay + dur);
        
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.01);
      }
    } else if (rand < 0.75) {
      // Soft melodic confirm tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const dur = 0.035;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(1550, now + dur);
      
      gain.gain.setValueAtTime(0.0008, now);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + dur);
      
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + dur + 0.01);
    }
  };

  const scheduleNext = () => {
    if (isCancelled) return;
    const delay = 8000 + Math.random() * 10000;
    const timerId = setTimeout(() => {
      triggerComputerSound();
      scheduleNext();
    }, delay);
    activeSoundItems.push({
      stop: () => clearTimeout(timerId)
    });
  };

  scheduleNext();

  activeSoundItems.push({
    stop: () => {
      isCancelled = true;
    }
  });
}

// Generates warm, relaxing space lounge neo-noir synth chords
function startBarLounge(ctx: AudioContext, dest: AudioNode) {
  let isCancelled = false;

  // Lush, warm sci-fi chord voicings (smooth neo-noir / lo-fi space lounge)
  // EbMaj9 -> Gm7 -> AbMaj7 -> Fm9
  const chordVoicings = [
    [155.56, 196.00, 233.08, 293.66, 349.23], // EbMaj9 (Eb3, G3, Bb3, D4, F4)
    [196.00, 233.08, 293.66, 349.23, 392.00], // Gm7 (G3, Bb3, D4, F4, G4)
    [103.83, 155.56, 207.65, 261.63, 311.13], // AbMaj7 (Ab2, Eb3, Ab3, C4, Eb4)
    [174.61, 207.65, 261.63, 311.13, 349.23]  // Fm9 (F3, Ab3, C4, Eb4, F4)
  ];

  let chordIndex = 0;

  const playWarmChord = () => {
    if (isCancelled || !audioCtx || currentAmbientType !== 'BAR') return;
    const now = ctx.currentTime;
    const chord = chordVoicings[chordIndex];
    chordIndex = (chordIndex + 1) % chordVoicings.length;

    const chordDuration = 8.5;

    chord.forEach((freq, noteIdx) => {
      // Create oscillator pair for warm, lush chorus effect
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      // Soft sine/triangle blend
      osc.type = noteIdx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.value = 0.7; // Very gentle Q, no resonant whistling

      // Smooth attack & gentle long release
      const noteDelay = noteIdx * 0.04; // Slight gentle strum
      const noteStart = now + noteDelay;
      const targetGain = 0.007 / Math.sqrt(chord.length);

      gainNode.gain.setValueAtTime(0.00001, noteStart);
      gainNode.gain.linearRampToValueAtTime(targetGain, noteStart + 1.6);
      gainNode.gain.setValueAtTime(targetGain, noteStart + chordDuration - 2.5);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, noteStart + chordDuration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(dest);

      osc.start(noteStart);
      osc.stop(noteStart + chordDuration + 0.1);
    });
  };

  // Play initial chord gently after 1 second
  const initTimer = setTimeout(playWarmChord, 1000);
  const intervalId = setInterval(playWarmChord, 9000);

  activeSoundItems.push({
    stop: () => {
      isCancelled = true;
      clearTimeout(initTimer);
      clearInterval(intervalId);
    }
  });
}

// Background crowd chatter hum, glass clinks, and friendly droid chirps for the Bar Lounge
function startBarChatter(ctx: AudioContext, dest: AudioNode) {
  let isCancelled = false;

  // 1. Distant crowd murmur hum (very soft filtered white noise)
  const buffer = createNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const humGain = ctx.createGain();
  
  source.buffer = buffer;
  source.loop = true;
  
  filter.type = 'bandpass';
  filter.frequency.value = 320;
  filter.Q.value = 0.7;
  
  humGain.gain.value = 0.002; // Very quiet background murmur
  
  source.connect(filter);
  filter.connect(humGain);
  humGain.connect(dest);
  
  source.start();
  
  // 2. Occasional glass clinks
  const triggerClink = () => {
    if (isCancelled || !audioCtx || currentAmbientType !== 'BAR') return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const dur = 0.1;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600 + Math.random() * 300, now);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + dur);
    
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + dur + 0.03);
  };
  
  const scheduleClinks = () => {
    if (isCancelled) return;
    const delay = 8000 + Math.random() * 10000;
    const timerId = setTimeout(() => {
      triggerClink();
      scheduleClinks();
    }, delay);
    activeSoundItems.push({
      stop: () => clearTimeout(timerId)
    });
  };
  
  scheduleClinks();
  
  // 3. Subtle robotic chatter chirps
  const triggerRoboMumble = () => {
    if (isCancelled || !audioCtx || currentAmbientType !== 'BAR') return;
    const now = ctx.currentTime;
    
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = i * 0.08;
      const dur = 0.04;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + Math.random() * 150, now + delay);
      osc.frequency.exponentialRampToValueAtTime(200 + Math.random() * 80, now + delay + dur);
      
      gain.gain.setValueAtTime(0.0012, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + delay + dur);
      
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now + delay);
      osc.stop(now + delay + dur + 0.02);
    }
  };
  
  const scheduleRoboChatter = () => {
    if (isCancelled) return;
    const delay = 11000 + Math.random() * 12000;
    const timerId = setTimeout(() => {
      triggerRoboMumble();
      scheduleRoboChatter();
    }, delay);
    activeSoundItems.push({
      stop: () => clearTimeout(timerId)
    });
  };
  
  scheduleRoboChatter();
  
  activeSoundItems.push({
    stop: () => {
      isCancelled = true;
      try { source.stop(); } catch(e){}
    }
  });
}

// Periodic subtle scanning telemetry chirps (Briefing Room)
function startBriefingTelemetry(ctx: AudioContext, dest: AudioNode) {
  let isCancelled = false;

  const triggerChirp = () => {
    if (isCancelled || !audioCtx || currentAmbientType !== 'BRIEFING') return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const chirpGain = ctx.createGain();
    const duration = 0.05;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + duration);
    
    chirpGain.gain.setValueAtTime(0.004, now);
    chirpGain.gain.exponentialRampToValueAtTime(0.00001, now + duration);
    
    osc.connect(chirpGain);
    chirpGain.connect(dest);
    
    osc.start(now);
    osc.stop(now + duration + 0.03);
  };

  const scheduleTelemetry = () => {
    if (isCancelled) return;
    const delay = 5000 + Math.random() * 4000;
    const timerId = setTimeout(() => {
      triggerChirp();
      scheduleTelemetry();
    }, delay);
    activeSoundItems.push({
      stop: () => clearTimeout(timerId)
    });
  };

  scheduleTelemetry();
  setTimeout(triggerChirp, 800);
  
  activeSoundItems.push({
    stop: () => {
      isCancelled = true;
    }
  });
}

// Gentle room air ventilation hiss (Crew Quarters)
function startQuartersVent(ctx: AudioContext, dest: AudioNode) {
  const buffer = createNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const ventGain = ctx.createGain();
  
  source.buffer = buffer;
  source.loop = true;
  
  filter.type = 'bandpass';
  filter.frequency.value = 750;
  filter.Q.value = 0.4;
  
  ventGain.gain.value = 0.0035; // Soft gentle air flow
  
  source.connect(filter);
  filter.connect(ventGain);
  ventGain.connect(dest);
  
  source.start();
  
  activeSoundItems.push({
    stop: () => {
      try { source.stop(); } catch(e){}
    }
  });
}

export const startAmbientSound = (room: 'BAR' | 'BRIEFING' | 'QUARTERS') => {
  initAudio();
  if (!audioCtx || !ambientGain) return;
  if (currentAmbientType === room) return;
  
  stopAmbientSound();
  currentAmbientType = room;
  
  // Start base warm engine rumble & life support
  startEngineRumble(audioCtx, ambientGain);
  
  // Start background computer processing clicks (ambient detail in all rooms)
  startComputerChamberAmbience(audioCtx, ambientGain);
  
  // Add room specific layer
  if (room === 'BAR') {
    startBarLounge(audioCtx, ambientGain);
    startBarChatter(audioCtx, ambientGain);
  } else if (room === 'BRIEFING') {
    startBriefingTelemetry(audioCtx, ambientGain);
  } else if (room === 'QUARTERS') {
    startQuartersVent(audioCtx, ambientGain);
  }
};

export const playMenuHoverSound = () => {
  initAudio();
  if (!audioCtx || isMuted) return;
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.02);

  gainNode.gain.setValueAtTime(0.003, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);

  osc.connect(gainNode);
  if (masterGain) {
    gainNode.connect(masterGain);
  } else {
    gainNode.connect(ctx.destination);
  }

  osc.start();
  osc.stop(ctx.currentTime + 0.02);
};

export const playMenuClickSound = () => {
  initAudio();
  if (!audioCtx || isMuted) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;

  // Snappy double click blip
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1200, now);
  osc1.frequency.exponentialRampToValueAtTime(850, now + 0.03);
  gain1.gain.setValueAtTime(0.008, now);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  osc1.connect(gain1);
  if (masterGain) gain1.connect(masterGain);
  else gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.03);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1600, now + 0.03);
  osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.06);
  gain2.gain.setValueAtTime(0.006, now + 0.03);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  osc2.connect(gain2);
  if (masterGain) gain2.connect(masterGain);
  else gain2.connect(ctx.destination);
  osc2.start(now + 0.03);
  osc2.stop(now + 0.06);
};

// Soft, satisfying retro data terminal typing tick
let lastTypeSoundTime = 0;
export const playTerminalKeySound = () => {
  initAudio();
  if (!audioCtx || isMuted) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;

  // Throttle so ultra-fast typing doesn't spam audio nodes
  if (now - lastTypeSoundTime < 0.035) return;
  lastTypeSoundTime = now;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Subtle randomized pitch between 1800Hz and 2400Hz for natural, non-repetitive typing sound
  const freq = 1900 + Math.random() * 500;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.015);

  filter.type = 'bandpass';
  filter.frequency.value = 2200;
  filter.Q.value = 1.2;

  const duration = 0.018;
  gain.gain.setValueAtTime(0.0035, now);
  gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);

  osc.connect(filter);
  filter.connect(gain);

  if (masterGain) {
    gain.connect(masterGain);
  } else {
    gain.connect(ctx.destination);
  }

  osc.start(now);
  osc.stop(now + duration + 0.005);
};

// Tactical alert warning klaxon for incoming enemies / wave alerts
let lastWarningTime = 0;
export const playWarningKlaxonSound = () => {
  initAudio();
  if (!audioCtx || isMuted) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;

  // Prevent spamming within 2.5 seconds
  if (now - lastWarningTime < 2.5) return;
  lastWarningTime = now;

  // Two-tone warning beep: Tone 1 (High) -> Tone 2 (Lower urgent)
  [0, 0.22].forEach((delay, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    const startFreq = idx === 0 ? 880 : 660;
    osc.frequency.setValueAtTime(startFreq, now + delay);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.85, now + delay + 0.16);

    gainNode.gain.setValueAtTime(0.08, now + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

    osc.connect(gainNode);
    if (masterGain) gainNode.connect(masterGain);
    else gainNode.connect(ctx.destination);

    osc.start(now + delay);
    osc.stop(now + delay + 0.2);
  });
};

// Subtle, gentle cockpit proximity warning ping when an enemy first nears danger radius
let lastProximityTime = 0;
export const playProximityAlertSound = () => {
  initAudio();
  if (!audioCtx || isMuted) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;

  if (now - lastProximityTime < 2.0) return;
  lastProximityTime = now;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1050, now);
  osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

  gain.gain.setValueAtTime(0.012, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.connect(gain);
  if (masterGain) gain.connect(masterGain);
  else gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.09);
};



