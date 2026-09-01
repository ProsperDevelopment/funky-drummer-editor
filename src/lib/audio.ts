import type { DrumPattern } from './types';

// Pre-allocated noise buffer (reused across all sounds)
let noiseBuffer: Float32Array | null = null;

function getNoise(ctx: AudioContext): AudioBuffer {
  const size = ctx.sampleRate * 2; // 2 seconds of noise
  if (!noiseBuffer || noiseBuffer.length !== size) {
    noiseBuffer = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      noiseBuffer[i] = Math.random() * 2 - 1;
    }
  }
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  buffer.getChannelData(0).set(noiseBuffer);
  return buffer;
}

function createNoiseSource(ctx: AudioContext): AudioBufferSourceNode {
  const source = ctx.createBufferSource();
  source.buffer = getNoise(ctx);
  return source;
}

function playKick(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Sine 150Hz body (0.15s)
  const bodyOsc = ctx.createOscillator();
  bodyOsc.type = 'sine';
  bodyOsc.frequency.value = 150;
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(velocity * 0.8, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  bodyOsc.connect(bodyGain);
  bodyGain.connect(gain);
  bodyOsc.start(now);
  bodyOsc.stop(now + 0.15);

  // Sine 60Hz→30Hz exponential sweep (0.15s)
  const sweepOsc = ctx.createOscillator();
  sweepOsc.type = 'sine';
  sweepOsc.frequency.setValueAtTime(60, now);
  sweepOsc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
  const sweepGain = ctx.createGain();
  sweepGain.gain.setValueAtTime(velocity * 0.8, now);
  sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  sweepOsc.connect(sweepGain);
  sweepGain.connect(gain);
  sweepOsc.start(now);
  sweepOsc.stop(now + 0.15);
}

function playSnare(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Triangle 180Hz (0.08s, 40% gain)
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 180;
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(velocity * 0.4, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  osc.connect(oscGain);
  oscGain.connect(gain);
  osc.start(now);
  osc.stop(now + 0.08);

  // Lowpass noise 5000Hz (0.15s, 60% gain)
  const noise = createNoiseSource(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 5000;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(velocity * 0.6, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(gain);
  noise.start(now);
  noise.stop(now + 0.15);
}

function playHiHat(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Noise lowpass 12000Hz (0.05s, 50%)
  const n1 = createNoiseSource(ctx);
  const f1 = ctx.createBiquadFilter();
  f1.type = 'lowpass';
  f1.frequency.value = 12000;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.5, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  n1.connect(f1);
  f1.connect(g1);
  g1.connect(gain);
  n1.start(now);
  n1.stop(now + 0.05);

  // Noise lowpass 16000Hz (0.01s, 30%)
  const n2 = createNoiseSource(ctx);
  const f2 = ctx.createBiquadFilter();
  f2.type = 'lowpass';
  f2.frequency.value = 16000;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.3, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
  n2.connect(f2);
  f2.connect(g2);
  g2.connect(gain);
  n2.start(now);
  n2.stop(now + 0.01);
}

function playHiHatOpen(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Noise lowpass 14000Hz (0.3s, 40%)
  const n1 = createNoiseSource(ctx);
  const f1 = ctx.createBiquadFilter();
  f1.type = 'lowpass';
  f1.frequency.value = 14000;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.4, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  n1.connect(f1);
  f1.connect(g1);
  g1.connect(gain);
  n1.start(now);
  n1.stop(now + 0.3);

  // Noise lowpass 18000Hz (0.05s, 20%)
  const n2 = createNoiseSource(ctx);
  const f2 = ctx.createBiquadFilter();
  f2.type = 'lowpass';
  f2.frequency.value = 18000;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.2, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  n2.connect(f2);
  f2.connect(g2);
  g2.connect(gain);
  n2.start(now);
  n2.stop(now + 0.05);
}

function playHiHatEdge(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Noise lowpass 14000Hz (0.03s, 40%)
  const n1 = createNoiseSource(ctx);
  const f1 = ctx.createBiquadFilter();
  f1.type = 'lowpass';
  f1.frequency.value = 14000;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.4, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
  n1.connect(f1);
  f1.connect(g1);
  g1.connect(gain);
  n1.start(now);
  n1.stop(now + 0.03);

  // Noise lowpass 18000Hz (0.01s, 30%)
  const n2 = createNoiseSource(ctx);
  const f2 = ctx.createBiquadFilter();
  f2.type = 'lowpass';
  f2.frequency.value = 18000;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.3, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
  n2.connect(f2);
  f2.connect(g2);
  g2.connect(gain);
  n2.start(now);
  n2.stop(now + 0.01);
}

function playHiHatMute(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Bandpass 10000Hz Q=2
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 10000;
  bp.Q.value = 2;

  // Highpass 7000Hz (0.015s, gain 0.15)
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;

  const n = createNoiseSource(ctx);
  const env = ctx.createGain();
  env.gain.setValueAtTime(velocity * 0.15, now);
  env.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

  n.connect(bp);
  bp.connect(hp);
  hp.connect(env);
  env.connect(gain);
  n.start(now);
  n.stop(now + 0.015);
}

function playCrash(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Noise lowpass 14000Hz (0.6s, 50%)
  const n1 = createNoiseSource(ctx);
  const f1 = ctx.createBiquadFilter();
  f1.type = 'lowpass';
  f1.frequency.value = 14000;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.5, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
  n1.connect(f1);
  f1.connect(g1);
  g1.connect(gain);
  n1.start(now);
  n1.stop(now + 0.6);

  // Noise lowpass 8000Hz (0.8s, 30%)
  const n2 = createNoiseSource(ctx);
  const f2 = ctx.createBiquadFilter();
  f2.type = 'lowpass';
  f2.frequency.value = 8000;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.3, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  n2.connect(f2);
  f2.connect(g2);
  g2.connect(gain);
  n2.start(now);
  n2.stop(now + 0.8);
}

function playRide(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Noise lowpass 10000Hz (0.3s, 30%)
  const n1 = createNoiseSource(ctx);
  const f1 = ctx.createBiquadFilter();
  f1.type = 'lowpass';
  f1.frequency.value = 10000;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.3, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  n1.connect(f1);
  f1.connect(g1);
  g1.connect(gain);
  n1.start(now);
  n1.stop(now + 0.3);

  // Noise lowpass 4000Hz (0.1s, 20%)
  const n2 = createNoiseSource(ctx);
  const f2 = ctx.createBiquadFilter();
  f2.type = 'lowpass';
  f2.frequency.value = 4000;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.2, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
  n2.connect(f2);
  f2.connect(g2);
  g2.connect(gain);
  n2.start(now);
  n2.stop(now + 0.1);
}

function playTomHi(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Sine 350Hz (0.2s)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 350;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.7, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc1.connect(g1);
  g1.connect(gain);
  osc1.start(now);
  osc1.stop(now + 0.2);

  // Triangle 300Hz (0.15s, 30%)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 300;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.3, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc2.connect(g2);
  g2.connect(gain);
  osc2.start(now);
  osc2.stop(now + 0.15);
}

function playTomMid(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Sine 260Hz (0.25s)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 260;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.7, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc1.connect(g1);
  g1.connect(gain);
  osc1.start(now);
  osc1.stop(now + 0.25);

  // Triangle 220Hz (0.18s, 30%)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 220;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.3, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc2.connect(g2);
  g2.connect(gain);
  osc2.start(now);
  osc2.stop(now + 0.18);
}

function playTomLo(ctx: AudioContext, velocity: number) {
  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  // Sine 180Hz (0.3s)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 180;
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(velocity * 0.7, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc1.connect(g1);
  g1.connect(gain);
  osc1.start(now);
  osc1.stop(now + 0.3);

  // Triangle 150Hz (0.2s, 30%)
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 150;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(velocity * 0.3, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc2.connect(g2);
  g2.connect(gain);
  osc2.start(now);
  osc2.stop(now + 0.2);
}

const drumSynthMap: Record<string, (ctx: AudioContext, velocity: number) => void> = {
  kick: playKick,
  snare: playSnare,
  hihat: playHiHat,
  hihatOpen: playHiHatOpen,
  hihatEdge: playHiHatEdge,
  hihatMute: playHiHatMute,
  crash: playCrash,
  ride: playRide,
  tomHi: playTomHi,
  tomMid: playTomMid,
  tomLo: playTomLo,
};

export function playDrum(drumId: string, velocity: number, ctx: AudioContext) {
  const synth = drumSynthMap[drumId];
  if (synth) {
    synth(ctx, velocity);
  }
}

export function createSequencer(pattern: DrumPattern, ctx: AudioContext) {
  let playing = false;
  let step = 0;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let bpm = pattern.bpm;
  let onStepCallback: ((step: number) => void) | null = null;
  let currentPattern = pattern;

  function scheduleStep() {
    if (!playing) return;

    const grid = currentPattern.grid;
    for (const drumId of Object.keys(grid)) {
      const velocity = grid[drumId]?.[step];
      if (velocity && velocity > 0) {
        playDrum(drumId, velocity, ctx);
      }
    }

    if (onStepCallback) {
      onStepCallback(step);
    }

    const totalSteps = currentPattern.measures * 16;
    step = (step + 1) % totalSteps;

    // interval = (60/bpm)*1000/4 for 16th notes
    const interval = (60 / bpm) * 1000 / 4;
    timerId = setTimeout(scheduleStep, interval);
  }

  return {
    start(
      newBpm: number,
      onStep: (step: number) => void,
      newPattern?: DrumPattern
    ) {
      if (newPattern) {
        currentPattern = newPattern;
      }
      bpm = newBpm;
      onStepCallback = onStep;
      if (playing) {
        if (timerId !== null) clearTimeout(timerId);
      }
      playing = true;
      step = 0;
      scheduleStep();
    },

    stop() {
      playing = false;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    },

    isPlaying() {
      return playing;
    },

    updatePattern(newPattern: DrumPattern) {
      currentPattern = newPattern;
    },

    updateBpm(newBpm: number) {
      bpm = newBpm;
    },
  };
}
