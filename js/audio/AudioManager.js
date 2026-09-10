/**
 * Space Jump - AudioManager
 * Gameplay BGM only: WebAudio buffer loop with slow-mo ducking.
 */
class AudioManager {
  constructor(storageService) {
    this.storage = storageService;
    this.ctx = null;

    this.masterGain = null;
    this.musicGain = null;
    this.musicFilter = null;

    this.currentMusicKey = null;
    this.currentMusicSource = null;
    this.currentMusicGain = null;
    this.isDucked = false;

    this.gameplayPath = 'assets/audio/music/bgm_gameplay.mp3';
    this.audioBuffers = new Map();

    this.enabled = this.storage ? (this.storage.data.settings.audioEnabled !== false) : true;
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

      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.musicFilter);
      this.musicFilter.connect(this.masterGain);

      this.updateVolumes();
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
    try {
      const response = await fetch(this.gameplayPath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.audioBuffers.set('bgm_gameplay', audioBuffer);
      if (this.currentMusicKey === 'bgm_gameplay') {
        this.currentMusicKey = null;
        this.playMusic('bgm_gameplay');
      }
    } catch (err) {
      console.warn('AudioManager: Failed to load gameplay music.', err);
    }
  }

  playMusic(key = 'bgm_gameplay') {
    if (!this.enabled) return;
    if (key !== 'bgm_gameplay') {
      this.stopMusic();
      return;
    }
    this.init();
    if (!this.ctx || this.currentMusicKey === key) return;

    const now = this.ctx.currentTime;
    const oldSource = this.currentMusicSource;
    const oldGain = this.currentMusicGain;
    this.currentMusicKey = key;

    const buffer = this.audioBuffers.get(key);
    if (!buffer) return;

    const newSource = this.ctx.createBufferSource();
    newSource.buffer = buffer;
    newSource.loop = true;

    const fadeGain = this.ctx.createGain();
    fadeGain.gain.setValueAtTime(0.001, now);
    fadeGain.gain.exponentialRampToValueAtTime(1.0, now + 1.2);

    newSource.connect(fadeGain);
    fadeGain.connect(this.musicGain);

    newSource.start(0);
    this.currentMusicSource = newSource;
    this.currentMusicGain = fadeGain;

    if (oldGain) {
      try {
        oldGain.gain.cancelScheduledValues(now);
        oldGain.gain.setValueAtTime(Math.max(0.001, oldGain.gain.value), now);
        oldGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      } catch (e) {}
    }
    if (oldSource) {
      try {
        oldSource.stop(now + 0.5);
      } catch (e) {}
    }
  }

  fadeOutMusic(seconds = 0.25) {
    if (!this.ctx) {
      this.stopMusic();
      return;
    }
    const now = this.ctx.currentTime;
    const fade = Math.max(0.05, seconds);
    if (this.currentMusicGain) {
      try {
        this.currentMusicGain.gain.cancelScheduledValues(now);
        this.currentMusicGain.gain.setValueAtTime(Math.max(0.001, this.currentMusicGain.gain.value), now);
        this.currentMusicGain.gain.exponentialRampToValueAtTime(0.001, now + fade);
      } catch (e) {}
    }
    const src = this.currentMusicSource;
    if (src) {
      try {
        src.stop(now + fade);
      } catch (e) {}
    }
    this.currentMusicSource = null;
    this.currentMusicGain = null;
    this.currentMusicKey = null;
  }

  stopMusic() {
    if (this.currentMusicSource) {
      try {
        this.currentMusicSource.stop();
      } catch (e) {}
    }
    this.currentMusicSource = null;
    this.currentMusicGain = null;
    this.currentMusicKey = null;
  }
}
