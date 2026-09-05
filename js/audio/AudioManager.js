/**
 * Sling Jump - AudioManager
 * Professional External Audio Pipeline with WebAudio Buffer Pool,
 * Dynamic Crossfading, Low-Pass Ducking, Pitch-Ramp combos and Procedural Fallbacks.
 */
class AudioManager {
  constructor(storageService) {
    this.storage = storageService;
    this.ctx = null;

    // Audio Graph Nodes
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicFilter = null; // Low-Pass filter for bullet-time ducking

    // Music State
    this.currentMusicKey = null;
    this.currentMusicSource = null;
    this.isDucked = false;

    // Audio Asset Paths
    this.assetPaths = {
      music: {
        bgm_menu: 'assets/audio/music/bgm_menu.mp3',
        bgm_gameplay: 'assets/audio/music/bgm_gameplay.mp3',
        bgm_gameover: 'assets/audio/music/bgm_gameover.mp3'
      },
      sfx: {
        sfx_grapple_lock: 'assets/audio/sfx/sfx_grapple_lock.wav',
        sfx_slingshot_boost: 'assets/audio/sfx/sfx_slingshot_boost.wav',
        sfx_core_pickup: 'assets/audio/sfx/sfx_core_pickup.wav',
        sfx_node_shatter: 'assets/audio/sfx/sfx_node_shatter.wav',
        sfx_near_miss: 'assets/audio/sfx/sfx_near_miss.wav',
        sfx_crash: 'assets/audio/sfx/sfx_crash.wav',
        sfx_ui_click: 'assets/audio/sfx/sfx_ui_click.wav'
      }
    };

    // Buffer Cache
    this.audioBuffers = new Map();
    this.failedAssets = new Set();

    // Combo Pitch Tracker
    this.lastPickupTime = 0;
    this.comboCount = 0;

    // SFX Pool (active buffer sources)
    this.activeSfxPool = [];

    // Global Audio Master Switch (Active by default, synchronized with storage)
    this.enabled = this.storage ? (this.storage.data.settings.audioEnabled !== false) : true;
    this.proceduralNodes = [];
  }

  init() {
    if (!this.enabled) return;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      // Music Channel with Biquad Filter (Ducking)
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(20000, this.ctx.currentTime); // Open filter by default

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.masterGain);

      // SFX Channel
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);

      this.updateVolumes();

      // Attempt to preload audio assets in background
      this.preloadAssets();
    } catch (err) {
      console.warn('AudioManager: WebAudio initialization deferred until user gesture.', err);
    }
  }

  updateVolumes() {
    if (!this.enabled || !this.ctx || !this.storage) return;
    const settings = this.storage.data.settings;
    const now = this.ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(settings.masterVolume, now, 0.05);
    }
    if (this.musicGain) {
      const targetVol = this.isDucked ? settings.musicVolume * 0.35 : settings.musicVolume;
      this.musicGain.gain.setTargetAtTime(targetVol, now, 0.05);
    }
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(settings.sfxVolume, now, 0.05);
    }
  }

  setDucking(active) {
    if (!this.enabled || !this.ctx || this.isDucked === active) return;
    this.isDucked = active;
    const now = this.ctx.currentTime;

    if (this.musicFilter && this.musicGain && this.storage) {
      const targetFreq = active ? 650 : 20000;
      const targetVol = active ? this.storage.data.settings.musicVolume * 0.35 : this.storage.data.settings.musicVolume;

      this.musicFilter.frequency.setTargetAtTime(targetFreq, now, 0.15);
      this.musicGain.gain.setTargetAtTime(targetVol, now, 0.15);
    }
  }

  async preloadAssets() {
    if (!this.enabled || !this.ctx) return;
    const all = [
      ...Object.entries(this.assetPaths.music),
      ...Object.entries(this.assetPaths.sfx)
    ];

    for (const [key, path] of all) {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(key, audioBuffer);
      } catch (err) {
        this.failedAssets.add(key);
      }
    }
  }

  // Crossfade between music tracks (1.5s)
  playMusic(key, loop = true) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.currentMusicKey === key) return;

    const oldSource = this.currentMusicSource;
    const oldKey = this.currentMusicKey;
    this.currentMusicKey = key;

    const buffer = this.audioBuffers.get(key);
    if (!buffer) {
      // Graceful procedural ambient synth fallback if file is missing
      this.playProceduralAmbient(key);
      return;
    }

    const newSource = this.ctx.createBufferSource();
    newSource.buffer = buffer;
    newSource.loop = loop;

    const fadeGain = this.ctx.createGain();
    fadeGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    fadeGain.gain.exponentialRampToValueAtTime(1.0, this.ctx.currentTime + 1.5);

    newSource.connect(fadeGain);
    fadeGain.connect(this.musicGain);

    newSource.start(0);
    this.currentMusicSource = newSource;

    if (oldSource) {
      try {
        oldSource.stop(this.ctx.currentTime + 1.5);
      } catch (e) {}
    }
  }

  stopMusic() {
    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.stop();
      } catch (e) {}
      this.currentMusicSource = null;
      this.currentMusicKey = null;
    }
    if (this.proceduralAmbientOsc) {
      try {
        this.proceduralAmbientOsc.stop();
      } catch (e) {}
      this.proceduralAmbientOsc = null;
    }
    if (Array.isArray(this.proceduralNodes)) {
      for (const node of this.proceduralNodes) {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      }
      this.proceduralNodes = [];
    }
  }

  // SFX Playback with Sound Pooling & Pitch-Shifting
  playSfx(key, options = {}) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const buffer = this.audioBuffers.get(key);
    if (!buffer) {
      // Procedural fallback
      this.playProceduralSfx(key, options);
      return;
    }

    try {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      // Pitch calculation (e.g. combo pitch-shift for cores)
      if (options.playbackRate) {
        source.playbackRate.setValueAtTime(options.playbackRate, this.ctx.currentTime);
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(options.volume || 1.0, this.ctx.currentTime);

      source.connect(gain);
      gain.connect(this.sfxGain);

      source.start(0);
      this.activeSfxPool.push(source);
      source.onended = () => {
        const idx = this.activeSfxPool.indexOf(source);
        if (idx !== -1) this.activeSfxPool.splice(idx, 1);
      };
    } catch (err) {
      this.playProceduralSfx(key, options);
    }
  }

  // Core pickup with combo pitch ramp (+1 semitone per core within 2s)
  playCorePickup() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.lastPickupTime < 1400) {
      this.comboCount = Math.min(8, this.comboCount + 1);
    } else {
      this.comboCount = 0;
    }
    this.lastPickupTime = now;

    const pitchRate = 1.0 + this.comboCount * 0.08;
    this.playSfx('sfx_core_pickup', { playbackRate: pitchRate, volume: 0.9 });
  }

  /* =========================================================================
     PROCEDURAL FALLBACK SYNTHESIZERS (ZERO-ASSET FAILSAFE)
     ========================================================================= */
  playProceduralSfx(key, options = {}) {
    if (!this.enabled || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    switch (key) {
      case 'sfx_core_pickup': {
        const baseFreq = 880 * Math.pow(2, (this.comboCount || 0) / 12);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.23);
        break;
      }
      case 'sfx_grapple_lock': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.11);
        break;
      }
      case 'sfx_slingshot_boost': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = options.isBoost ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(options.isBoost ? 180 : 130, now);
        osc.frequency.exponentialRampToValueAtTime(options.isBoost ? 620 : 380, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.35);

        gain.gain.setValueAtTime(options.isBoost ? 0.35 : 0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.36);

        // Ascending Chromatic Chime for Perfect 90-degree Combo launches
        if (options.isPerfect) {
          const comboLevel = Math.min(10, Math.max(1, options.combo || 1));
          const semitones = (comboLevel - 1) * 2; // Ascending whole steps up to octave+
          const baseFreq = 523.25 * Math.pow(2, semitones / 12); // C5 to C7 scale

          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();
          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(baseFreq, now);
          chimeOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.15);

          chimeGain.gain.setValueAtTime(0.24, now);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(this.sfxGain);
          chimeOsc.start(now);
          chimeOsc.stop(now + 0.37);
        }
        break;
      }
      case 'sfx_node_shatter': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.24);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }
      case 'sfx_near_miss': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.21);
        break;
      }
      case 'sfx_crash': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.9);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.96);
        break;
      }
      case 'sfx_ui_click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
    }
  }

  playProceduralAmbient(key) {
    if (!this.ctx || !this.musicGain) return;
    this.stopMusic();

    try {
      const now = this.ctx.currentTime;
      this.proceduralNodes = [];

      // Warm low-pass filter for analog synthwave warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(key === 'bgm_gameplay' ? 650 : 480, now);
      filter.Q.setValueAtTime(2.0, now);

      // Sub-bass & Harmony Oscillators for celestial space vibe
      const freqs = key === 'bgm_gameplay'
        ? [73.42, 110.0, 146.83] // D2 (root), A2 (fifth), D3 (octave)
        : key === 'bgm_gameover'
          ? [65.41, 77.78, 116.54] // C2, Eb2, Bb2 (poignant minor decay)
          : [110.0, 164.81, 220.0]; // A2, E3, A3 (ethereal space menu)

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.exponentialRampToValueAtTime(key === 'bgm_gameplay' ? 0.09 : 0.06, now + 1.2);

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = (idx === 0 && key === 'bgm_gameplay') ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        // Subtle detune for analog chorus warmth
        osc.detune.setValueAtTime((idx - 1) * 7, now);
        osc.connect(filter);
        osc.start(now);
        this.proceduralNodes.push(osc);
      });

      // Gentle LFO filter sweep (space breathing effect)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(key === 'bgm_gameplay' ? 0.4 : 0.12, now);
      lfoGain.gain.setValueAtTime(140, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(now);
      this.proceduralNodes.push(lfo, lfoGain);

      filter.connect(subGain);
      subGain.connect(this.musicGain);
      this.proceduralNodes.push(filter, subGain);
    } catch (e) {
      console.warn('AudioManager: Procedural synth initialization note:', e.message);
    }
  }
}
