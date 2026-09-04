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
      
      // Player Profile & Registration System
      playerProfile: {
        registered: false,
        pilotName: 'Gast-Pilot',
        callsign: 'KOSMOS-1',
        playerId: null,
        registeredAt: null
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
    if (!Array.isArray(merged.leaderboard)) {
      merged.leaderboard = [];
    }

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

  registerPlayer(pilotName, callsign = 'PILOT') {
    const cleanName = (pilotName || 'Pilot').trim().substring(0, 18);
    const existing = this.getPlayerProfile();
    const id = existing.playerId || ('SJ-' + Math.floor(10000 + Math.random() * 90000));
    this.data.playerProfile = {
      registered: true,
      pilotName: cleanName,
      callsign: (callsign || 'PILOT').trim().toUpperCase().substring(0, 12),
      playerId: id,
      registeredAt: existing.registeredAt || new Date().toISOString()
    };
    this.save();
    return this.data.playerProfile;
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

    // Add to Top 5 Leaderboard
    const entry = {
      score: totalScore,
      altitude: altitude,
      cores: coresCollected,
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    this.data.leaderboard.push(entry);
    this.data.leaderboard.sort((a, b) => b.score - a.score);
    if (this.data.leaderboard.length > 5) {
      this.data.leaderboard = this.data.leaderboard.slice(0, 5);
    }

    this.save();
    return { totalScore, isNewHighScore };
  }

  updateBestCombo(combo) {
    if (combo > (this.data.stats.bestCombo || 0)) {
      this.data.stats.bestCombo = combo;
      this.save();
    }
  }
}
