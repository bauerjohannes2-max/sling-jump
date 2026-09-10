/**
 * Space Jump - AudioManager
 * Two looping BGM beds: menu/out-of-run, and in-run gameplay.
 * Track files already contain their own fades — do not wrap extra envelopes.
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

    this.tracks = {
      bgm_gameplay: 'assets/audio/music/bgm_gameplay.m4a',
      bgm_menu: 'assets/audio/music/bgm_menu.m4a'
    };
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
    await Promise.all(Object.keys(this.tracks).map((key) => this.loadTrack(key)));
  }

  async loadTrack(key) {
    const path = this.tracks[key];
    if (!path || this.audioBuffers.has(key)) return;
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(key, audioBuffer);
      if (this.currentMusicKey === key && !this.currentMusicSource) {
        this.currentMusicKey = null;
        this.playMusic(key);
      }
    } catch (err) {
      console.warn(`AudioManager: Failed to load ${key}.`, err);
    }
  }

  playMusic(key = 'bgm_menu') {
    if (!this.enabled) return;
    if (!this.tracks[key]) {
      this.stopMusic();
      return;
    }
    this.init();
    if (!this.ctx) return;
    if (this.currentMusicKey === key && this.currentMusicSource) return;

    this.stopMusic();
    this.currentMusicKey = key;

    const buffer = this.audioBuffers.get(key);
    if (!buffer) return;

    const newSource = this.ctx.createBufferSource();
    newSource.buffer = buffer;
    newSource.loop = true;
    newSource.loopStart = 0;
    newSource.loopEnd = buffer.duration;

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(1, this.ctx.currentTime);

    newSource.connect(trackGain);
    trackGain.connect(this.musicGain);

    newSource.start(0);
    this.currentMusicSource = newSource;
    this.currentMusicGain = trackGain;
  }

  fadeOutMusic(seconds = 0.25) {
    this.stopMusic();
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
