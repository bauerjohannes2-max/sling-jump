/**
 * Sling Jump - Audio Asset Generator & Downloader
 * Generates pristine 44.1kHz 16-Bit PCM WAV / Audio assets for all music tracks and sound effects.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MUSIC_DIR = path.join(__dirname, '..', 'assets', 'audio', 'music');
const SFX_DIR = path.join(__dirname, '..', 'assets', 'audio', 'sfx');

// Ensure directories exist
fs.mkdirSync(MUSIC_DIR, { recursive: true });
fs.mkdirSync(SFX_DIR, { recursive: true });

const SAMPLE_RATE = 44100;

/**
 * Creates a valid 16-bit PCM WAV buffer from float samples (-1.0 to 1.0)
 */
function createWavBuffer(samples, sampleRate = SAMPLE_RATE, channels = 1) {
  const numSamples = samples.length;
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Write 16-bit signed PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(val), offset);
    offset += 2;
  }

  return buffer;
}

/* =========================================================================
   SYNTHESIZERS FOR HIGH QUALITY AUDIO ASSETS
   ========================================================================= */

// 1. SFX: Grapple Lock
function synthGrappleLock() {
  const duration = 0.14;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 420 + (t / duration) * 360;
    const env = Math.exp(-t * 24);
    const sine = Math.sin(2 * Math.PI * freq * t);
    const sub = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.4;
    samples[i] = (sine + sub) * env * 0.7;
  }
  return samples;
}

// 2. SFX: Slingshot Boost
function synthSlingshotBoost() {
  const duration = 0.42;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 7.5);
    // Exponential frequency rise
    const freq = 140 + Math.pow(t / duration, 2) * 580;
    const tone = (Math.sin(2 * Math.PI * freq * t) + (Math.random() * 2 - 1) * 0.25);
    samples[i] = tone * env * 0.75;
  }
  return samples;
}

// 3. SFX: Core Pickup (Crystalline Chime)
function synthCorePickup() {
  const duration = 0.28;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const freqs = [880, 1174.66, 1760, 2349.32]; // D5, F#5, A5, D6
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    freqs.forEach((f, idx) => {
      const delay = idx * 0.025;
      if (t >= delay) {
        const localT = t - delay;
        const env = Math.exp(-localT * 16);
        val += Math.sin(2 * Math.PI * f * localT) * env * 0.25;
      }
    });
    samples[i] = val;
  }
  return samples;
}

// 4. SFX: Node Shatter
function synthNodeShatter() {
  const duration = 0.35;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 11);
    const noise = (Math.random() * 2 - 1);
    const thud = Math.sin(2 * Math.PI * (120 - t * 250) * t) * 0.6;
    samples[i] = (noise * 0.7 + thud) * env * 0.8;
  }
  return samples;
}

// 5. SFX: Near Miss (Doppler Whistle)
function synthNearMiss() {
  const duration = 0.26;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq = 1400 - Math.sin((t / duration) * (Math.PI / 2)) * 800;
    const env = Math.sin((t / duration) * Math.PI);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.6;
  }
  return samples;
}

// 6. SFX: Crash Explosion
function synthCrash() {
  const duration = 0.95;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 3.8);
    const noise = (Math.random() * 2 - 1) * 0.85;
    const sub = Math.sin(2 * Math.PI * (110 - t * 90) * t) * 0.8;
    samples[i] = (noise + sub) * env * 0.8;
  }
  return samples;
}

// 7. SFX: UI Click
function synthUIClick() {
  const duration = 0.06;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 60);
    const tone = Math.sin(2 * Math.PI * 920 * t);
    samples[i] = tone * env * 0.45;
  }
  return samples;
}

// 8. BGM: Menu Ambient (14s Seamless Loop)
function synthMenuMusic() {
  const duration = 14.0;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Chord progression in D minor: Dm9 -> Bbmaj7 -> Fmaj7 -> C9
  const chords = [
    [146.83, 220.00, 261.63, 329.63], // Dm9
    [116.54, 174.61, 233.08, 293.66], // Bbmaj7
    [174.61, 220.00, 261.63, 349.23], // Fmaj7
    [130.81, 196.00, 246.94, 293.66]  // C9
  ];

  const chordDur = duration / chords.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const chordIdx = Math.floor(t / chordDur) % chords.length;
    const chord = chords[chordIdx];
    const localT = t % chordDur;
    const env = Math.sin((localT / chordDur) * Math.PI);

    let val = 0;
    chord.forEach(f => {
      // Warm detuned dual sine waves
      val += Math.sin(2 * Math.PI * f * t) * 0.12;
      val += Math.sin(2 * Math.PI * (f * 1.003) * t) * 0.10;
      val += Math.sin(2 * Math.PI * (f * 0.5) * t) * 0.08; // sub warmth
    });

    // Gentle arpeggio shimmer
    const arpFreq = chord[Math.floor(t * 3) % chord.length] * 2;
    const arpEnv = Math.exp(-(localT % 0.33) * 8);
    const arp = Math.sin(2 * Math.PI * arpFreq * t) * arpEnv * 0.08;

    samples[i] = (val * env + arp) * 0.65;
  }
  return samples;
}

// 9. BGM: Gameplay Driving Cyberpunk Track (16s Seamless Loop)
function synthGameplayMusic() {
  const duration = 16.0;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const bpm = 128;
  const beatDur = 60 / bpm; // ~0.46875s

  // Bassline notes (E Minor)
  const bassNotes = [82.41, 82.41, 98.00, 110.00, 82.41, 73.42, 82.41, 123.47];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const beatTime = t % beatDur;
    const beatIndex = Math.floor(t / beatDur);

    // 1. Kick Drum (on every beat)
    const kickEnv = Math.exp(-beatTime * 18);
    const kickFreq = 140 * Math.exp(-beatTime * 35) + 45;
    const kick = Math.sin(2 * Math.PI * kickFreq * beatTime) * kickEnv * 0.7;

    // 2. Offbeat Hi-Hat
    const hatTime = (t + beatDur / 2) % beatDur;
    const hatEnv = Math.exp(-hatTime * 45);
    const hat = (Math.random() * 2 - 1) * hatEnv * 0.18;

    // 3. Cyberpunk Bassline (16th notes)
    const sixteenth = (t % (beatDur / 4)) / (beatDur / 4);
    const noteIdx = Math.floor(t / (beatDur / 2)) % bassNotes.length;
    const bFreq = bassNotes[noteIdx];
    const bassEnv = Math.exp(-sixteenth * 10);
    // Sawtooth wave synthesis
    let saw = 0;
    for (let k = 1; k <= 5; k++) {
      saw += (Math.sin(2 * Math.PI * (bFreq * k) * t) / k) * 0.15;
    }
    const bass = saw * bassEnv;

    // 4. Arpeggio Synth Lead
    const leadNotes = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99]; // E minor pentatonic
    const leadNote = leadNotes[Math.floor(t * 8) % leadNotes.length];
    const leadEnv = Math.exp(-(t % 0.125) * 14);
    const lead = Math.sin(2 * Math.PI * leadNote * t) * leadEnv * 0.14;

    samples[i] = (kick + hat + bass + lead) * 0.65;
  }
  return samples;
}

// 10. BGM: Game Over Stinger (4.5s)
function synthGameOverMusic() {
  const duration = 4.5;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [440, 415.30, 392.00, 349.23, 293.66]; // Melancholic descent
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const noteIdx = Math.min(notes.length - 1, Math.floor(t / 0.7));
    const freq = notes[noteIdx];
    const env = Math.exp(-(t % 0.7) * 4) * Math.exp(-t * 0.6);

    const pad = Math.sin(2 * Math.PI * freq * t) * env * 0.3;
    const sub = Math.sin(2 * Math.PI * (freq * 0.5) * t) * env * 0.3;
    const drone = Math.sin(2 * Math.PI * 55 * t) * Math.exp(-t * 0.5) * 0.25;

    samples[i] = (pad + sub + drone) * 0.7;
  }
  return samples;
}

/* =========================================================================
   GENERATE ALL ASSETS
   ========================================================================= */

const assetsToGenerate = [
  // Music
  { dir: MUSIC_DIR, name: 'bgm_menu.mp3', synth: synthMenuMusic },
  { dir: MUSIC_DIR, name: 'bgm_gameplay.mp3', synth: synthGameplayMusic },
  { dir: MUSIC_DIR, name: 'bgm_gameover.mp3', synth: synthGameOverMusic },
  // SFX
  { dir: SFX_DIR, name: 'sfx_grapple_lock.wav', synth: synthGrappleLock },
  { dir: SFX_DIR, name: 'sfx_slingshot_boost.wav', synth: synthSlingshotBoost },
  { dir: SFX_DIR, name: 'sfx_core_pickup.wav', synth: synthCorePickup },
  { dir: SFX_DIR, name: 'sfx_node_shatter.wav', synth: synthNodeShatter },
  { dir: SFX_DIR, name: 'sfx_near_miss.wav', synth: synthNearMiss },
  { dir: SFX_DIR, name: 'sfx_crash.wav', synth: synthCrash },
  { dir: SFX_DIR, name: 'sfx_ui_click.wav', synth: synthUIClick }
];

console.log('Generating audio assets for Sling Jump...');

assetsToGenerate.forEach(({ dir, name, synth }) => {
  const filePath = path.join(dir, name);
  const floatSamples = synth();
  const wavBuffer = createWavBuffer(floatSamples);
  fs.writeFileSync(filePath, wavBuffer);
  console.log(`[OK] Generated: ${name} (${(wavBuffer.length / 1024).toFixed(1)} KB) -> ${path.relative(path.join(__dirname, '..'), filePath)}`);
});

console.log('\nAll audio assets successfully initialized and ready for immediate playback!');
