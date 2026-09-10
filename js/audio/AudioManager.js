/**
 * Space Jump - AudioManager
 * Gameplay BGM only: WebAudio buffer loop at the player's chosen volume.
 */
class AudioManager {
  constructor(storageService) {
    this.storage = storageService;
    this.ctx = null;

    this.masterGain = null;
    this.musicGain = null;

    this.currentMusicKey = null;
    this.currentMusicSource = null;
    this.currentMusicGain = null;

    this.gameplayPath = 'assets/audio/music/bgm_gameplay.m4a';
    this.audioBuffers = new Map();

    this.enabled = this.storage ? (this.storage.data.settings.audioEnabled !== false) : true;
  }

  getMusicVolume() {
    if (!this.storage || !this.storage.data || !this.storage.data.settings) return 0.7;
    const raw = Number(this.storage.data.settings.musicVolume);
    if (!Number.isFinite(raw)) return 0.7;
    return Math.max(0, Math.min(1, raw));
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

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);

      this.updateVolumes();
      this.preloadAssets();
    } catch (err) {
      console.warn('AudioManager: WebAudio initialization deferred until user gesture.', err);
    }
  }

  updateVolumes() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const vol = this.getMusicVolume();

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(1, now, 0.03);
    }
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(vol, now, 0.03);
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
    newSource.loopStart = 0;
    newSource.loopEnd = buffer.duration;

    const fadeGain = this.ctx.createGain();
    fadeGain.gain.setValueAtTime(1, now);

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
