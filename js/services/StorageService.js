/**
 * Sling Jump - StorageService
 * Versioned LocalStorage persistence with corruption safeguards & migration
 */
let CloudBackendModule = null;
if (typeof CloudBackend !== 'undefined') {
  CloudBackendModule = CloudBackend;
} else if (typeof require !== 'undefined') {
  try {
    CloudBackendModule = require('./CloudBackend').CloudBackend;
  } catch (e) {}
}

class StorageService {
  constructor() {
    this.key = CONSTANTS.STORAGE_KEY;
    this.data = this.getDefaultState();
    this._cloudBackend = null;
    this.load();
    this.syncToCloud();
  }

  static generateRandomGamerTag() {
    const prefixes = ['Neon', 'Shadow', 'Cyber', 'Nova', 'Vortex', 'Apex', 'Turbo', 'Ghost', 'Pixel', 'Quantum', 'Blaze', 'Frost', 'Echo', 'Cosmic', 'Solar', 'Strike', 'Hyper', 'Night', 'Phantom', 'Zero'];
    const nouns = ['Viper', 'Runner', 'Blade', 'Wolf', 'Hawk', 'Falcon', 'Fox', 'Knight', 'Hunter', 'Striker', 'Drifter', 'Spark', 'Pulse', 'Ace', 'Spectre', 'Rider'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${p}${n}${num}`;
  }

  static generateUniqueUserId() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let p1 = '';
    let p2 = '';
    for (let i = 0; i < 4; i++) {
      p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    for (let i = 0; i < 4; i++) {
      p2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `#${p1}-${p2}`;
  }

  getDefaultState() {
    return {
      version: CONSTANTS.VERSION,
      cores: 0,
      hyperCrystals: 1, // 1 free starter crystal so players can experience revive immediately
      highScore: 0,
      selectedShip: 'dart',
      selectedTrail: 'neon_cyan',
      selectedTheme: 'deep_space',
      unlockedShips: ['dart'],
      unlockedTrails: ['neon_cyan'],
      unlockedThemes: ['deep_space'],
      notifiedUpgradeIds: [], // Tracks upgrade IDs that have already been notified (one-time per item)
      
      // Player Profile & Unique Gaming Identity
      playerProfile: {
        registered: true,
        pilotName: StorageService.generateRandomGamerTag(),
        callsign: 'KOSMOS',
        playerId: StorageService.generateUniqueUserId(),
        registeredAt: new Date().toISOString(),
        nameChanges: 0,
        passwordHash: null,
        sessionToken: null
      },
      
      // Daily & Weekly Mission System
      dailyResetTimestamp: 0,
      weeklyResetTimestamp: 0,
      activeDailyQuestIds: ['daily_reach_3000', 'daily_collect_25', 'daily_boost_5'],
      activeWeeklyQuestIds: ['weekly_altitude_30k', 'weekly_cores_80', 'weekly_combo_5'],
      claimedQuestIds: [], // Quests whose rewards have been actively claimed
      questProgress: {},
      completedQuestCount: 0,

      // Global & Local Highscores
      leaderboard: [], // Top 5: [{ score, altitude, cores, date }]
      stats: {
        lifetimeMeters: 0,
        totalRuns: 0,
        totalCoresCollected: 0,
        totalCrystalsCollected: 0,
        totalRevives: 0,
        totalSlingshots: 0,
        totalNearMisses: 0,
        fragileAvoidedMeters: 0,
        bestCombo: 0,
        totalTimePlayedSec: 0
      },
      settings: {
        audioEnabled: true,
        masterVolume: 0.85,
        musicVolume: 0.70,
        sfxVolume: 0.90,
        screenShakeIntensity: 1.0, // 0.0, 0.5, 1.0
        performanceMode: false,
        showFps: true
      }
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        this.save();
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        this.data = this.migrate(parsed);
      } else {
        this.data = this.getDefaultState();
      }
    } catch (err) {
      console.warn('StorageService: Failed to parse save data, initializing default state.', err);
      this.data = this.getDefaultState();
      this.save();
    }
  }

  migrate(saved) {
    const defaultState = this.getDefaultState();
    const merged = { ...defaultState, ...saved };

    // Deep merge nested objects
    merged.stats = { ...defaultState.stats, ...(saved.stats || {}) };
    merged.settings = { ...defaultState.settings, ...(saved.settings || {}) };
    merged.questProgress = { ...defaultState.questProgress, ...(saved.questProgress || {}) };
    merged.playerProfile = { ...defaultState.playerProfile, ...(saved.playerProfile || {}) };

    // Ensure array integrity & valid selected equipment
    if (!CONSTANTS.SHIPS.some(s => s.id === merged.selectedShip)) {
      merged.selectedShip = CONSTANTS.SHIPS[0].id;
    }
    if (!CONSTANTS.TRAILS.some(t => t.id === merged.selectedTrail)) {
      merged.selectedTrail = CONSTANTS.TRAILS[0].id;
    }
    if (!Array.isArray(merged.unlockedShips) || merged.unlockedShips.length === 0) {
      merged.unlockedShips = [CONSTANTS.SHIPS[0].id];
    } else if (!merged.unlockedShips.includes(CONSTANTS.SHIPS[0].id)) {
      merged.unlockedShips.unshift(CONSTANTS.SHIPS[0].id);
    }

    if (!Array.isArray(merged.unlockedTrails) || merged.unlockedTrails.length === 0) {
      merged.unlockedTrails = [CONSTANTS.TRAILS[0].id];
    } else if (!merged.unlockedTrails.includes(CONSTANTS.TRAILS[0].id)) {
      merged.unlockedTrails.unshift(CONSTANTS.TRAILS[0].id);
    }

    if (!Array.isArray(merged.unlockedThemes) || merged.unlockedThemes.length === 0) {
      merged.unlockedThemes = ['deep_space'];
    }
    if (!Array.isArray(merged.notifiedUpgradeIds)) {
      merged.notifiedUpgradeIds = [];
    }
    const validDailyIds = ['daily_reach_3000', 'daily_collect_25', 'daily_boost_5'];
    if (!Array.isArray(merged.activeDailyQuestIds) || merged.activeDailyQuestIds.length === 0 || !merged.activeDailyQuestIds.every(id => validDailyIds.includes(id))) {
      merged.activeDailyQuestIds = ['daily_reach_3000', 'daily_collect_25', 'daily_boost_5'];
    }
    const validWeeklyIds = ['weekly_altitude_30k', 'weekly_cores_80', 'weekly_combo_5'];
    if (!Array.isArray(merged.activeWeeklyQuestIds) || merged.activeWeeklyQuestIds.length < 3 || !merged.activeWeeklyQuestIds.every(id => validWeeklyIds.includes(id))) {
      merged.activeWeeklyQuestIds = ['weekly_altitude_30k', 'weekly_cores_80', 'weekly_combo_5'];
    }
    if (!Array.isArray(merged.claimedQuestIds)) {
      merged.claimedQuestIds = [];
    }
    if (!Array.isArray(merged.leaderboard) || merged.leaderboardResetVersion !== '4.6.0') {
      merged.leaderboard = [];
      merged.leaderboardResetVersion = '4.6.0';
    }

    // Player profile & unique user ID migration (accepts legacy #XXXX and new #XXXX-XXXX)
    const validIdRegex = /^#[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}(-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4})?$/;
    if (!merged.playerProfile.playerId || typeof merged.playerProfile.playerId !== 'string' || !validIdRegex.test(merged.playerProfile.playerId)) {
      merged.playerProfile.playerId = StorageService.generateUniqueUserId();
    }
    if (!merged.playerProfile.pilotName || merged.playerProfile.pilotName === 'Gast-Pilot' || merged.playerProfile.pilotName.startsWith('Pilot') || merged.playerProfile.pilotName.trim() === '') {
      merged.playerProfile.pilotName = StorageService.generateRandomGamerTag();
    }
    if (typeof merged.playerProfile.nameChanges !== 'number') {
      merged.playerProfile.nameChanges = 0;
    }
    if (merged.playerProfile.sessionToken === undefined) {
      merged.playerProfile.sessionToken = null;
    }
    merged.playerProfile.registered = true;

    if (typeof merged.hyperCrystals !== 'number' || isNaN(merged.hyperCrystals)) {
      merged.hyperCrystals = 1;
    }
    merged.stats.totalCrystalsCollected = merged.stats.totalCrystalsCollected || 0;
    merged.stats.totalRevives = merged.stats.totalRevives || 0;

    merged.version = CONSTANTS.VERSION;
    return merged;
  }

  isUpgradeNotified(id) {
    return Array.isArray(this.data.notifiedUpgradeIds) && this.data.notifiedUpgradeIds.includes(id);
  }

  markUpgradeNotified(id) {
    if (!Array.isArray(this.data.notifiedUpgradeIds)) {
      this.data.notifiedUpgradeIds = [];
    }
    if (!this.data.notifiedUpgradeIds.includes(id)) {
      this.data.notifiedUpgradeIds.push(id);
      this.save();
    }
  }

  registerPlayer(pilotName, callsign = 'ACE') {
    const existing = this.getPlayerProfile();
    const changesCount = typeof existing.nameChanges === 'number' ? existing.nameChanges : 0;
    const MAX_FREE_CHANGES = 2;

    // Strict 2x free name change allowance
    if (changesCount >= MAX_FREE_CHANGES) {
      return { success: false, profile: existing, message: 'Keine kostenlosen Namensänderungen mehr verfügbar.' };
    }

    const cleanName = (pilotName || '').trim().substring(0, 16);
    if (!cleanName) {
      return { success: false, profile: existing, message: 'Ungültiger Name.' };
    }

    const id = existing.playerId || StorageService.generateUniqueUserId();
    const hasChanged = cleanName !== existing.pilotName;

    this.data.playerProfile = {
      ...existing,
      registered: true,
      pilotName: cleanName,
      callsign: (callsign || 'ACE').trim().toUpperCase().substring(0, 12),
      playerId: id,
      nameChanges: hasChanged ? (changesCount + 1) : changesCount,
      registeredAt: existing.registeredAt || new Date().toISOString()
    };
    this.save();
    return { success: true, profile: this.data.playerProfile, message: 'Profil aktualisiert.' };
  }

  getPlayerProfile() {
    if (!this.data.playerProfile) {
      this.data.playerProfile = this.getDefaultState().playerProfile;
    }
    return this.data.playerProfile;
  }

  isQuestClaimed(questId) {
    return Array.isArray(this.data.claimedQuestIds) && this.data.claimedQuestIds.includes(questId);
  }

  markQuestClaimed(questId) {
    if (!Array.isArray(this.data.claimedQuestIds)) {
      this.data.claimedQuestIds = [];
    }
    if (!this.data.claimedQuestIds.includes(questId)) {
      this.data.claimedQuestIds.push(questId);
      this.data.completedQuestCount = (this.data.completedQuestCount || 0) + 1;
      this.save();
    }
  }

  isShipUnlocked(shipId) {
    return Array.isArray(this.data.unlockedShips) && this.data.unlockedShips.includes(shipId);
  }

  unlockShip(shipId) {
    if (!this.isShipUnlocked(shipId)) {
      if (!Array.isArray(this.data.unlockedShips)) this.data.unlockedShips = ['dart'];
      this.data.unlockedShips.push(shipId);
      this.save();
      return true;
    }
    return false;
  }

  save(immediate = true) {
    if (!immediate) {
      if (this._saveTimer) return;
      this._saveTimer = setTimeout(() => {
        this._saveTimer = null;
        this.save(true);
      }, 1500);
      return;
    }

    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
      this._saveTimer = null;
    }

    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (err) {
      console.warn('StorageService: Failed to write to localStorage (quota or disabled)', err);
    }

    // Auto-sync state to cloud in background
    this.syncToCloud();
  }

  getCloudBackend() {
    if (this._cloudBackend) return this._cloudBackend;
    if (typeof CloudBackend !== 'undefined' && CloudBackend.getAdapter) {
      return CloudBackend.getAdapter();
    }
    if (typeof CloudBackendModule !== 'undefined' && CloudBackendModule && CloudBackendModule.getAdapter) {
      return CloudBackendModule.getAdapter();
    }
    if (typeof LocalNodeAdapter !== 'undefined') {
      return new LocalNodeAdapter();
    }
    return null;
  }

  setCloudBackend(backend) {
    this._cloudBackend = backend;
  }

  syncToCloud() {
    if (this._cloudSyncTimer) return;
    this._cloudSyncTimer = setTimeout(async () => {
      this._cloudSyncTimer = null;
      try {
        const profile = this.getPlayerProfile();
        if (!profile || !profile.playerId) return;

        const syncPayload = {
          playerId: profile.playerId,
          sessionToken: profile.sessionToken || null,
          passwordHash: profile.sessionToken ? null : (profile.passwordHash || null),
          state: {
            cores: this.data.cores,
            hyperCrystals: this.data.hyperCrystals,
            highScore: this.data.highScore,
            selectedShip: this.data.selectedShip,
            selectedTrail: this.data.selectedTrail,
            selectedTheme: this.data.selectedTheme,
            unlockedShips: this.data.unlockedShips,
            unlockedTrails: this.data.unlockedTrails,
            unlockedThemes: this.data.unlockedThemes,
            playerProfile: this.data.playerProfile,
            stats: this.data.stats,
            questProgress: this.data.questProgress,
            claimedQuestIds: this.data.claimedQuestIds,
            leaderboard: this.data.leaderboard,
            settings: this.data.settings
          }
        };

        const backend = this.getCloudBackend();
        if (!backend) return;

        const res = await backend.sync(syncPayload);
        if (res && res.tokenExpired) {
          if (this.data && this.data.playerProfile) {
            this.data.playerProfile.sessionToken = null;
          }
        } else if (res && res.ok) {
          if (res.sessionToken && this.data && this.data.playerProfile) {
            this.data.playerProfile.sessionToken = res.sessionToken;
            try {
              localStorage.setItem(this.key, JSON.stringify(this.data));
            } catch (e) {}
          }
        }
      } catch (e) {}
    }, 800);
  }

  async restoreFromCloud(rawId, password) {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
      return { success: false, message: 'Server nicht erreichbar.' };
    }
    if (!rawId || typeof rawId !== 'string') {
      return { success: false, message: 'Ungültige User-ID.' };
    }
    let cleanId = rawId.trim().toUpperCase();
    if (!cleanId.startsWith('#')) cleanId = '#' + cleanId;

    // Hash password client-side if provided
    let pwHash = '';
    if (password && password.trim()) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password.trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        pwHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        return { success: false, message: 'Passwort-Verschlüsselung fehlgeschlagen.' };
      }
    }

    try {
      const backend = this.getCloudBackend();
      if (!backend) {
        return { success: false, message: 'Server nicht erreichbar.' };
      }

      const res = await backend.restore(cleanId, pwHash || null);
      if (res && res.requiresPassword) {
        return { success: false, message: 'PASSWORT ERFORDERLICH', requiresPassword: true };
      }
      if (res && res.locked) {
        return { success: false, message: res.error || 'ZU VIELE VERSUCHE! BITTE WARTEN.' };
      }
      if (!res || !res.ok) {
        return { success: false, message: (res && res.error) || `Spieler ${cleanId} nicht gefunden.` };
      }

      if (res.player && res.player.state) {
        this.data = this.migrate(res.player.state);
        if (res.sessionToken && this.data.playerProfile) {
          this.data.playerProfile.sessionToken = res.sessionToken;
        }
        if (pwHash && this.data.playerProfile) {
          this.data.playerProfile.passwordHash = pwHash;
        }
        try {
          localStorage.setItem(this.key, JSON.stringify(this.data));
        } catch (e) {}
        return { success: true, profile: this.data.playerProfile, message: `Spielstand für ${cleanId} geladen!` };
      }
      return { success: false, message: 'Spielstand unvollständig.' };
    } catch (err) {
      return { success: false, message: 'Server nicht erreichbar.' };
    }
  }

  async setPassword(plainPassword) {
    if (!plainPassword || !plainPassword.trim()) {
      return { success: false, message: 'Passwort darf nicht leer sein.' };
    }
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plainPassword.trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      this.data.playerProfile.passwordHash = hash;
      this.data.playerProfile.sessionToken = null; // Forces token re-negotiation on next sync
      this.save();
      return { success: true, message: 'PASSWORT GESETZT' };
    } catch (e) {
      return { success: false, message: 'Fehler beim Setzen des Passworts.' };
    }
  }

  async removePassword() {
    const oldHash = this.data.playerProfile ? this.data.playerProfile.passwordHash : null;
    const oldToken = this.data.playerProfile ? this.data.playerProfile.sessionToken : null;
    const playerId = this.data.playerProfile ? this.data.playerProfile.playerId : null;
    this.data.playerProfile.passwordHash = null;
    this.data.playerProfile.sessionToken = null;
    this.save();

    const backend = this.getCloudBackend();
    if (backend && playerId) {
      try {
        await backend.removePassword(playerId, oldHash, oldToken, this.data);
      } catch (e) {}
    }

    return { success: true, message: 'PASSWORT ENTFERNT' };
  }

  async login(rawId, password) {
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
      return { success: false, message: 'Server nicht erreichbar.' };
    }
    let cleanId = (rawId || '').trim().toUpperCase();
    if (!cleanId.startsWith('#')) cleanId = '#' + cleanId;

    let pwHash = '';
    if (password && password.trim()) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password.trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        pwHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        return { success: false, message: 'Passwort-Verschlüsselung fehlgeschlagen.' };
      }
    }

    try {
      const backend = this.getCloudBackend();
      if (!backend) {
        return { success: false, message: 'Server nicht erreichbar.' };
      }

      const res = await backend.login(cleanId, pwHash || null);
      if (res && res.locked) {
        return { success: false, message: res.error || 'ZU VIELE VERSUCHE! BITTE WARTEN.' };
      }
      if (!res || !res.ok) {
        return { success: false, message: (res && res.error) || 'FALSCHES PASSWORT' };
      }
      if (res.sessionToken) {
        if (this.data && this.data.playerProfile) {
          this.data.playerProfile.sessionToken = res.sessionToken;
          if (pwHash) this.data.playerProfile.passwordHash = pwHash;
          try {
            localStorage.setItem(this.key, JSON.stringify(this.data));
          } catch (e) {}
        }
        return { success: true, sessionToken: res.sessionToken };
      }
      return { success: false, message: 'Login unvollständig.' };
    } catch (e) {
      return { success: false, message: 'Server nicht erreichbar.' };
    }
  }

  saveDeferred() {
    this.save(false);
  }

  resetAll() {
    this.data = this.getDefaultState();
    this.save();
    return this.data;
  }

  addCores(amount) {
    this.data.cores = Math.max(0, this.data.cores + amount);
    this.data.stats.totalCoresCollected += Math.max(0, amount);
    this.saveDeferred();
    return this.data.cores;
  }

  spendCores(amount) {
    if (this.data.cores >= amount) {
      this.data.cores -= amount;
      this.save();
      return true;
    }
    return false;
  }

  addHyperCrystals(amount = 1) {
    this.data.hyperCrystals = Math.max(0, (this.data.hyperCrystals || 0) + amount);
    this.data.stats.totalCrystalsCollected = (this.data.stats.totalCrystalsCollected || 0) + amount;
    this.saveDeferred();
    return this.data.hyperCrystals;
  }

  spendHyperCrystals(amount = 1) {
    if ((this.data.hyperCrystals || 0) >= amount) {
      this.data.hyperCrystals -= amount;
      this.save();
      return true;
    }
    return false;
  }

  recordRevive() {
    this.data.stats.totalRevives = (this.data.stats.totalRevives || 0) + 1;
    this.save();
  }

  recordRun(altitude, coresCollected, nearMisses, slingshots) {
    this.data.stats.totalRuns++;
    this.data.stats.lifetimeMeters += altitude;
    this.data.stats.totalSlingshots += slingshots;
    this.data.stats.totalNearMisses += nearMisses;

    const totalScore = Math.floor(altitude + (coresCollected * CONSTANTS.SCORE.PARTICLE_VALUE));
    let isNewHighScore = false;

    if (altitude > this.data.highScore) {
      this.data.highScore = altitude;
      isNewHighScore = true;
    }

    // Add to Flight Records (Top 100 runs sorted by altitude, only for completed climbs)
    if (altitude > 0) {
      const profile = this.getPlayerProfile();
      const region = StorageService.getPlayerRegion();
      const entry = {
        altitude: altitude,
        name: profile.pilotName || 'Player',
        country: region.code,
        countryName: region.name,
        timestamp: Date.now()
      };

      this.data.leaderboard.push(entry);
      this.data.leaderboard.sort((a, b) => b.altitude - a.altitude);
      if (this.data.leaderboard.length > 100) {
        this.data.leaderboard = this.data.leaderboard.slice(0, 100);
      }
    }

    this.save();
    return { totalScore, isNewHighScore };
  }

  static getPlayerRegion() {
    try {
      const navLocale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'de-DE';
      const parts = navLocale.split('-');
      const countryCode = (parts[1] || (parts[0].length === 2 ? parts[0] : 'DE')).toUpperCase();
      let countryName = countryCode;
      try {
        if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
          const dn = new Intl.DisplayNames(['de', 'en'], { type: 'region' });
          countryName = dn.of(countryCode) || countryCode;
        }
      } catch (e) {
        countryName = countryCode;
      }
      return { code: countryCode, name: countryName };
    } catch (err) {
      return { code: 'DE', name: 'Deutschland' };
    }
  }

  updateBestCombo(combo) {
    if (combo > (this.data.stats.bestCombo || 0)) {
      this.data.stats.bestCombo = combo;
      this.save();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
}

