/**
 * Space Jump - UIManager
 * Manages all HUD elements, Modals, State Transitions, Settings, Hangar UI,
 * Leaderboard & Quest notifications.
 * STRICT RULE: No Emojis - Pure Minimalist Vector UI & SVG Icons.
 */
class UIManager {
  static COIN_SVG = '<svg class="currency-icon coin-icon" viewBox="0 0 36 36" fill="none" style="width:15px;height:15px;vertical-align:middle;display:inline-block;"><circle cx="18" cy="18" r="17.2" fill="url(#coinRimGrad)" stroke="#260b02" stroke-width="0.8"/><circle cx="18" cy="18" r="15.6" stroke="#fef08a" stroke-width="0.5" stroke-opacity="0.4"/><circle cx="18" cy="18" r="13.6" fill="url(#coinWellDepth)" stroke="#1a0601" stroke-width="0.75"/><text x="18" y="18.5" text-anchor="middle" dominant-baseline="central" font-family="\'Rajdhani\', sans-serif" font-weight="700" font-size="23" fill="#fef08a" style="user-select:none;">C</text></svg>';
  static CRYSTAL_SVG = '<svg class="currency-icon spark-icon" viewBox="0 0 40 40" fill="none" style="width:14px;height:14px;vertical-align:middle;display:inline-block;"><polygon points="20,2 24,15 38,20 24,25 20,38 16,25 2,20 16,15" fill="url(#sparkCoreGrad)" stroke="#d8b4fe" stroke-width="1" stroke-linejoin="round"/><polygon points="20,2 24,15 20,20" fill="#ffffff" opacity="0.16"/><polygon points="2,20 16,15 20,20" fill="#ffffff" opacity="0.10"/><polygon points="20,38 24,25 20,20" fill="#3b0764" opacity="0.35"/><polygon points="38,20 24,25 20,20" fill="#3b0764" opacity="0.25"/><line x1="24" y1="15" x2="16" y2="25" stroke="#f5d0fe" stroke-width="0.75" opacity="0.5"/><line x1="16" y1="15" x2="24" y2="25" stroke="#f5d0fe" stroke-width="0.75" opacity="0.5"/><circle cx="20" cy="20" r="1.6" fill="#f5d0fe"/></svg>';

  static getMissionIcon(type) {
    switch (type) {
      case 'altitude_single':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c2 2 4 6 4 10l-4 3-4-3c0-4 2-8 4-10z"></path><path d="M8 12l-3 3v2l3-1"></path><path d="M16 12l3 3v2l-3-1"></path><circle cx="12" cy="7" r="1.5" fill="currentColor"></circle><path d="M10 18l2 4 2-4"></path></svg>';
      case 'altitude_cumulative':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="7"></circle><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-25 12 12)"></ellipse><polyline points="12 9 12 12 14 14"></polyline></svg>';
      case 'cores_single':
      case 'cores_cumulative':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="5" stroke-dasharray="2 2"></circle><path d="M12 9v6M9.5 12h5"></path></svg>';
      case 'boost_single':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 4 14 11 14 9 22 20 10 13 10 13 2" fill="none"></polygon></svg>';
      case 'slingshot_cumulative':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="4"></circle><path d="M9 13v6a3 3 0 0 0 6 0V7a4 4 0 0 1 4 4"></path><polyline points="17 9 19 11 21 9"></polyline></svg>';
      case 'near_miss_cumulative':
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"></circle><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><polygon points="12 9 15 12 12 15 9 12" fill="currentColor"></polygon></svg>';
      default:
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    }
  }

  constructor(storageService, audioManager, shopManager, missionManager, inputManager) {
    this.storage = storageService;
    this.audio = audioManager;
    this.shop = shopManager;
    this.missions = missionManager;
    this.input = inputManager;

    // Cache DOM Elements
    this.dom = {
      // Overlays & Modals
      menuOverlay: document.getElementById('menu-overlay'),
      hudLayer: document.getElementById('hud-layer'),
      pauseModal: document.getElementById('pause-modal'),
      gameoverModal: document.getElementById('gameover-modal'),
      questsModal: document.getElementById('quests-modal'),
      leaderboardModal: document.getElementById('leaderboard-modal'),
      statsModal: document.getElementById('stats-modal'),
      settingsModal: document.getElementById('settings-modal'),
      legalModal: document.getElementById('legal-modal'),
      confirmModal: document.getElementById('confirm-modal'),
      tutorialModal: document.getElementById('tutorial-modal'),
      profileModal: document.getElementById('profile-modal'),

      // Screen Effects
      slowmoOverlay: document.getElementById('slowmo-overlay'),
      dangerOverlay: document.getElementById('danger-overlay'),
      flashOverlay: document.getElementById('flash-overlay'),
      recordFx: document.getElementById('record-fx'),
      recordFxGateTag: document.getElementById('record-fx-gate-tag'),
      recordFxMeters: document.getElementById('record-fx-meters'),

      // HUD Elements
      altitudeVal: document.getElementById('altitude-val'),
      bestVal: document.getElementById('best-val'),
      chaseFill: document.getElementById('chase-fill'),
      chaseCaption: document.getElementById('chase-caption'),
      scoreContainer: document.getElementById('score-container'),
      orbsVal: document.getElementById('orbs-val'),
      hudComboBadge: document.getElementById('hud-combo-badge'),
      hudQuestTitle: document.getElementById('hud-quest-title'),
      hudQuestProgress: document.getElementById('hud-quest-progress'),
      hudQuestFill: document.getElementById('hud-quest-fill'),
      hudTutorialTip: document.getElementById('hud-tutorial-tip'),
      hudTutorialTipText: document.getElementById('hud-tutorial-tip-text'),

      // Game Over Stats
      finalAltitude: document.getElementById('final-altitude'),
      finalOrbs: document.getElementById('final-orbs'),
      finalCrystals: document.getElementById('final-crystals'),
      finalBest: document.getElementById('final-best'),
      newRecordBadge: document.getElementById('new-record-badge'),
      flightEndedBadge: document.getElementById('flight-ended-badge'),
      reviveBox: document.getElementById('revive-box'),
      btnGameOverRevive: document.getElementById('btn-gameover-revive'),
      reviveBtnText: document.getElementById('revive-btn-text'),
      reviveCostTag: document.getElementById('revive-cost-tag'),
      reviveStatusText: document.getElementById('revive-status-text'),
      // Menu currencies
      menuCurrencyVal: document.getElementById('menu-currency-val'),
      menuCrystalsVal: document.getElementById('menu-crystals-val'),

      // Global & Local Leaderboard
      globalLeaderboardList: document.getElementById('global-leaderboard-list'),
      btnLbTabGlobal: document.getElementById('btn-lb-tab-global'),
      btnLbTabLocal: document.getElementById('btn-lb-tab-local'),
      playerRankBadge: document.getElementById('player-rank-badge'),
      playerRankPercentile: document.getElementById('player-rank-percentile'),
      playerRankDelta: document.getElementById('player-rank-delta'),
      rankPillBadge: document.getElementById('rank-pill-badge'),
      btnLeaderboardClose: document.getElementById('btn-leaderboard-close'),

      // Challenges, Missions & Timers
      dailyResetTimer: document.getElementById('daily-reset-timer'),
      weeklyResetTimer: document.getElementById('weekly-reset-timer'),
      dailyQuestsList: document.getElementById('daily-quests-list'),
      weeklyQuestsList: document.getElementById('weekly-quests-list'),
      menuQuestsBadge: document.getElementById('menu-quests-badge'),
      btnQuestsClose: document.getElementById('btn-quests-close'),
      tabMissionsAll: document.getElementById('tab-missions-all'),
      tabMissionsDaily: document.getElementById('tab-missions-daily'),
      tabMissionsWeekly: document.getElementById('tab-missions-weekly'),
      badgeCountAll: document.getElementById('badge-count-all'),
      badgeCountDaily: document.getElementById('badge-count-daily'),
      badgeCountWeekly: document.getElementById('badge-count-weekly'),
      dotUnclaimedDaily: document.getElementById('dot-unclaimed-daily'),
      dotUnclaimedWeekly: document.getElementById('dot-unclaimed-weekly'),
      sectionDailyQuests: document.getElementById('section-daily-quests'),
      sectionWeeklyQuests: document.getElementById('section-weekly-quests'),

      // Lifetime Stats
      statHighScore: document.getElementById('stat-high-score'),
      statLifetimeMeters: document.getElementById('stat-lifetime-meters'),
      statTotalRuns: document.getElementById('stat-total-runs'),
      statAvgAltitude: document.getElementById('stat-avg-altitude'),
      statTotalCores: document.getElementById('stat-total-cores'),
      statTotalCrystals: document.getElementById('stat-total-crystals'),
      statTotalRevives: document.getElementById('stat-total-revives'),
      statTotalSlingshots: document.getElementById('stat-total-slingshots'),
      statTotalNearmisses: document.getElementById('stat-total-nearmisses'),
      statCompletedQuests: document.getElementById('stat-completed-quests'),
      statBestCombo: document.getElementById('stat-best-combo'),
      btnStatsClose: document.getElementById('btn-stats-close'),

      // Settings Inputs
      btnAudioToggle: document.getElementById('btn-audio-toggle'),
      sliderMusicVolume: document.getElementById('slider-music-volume'),
      musicVolumeValue: document.getElementById('music-volume-value'),
      btnVolumeDown: document.getElementById('btn-volume-down'),
      btnVolumeUp: document.getElementById('btn-volume-up'),
      btnFpsToggle: document.getElementById('btn-fps-toggle'),
      btnPerfToggle: document.getElementById('btn-perf-toggle'),
      hudFpsBadge: document.getElementById('hud-fps-badge'),
      hudFpsVal: document.getElementById('hud-fps-val'),
      hudFpsDt: document.getElementById('hud-fps-dt'),
      menuFpsBadge: document.getElementById('menu-fps-badge'),
      menuFpsVal: document.getElementById('menu-fps-val'),
      menuFpsDt: document.getElementById('menu-fps-dt'),
      // Profile & Identity Elements
      menuProfileName: document.getElementById('menu-profile-name'),
      menuProfileRole: document.getElementById('menu-profile-role'),
      profileHeroName: document.getElementById('profile-hero-name'),
      profileUserIdBadge: document.getElementById('profile-user-id-badge'),
      profileStatusMsg: document.getElementById('profile-status-message'),
      btnProfileRandom: document.getElementById('btn-profile-random')
    };

    this.activeLeaderboardTab = 'global';
    this._remoteLeaderboard = null;
    this._leaderboardRenderGen = 0;
    this.activeMissionTab = 'all';
    this._debriefSeqId = 0;
    this._debriefAnimating = false;
    this._debriefReady = false;
    this._lastDebrief = null;
    this.initMissionTabsUI();
    this.initSettingsUI();
    this.initLegalUI();
    this.initDebriefInteraction();
    this.updateUserProfileNav();
    window._uiManager = this;
  }

  setStateManager(stateManager) {
    this.state = stateManager;
  }

  /* =========================================================================
     STATE VISIBILITY SWITCHER
     ========================================================================= */
  showState(state, previousState, contextData = {}) {
    const isMenuTab = (
      state === StateManager.STATES.SETTINGS ||
      state === StateManager.STATES.STATS ||
      state === StateManager.STATES.LEADERBOARD ||
      state === StateManager.STATES.QUESTS ||
      state === StateManager.STATES.TUTORIAL
    );

    // Hide other modal overlays
    const modalOverlays = [
      this.dom.hudLayer,
      this.dom.pauseModal,
      this.dom.gameoverModal,
      this.dom.questsModal,
      this.dom.leaderboardModal,
      this.dom.statsModal,
      this.dom.settingsModal,
      this.dom.legalModal,
      this.dom.tutorialModal,
      this.dom.profileModal
    ];
    modalOverlays.forEach(el => {
      if (el) el.classList.remove('active', 'visible');
    });

    if (previousState === StateManager.STATES.GAME_OVER && state !== StateManager.STATES.GAME_OVER) {
      this.cancelDebriefSequence();
    }

    // Only hide menuOverlay when transitioning to active gameplay, tutorial run, or game over
    if (!isMenuTab && state !== StateManager.STATES.MENU) {
      if (this.dom.menuOverlay) this.dom.menuOverlay.classList.remove('active', 'visible');
    }

    // If opening settings while in PAUSED state, keep paused HUD & pauseModal active behind settings
    if (state === StateManager.STATES.SETTINGS && previousState === StateManager.STATES.PAUSED) {
      if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
      if (this.dom.pauseModal) this.dom.pauseModal.classList.add('visible');
    }

    switch (state) {
      case StateManager.STATES.MENU:
        if (this.dom.menuOverlay) this.dom.menuOverlay.classList.add('visible');
        this.updateCurrency();
        this.refreshRemoteLeaderboard().then(() => this.updateMenuRank()).catch(() => {});
        break;

      case StateManager.STATES.PLAYING:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
        this.updateActiveHUDQuest();
        break;

      case StateManager.STATES.TUTORIAL:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
        this.updateHUD(0, this.storage.data.highScore, this.storage.data.cores);
        break;

      case StateManager.STATES.PAUSED:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
        if (this.dom.pauseModal) this.dom.pauseModal.classList.add('visible');
        break;

      case StateManager.STATES.GAME_OVER:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.remove('visible');
        if (this.dom.gameoverModal) this.dom.gameoverModal.classList.add('visible');
        this.populateGameOver(contextData);
        break;

      case StateManager.STATES.QUESTS:
        if (this.dom.menuOverlay) this.dom.menuOverlay.classList.add('visible');
        if (this.dom.questsModal) this.dom.questsModal.classList.add('visible');
        this.renderChallenges();
        break;

      case StateManager.STATES.LEADERBOARD:
        if (this.dom.menuOverlay) this.dom.menuOverlay.classList.add('visible');
        if (this.dom.leaderboardModal) this.dom.leaderboardModal.classList.add('visible');
        this.renderGlobalLeaderboard();
        break;

      case StateManager.STATES.STATS:
        if (this.dom.menuOverlay) this.dom.menuOverlay.classList.add('visible');
        if (this.dom.statsModal) this.dom.statsModal.classList.add('visible');
        this.populateLifetimeStats();
        break;

      case StateManager.STATES.SETTINGS:
        if (previousState !== StateManager.STATES.PAUSED) {
          if (this.dom.menuOverlay) this.dom.menuOverlay.classList.add('visible');
        }
        if (this.dom.settingsModal) this.dom.settingsModal.classList.add('visible');
        this.updateAudioToggleBtn();
        this.updateMusicVolumeUI();
        this.updateFpsToggleBtn();
        this.updatePerfToggleBtn();
        break;
    }

    this.syncMusic(state);
  }

  syncMusic(state) {
    if (!this.audio) return;
    const inRun = state === StateManager.STATES.PLAYING || state === StateManager.STATES.TUTORIAL;
    this.audio.playMusic(inRun ? 'bgm_gameplay' : 'bgm_menu');
  }

  showTutorialTip(text) {
    if (this.dom.hudTutorialTipText) {
      this.dom.hudTutorialTipText.textContent = text;
    }
    if (this.dom.hudTutorialTip) {
      this.dom.hudTutorialTip.style.display = 'flex';
    }
  }

  hideTutorialTip() {
    if (this.dom.hudTutorialTip) {
      this.dom.hudTutorialTip.style.display = 'none';
    }
  }

  openTutorialModal(slide = 1) {
    if (!this.dom.tutorialModal) return;
    this.activeTutorialSlide = 1;
    this.dom.tutorialModal.classList.add('visible');
  }

  closeTutorialModal() {
    if (!this.dom.tutorialModal) return;
    this.dom.tutorialModal.classList.remove('visible');
  }

  /* =========================================================================
     PILOT PROFILE & REGISTRATION
     ========================================================================= */
  updateUserProfileNav() {
    if (!this.storage) return;
    const profile = this.storage.getPlayerProfile();
    const navNameEl = this.dom.menuProfileName || document.getElementById('menu-profile-name');
    const navRoleEl = this.dom.menuProfileRole || document.getElementById('menu-profile-role');
    if (navNameEl && profile) {
      navNameEl.textContent = profile.pilotName || 'SPIELER';
    }
    if (navRoleEl) {
      const isGuest = !(this.storage.hasAccount && this.storage.hasAccount());
      navRoleEl.hidden = !isGuest;
      navRoleEl.textContent = 'GAST';
    }
  }

  openProfileModal() {
    if (!this.dom.profileModal) return;
    const profile = this.storage.getPlayerProfile();
    const stats = this.storage.data.stats || {};
    
    const heroNameEl = document.getElementById('profile-hero-name');
    const idBadgeEl = document.getElementById('profile-user-id-badge');
    const nameEl = document.getElementById('profile-display-name');
    const idEl = document.getElementById('profile-display-id');
    const statusEl = document.getElementById('profile-status-badge');
    const hsEl = document.getElementById('profile-display-highscore');
    const dateEl = document.getElementById('profile-registered-date');
    const runsEl = document.getElementById('profile-runs-count');
    const inputEl = document.getElementById('profile-name-input');
    const msgEl = document.getElementById('profile-status-message');
    const noticeEl = document.getElementById('profile-change-notice');
    const saveBtn = document.getElementById('btn-profile-save');

    const nameChanges = typeof profile.nameChanges === 'number' ? profile.nameChanges : 0;
    const MAX_FREE_CHANGES = 2;
    const remaining = Math.max(0, MAX_FREE_CHANGES - nameChanges);

    if (heroNameEl) heroNameEl.textContent = profile.pilotName || 'SPIELER';
    const hasAccount = this.storage.hasAccount ? this.storage.hasAccount() : !!(profile && profile.passwordHash);
    if (idBadgeEl) {
      idBadgeEl.textContent = hasAccount ? 'ACCOUNT' : 'GAST';
      idBadgeEl.classList.toggle('guest', !hasAccount);
      idBadgeEl.classList.toggle('account', hasAccount);
    }
    if (nameEl) nameEl.textContent = profile.pilotName || 'SPIELER';
    if (idEl) idEl.textContent = profile.playerId || '';
    if (statusEl) {
      statusEl.textContent = hasAccount ? 'ACCOUNT' : 'GAST';
    }
    this.updateProfileAuthUI();
    if (hsEl) hsEl.textContent = `${this.storage.data.highScore || 0} m`;
    if (dateEl) {
      const d = profile.registeredAt ? new Date(profile.registeredAt).toLocaleDateString('de-DE') : 'Heute';
      dateEl.textContent = `Aktiv seit: ${d}`;
    }
    if (runsEl) runsEl.textContent = (stats.totalRuns || 0).toLocaleString('de-DE');

    if (inputEl) {
      inputEl.value = profile.pilotName || '';
      if (remaining <= 0) {
        inputEl.disabled = true;
        inputEl.style.opacity = '0.55';
        inputEl.style.cursor = 'not-allowed';
      } else {
        inputEl.disabled = false;
        inputEl.style.opacity = '1';
        inputEl.style.cursor = 'text';
      }
    }

    if (noticeEl) {
      if (remaining === 2) {
        noticeEl.textContent = 'NOCH 2 NAMENSÄNDERUNGEN VERFÜGBAR';
        noticeEl.style.color = '#10b981';
        noticeEl.style.background = 'rgba(16, 185, 129, 0.08)';
        noticeEl.style.borderColor = 'rgba(16, 185, 129, 0.25)';
      } else if (remaining === 1) {
        noticeEl.textContent = 'NOCH 1 NAMENSÄNDERUNG VERFÜGBAR';
        noticeEl.style.color = '#38bdf8';
        noticeEl.style.background = 'rgba(56, 189, 248, 0.08)';
        noticeEl.style.borderColor = 'rgba(56, 189, 248, 0.25)';
      } else {
        noticeEl.textContent = 'KEINE NAMENSÄNDERUNGEN MEHR VERFÜGBAR';
        noticeEl.style.color = '#64748b';
        noticeEl.style.background = 'rgba(255, 255, 255, 0.04)';
        noticeEl.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }
    }

    if (saveBtn) {
      if (remaining <= 0) {
        saveBtn.disabled = true;
        saveBtn.style.display = 'none';
      } else {
        saveBtn.disabled = false;
        saveBtn.style.display = 'inline-flex';
      }
    }

    if (msgEl) {
      msgEl.style.opacity = '0';
      msgEl.textContent = '';
    }

    this.updateUserProfileNav();
    this.dom.profileModal.classList.add('visible');
  }

  closeProfileModal() {
    if (this.dom.profileModal) this.dom.profileModal.classList.remove('visible');
  }

  updateProfileAuthUI() {
    const hasAccount = this.storage && this.storage.hasAccount ? this.storage.hasAccount() : false;
    const guestEl = document.getElementById('profile-auth-guest');
    const accountEl = document.getElementById('profile-auth-account');
    const loginNameEl = document.getElementById('profile-account-login-name');
    const profile = this.storage ? this.storage.getPlayerProfile() : null;

    if (guestEl) guestEl.hidden = hasAccount;
    if (accountEl) accountEl.hidden = !hasAccount;
    if (loginNameEl && profile) {
      const loginName = profile.accountName || profile.pilotName || '—';
      loginNameEl.textContent = `Login: ${loginName}`;
    }
  }

  saveProfile(e) {
    if (e) e.preventDefault();
    const inputEl = document.getElementById('profile-name-input');
    const name = inputEl ? inputEl.value : '';
    const res = this.storage.registerPlayer(name);
    
    const heroNameEl = document.getElementById('profile-hero-name');
    const msgEl = document.getElementById('profile-status-message');
    const noticeEl = document.getElementById('profile-change-notice');
    const saveBtn = document.getElementById('btn-profile-save');

    if (res && res.success) {
      const remaining = Math.max(0, 2 - (res.profile.nameChanges || 0));
      if (heroNameEl) heroNameEl.textContent = res.profile.pilotName;
      if (inputEl) {
        inputEl.value = res.profile.pilotName;
        if (remaining <= 0) {
          inputEl.disabled = true;
          inputEl.style.opacity = '0.55';
          inputEl.style.cursor = 'not-allowed';
        }
      }
      if (saveBtn) {
        if (remaining <= 0) {
          saveBtn.disabled = true;
          saveBtn.style.display = 'none';
        } else {
          saveBtn.disabled = false;
          saveBtn.style.display = 'inline-flex';
        }
      }
      if (noticeEl) {
        if (remaining === 1) {
          noticeEl.textContent = 'NOCH 1 NAMENSÄNDERUNG VERFÜGBAR';
          noticeEl.style.color = '#38bdf8';
          noticeEl.style.background = 'rgba(56, 189, 248, 0.08)';
          noticeEl.style.borderColor = 'rgba(56, 189, 248, 0.25)';
        } else {
          noticeEl.textContent = 'KEINE NAMENSÄNDERUNGEN MEHR VERFÜGBAR';
          noticeEl.style.color = '#64748b';
          noticeEl.style.background = 'rgba(255, 255, 255, 0.04)';
          noticeEl.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }
      }
      this.updateUserProfileNav();

      if (msgEl) {
        msgEl.textContent = 'PROFIL GESPEICHERT';
        msgEl.style.color = '#10b981';
        msgEl.style.opacity = '1';
        setTimeout(() => { if (msgEl) msgEl.style.opacity = '0'; }, 2000);
      }

    } else {
      if (msgEl) {
        msgEl.textContent = (res && res.message) || 'ÄNDERUNG NICHT MÖGLICH';
        msgEl.style.color = '#f59e0b';
        msgEl.style.opacity = '1';
        setTimeout(() => { if (msgEl) msgEl.style.opacity = '0'; }, 2000);
      }
    }
  }

  /* =========================================================================
     HUD UPDATES
     ========================================================================= */
  updateHUD(altitude, best, cores, multiplier = 1.0) {
    const alt = Number.isFinite(altitude) ? altitude : (this._cachedAlt || 0);
    const hi = Number.isFinite(best)
      ? best
      : (this.storage && this.storage.data ? this.storage.data.highScore : (this._cachedBest || 0));
    const coins = Number.isFinite(cores)
      ? cores
      : (this.storage && this.storage.data ? this.storage.data.cores : (this._cachedCores || 0));

    if (this._cachedAlt !== alt) {
      this._cachedAlt = alt;
      if (this.dom.altitudeVal) this.dom.altitudeVal.textContent = alt.toString();
    }

    const breaking = alt > 0 && alt >= hi;
    const shownBest = breaking ? alt : hi;
    if (this._cachedBestDisplay !== shownBest) {
      this._cachedBestDisplay = shownBest;
      if (this.dom.bestVal) this.dom.bestVal.textContent = `${shownBest}m`;
    }
    this._cachedBest = hi;

    const pct = breaking ? 100 : (hi > 0 ? Math.min(100, (alt / hi) * 100) : 0);
    const roundedPct = Math.round(pct * 10) / 10;
    if (this.dom.chaseFill && this._cachedChasePct !== roundedPct) {
      this._cachedChasePct = roundedPct;
      this.dom.chaseFill.style.width = `${roundedPct}%`;
    }

    if (this.dom.scoreContainer && this._cachedBreaking !== breaking) {
      this._cachedBreaking = breaking;
      this.dom.scoreContainer.classList.toggle('record-break', breaking);
    }

    const caption = breaking ? 'NEW BEST' : 'TO BEST';
    if (this.dom.chaseCaption && this._cachedChaseCap !== caption) {
      this._cachedChaseCap = caption;
      this.dom.chaseCaption.textContent = caption;
    }

    if (this._cachedCores !== coins) {
      this._cachedCores = coins;
      if (this.dom.orbsVal) this.dom.orbsVal.textContent = coins.toString();
    }
  }

  showComboBadge(text, color = '#a855f7') {
    if (this.dom.hudComboBadge) {
      this.dom.hudComboBadge.textContent = text;
      this.dom.hudComboBadge.style.color = color;
      this.dom.hudComboBadge.style.display = 'block';
    }
  }

  hideComboBadge() {
    if (this.dom.hudComboBadge) {
      this.dom.hudComboBadge.style.display = 'none';
    }
  }

  setSlowMoVisual(active) {
    if (this.dom.bulletBadge) {
      if (active) this.dom.bulletBadge.classList.add('active');
      else this.dom.bulletBadge.classList.remove('active');
    }
    if (this.dom.slowmoOverlay) {
      if (active) this.dom.slowmoOverlay.classList.add('active');
      else this.dom.slowmoOverlay.classList.remove('active');
    }
  }

  setDangerVisual(ratio) {
    if (this.dom.dangerOverlay) {
      const clamped = Math.round(Math.max(0, Math.min(0.9, ratio)) * 50) / 50;
      if (this._cachedDanger !== clamped) {
        this._cachedDanger = clamped;
        this.dom.dangerOverlay.style.opacity = clamped.toString();
      }
    }
  }

  showRecordFlash(previousBest, newAltitude) {
    const prev = Math.max(0, Math.round(Number(previousBest) || 0));
    const next = Math.max(prev, Math.round(Number(newAltitude) || prev));
    const fmt = (n) => n.toLocaleString('de-DE');

    if (this.dom.recordFxGateTag) {
      this.dom.recordFxGateTag.textContent = `BEST  ${fmt(prev)} m`;
    }
    if (this.dom.recordFxMeters) {
      this.dom.recordFxMeters.textContent = fmt(next);
    }

    const fx = this.dom.recordFx;
    if (fx) {
      fx.classList.remove('play');
      void fx.offsetWidth;
      fx.classList.add('play');
      clearTimeout(this._recordFxTimer);
      this._recordFxTimer = setTimeout(() => fx.classList.remove('play'), 3000);
    }

    const hud = this.dom.scoreContainer;
    if (hud) {
      hud.classList.remove('record-fx-pulse');
      void hud.offsetWidth;
      hud.classList.add('record-fx-pulse');
      clearTimeout(this._recordHudTimer);
      this._recordHudTimer = setTimeout(() => hud.classList.remove('record-fx-pulse'), 2800);
    }
  }

  updateActiveHUDQuest() {
    if (!this.missions || !this.dom.hudQuestTitle) return;
    const activeQuests = this.missions.getActiveQuests();
    if (activeQuests.length > 0) {
      const q = activeQuests[0];
      this.dom.hudQuestTitle.textContent = q.title;
      this.dom.hudQuestProgress.textContent = `${q.progress} / ${q.target}`;
      const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));
      if (this.dom.hudQuestFill) this.dom.hudQuestFill.style.width = `${pct}%`;
    }
  }

  /* =========================================================================
     GAME OVER SUMMARY & TRAJECTORY ANIMATION
     ========================================================================= */
  updateDebriefTrajectory(altitude, highScore, isNewRecord) {
    const tracePath = document.getElementById('debrief-trace-path');
    const tickRowCrash = document.getElementById('tick-row-crash');
    const tickRowHi = document.getElementById('tick-row-hi');
    const tickCrash = document.getElementById('debrief-tick-crash');
    const tickHi = document.getElementById('debrief-tick-hi');
    const tickTop = document.getElementById('debrief-tick-top');
    const tickMid = document.getElementById('debrief-tick-mid');

    const topAlt = Math.max(100, Math.round(Math.max(highScore, altitude) * 1.25));
    const midAlt = Math.round(topAlt * 0.5);

    if (tickTop) tickTop.textContent = String(topAlt);
    if (tickMid) tickMid.textContent = String(midAlt);
    if (tickHi) tickHi.textContent = String(highScore);
    if (tickCrash) tickCrash.textContent = String(altitude);

    // Coordinate mapping in SVG viewBox (120 x 932)
    // Base 000 m is at Y = 890
    // Ceiling topAlt is at Y = 160
    // Total vertical travel = 730
    const baseY = 890;
    const topY = 160;
    const travel = baseY - topY;

    const crashRatio = Math.max(0.04, Math.min(0.96, altitude / topAlt));
    const crashY = Math.round(baseY - (crashRatio * travel));
    const hiRatio = Math.max(0.04, Math.min(0.96, highScore / topAlt));
    const hiY = Math.round(baseY - (hiRatio * travel));

    // Dynamic X: gentle organic wander within the 80px rail column
    const crashX = Math.round(34 + (Math.sin(altitude * 0.08) * 8));

    // Generate wavy flight trajectory spline from (26, 890) up to (crashX, crashY)
    const points = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const py = Math.round(baseY + t * (crashY - baseY));
      // Organic slingshot curvature within rail bounds, dampened at endpoints
      const envelope = Math.sin(t * Math.PI);
      const wave = Math.sin(t * Math.PI * 2.2 + (altitude % 5)) * 10 * envelope;
      const px = Math.round(26 + (t * (crashX - 26)) + wave);
      points.push({ x: px, y: py });
    }

    // Build SVG Path d string with smooth cubic beziers
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cy1 = Math.round(p0.y + (p1.y - p0.y) * 0.45);
      const cy2 = Math.round(p0.y + (p1.y - p0.y) * 0.55);
      d += ` C ${p0.x} ${cy1}, ${p1.x} ${cy2}, ${p1.x} ${p1.y}`;
    }

    if (tracePath) {
      tracePath.setAttribute('d', d);
      let length = 900;
      try {
        if (typeof tracePath.getTotalLength === 'function') {
          length = Math.ceil(tracePath.getTotalLength());
        }
      } catch (e) {}
      tracePath.style.setProperty('--trace-length', `${length}`);
      tracePath.style.strokeDasharray = `${length}`;
      tracePath.style.strokeDashoffset = `${length}`;
    }

    // Position crash beacon group exactly on top of the terminal point of the trajectory line
    const endPoint = points[points.length - 1];
    const crashPos = document.getElementById('debrief-crash-pos');
    if (crashPos && endPoint) {
      crashPos.setAttribute('transform', `translate(${endPoint.x}, ${endPoint.y})`);
    }

    // Position rail ticks so crash tick aligns horizontally with crash dot
    // ViewBox height is 932
    if (tickRowCrash && endPoint) {
      const crashPct = ((endPoint.y / 932) * 100).toFixed(2);
      tickRowCrash.style.top = `${crashPct}%`;
    }

    if (tickRowHi) {
      if (isNewRecord || altitude >= highScore) {
        tickRowHi.style.display = 'none'; // Merged into crash tick
        if (tickRowCrash) tickRowCrash.classList.add('new-record-tick');
      } else {
        tickRowHi.style.display = 'flex';
        const hiPct = ((hiY / 932) * 100).toFixed(2);
        tickRowHi.style.top = `${hiPct}%`;
        if (tickRowCrash) tickRowCrash.classList.remove('new-record-tick');
      }
    }
  }

  populateGameOver(data = {}) {
    const altitude = data.altitude || 0;
    const cores = data.cores || 0;
    const crystals = data.crystals || 0;
    const isNewRecord = data.isNewRecord || false;
    const canRevive = data.canRevive !== false;
    const highScore = Math.max(altitude, (this.storage && this.storage.data && this.storage.data.highScore) || 0);
    const barPct = highScore > 0 ? Math.min(100, Math.round((altitude / highScore) * 100)) : 100;
    const seqId = ++this._debriefSeqId;

    this._lastDebrief = {
      altitude,
      cores,
      crystals,
      isNewRecord,
      highScore,
      grapples: data.grapples || 0,
      bestSwing: data.bestSwing || 0,
      flightTime: data.flightTime || '0:00',
      barPct
    };

    this.setDebriefInteractive(false);
    this._debriefAnimating = true;

    // Update dynamic trajectory line to actual crash point
    this.updateDebriefTrajectory(altitude, highScore, isNewRecord);

    // Reset and trigger sequenced arrival animation on the debrief card
    const debriefCard = document.getElementById('debrief-card');
    if (debriefCard) {
      debriefCard.classList.remove('play-seq', 'seq-done');
      void debriefCard.offsetWidth; // Force reflow to re-arm keyframe animations
      debriefCard.classList.add('play-seq');
    }

    this.armDebriefSequence(seqId);

    // Count-up helper (Tween with cubic-ease-out and delay)
    const animateCountUp = (element, targetValue, duration = 600, delay = 0, prefix = '+') => {
      if (!element) return;
      if (targetValue <= 0) {
        element.textContent = `${prefix}0`;
        return;
      }
      setTimeout(() => {
        if (seqId !== this._debriefSeqId) return;
        const startTime = performance.now();
        const step = (now) => {
          if (seqId !== this._debriefSeqId) return;
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(easeOut * targetValue);
          element.textContent = `${prefix}${current.toLocaleString('de-DE')}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            element.textContent = `${prefix}${targetValue.toLocaleString('de-DE')}`;
          }
        };
        requestAnimationFrame(step);
      }, delay);
    };

    // Hero Altitude Display (Counts up right when the trajectory line reaches crash beacon ~1600ms)
    const altVal = document.getElementById('final-altitude-val');
    if (altVal) {
      altVal.textContent = '0';
      animateCountUp(altVal, altitude, 850, 1700, '');
    } else if (this.dom.finalAltitude) {
      const heroValClass = isNewRecord ? 'hero-altitude-val new-record' : 'hero-altitude-val';
      this.dom.finalAltitude.innerHTML = `<span class="${heroValClass}">${Number(altitude).toLocaleString('de-DE')}</span><span class="hero-altitude-unit">m</span>`;
    }

    // Currency Count-up (Starts when in-flight loot row appears ~3650ms)
    const finalOrbsEl = document.getElementById('final-orbs') || this.dom.finalOrbs;
    const finalCrystalsEl = document.getElementById('final-crystals') || this.dom.finalCrystals;
    if (finalOrbsEl) animateCountUp(finalOrbsEl, cores, 600, 3650, '+');
    if (finalCrystalsEl) animateCountUp(finalCrystalsEl, crystals, 600, 3650, '+');

    // Record Chase Bar & Gap
    const finalBest = document.getElementById('final-best');
    if (finalBest) {
      finalBest.textContent = `${Number(highScore).toLocaleString('de-DE')} m`;
    } else if (this.dom.finalBest) {
      this.dom.finalBest.textContent = `${Number(highScore).toLocaleString('de-DE')} m`;
    }

    const barFill = document.getElementById('debrief-bar-fill');
    const gapText = document.getElementById('debrief-gap-text');
    if (barFill) {
      barFill.style.width = '0%';
      setTimeout(() => {
        if (seqId !== this._debriefSeqId) return;
        barFill.style.width = `${barPct}%`;
      }, 2550);
    }
    if (gapText) {
      if (isNewRecord || altitude >= highScore) {
        gapText.textContent = 'NEUER REKORD!';
        gapText.className = 'debrief-gapline new-rec';
      } else {
        const gap = Math.max(0, highScore - altitude);
        gapText.innerHTML = `Nur <em>${gap.toLocaleString('de-DE')} m</em> bis zum neuen Rekord.`;
        gapText.className = 'debrief-gapline';
      }
    }

    // Telemetry 3-Column Stats
    const statGrapples = document.getElementById('debrief-stat-grapples');
    if (statGrapples) statGrapples.textContent = String(data.grapples || 0);

    const statSwing = document.getElementById('debrief-stat-swing');
    if (statSwing) statSwing.textContent = String(Number(data.bestSwing || 0).toLocaleString('de-DE'));

    const statTime = document.getElementById('debrief-stat-time');
    if (statTime) statTime.textContent = data.flightTime || '0:00';

    // Interactive Revive Section
    const currentCrystals = (this.storage && this.storage.data && this.storage.data.hyperCrystals) || 0;
    const btnRevive = document.getElementById('btn-gameover-revive');
    const reviveBtnText = document.getElementById('revive-btn-text') || this.dom.reviveBtnText;
    const reviveAltDisplay = document.getElementById('revive-alt-display');
    if (reviveAltDisplay) {
      reviveAltDisplay.textContent = Number(altitude).toLocaleString('de-DE');
    }

    if (btnRevive) {
      if (canRevive && currentCrystals >= 1) {
        btnRevive.disabled = false;
        btnRevive.classList.remove('disabled');
        if (reviveBtnText) reviveBtnText.textContent = 'ZWEITE CHANCE';
      } else {
        btnRevive.disabled = true;
        btnRevive.classList.add('disabled');
        if (reviveBtnText && !canRevive) {
          reviveBtnText.textContent = 'BEREITS GENUTZT';
        } else if (reviveBtnText && currentCrystals < 1) {
          reviveBtnText.textContent = 'KEINE SPARKS';
        }
      }
    }

    // Configure Interactive Revive Section (Second Chance)
    if (this.dom.reviveBox) {
      this.dom.reviveBox.style.display = 'block';

      if (canRevive) {
        if (this.dom.reviveBtnText) {
          this.dom.reviveBtnText.textContent = 'ZWEITE CHANCE';
        }
        if (this.dom.reviveCostTag) {
          this.dom.reviveCostTag.style.display = 'inline-flex';
        }

        if (currentCrystals >= 1) {
          if (this.dom.btnGameOverRevive) {
            this.dom.btnGameOverRevive.disabled = false;
          }
          if (this.dom.reviveStatusText) {
            this.dom.reviveStatusText.textContent = '1x pro Flug';
          }
        } else {
          if (this.dom.btnGameOverRevive) {
            this.dom.btnGameOverRevive.disabled = true;
          }
          if (this.dom.reviveStatusText) {
            this.dom.reviveStatusText.textContent = 'Finde seltene Sparks im Tiefraum!';
          }
        }
      } else {
        // Already used revive in this round
        if (this.dom.btnGameOverRevive) {
          this.dom.btnGameOverRevive.disabled = true;
        }
        if (this.dom.reviveBtnText) {
          this.dom.reviveBtnText.textContent = 'BEREITS GENUTZT';
        }
        if (this.dom.reviveCostTag) {
          this.dom.reviveCostTag.style.display = 'none';
        }
        if (this.dom.reviveStatusText) {
          this.dom.reviveStatusText.textContent = 'Bereits genutzt';
        }
      }
    }

  }

  isDebriefInteractive() {
    if (!this._debriefReady) return false;
    if (this._debriefSkipGuardUntil && performance.now() < this._debriefSkipGuardUntil) return false;
    return true;
  }

  initDebriefInteraction() {
    const modal = this.dom.gameoverModal;
    if (!modal || this._debriefSkipBound) return;
    this._debriefSkipBound = true;

    const swallowIfLocked = (e) => {
      if (this.isDebriefInteractive()) return;
      e.preventDefault();
      e.stopPropagation();
    };

    modal.addEventListener('pointerdown', (e) => {
      if (!this._debriefAnimating) return;
      swallowIfLocked(e);
      this.skipDebriefSequence();
    }, true);

    modal.addEventListener('click', swallowIfLocked, true);
  }

  setDebriefInteractive(ready) {
    this._debriefReady = !!ready;
    if (ready) this._debriefAnimating = false;
    const card = document.getElementById('debrief-card');
    if (card) card.classList.toggle('seq-done', !!ready);
    const actions = document.getElementById('debrief-actions');
    if (actions) {
      if ('inert' in actions) actions.inert = !ready;
      actions.style.pointerEvents = ready ? '' : 'none';
      actions.querySelectorAll('button').forEach((btn) => {
        if (!ready) {
          btn.disabled = true;
          return;
        }
        if (btn.id === 'btn-gameover-revive' && btn.classList.contains('disabled')) {
          btn.disabled = true;
          return;
        }
        btn.disabled = false;
      });
    }
  }

  armDebriefSequence(seqId) {
    const actions = document.getElementById('debrief-actions');
    if (actions) {
      const onEnd = (e) => {
        if (e.animationName !== 'debrief-row-in') return;
        if (seqId !== this._debriefSeqId) return;
        actions.removeEventListener('animationend', onEnd);
        this.setDebriefInteractive(true);
      };
      actions.addEventListener('animationend', onEnd);
    }
    setTimeout(() => {
      if (seqId !== this._debriefSeqId) return;
      if (!this._debriefReady) this.setDebriefInteractive(true);
    }, 4900);
  }

  applyDebriefFinalValues() {
    const d = this._lastDebrief;
    if (!d) return;
    const altVal = document.getElementById('final-altitude-val');
    if (altVal) altVal.textContent = Number(d.altitude || 0).toLocaleString('de-DE');
    const orbsEl = document.getElementById('final-orbs') || this.dom.finalOrbs;
    if (orbsEl) orbsEl.textContent = `+${Number(d.cores || 0).toLocaleString('de-DE')}`;
    const crystalsEl = document.getElementById('final-crystals') || this.dom.finalCrystals;
    if (crystalsEl) crystalsEl.textContent = `+${Number(d.crystals || 0).toLocaleString('de-DE')}`;
    const barFill = document.getElementById('debrief-bar-fill');
    if (barFill) barFill.style.width = `${d.barPct || 0}%`;
  }

  skipDebriefSequence() {
    if (this._debriefReady) return;
    this._debriefSeqId += 1;
    this._debriefAnimating = false;
    const card = document.getElementById('debrief-card');
    if (card) {
      card.classList.remove('play-seq');
      card.classList.add('seq-done');
    }
    this.applyDebriefFinalValues();
    this._debriefSkipGuardUntil = performance.now() + 350;
    setTimeout(() => this.setDebriefInteractive(true), 90);
  }

  cancelDebriefSequence() {
    this._debriefSeqId += 1;
    this._debriefAnimating = false;
    this._debriefReady = false;
    const card = document.getElementById('debrief-card');
    if (card) card.classList.remove('play-seq', 'seq-done');
    const actions = document.getElementById('debrief-actions');
    if (actions) {
      if ('inert' in actions) actions.inert = true;
      actions.style.pointerEvents = 'none';
    }
  }

  async shareGameOverRun() {
    const data = this._lastDebrief || {};
    const alt = Number(data.altitude || 0).toLocaleString('de-DE');
    const shareText = `Space Jump: ${alt}m Flugdistanz gemeistert! Kannst du mich schlagen?`;
    let file = null;
    try {
      file = await this.buildHighscoreShareFile(data);
    } catch (e) {
      file = null;
    }

    if (file && navigator.share) {
      const withFile = { title: 'Space Jump', text: shareText, files: [file] };
      try {
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share(withFile);
          return { ok: true };
        }
      } catch (e) {
        if (e && e.name === 'AbortError') return { ok: false, aborted: true };
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Space Jump', text: shareText, url: window.location.href });
        return { ok: true };
      } catch (e) {
        if (e && e.name === 'AbortError') return { ok: false, aborted: true };
      }
    }

    if (file && navigator.clipboard && window.ClipboardItem) {
      try {
        const blob = file instanceof Blob ? file : new Blob([file], { type: 'image/png' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
            'text/plain': new Blob([shareText], { type: 'text/plain' })
          })
        ]);
        return { ok: true, copied: true };
      } catch (e) {}
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        return { ok: true, copied: true };
      } catch (e) {}
    }
    return { ok: false };
  }

  async buildHighscoreShareFile(data = {}) {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (e) {}
    }
    const w = 1080;
    const h = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const altitude = Number(data.altitude || 0);
    const highScore = Number(data.highScore || altitude);
    const isNewRecord = !!(data.isNewRecord || altitude >= highScore);
    const fmt = (n) => Number(n || 0).toLocaleString('de-DE');
    let profileName = 'Pilot';
    try {
      const profile = this.storage && this.storage.getPlayerProfile ? this.storage.getPlayerProfile() : null;
      profileName = (profile && (profile.pilotName || profile.accountName)) || profileName;
    } catch (e) {}

    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.28, 40, w * 0.5, h * 0.4, 900);
    bg.addColorStop(0, '#121a33');
    bg.addColorStop(1, '#050810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffffff';
    const starSeed = (altitude * 13 + 17) % 97;
    for (let i = 0; i < 70; i++) {
      const sx = ((i * 137 + starSeed * 11) % 1080);
      const sy = ((i * 89 + starSeed * 7) % 1350);
      const sr = (i % 5 === 0) ? 2.1 : 1.15;
      ctx.globalAlpha = 0.18 + (i % 6) * 0.08;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const pathEl = document.getElementById('debrief-trace-path');
    if (pathEl && typeof Path2D === 'function') {
      try {
        const d = pathEl.getAttribute('d');
        if (d) {
          ctx.save();
          ctx.translate(72, 110);
          ctx.scale(1.05, 1.15);
          const grad = ctx.createLinearGradient(0, 890, 0, 160);
          grad.addColorStop(0, 'rgba(56,232,255,0.18)');
          grad.addColorStop(0.6, 'rgba(56,232,255,0.9)');
          grad.addColorStop(1, '#e11d48');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 3.2;
          ctx.lineCap = 'round';
          ctx.stroke(new Path2D(d));
          ctx.restore();
        }
      } catch (e) {}
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = '#8b93b8';
    ctx.font = '700 28px Rajdhani, sans-serif';
    ctx.fillText('SPACE JUMP', 220, 160);
    ctx.fillStyle = '#64748b';
    ctx.font = '600 24px Rajdhani, sans-serif';
    ctx.fillText(String(profileName).slice(0, 18).toUpperCase(), 220, 198);

    ctx.fillStyle = '#8b93b8';
    ctx.font = '700 22px Rajdhani, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillText('FLUGDISTANZ', 220, 310);

    ctx.letterSpacing = '0px';
    const scoreGrad = ctx.createLinearGradient(220, 340, 220, 520);
    scoreGrad.addColorStop(0, '#ffffff');
    scoreGrad.addColorStop(1, '#a9b6e8');
    ctx.fillStyle = scoreGrad;
    ctx.font = '900 168px Orbitron, sans-serif';
    ctx.fillText(fmt(altitude), 210, 500);
    const scoreWidth = ctx.measureText(fmt(altitude)).width;
    ctx.fillStyle = '#38e8ff';
    ctx.font = '700 42px Rajdhani, sans-serif';
    ctx.fillText('m', 230 + scoreWidth, 488);

    if (isNewRecord) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 36px Rajdhani, sans-serif';
      ctx.fillText('NEUER REKORD', 220, 570);
    } else {
      const gap = Math.max(0, highScore - altitude);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 28px Rajdhani, sans-serif';
      ctx.fillText(`Nur ${fmt(gap)} m bis zum neuen Rekord.`, 220, 570);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '700 22px Rajdhani, sans-serif';
    ctx.fillText('BEST', 220, 640);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 28px Orbitron, sans-serif';
    ctx.fillText(`${fmt(highScore)} m`, 300, 642);

    const barX = 220;
    const barY = 670;
    const barW = 760;
    const barH = 10;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = isNewRecord ? '#fbbf24' : '#38e8ff';
    ctx.fillRect(barX, barY, barW * Math.max(0.04, Math.min(1, (data.barPct || 0) / 100)), barH);

    const stats = [
      { k: 'GRAPPLES', v: String(data.grapples || 0) },
      { k: 'BESTER SWING', v: `${fmt(data.bestSwing)} m` },
      { k: 'FLUGZEIT', v: data.flightTime || '0:00' }
    ];
    stats.forEach((s, i) => {
      const x = 220 + i * 270;
      ctx.fillStyle = '#64748b';
      ctx.font = '700 18px Rajdhani, sans-serif';
      ctx.fillText(s.k, x, 760);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 40px Orbitron, sans-serif';
      ctx.fillText(s.v, x, 812);
    });

    ctx.fillStyle = '#fbbf24';
    ctx.font = '700 32px Rajdhani, sans-serif';
    ctx.fillText(`C  +${fmt(data.cores)}`, 220, 900);
    ctx.fillStyle = '#e879f9';
    ctx.fillText(`+${fmt(data.crystals)}  Sparks`, 430, 900);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 24px Rajdhani, sans-serif';
    ctx.fillText('Kannst du mich schlagen?', 220, 1240);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return null;
    return new File([blob], 'space-jump-flugdistanz.png', { type: 'image/png' });
  }

  /* =========================================================================
     DEDICATED MODALS (LEADERBOARD, QUESTS & STATS)
     ========================================================================= */
  populateLifetimeStats() {
    this.updateCurrency();
    this.renderStats();
  }

  updateCurrency(fullUpdate = true) {
    const cores = (this.storage && this.storage.data && this.storage.data.cores != null)
      ? this.storage.data.cores.toString()
      : '0';

    if (this._cachedHudCores !== cores) {
      this._cachedHudCores = cores;
      if (this.dom.orbsVal) this.dom.orbsVal.textContent = cores;
      if (this.dom.hudCoresVal) this.dom.hudCoresVal.textContent = cores;
    }

    if (!fullUpdate) return;

    const crystals = (this.storage && this.storage.data && this.storage.data.hyperCrystals != null)
      ? this.storage.data.hyperCrystals.toString()
      : '0';

    if (this.dom.menuCurrencyVal) this.dom.menuCurrencyVal.textContent = cores;
    if (this.dom.menuCrystalsVal) this.dom.menuCrystalsVal.textContent = crystals;
    this.updateUserProfileNav();
    this.updateUnclaimedBadges();
    this.updateMenuRank();
  }

  getPlayerRankNumber() {
    const bestAltitude = (this.storage && this.storage.data && this.storage.data.highScore) || 0;
    if (bestAltitude <= 0) return null;

    const profile = (this.storage && this.storage.getPlayerProfile) ? this.storage.getPlayerProfile() : {};
    const playerName = profile.pilotName || 'Player';
    const playerId = (profile.playerId || '').toUpperCase();
    const remote = Array.isArray(this._remoteLeaderboard) ? this._remoteLeaderboard : null;

    const playerBestMap = new Map();
    const storedRuns = (remote || ((this.storage && this.storage.data && this.storage.data.leaderboard) || [])).map(r => {
      const entryId = String(r.playerId || r.player_id || '').toUpperCase();
      const isPlayer = remote
        ? !!(playerId && entryId && entryId === playerId)
        : (r.name === playerName || !r.name || (typeof r.name === 'string' && r.name.includes('(DU)')));
      return {
        name: r.name || playerName,
        altitude: Math.floor(Number(r.altitude) || 0),
        playerId: r.playerId || r.player_id || '',
        isPlayer
      };
    });

    storedRuns.push({
      name: playerName,
      altitude: bestAltitude,
      playerId: profile.playerId || '',
      isPlayer: true
    });

    storedRuns.forEach(r => {
      const key = r.isPlayer ? '__CURRENT_PLAYER__' : ((r.playerId || r.name || 'Contender').toString().trim());
      const existing = playerBestMap.get(key);
      if (!existing || r.altitude > existing.altitude) {
        playerBestMap.set(key, {
          altitude: r.altitude,
          isPlayer: r.isPlayer
        });
      }
    });

    const displayList = Array.from(playerBestMap.values());
    displayList.sort((a, b) => b.altitude - a.altitude);
    const fullRank = displayList.findIndex(e => e.isPlayer) + 1;
    return fullRank > 0 ? fullRank : null;
  }

  updateMenuRank() {
    if (!this.dom.rankPillBadge) return;
    const rank = this.getPlayerRankNumber();
    if (rank) {
      this.dom.rankPillBadge.textContent = `#${rank}`;
      this.dom.rankPillBadge.style.display = '';
      this.dom.rankPillBadge.classList.remove('unranked');
    } else {
      this.dom.rankPillBadge.textContent = '';
      this.dom.rankPillBadge.style.display = 'none';
      this.dom.rankPillBadge.classList.add('unranked');
    }
  }

  updateUnclaimedBadges() {
    if (!this.missions) return;
    const unclaimed = this.missions.getUnclaimedCount();
    if (this.dom.questsTabBadge) {
      this.dom.questsTabBadge.textContent = unclaimed.toString();
      this.dom.questsTabBadge.style.display = unclaimed > 0 ? 'inline-block' : 'none';
    }
    if (this.dom.menuStatsBadge) {
      this.dom.menuStatsBadge.textContent = `${unclaimed} BEREIT`;
      this.dom.menuStatsBadge.style.display = unclaimed > 0 ? 'inline-block' : 'none';
    }
    if (this.dom.menuQuestsBadge) {
      this.dom.menuQuestsBadge.textContent = `${unclaimed}`;
      this.dom.menuQuestsBadge.style.display = unclaimed > 0 ? 'flex' : 'none';
    }

    const dailies = this.missions.getDailyQuests() || [];
    const weeklies = this.missions.getWeeklyQuests() || [];
    const unclaimedDailies = dailies.filter(q => q.isComplete && !q.isClaimed).length;
    const unclaimedWeeklies = weeklies.filter(q => q.isComplete && !q.isClaimed).length;
    if (this.dom.dotUnclaimedDaily) {
      this.dom.dotUnclaimedDaily.style.display = unclaimedDailies > 0 ? 'block' : 'none';
    }
    if (this.dom.dotUnclaimedWeekly) {
      this.dom.dotUnclaimedWeekly.style.display = unclaimedWeeklies > 0 ? 'block' : 'none';
    }
  }

  renderGlobalLeaderboard() {
    this.renderLeaderboard();
  }

  async refreshRemoteLeaderboard() {
    const backend = this.storage && this.storage.getCloudBackend ? this.storage.getCloudBackend() : null;
    if (!backend || typeof backend.fetchLeaderboard !== 'function') {
      this._remoteLeaderboard = null;
      return null;
    }
    const res = await backend.fetchLeaderboard();
    if (res && res.ok && Array.isArray(res.entries)) {
      this._remoteLeaderboard = res.entries;
      return res.entries;
    }
    this._remoteLeaderboard = null;
    return null;
  }

  renderLeaderboard() {
    if (!this.dom.globalLeaderboardList) return;
    this._leaderboardRenderGen += 1;
    const gen = this._leaderboardRenderGen;
    this.paintLeaderboard(this._remoteLeaderboard);
    this.refreshRemoteLeaderboard().then((remote) => {
      if (gen !== this._leaderboardRenderGen) return;
      this.paintLeaderboard(remote);
      this.updateMenuRank();
    }).catch(() => {});
  }

  paintLeaderboard(remoteEntries) {
    if (!this.dom.globalLeaderboardList) return;
    this.dom.globalLeaderboardList.innerHTML = '';

    const profile = this.storage.getPlayerProfile();
    const playerName = profile.pilotName || 'Player';
    const playerId = (profile.playerId || '').toUpperCase();
    const bestAltitude = this.storage.data.highScore || 0;
    const remote = Array.isArray(remoteEntries) ? remoteEntries : null;
    const sharedBoard = !!remote;

    const playerBestMap = new Map();
    const sourceRuns = remote || (this.storage.data.leaderboard || []);
    const storedRuns = sourceRuns.map(r => {
      const entryId = String(r.playerId || r.player_id || '').toUpperCase();
      const altitude = Math.floor(Number(r.altitude) || 0);
      const isPlayer = remote
        ? !!(playerId && entryId && entryId === playerId)
        : (r.name === playerName || !r.name || (typeof r.name === 'string' && r.name.includes('(DU)')));
      return {
        name: r.name || playerName,
        altitude,
        country: r.country || 'DE',
        countryName: r.countryName || 'Deutschland',
        playerId: r.playerId || r.player_id || null,
        isPlayer
      };
    });

    if (bestAltitude > 0) {
      storedRuns.push({
        name: playerName,
        altitude: bestAltitude,
        country: 'DE',
        countryName: 'Deutschland',
        playerId: profile.playerId || null,
        isPlayer: true
      });
    }

    storedRuns.forEach(r => {
      const key = r.isPlayer
        ? '__CURRENT_PLAYER__'
        : ((r.playerId || r.name || '').toString().trim() || 'Contender');
      const existing = playerBestMap.get(key);
      if (!existing || r.altitude > existing.altitude) {
        playerBestMap.set(key, {
          name: r.isPlayer ? `${playerName} (DU)` : r.name,
          altitude: r.altitude,
          country: r.country,
          countryName: r.countryName,
          isPlayer: r.isPlayer
        });
      }
    });

    const displayList = Array.from(playerBestMap.values());
    displayList.sort((a, b) => b.altitude - a.altitude);
    const top100 = displayList.slice(0, 100);

    // Assign ranking numbers
    top100.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    if (top100.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'lb-empty-state';
      const emptyTitle = document.createElement('div');
      emptyTitle.className = 'lb-empty-title';
      emptyTitle.textContent = sharedBoard ? 'KEINE GEMEINSAMEN EINTRÄGE' : 'KEINE EINTRÄGE';
      const emptyDesc = document.createElement('div');
      emptyDesc.className = 'lb-empty-desc';
      emptyDesc.textContent = sharedBoard
        ? 'Lege einen Account an und fliege, um auf der Bestenliste zu stehen.'
        : 'Starte deinen ersten Flug, um gewertet zu werden.';
      emptyBox.appendChild(emptyTitle);
      emptyBox.appendChild(emptyDesc);
      this.dom.globalLeaderboardList.appendChild(emptyBox);
    } else {
      // Names are player-supplied and also arrive from the cloud sync API, so cells are
      // built as text nodes instead of interpolated into markup.
      const makeCell = (className, text) => {
        const cell = document.createElement('div');
        cell.className = className;
        cell.textContent = text;
        return cell;
      };

      top100.forEach(entry => {
        const row = document.createElement('div');
        const rankClass = entry.rank <= 3 ? `top-rank-${entry.rank}` : '';
        const playerClass = entry.isPlayer ? 'player-entry' : '';
        row.className = `leaderboard-row ${rankClass} ${playerClass}`.trim();
        // Strictly 3 columns: Rank, Name, Metres
        row.appendChild(makeCell('lb-rank', `#${entry.rank}`));
        row.appendChild(makeCell('lb-name', entry.name));
        row.appendChild(makeCell('lb-alt', `${entry.altitude.toLocaleString('de-DE')} m`));
        this.dom.globalLeaderboardList.appendChild(row);
      });
    }

    // Sticky Player Rank Card
    const scopeLabel = sharedBoard ? 'GETEILT (TOP 100)' : 'GERÄT';
    const playerEntry = top100.find(e => e.isPlayer);
    let rankDisplay = '#---';
    let titleDisplay = scopeLabel;
    let deltaDisplay = 'Absolviere einen Flug zur Wertung';

    if (playerEntry) {
      rankDisplay = `#${playerEntry.rank}`;
      titleDisplay = `RANG #${playerEntry.rank} • ${scopeLabel}`;
      deltaDisplay = `Bestleistung: ${bestAltitude.toLocaleString('de-DE')} m`;
    } else if (bestAltitude > 0) {
      const fullRank = displayList.findIndex(e => e.isPlayer) + 1;
      rankDisplay = fullRank > 0 ? `#${fullRank}` : '#---';
      titleDisplay = fullRank > 0 ? `RANG #${fullRank} • ${scopeLabel}` : scopeLabel;
      deltaDisplay = `Bestleistung: ${bestAltitude.toLocaleString('de-DE')} m`;
    }

    if (this.dom.playerRankBadge) {
      this.dom.playerRankBadge.textContent = rankDisplay;
    }
    if (this.dom.playerRankPercentile) {
      this.dom.playerRankPercentile.textContent = titleDisplay;
    }
    if (this.dom.playerRankDelta) {
      this.dom.playerRankDelta.textContent = deltaDisplay;
    }
    if (this.dom.rankPillBadge) {
      const isRanked = Boolean(playerEntry || (bestAltitude > 0 && displayList.some(e => e.isPlayer)));
      if (isRanked && rankDisplay && rankDisplay !== '#---') {
        this.dom.rankPillBadge.textContent = rankDisplay;
        this.dom.rankPillBadge.style.display = '';
        this.dom.rankPillBadge.classList.remove('unranked');
      } else {
        this.dom.rankPillBadge.textContent = '';
        this.dom.rankPillBadge.style.display = 'none';
        this.dom.rankPillBadge.classList.add('unranked');
      }
    }
  }

  initMissionTabsUI() {
    const tabs = [
      { id: 'tab-missions-all', type: 'all' },
      { id: 'tab-missions-daily', type: 'daily' },
      { id: 'tab-missions-weekly', type: 'weekly' }
    ];

    tabs.forEach(({ id, type }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.activeMissionTab = type;
          tabs.forEach(t => {
            const b = document.getElementById(t.id);
            if (b) b.classList.toggle('active', t.type === type);
          });
          this.filterMissionSections();
        });
      }
    });
  }

  filterMissionSections() {
    const secDaily = document.getElementById('section-daily-quests');
    const secWeekly = document.getElementById('section-weekly-quests');
    if (!secDaily || !secWeekly) return;

    if (this.activeMissionTab === 'daily') {
      secDaily.style.display = 'block';
      secWeekly.style.display = 'none';
    } else if (this.activeMissionTab === 'weekly') {
      secDaily.style.display = 'none';
      secWeekly.style.display = 'block';
    } else {
      secDaily.style.display = 'block';
      secWeekly.style.display = 'block';
    }
  }

  renderChallenges() {
    if (!this.missions) return;

    if (this.dom.dailyResetTimer) {
      this.dom.dailyResetTimer.textContent = `Reset in ${this.missions.getDailyTimeRemaining()}`;
    }
    if (this.dom.weeklyResetTimer) {
      this.dom.weeklyResetTimer.textContent = `Reset in ${this.missions.getWeeklyTimeRemaining()}`;
    }

    const dailies = this.missions.getDailyQuests() || [];
    const weeklies = this.missions.getWeeklyQuests() || [];
    const allQuests = [...dailies, ...weeklies];
    const totalCount = allQuests.length;
    const unclaimedDailies = dailies.filter(q => q.isComplete && !q.isClaimed).length;
    const unclaimedWeeklies = weeklies.filter(q => q.isComplete && !q.isClaimed).length;
    // Update Tab Count Badges & Notification Dots
    if (this.dom.badgeCountAll) this.dom.badgeCountAll.textContent = totalCount.toString();
    if (this.dom.badgeCountDaily) this.dom.badgeCountDaily.textContent = dailies.length.toString();
    if (this.dom.badgeCountWeekly) this.dom.badgeCountWeekly.textContent = weeklies.length.toString();
    if (this.dom.dotUnclaimedDaily) this.dom.dotUnclaimedDaily.style.display = unclaimedDailies > 0 ? 'block' : 'none';
    if (this.dom.dotUnclaimedWeekly) this.dom.dotUnclaimedWeekly.style.display = unclaimedWeeklies > 0 ? 'block' : 'none';

    // Daily Quests List
    if (this.dom.dailyQuestsList) {
      this.dom.dailyQuestsList.innerHTML = '';
      dailies.forEach(q => {
        const card = this.createChallengeCard(q);
        this.dom.dailyQuestsList.appendChild(card);
      });
    }

    // Weekly Quests List
    if (this.dom.weeklyQuestsList) {
      this.dom.weeklyQuestsList.innerHTML = '';
      weeklies.forEach(q => {
        const card = this.createChallengeCard(q);
        this.dom.weeklyQuestsList.appendChild(card);
      });
    }

    this.filterMissionSections();
  }

  createChallengeCard(q) {
    const card = document.createElement('div');
    const isReady = q.isComplete && !q.isClaimed;
    card.className = `quest-card ${isReady ? 'ready-to-claim' : ''} ${q.isClaimed ? 'is-claimed' : ''}`;
    card.setAttribute('data-id', q.id);

    const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));
    const statusDigits = `${q.progress.toLocaleString('de-DE')} / ${q.target.toLocaleString('de-DE')}`;

    let actionMarkup = '';
    if (q.isClaimed) {
      actionMarkup = `
        <div class="quest-claimed-badge">
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>EINGELÖST</span>
        </div>
      `;
    } else {
      actionMarkup = `
        <div class="quest-reward-pill">
          <span class="reward-plus">+</span>
          <span class="reward-val">${q.reward.toLocaleString('de-DE')}</span>
          ${UIManager.COIN_SVG}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="quest-card-header">
        <span class="quest-card-title">${q.title || q.description}</span>
        <div class="quest-card-reward">${actionMarkup}</div>
      </div>
      <div class="quest-card-desc">${q.description}</div>
      <div class="quest-meter-container">
        <div class="quest-bar-bg">
          <div class="quest-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="quest-meter-info">
          <span class="quest-pct-label">${pct}%</span>
          <span class="quest-bar-text">${statusDigits}</span>
        </div>
      </div>
      ${isReady ? `
        <button class="btn-claim" data-id="${q.id}" type="button">
          <svg class="claim-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span class="claim-btn-text">BELOHNUNG EINSAMMELN</span>
          <span class="claim-btn-reward">+${q.reward.toLocaleString('de-DE')} ${UIManager.COIN_SVG}</span>
        </button>
      ` : ''}
    `;

    const claimBtn = card.querySelector('.btn-claim');
    if (claimBtn) {
      claimBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const success = this.missions.claimReward(q.id);
        if (success) {
          this.updateCurrency();
          this.updateUnclaimedBadges();
          this.renderChallenges();
        }
      });
    }

    return card;
  }

  renderStats() {
    const stats = this.storage.data.stats;
    const totalRuns = stats.totalRuns || 0;
    const avgAlt = totalRuns > 0 ? Math.round(stats.lifetimeMeters / totalRuns) : 0;

    if (this.dom.statHighScore) this.dom.statHighScore.textContent = `${(this.storage.data.highScore || 0).toLocaleString('de-DE')} m`;
    if (this.dom.statLifetimeMeters) this.dom.statLifetimeMeters.textContent = `${(stats.lifetimeMeters || 0).toLocaleString('de-DE')} m`;
    if (this.dom.statTotalRuns) this.dom.statTotalRuns.textContent = totalRuns.toString();
    if (this.dom.statAvgAltitude) this.dom.statAvgAltitude.textContent = `${avgAlt.toLocaleString('de-DE')} m`;
    if (this.dom.statTotalCores) this.dom.statTotalCores.textContent = (stats.totalCoresCollected || 0).toString();
    if (this.dom.statTotalSlingshots) this.dom.statTotalSlingshots.textContent = (stats.totalSlingshots || 0).toString();
    if (this.dom.statTotalNearmisses) this.dom.statTotalNearmisses.textContent = (stats.totalNearMisses || 0).toString();
    if (this.dom.statCompletedQuests) this.dom.statCompletedQuests.textContent = (this.storage.data.completedQuestCount || 0).toString();
    if (this.dom.statBestCombo) this.dom.statBestCombo.textContent = `${stats.bestCombo || 0}x`;
    if (this.dom.statTotalCrystals) this.dom.statTotalCrystals.textContent = (stats.totalCrystalsCollected || 0).toString();
    if (this.dom.statTotalRevives) this.dom.statTotalRevives.textContent = (stats.totalRevives || 0).toString();
  }

  /* =========================================================================
     SETTINGS UI
     ========================================================================= */
  initSettingsUI() {
    if (this.dom.btnAudioToggle) {
      this.updateAudioToggleBtn();
      this.dom.btnAudioToggle.addEventListener('click', () => {
        this.toggleAudio();
      });
    }

    this.updateMusicVolumeUI();
    if (!this._volumeUiBound) {
      this._volumeUiBound = true;
      if (this.dom.sliderMusicVolume) {
        this.dom.sliderMusicVolume.addEventListener('input', (e) => {
          this.setMusicVolume(Number(e.target.value) / 100, false);
        });
        this.dom.sliderMusicVolume.addEventListener('change', (e) => {
          this.setMusicVolume(Number(e.target.value) / 100, true);
        });
      }
      if (this.dom.btnVolumeDown) {
        this.dom.btnVolumeDown.addEventListener('click', () => {
          this.nudgeMusicVolume(-0.1);
        });
      }
      if (this.dom.btnVolumeUp) {
        this.dom.btnVolumeUp.addEventListener('click', () => {
          this.nudgeMusicVolume(0.1);
        });
      }
    }

    if (this.dom.btnFpsToggle) {
      this.updateFpsToggleBtn();
      this.dom.btnFpsToggle.addEventListener('click', () => {
        this.toggleFps();
      });
    }

    if (this.dom.btnPerfToggle) {
      this.updatePerfToggleBtn();
      this.dom.btnPerfToggle.addEventListener('click', () => {
        this.togglePerfMode();
      });
    }

    // URL parameter auto-enable for profiling (?fps=1 or ?fps)
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const p = new URLSearchParams(window.location.search);
        if (p.has('fps')) {
          this.storage.data.settings.showFps = true;
          this.updateFpsToggleBtn();
        }
      }
    } catch (e) {}
  }

  initLegalUI() {
    if (this._legalUiBound) return;
    this._legalUiBound = true;
    document.querySelectorAll('[data-legal]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLegal(btn.getAttribute('data-legal') || 'impressum');
      });
    });
    document.querySelectorAll('[data-legal-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openLegal(btn.getAttribute('data-legal-tab') || 'impressum');
      });
    });
    const closeBtn = document.getElementById('btn-legal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLegal());
    }
  }

  openLegal(section) {
    const which = section === 'privacy' ? 'privacy' : 'impressum';
    if (this.dom.legalModal) this.dom.legalModal.classList.add('visible');
    const impressumTab = document.getElementById('legal-tab-impressum');
    const privacyTab = document.getElementById('legal-tab-privacy');
    const impressumPanel = document.getElementById('legal-panel-impressum');
    const privacyPanel = document.getElementById('legal-panel-privacy');
    if (impressumTab) impressumTab.classList.toggle('is-active', which === 'impressum');
    if (privacyTab) privacyTab.classList.toggle('is-active', which === 'privacy');
    if (impressumPanel) {
      impressumPanel.hidden = which !== 'impressum';
      impressumPanel.classList.toggle('is-active', which === 'impressum');
    }
    if (privacyPanel) {
      privacyPanel.hidden = which !== 'privacy';
      privacyPanel.classList.toggle('is-active', which === 'privacy');
    }
  }

  closeLegal() {
    if (this.dom.legalModal) this.dom.legalModal.classList.remove('visible');
  }

  toggleAudio() {
    const current = this.storage.data.settings.audioEnabled !== false;
    const next = !current;
    this.storage.data.settings.audioEnabled = next;
    this.storage.save();
    if (this.audio) {
      this.audio.enabled = next;
      if (next) {
        this.audio.init();
        this.audio.updateVolumes();
        this.syncMusic(this.state ? this.state.currentState : StateManager.STATES.MENU);
      } else {
        this.audio.stopMusic();
      }
    }
    this.updateAudioToggleBtn();
  }

  getStoredMusicVolume() {
    const fallback = (CONSTANTS.AUDIO && CONSTANTS.AUDIO.MUSIC_VOLUME_DEFAULT) || 0.55;
    const raw = this.storage && this.storage.data && this.storage.data.settings
      ? Number(this.storage.data.settings.musicVolume)
      : fallback;
    if (!Number.isFinite(raw)) return fallback;
    return Math.max(0, Math.min(1, raw));
  }

  nudgeMusicVolume(delta) {
    this.setMusicVolume(this.getStoredMusicVolume() + delta, true);
  }

  setMusicVolume(volume, persist) {
    const next = Math.max(0, Math.min(1, Number(volume) || 0));
    this.storage.data.settings.musicVolume = next;
    if (persist) this.storage.save();
    else this.storage.saveDeferred();
    if (this.audio) this.audio.updateVolumes();
    this.updateMusicVolumeUI();
  }

  updateMusicVolumeUI() {
    const pct = Math.round(this.getStoredMusicVolume() * 100);
    if (this.dom.sliderMusicVolume) this.dom.sliderMusicVolume.value = String(pct);
    if (this.dom.musicVolumeValue) this.dom.musicVolumeValue.textContent = `${pct}%`;
  }

  updateAudioToggleBtn() {
    if (!this.dom.btnAudioToggle) return;
    const isEnabled = this.storage.data.settings.audioEnabled !== false;
    this.dom.btnAudioToggle.textContent = isEnabled ? 'AN' : 'AUS';
    if (isEnabled) {
      this.dom.btnAudioToggle.style.color = '#ffffff';
      this.dom.btnAudioToggle.style.background = 'rgba(225, 29, 72, 0.22)';
      this.dom.btnAudioToggle.style.borderColor = 'var(--accent-crimson)';
      this.dom.btnAudioToggle.style.boxShadow = '0 0 12px var(--accent-crimson-glow)';
    } else {
      this.dom.btnAudioToggle.style.color = '#64748b';
      this.dom.btnAudioToggle.style.background = 'rgba(255, 255, 255, 0.04)';
      this.dom.btnAudioToggle.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      this.dom.btnAudioToggle.style.boxShadow = 'none';
    }
  }

  toggleFps() {
    const current = Boolean(this.storage.data.settings.showFps);
    const next = !current;
    this.storage.data.settings.showFps = next;
    this.storage.saveDeferred();
    this.updateFpsToggleBtn();
    if (this.dom.hudFpsBadge) {
      this.dom.hudFpsBadge.style.display = next ? 'flex' : 'none';
    }
    if (this.dom.menuFpsBadge) {
      this.dom.menuFpsBadge.style.display = next ? 'flex' : 'none';
    }
  }

  updateFpsToggleBtn() {
    if (!this.dom.btnFpsToggle) return;
    const isEnabled = Boolean(this.storage.data.settings.showFps);
    this.dom.btnFpsToggle.textContent = isEnabled ? 'AN' : 'AUS';
    if (isEnabled) {
      this.dom.btnFpsToggle.style.color = '#ffffff';
      this.dom.btnFpsToggle.style.background = 'rgba(225, 29, 72, 0.22)';
      this.dom.btnFpsToggle.style.borderColor = 'var(--accent-crimson)';
      this.dom.btnFpsToggle.style.boxShadow = '0 0 12px var(--accent-crimson-glow)';
    } else {
      this.dom.btnFpsToggle.style.color = '#64748b';
      this.dom.btnFpsToggle.style.background = 'rgba(255, 255, 255, 0.04)';
      this.dom.btnFpsToggle.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      this.dom.btnFpsToggle.style.boxShadow = 'none';
    }
  }

  togglePerfMode() {
    const current = Boolean(this.storage.data.settings.performanceMode);
    const next = !current;
    this.storage.data.settings.performanceMode = next;
    this.storage.saveDeferred();
    this.updatePerfToggleBtn();
  }

  updatePerfToggleBtn() {
    if (!this.dom.btnPerfToggle) return;
    const isEnabled = Boolean(this.storage.data.settings.performanceMode);
    this.dom.btnPerfToggle.textContent = isEnabled ? 'AN' : 'AUS';
    if (isEnabled) {
      this.dom.btnPerfToggle.style.color = '#ffffff';
      this.dom.btnPerfToggle.style.background = 'rgba(225, 29, 72, 0.22)';
      this.dom.btnPerfToggle.style.borderColor = 'var(--accent-crimson)';
      this.dom.btnPerfToggle.style.boxShadow = '0 0 12px var(--accent-crimson-glow)';
    } else {
      this.dom.btnPerfToggle.style.color = '#64748b';
      this.dom.btnPerfToggle.style.background = 'rgba(255, 255, 255, 0.04)';
      this.dom.btnPerfToggle.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      this.dom.btnPerfToggle.style.boxShadow = 'none';
    }
  }

  updateFpsDisplay(fps, dtMs, minFps) {
    const show = Boolean(this.storage && this.storage.data && this.storage.data.settings && this.storage.data.settings.showFps);

    // Update HUD Badge visibility
    if (this.dom.hudFpsBadge) {
      if (!show) {
        if (this.dom.hudFpsBadge.style.display !== 'none') this.dom.hudFpsBadge.style.display = 'none';
      } else {
        if (this.dom.hudFpsBadge.style.display !== 'flex') this.dom.hudFpsBadge.style.display = 'flex';
      }
    }

    // Update Menu Badge visibility
    if (this.dom.menuFpsBadge) {
      if (!show) {
        if (this.dom.menuFpsBadge.style.display !== 'none') this.dom.menuFpsBadge.style.display = 'none';
      } else {
        if (this.dom.menuFpsBadge.style.display !== 'flex') this.dom.menuFpsBadge.style.display = 'flex';
      }
    }

    if (!show) return;

    // High-Precision Real-Time Format: 1 decimal place reveals authentic sub-frame jitter
    const fpsStr = `${fps.toFixed(1)} FPS`;
    const dtStr = `${dtMs.toFixed(1)}ms`;

    // Tiered color & styling based on performance:
    // >= 90: Cyan (#38bdf8) ProMotion / High Refresh
    // >= 55: Emerald (#10b981) Solid target
    // >= 42: Amber (#fbbf24) Hitch warning
    // < 42: Carmine (#e11d48) Stutter danger
    let badgeClass = 'stat-badge fps';
    let valColor = '#10b981';

    if (fps >= 90) {
      badgeClass = 'stat-badge fps high-refresh';
      valColor = '#38bdf8';
    } else if (fps >= 55) {
      badgeClass = 'stat-badge fps';
      valColor = '#10b981';
    } else if (fps >= 42) {
      badgeClass = 'stat-badge fps warning';
      valColor = '#fbbf24';
    } else {
      badgeClass = 'stat-badge fps danger';
      valColor = '#e11d48';
    }

    // Debounced DOM updates with property caching to minimize browser layout churn
    if (this.dom.hudFpsVal && this._lastHudFpsText !== fpsStr) {
      this.dom.hudFpsVal.textContent = fpsStr;
      this.dom.hudFpsVal.style.color = valColor;
      this._lastHudFpsText = fpsStr;
    }
    if (this.dom.hudFpsDt && this._lastHudDtText !== dtStr) {
      this.dom.hudFpsDt.textContent = dtStr;
      this._lastHudDtText = dtStr;
    }
    if (this.dom.hudFpsBadge && this._lastHudBadgeClass !== badgeClass) {
      this.dom.hudFpsBadge.className = badgeClass;
      this._lastHudBadgeClass = badgeClass;
    }

    if (this.dom.menuFpsVal && this._lastMenuFpsText !== fpsStr) {
      this.dom.menuFpsVal.textContent = fpsStr;
      this.dom.menuFpsVal.style.color = valColor;
      this._lastMenuFpsText = fpsStr;
    }
    if (this.dom.menuFpsDt && this._lastMenuDtText !== dtStr) {
      this.dom.menuFpsDt.textContent = dtStr;
      this._lastMenuDtText = dtStr;
    }
    if (this.dom.menuFpsBadge && this._lastMenuBadgeClass !== badgeClass) {
      this.dom.menuFpsBadge.className = `stat-badge fps menu-fps-pill ${badgeClass.includes('high-refresh') ? 'high-refresh' : badgeClass.includes('warning') ? 'warning' : badgeClass.includes('danger') ? 'danger' : ''}`.trim();
      this._lastMenuBadgeClass = badgeClass;
    }
  }
}
