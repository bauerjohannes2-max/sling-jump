/**
 * Sling Jump - StorageService
 * Versioned LocalStorage persistence with corruption safeguards & migration
 */
class StorageService {
  constructor() {
    this.key = CONSTANTS.STORAGE_KEY;
    this.data = this.getDefaultState();
    this.load();
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
    return 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
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
        nameChanges: 0
      },
      
      // Daily & Weekly Mission System
      dailyResetTimestamp: 0,
      weeklyResetTimestamp: 0,
      activeDailyQuestIds: ['daily_reach_350', 'daily_collect_12', 'daily_boost_3'],
      activeWeeklyQuestIds: ['weekly_altitude_8000', 'weekly_cores_100'],
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
        performanceMode: false
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
    if (!Array.isArray(merged.activeDailyQuestIds) || merged.activeDailyQuestIds.length === 0) {
      merged.activeDailyQuestIds = ['daily_reach_350', 'daily_collect_12', 'daily_boost_3'];
    }
    if (!Array.isArray(merged.activeWeeklyQuestIds) || merged.activeWeeklyQuestIds.length === 0) {
      merged.activeWeeklyQuestIds = ['weekly_altitude_8000', 'weekly_cores_100'];
    }
    if (!Array.isArray(merged.claimedQuestIds)) {
      merged.claimedQuestIds = [];
    }
    if (!Array.isArray(merged.leaderboard) || merged.leaderboardResetVersion !== '4.6.0') {
      merged.leaderboard = [];
      merged.leaderboardResetVersion = '4.6.0';
    }

    // Player profile & unique user ID migration
    if (!merged.playerProfile.playerId || typeof merged.playerProfile.playerId !== 'string' || merged.playerProfile.playerId.startsWith('SJ-')) {
      merged.playerProfile.playerId = StorageService.generateUniqueUserId();
    }
    if (!merged.playerProfile.pilotName || merged.playerProfile.pilotName === 'Gast-Pilot' || merged.playerProfile.pilotName.startsWith('Pilot') || merged.playerProfile.pilotName.trim() === '') {
      merged.playerProfile.pilotName = StorageService.generateRandomGamerTag();
    }
    if (typeof merged.playerProfile.nameChanges !== 'number') {
      merged.playerProfile.nameChanges = 0;
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
    const changesCount = existing.nameChanges || 0;

    // Strict 1x name change restriction
    if (changesCount >= 1) {
      return { success: false, profile: existing, message: 'Name kann nur einmal geändert werden.' };
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
    this.save();
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
    this.save();
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

    // Add to Flight Records (Top 100 runs sorted by altitude)
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
