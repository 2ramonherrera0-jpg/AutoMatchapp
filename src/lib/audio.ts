/**
 * procedural car engine synthesizer using the Web Audio API.
 * This synthesizes different styles of car engines (V8, Sport, Rally, F1)
 * to act as satisfying notification and startup sound effects.
 */

export type EngineType = 'v8' | 'sport' | 'rally' | 'f1';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    // Standard AudioContext fallback
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx!;
}

/**
 * Procedurally plays a satisfying car engine start and rev sound!
 */
export function playEngineSound(type: EngineType = 'v8') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Define engine characteristics based on style choice
    let startFreq = 35;
    let revPeakFreq = 150;
    let idleFreq = 55;
    let revDuration = 0.4;
    let decayDuration = 0.8;
    let engineQ = 4; // Filter resonance
    let noiseLevel = 0.08; // Turbo / exhaust air simulation

    switch (type) {
      case 'sport':
        startFreq = 45;
        revPeakFreq = 240;
        idleFreq = 70;
        revDuration = 0.35;
        decayDuration = 0.7;
        engineQ = 5;
        noiseLevel = 0.12;
        break;
      case 'rally':
        startFreq = 50;
        revPeakFreq = 340;
        idleFreq = 85;
        revDuration = 0.3;
        decayDuration = 0.6;
        engineQ = 6;
        noiseLevel = 0.18;
        break;
      case 'f1':
        startFreq = 90;
        revPeakFreq = 580;
        idleFreq = 130;
        revDuration = 0.28;
        decayDuration = 0.55;
        engineQ = 8;
        noiseLevel = 0.25;
        break;
      case 'v8':
      default:
        startFreq = 30;
        revPeakFreq = 140;
        idleFreq = 48;
        revDuration = 0.45;
        decayDuration = 0.95;
        engineQ = 3.5;
        noiseLevel = 0.06;
        break;
    }

    // --- STARTER CLICKS (Simulate the starting motor: "chk-chk-chk") ---
    const clickCount = 3;
    const clickInterval = 0.12;
    for (let i = 0; i < clickCount; i++) {
      const clickTime = now + i * clickInterval;
      
      // Filtered click noise
      const bufferSize = ctx.sampleRate * 0.02; // 20ms click
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      
      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.value = 600;
      clickFilter.Q.value = 10;
      
      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.04, clickTime);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.015);
      
      noiseNode.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(ctx.destination);
      
      noiseNode.start(clickTime);
      noiseNode.stop(clickTime + 0.02);
    }

    // --- MAIN ENGINE COMBUSTION ENGINE ---
    const engineStartTime = now + (clickCount * clickInterval);

    // 1. Core combustion oscillator (sawtooth represents the raw piston stroke sound)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator(); // Sub-harmonic for warmth & stereo width
    
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Frequency Envelope - Jumps from low, sweeps up to peak, then decrescendos back to idle and fades out
    osc1.frequency.setValueAtTime(startFreq, engineStartTime);
    osc1.frequency.exponentialRampToValueAtTime(revPeakFreq, engineStartTime + revDuration);
    osc1.frequency.exponentialRampToValueAtTime(idleFreq, engineStartTime + revDuration + decayDuration);

    osc2.frequency.setValueAtTime(startFreq * 0.5, engineStartTime);
    osc2.frequency.exponentialRampToValueAtTime(revPeakFreq * 0.5, engineStartTime + revDuration);
    osc2.frequency.exponentialRampToValueAtTime(idleFreq * 0.5, engineStartTime + revDuration + decayDuration);

    // 2. Lowpass Filter to refine the "rumble" and block harsh high sizzle
    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.setValueAtTime(startFreq * 3, engineStartTime);
    engineFilter.frequency.exponentialRampToValueAtTime(revPeakFreq * 2.5, engineStartTime + revDuration);
    engineFilter.frequency.exponentialRampToValueAtTime(idleFreq * 2, engineStartTime + revDuration + decayDuration);
    engineFilter.Q.setValueAtTime(engineQ, engineStartTime);

    // 3. Exhaust Noise Simulator (White noise band-pass modulated)
    const noiseBufferSize = ctx.sampleRate * (revDuration + decayDuration + 0.3);
    const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(200, engineStartTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, engineStartTime + revDuration);
    noiseFilter.frequency.exponentialRampToValueAtTime(150, engineStartTime + revDuration + decayDuration);
    noiseFilter.Q.setValueAtTime(2, engineStartTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, engineStartTime);
    noiseGain.gain.linearRampToValueAtTime(noiseLevel, engineStartTime + revDuration);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, engineStartTime + revDuration + decayDuration);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, engineStartTime + revDuration + decayDuration + 0.2);

    // 4. Amplitude/Volume Envelope (Starts quiet, spikes at the rev, falls to idling growl, then turns off)
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, engineStartTime);
    // Smooth rapid volume surge for the start
    mainGain.gain.linearRampToValueAtTime(0.28, engineStartTime + 0.08); 
    mainGain.gain.linearRampToValueAtTime(0.35, engineStartTime + revDuration); // Peak rev loudness
    mainGain.gain.exponentialRampToValueAtTime(0.12, engineStartTime + revDuration + decayDuration * 0.4); // Idling
    mainGain.gain.exponentialRampToValueAtTime(0.05, engineStartTime + revDuration + decayDuration); // Turning off
    mainGain.gain.exponentialRampToValueAtTime(0.001, engineStartTime + revDuration + decayDuration + 0.25);

    // Connections
    osc1.connect(engineFilter);
    osc2.connect(engineFilter);
    engineFilter.connect(mainGain);
    
    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(mainGain);

    mainGain.connect(ctx.destination);

    // Start nodes
    osc1.start(engineStartTime);
    osc2.start(engineStartTime);
    whiteNoise.start(engineStartTime);

    // Stop nodes
    const stopTime = engineStartTime + revDuration + decayDuration + 0.3;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    whiteNoise.stop(stopTime);

  } catch (error) {
    console.warn('Web Audio API not supported or user gesture required', error);
  }
}
