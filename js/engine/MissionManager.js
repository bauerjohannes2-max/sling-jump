/**
 * Sling Jump - MissionManager
 * Industry Standard Daily (24h) & Weekly (7d) Challenge System with Active Claim Flow
 */
class MissionManager {
  constructor(storageService, audioManager, onQuestCompletedCallback) {
    this.storage = storageService;
    this.audio = audioManager;
    this.onQuestCompleted = onQuestCompletedCallback;

    // Run-Specific volatile metrics
    this.runCores = 0;
    this.runBoosts = 0;
    this.usedFragileInRun = false;

    this.checkAndRotateQuests();
  }

  /* =========================================================================
     1. ROTATION & TIMERS (24h Daily & 7-Day Weekly Resets)
     ========================================================================= */
  checkAndRotateQuests() {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const WEEK_MS = 7 * DAY_MS;

    // 1. Daily Quests Rotation Check
    if (!this.storage.data.dailyResetTimestamp || now >= this.storage.data.dailyResetTimestamp) {
      this.rotateDailyQuests(now + DAY_MS);
    }

    // 2. Weekly Quests Rotation Check
    if (!this.storage.data.weeklyResetTimestamp || now >= this.storage.data.weeklyResetTimestamp) {
      this.rotateWeeklyQuests(now + WEEK_MS);
    }

    this.storage.save();
  }

  rotateDailyQuests(nextReset) {
    this.storage.data.dailyResetTimestamp = nextReset;
    const pool = CONSTANTS.DAILY_QUEST_POOL || CONSTANTS.QUEST_POOL;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map(q => q.id);

    this.storage.data.activeDailyQuestIds = selected;

    // Reset progress and claim status for new dailies
    selected.forEach(id => {
      this.storage.data.questProgress[id] = 0;
      this.storage.data.claimedQuestIds = (this.storage.data.claimedQuestIds || []).filter(cId => cId !== id);
    });
  }

  rotateWeeklyQuests(nextReset) {
    this.storage.data.weeklyResetTimestamp = nextReset;
    const pool = CONSTANTS.WEEKLY_QUEST_POOL || CONSTANTS.QUEST_POOL;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2).map(q => q.id);

    this.storage.data.activeWeeklyQuestIds = selected;

    // Reset progress and claim status for new weeklies
    selected.forEach(id => {
      this.storage.data.questProgress[id] = 0;
      this.storage.data.claimedQuestIds = (this.storage.data.claimedQuestIds || []).filter(cId => cId !== id);
    });
  }

  getDailyTimeRemaining() {
    const remainingMs = Math.max(0, (this.storage.data.dailyResetTimestamp || 0) - Date.now());
    const totalMinutes = Math.floor(remainingMs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  }

  getWeeklyTimeRemaining() {
    const remainingMs = Math.max(0, (this.storage.data.weeklyResetTimestamp || 0) - Date.now());
    const totalHours = Math.floor(remainingMs / (60 * 60 * 1000));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days}d ${hours}h`;
  }

  /* =========================================================================
     2. QUEST RETRIEVAL & ACTIVE CLAIM ENGINE
     ========================================================================= */
  resetRunMetrics() {
    this.runCores = 0;
    this.runBoosts = 0;
    this.usedFragileInRun = false;
  }

  getDailyQuests() {
    const pool = CONSTANTS.DAILY_QUEST_POOL || [];
    return (this.storage.data.activeDailyQuestIds || []).map(id => {
      const template = pool.find(q => q.id === id);
      if (!template) return null;
      const progress = this.storage.data.questProgress[id] || 0;
      const isComplete = progress >= template.target;
      const isClaimed = this.storage.isQuestClaimed(id);
      return {
        ...template,
        progress: Math.min(progress, template.target),
        isComplete,
        isClaimed
      };
    }).filter(q => !!q);
  }

  getWeeklyQuests() {
    const pool = CONSTANTS.WEEKLY_QUEST_POOL || [];
    return (this.storage.data.activeWeeklyQuestIds || []).map(id => {
      const template = pool.find(q => q.id === id);
      if (!template) return null;
      const progress = this.storage.data.questProgress[id] || 0;
      const isComplete = progress >= template.target;
      const isClaimed = this.storage.isQuestClaimed(id);
      return {
        ...template,
        progress: Math.min(progress, template.target),
        isComplete,
        isClaimed
      };
    }).filter(q => !!q);
  }

  getAllActiveQuests() {
    return [...this.getDailyQuests(), ...this.getWeeklyQuests()];
  }

  getActiveQuests() {
    return this.getAllActiveQuests();
  }

  getUnclaimedCount() {
    return this.getAllActiveQuests().filter(q => q.isComplete && !q.isClaimed).length;
  }

  claimReward(questId) {
    const allPools = [...(CONSTANTS.DAILY_QUEST_POOL || []), ...(CONSTANTS.WEEKLY_QUEST_POOL || [])];
    const quest = allPools.find(q => q.id === questId);
    if (!quest) return false;

    const progress = this.storage.data.questProgress[questId] || 0;
    const isComplete = progress >= quest.target;
    const isClaimed = this.storage.isQuestClaimed(questId);

    if (isComplete && !isClaimed) {
      // Grant Stars
      this.storage.addCores(quest.reward);
      this.storage.markQuestClaimed(questId);

      // Sound Fanfare
      if (this.audio) {
        this.audio.playSfx('sfx_slingshot_boost', { isBoost: true });
      }

      if (this.onQuestCompleted) {
        this.onQuestCompleted(quest);
      }
      return true;
    }
    return false;
  }

  /* =========================================================================
     3. REAL-TIME GAMEPLAY PROGRESS TRACKING
     ========================================================================= */
  checkAndProgress(questId, amount, isAbsolute = false, deferred = false) {
    const allPools = [...(CONSTANTS.DAILY_QUEST_POOL || []), ...(CONSTANTS.WEEKLY_QUEST_POOL || [])];
    const template = allPools.find(q => q.id === questId);
    if (!template) return;

    let current = this.storage.data.questProgress[questId] || 0;
    current = isAbsolute ? Math.max(current, amount) : current + amount;
    this.storage.data.questProgress[questId] = current;
    if (deferred && typeof this.storage.saveDeferred === 'function') {
      this.storage.saveDeferred();
    } else {
      this.storage.save();
    }
  }

  onAltitudeUpdate(meters, usedFragile) {
    if (usedFragile) this.usedFragileInRun = true;

    for (const quest of this.getAllActiveQuests()) {
      if (quest.type === 'altitude_single') {
        this.checkAndProgress(quest.id, meters, true, true);
      } else if (quest.type === 'altitude_no_fragile' && !this.usedFragileInRun) {
        this.checkAndProgress(quest.id, meters, true, true);
      }
    }
  }

  onCoreCollected() {
    this.runCores++;
    for (const quest of this.getAllActiveQuests()) {
      if (quest.type === 'cores_single') {
        this.checkAndProgress(quest.id, this.runCores, true);
      } else if (quest.type === 'cores_cumulative') {
        this.checkAndProgress(quest.id, 1, false);
      }
    }
  }

  onSuperBoostUsed() {
    this.runBoosts++;
    for (const quest of this.getAllActiveQuests()) {
      if (quest.type === 'boost_single') {
        this.checkAndProgress(quest.id, this.runBoosts, true);
      }
    }
  }

  onSlingshotPerformed() {
    for (const quest of this.getAllActiveQuests()) {
      if (quest.type === 'slingshot_cumulative') {
        this.checkAndProgress(quest.id, 1, false);
      }
    }
  }

  onNearMiss() {
    for (const quest of this.getAllActiveQuests()) {
      if (quest.type === 'near_miss_cumulative') {
        this.checkAndProgress(quest.id, 1, false);
      }
    }
  }

  onRunFinished(totalAltitude) {
    for (const quest of this.getAllActiveQuests()) {
      if (quest.type === 'altitude_cumulative') {
        this.checkAndProgress(quest.id, totalAltitude, false);
      }
    }
    if (this.storage) {
      this.storage.save(true);
    }
  }
}
