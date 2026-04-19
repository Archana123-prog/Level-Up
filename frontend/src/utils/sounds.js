// Web Audio API sound effects - no external files needed
let audioCtx = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const playTone = (frequency, duration, type = 'sine', volume = 0.3, delay = 0) => {
  try {
    const ctx = getAudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + delay + duration * 0.5);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration);
  } catch (e) {
    // Audio not supported
  }
};

export const sounds = {
  xpGain: () => {
    playTone(523, 0.15, 'triangle', 0.2);
    playTone(659, 0.15, 'triangle', 0.2, 0.1);
    playTone(784, 0.2, 'triangle', 0.25, 0.2);
  },

  habitComplete: () => {
    playTone(440, 0.1, 'sine', 0.15);
    playTone(554, 0.1, 'sine', 0.15, 0.08);
    playTone(659, 0.15, 'sine', 0.2, 0.16);
  },

  levelUp: () => {
    const notes = [261, 329, 392, 523, 659, 784, 1047];
    notes.forEach((note, i) => {
      playTone(note, 0.3, 'triangle', 0.3, i * 0.08);
    });
  },

  badgeUnlocked: () => {
    playTone(880, 0.2, 'sine', 0.25);
    playTone(1100, 0.2, 'sine', 0.25, 0.15);
    playTone(1320, 0.3, 'sine', 0.3, 0.3);
  },

  challengeComplete: () => {
    const chord = [523, 659, 784, 1047];
    chord.forEach((note, i) => {
      playTone(note, 0.5, 'triangle', 0.2, i * 0.05);
    });
  },

  error: () => {
    playTone(200, 0.3, 'sawtooth', 0.15);
    playTone(150, 0.3, 'sawtooth', 0.15, 0.15);
  },

  click: () => {
    playTone(800, 0.05, 'sine', 0.1);
  },
};

let soundEnabled = localStorage.getItem('levelup_sound') !== 'false';

export const isSoundEnabled = () => soundEnabled;

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('levelup_sound', soundEnabled ? 'true' : 'false');
  return soundEnabled;
};

export const playSound = (soundName) => {
  if (soundEnabled && sounds[soundName]) {
    sounds[soundName]();
  }
};
