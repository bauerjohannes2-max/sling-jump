/**
 * Sling Jump - UIManager
 * Manages all HUD elements, Modals, State Transitions, Settings, Hangar UI,
 * Leaderboard & Quest notifications.
 * STRICT RULE: No Emojis - Pure Minimalist Vector UI & SVG Icons.
 */
class UIManager {
  static COIN_SVG = '<svg class="icon-svg coin-icon" viewBox="0 0 24 24" style="width:14px;height:14px;vertical-align:middle;display:inline-block;"><circle cx="12" cy="12" r="9.5" fill="rgba(251,191,36,0.18)" stroke="#fbbf24" stroke-width="1.6"></circle><polygon points="12,5.5 17.5,12 12,18.5 6.5,12" fill="#ffffff" stroke="#f59e0b" stroke-width="1.2"></polygon><circle cx="12" cy="12" r="1.5" fill="#fbbf24"></circle></svg>';
  static CRYSTAL_SVG = '<svg class="icon-svg crystal-icon" viewBox="0 0 24 24" style="width:14px;height:14px;vertical-align:middle;display:inline-block;"><polygon points="12,2 20,8 17,21 7,21 4,8" fill="rgba(217,70,239,0.22)" stroke="#d946ef" stroke-width="1.6" stroke-linejoin="round"></polygon><polygon points="12,2 17,21 7,21" fill="none" stroke="#f43f5e" stroke-width="1"></polygon><polygon points="12,6 16,10 12,18 8,10" fill="#ffffff" stroke="#d946ef" stroke-width="1"></polygon></svg>';

  constructor(storageService, audioManager, shopManager, missionManager, inputManager) {
    this.storage = storageService;
    this.audio = audioManager;
    this.shop = shopManager;
    this.missions = missionManager;
    this.input = inputManager;

    // Active Hangar Tab
    this.activeShopTab = 'ships'; // 'ships', 'trails', 'themes'
    this.selectedShopItem = null;

    // Cache DOM Elements
    this.dom = {
      // Overlays & Modals
      menuOverlay: document.getElementById('menu-overlay'),
      hudLayer: document.getElementById('hud-layer'),
      pauseModal: document.getElementById('pause-modal'),
      gameoverModal: document.getElementById('gameover-modal'),
      shopModal: document.getElementById('shop-modal'),
      questsModal: document.getElementById('quests-modal'),
      leaderboardModal: document.getElementById('leaderboard-modal'),
      statsModal: document.getElementById('stats-modal'),
      settingsModal: document.getElementById('settings-modal'),
      confirmModal: document.getElementById('confirm-modal'),
      tutorialModal: document.getElementById('tutorial-modal'),
      profileModal: document.getElementById('profile-modal'),

      // Screen Effects
      slowmoOverlay: document.getElementById('slowmo-overlay'),
      dangerOverlay: document.getElementById('danger-overlay'),
      flashOverlay: document.getElementById('flash-overlay'),
      recordBanner: document.getElementById('record-banner'),
      questToast: document.getElementById('quest-toast'),
      questToastTitle: document.getElementById('quest-toast-title'),
      questToastReward: document.getElementById('quest-toast-reward'),

      // HUD Elements
      altitudeVal: document.getElementById('altitude-val'),
      bestVal: document.getElementById('best-val'),
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
      reviveBox: document.getElementById('revive-box'),
      btnGameOverRevive: document.getElementById('btn-gameover-revive'),
      reviveBtnText: document.getElementById('revive-btn-text'),
      reviveStatusText: document.getElementById('revive-status-text'),
      gameoverUpgradeBanner: document.getElementById('gameover-upgrade-banner'),
      upgradeBannerText: document.getElementById('upgrade-banner-text'),
      btnUpgradeView: document.getElementById('btn-upgrade-view'),

      // Shop / Hangar
      shopCurrencyVal: document.getElementById('shop-currency-val'),
      shopCrystalsVal: document.getElementById('shop-crystals-val'),
      menuCurrencyVal: document.getElementById('menu-currency-val'),
      menuCrystalsVal: document.getElementById('menu-crystals-val'),
      shopGrid: document.getElementById('shop-grid'),
      shopItemTitle: document.getElementById('shop-item-title'),
      shopItemDesc: document.getElementById('shop-item-desc'),
      shopActionBtn: document.getElementById('shop-action-btn'),
      hangarCanvas: document.getElementById('hangar-preview-canvas'),

      // Global & Local Leaderboard
      globalLeaderboardList: document.getElementById('global-leaderboard-list'),
      btnLbTabGlobal: document.getElementById('btn-lb-tab-global'),
      btnLbTabLocal: document.getElementById('btn-lb-tab-local'),
      playerRankBadge: document.getElementById('player-rank-badge'),
      playerRankPercentile: document.getElementById('player-rank-percentile'),
      playerRankDelta: document.getElementById('player-rank-delta'),
      btnLeaderboardClose: document.getElementById('btn-leaderboard-close'),

      // Challenges & Timers
      dailyResetTimer: document.getElementById('daily-reset-timer'),
      weeklyResetTimer: document.getElementById('weekly-reset-timer'),
      dailyQuestsList: document.getElementById('daily-quests-list'),
      weeklyQuestsList: document.getElementById('weekly-quests-list'),
      menuQuestsBadge: document.getElementById('menu-quests-badge'),
      btnQuestsClose: document.getElementById('btn-quests-close'),

      // Lifetime Stats
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
      sliderMaster: document.getElementById('slider-master'),
      sliderMusic: document.getElementById('slider-music'),
      sliderSfx: document.getElementById('slider-sfx'),
      valMaster: document.getElementById('val-master'),
      valMusic: document.getElementById('val-music'),
      valSfx: document.getElementById('val-sfx'),
      btnShake: document.getElementById('btn-shake'),

      // Profile & Identity Elements
      menuProfileName: document.getElementById('menu-profile-name'),
      profileHeroName: document.getElementById('profile-hero-name'),
      profileUserIdBadge: document.getElementById('profile-user-id-badge'),
      profileStatusMsg: document.getElementById('profile-status-message'),
      btnProfileRandom: document.getElementById('btn-profile-random')
    };

    this.activeLeaderboardTab = 'global';
    this.initSettingsUI();
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
    // Hide all overlays first
    const overlays = [
      this.dom.menuOverlay,
      this.dom.hudLayer,
      this.dom.pauseModal,
      this.dom.gameoverModal,
      this.dom.shopModal,
      this.dom.questsModal,
      this.dom.leaderboardModal,
      this.dom.statsModal,
      this.dom.settingsModal,
      this.dom.tutorialModal,
      this.dom.profileModal
    ];
    overlays.forEach(el => {
      if (el) el.classList.remove('active', 'visible');
    });

    switch (state) {
      case StateManager.STATES.MENU:
        if (this.dom.menuOverlay) this.dom.menuOverlay.classList.add('visible');
        this.updateCurrency();
        if (this.audio) this.audio.playMusic('bgm_menu');
        break;

      case StateManager.STATES.PLAYING:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
        if (this.audio) this.audio.playMusic('bgm_gameplay');
        this.updateActiveHUDQuest();
        break;

      case StateManager.STATES.TUTORIAL:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
        if (this.audio) this.audio.playMusic('bgm_gameplay');
        this.updateHUD(0, this.storage.data.highScore, this.storage.data.cores);
        break;

      case StateManager.STATES.PAUSED:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
        if (this.dom.pauseModal) this.dom.pauseModal.classList.add('visible');
        if (this.audio) this.audio.setDucking(true);
        break;

      case StateManager.STATES.GAME_OVER:
        if (this.dom.hudLayer) this.dom.hudLayer.classList.add('visible');
        if (this.dom.gameoverModal) this.dom.gameoverModal.classList.add('visible');
        this.populateGameOver(contextData);
        if (this.audio) this.audio.playMusic('bgm_gameover', false);
        break;

      case StateManager.STATES.SHOP:
        if (this.dom.shopModal) this.dom.shopModal.classList.add('visible');
        this.openHangarTab(this.activeShopTab || 'ships');
        break;

      case StateManager.STATES.QUESTS:
        if (this.dom.questsModal) this.dom.questsModal.classList.add('visible');
        this.renderChallenges();
        break;

      case StateManager.STATES.LEADERBOARD:
        if (this.dom.leaderboardModal) this.dom.leaderboardModal.classList.add('visible');
        this.renderGlobalLeaderboard();
        break;

      case StateManager.STATES.STATS:
        if (this.dom.statsModal) this.dom.statsModal.classList.add('visible');
        this.populateLifetimeStats();
        break;

      case StateManager.STATES.SETTINGS:
        if (this.dom.settingsModal) this.dom.settingsModal.classList.add('visible');
        break;
    }
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
    this.startTutorialAnimation();
  }

  closeTutorialModal() {
    if (!this.dom.tutorialModal) return;
    this.dom.tutorialModal.classList.remove('visible');
    this.stopTutorialAnimation();
  }

  showTutorialSlide(slideNumber = 1) {
    this.activeTutorialSlide = 1;
  }

  startTutorialAnimation() {
    this.stopTutorialAnimation();
    const slingCanvas = document.getElementById('tut-sling-canvas');
    const slingCtx = slingCanvas ? slingCanvas.getContext('2d') : null;

    const loop = (timestamp) => {
      if (slingCtx && slingCanvas) {
        this.renderTutorialSlide1(slingCtx, slingCanvas.width, slingCanvas.height, timestamp);
      }
      this.tutAnimFrame = requestAnimationFrame(loop);
    };
    this.tutAnimFrame = requestAnimationFrame(loop);
  }

  stopTutorialAnimation() {
    if (this.tutAnimFrame) {
      cancelAnimationFrame(this.tutAnimFrame);
      this.tutAnimFrame = null;
    }
  }

  renderTutorialSlide1(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);

    // 1. Deep Space Cosmic Background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 1.4);
    bgGrad.addColorStop(0, '#0a101f');
    bgGrad.addColorStop(1, '#04070e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Multi-Layer Twinkling Starfield
    const starField = [
      [30, 25, 1.2, 0.4], [75, 40, 1.0, 0.6], [120, 18, 1.4, 0.8], [240, 22, 1.0, 0.5],
      [310, 35, 1.5, 0.7], [340, 70, 0.8, 0.4], [45, 115, 1.1, 0.5], [85, 160, 1.3, 0.7],
      [140, 190, 0.9, 0.4], [225, 175, 1.4, 0.6], [295, 130, 1.2, 0.8], [330, 180, 1.0, 0.5],
      [180, 60, 0.8, 0.3], [20, 195, 1.0, 0.4], [320, 205, 1.2, 0.6]
    ];
    starField.forEach(([sx, sy, sr, sAlpha], i) => {
      const pulseAlpha = Math.max(0.15, Math.min(1.0, sAlpha + Math.sin(t * 0.003 + i) * 0.25));
      ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });

    const cycle = 6.6;
    const time = (t / 1000) % cycle;
    const nodeX = 180;
    const nodeY = 112;
    const orbitRadius = 48;

    // 3. Distant Destination Node (Shows altitude progression)
    ctx.save();
    ctx.translate(nodeX, 26);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Main Orbit Node (Authentic In-Game Shaders & Geometry)
    ctx.save();
    ctx.translate(nodeX, nodeY);

    // Soft Radial Energy Aura
    const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 36);
    aura.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
    aura.addColorStop(0.6, 'rgba(0, 240, 255, 0.1)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();

    // Tactical Lock-On Brackets (approaching or hooked)
    if (time < 4.4) {
      const bracketPulse = (Math.sin(t * 0.008) + 1) * 0.5;
      const ringRadius = 26 + bracketPulse * 4;
      ctx.save();
      ctx.rotate(t * 0.001);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      const bLen = 6;
      ctx.beginPath();
      // 4 Tactical Corner Brackets
      ctx.moveTo(0, -ringRadius - 3); ctx.lineTo(0, -ringRadius + bLen);
      ctx.moveTo(0, ringRadius + 3); ctx.lineTo(0, ringRadius - bLen);
      ctx.moveTo(-ringRadius - 3, 0); ctx.lineTo(-ringRadius + bLen, 0);
      ctx.moveTo(ringRadius + 3, 0); ctx.lineTo(ringRadius - bLen, 0);
      ctx.stroke();
      ctx.restore();
    }

    // Outer Target Ring
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.0;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 16 + Math.sin(t * 0.004) * 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Glowing Core
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Slingshot Shockwave Plume (at moment of launch)
    if (time >= 4.4 && time < 5.4) {
      const swProgress = (time - 4.4) / 1.0;
      ctx.save();
      ctx.translate(nodeX, nodeY);
      ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 1.0 - swProgress)})`;
      ctx.lineWidth = 3.0 * (1.0 - swProgress * 0.5);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, orbitRadius * swProgress * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Flight Coordinates & Spaceship Dynamics
    let shipX = 0;
    let shipY = 0;
    let shipAngle = 0;
    let isLaunching = false;

    if (time < 1.8) {
      // Phase 1: Approach & Reticle Lock (1.8s)
      const p = time / 1.8;
      shipX = 55 + p * (nodeX - orbitRadius - 55);
      shipY = 195 - p * (195 - nodeY);
      shipAngle = Math.atan2(nodeY - 195, (nodeX - orbitRadius) - 55);

      // Aim-Assist Dashed Line from Ship to Node
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(shipX, shipY);
      ctx.lineTo(nodeX, nodeY);
      ctx.stroke();
      ctx.restore();
    } else if (time < 4.4) {
      // Phase 2: Gravitational Orbit (2.6s)
      const p = (time - 1.8) / 2.6;
      const startAngle = Math.PI; // West (180°)
      const currentAngle = startAngle - p * Math.PI; // Counter-clockwise to East (0°)
      shipX = nodeX + Math.cos(currentAngle) * orbitRadius;
      shipY = nodeY + Math.sin(currentAngle) * orbitRadius;
      shipAngle = currentAngle - Math.PI / 2; // Forward tangent

      // Orbital Tetherless Guide Arc
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, orbitRadius, startAngle, currentAngle, true);
      ctx.stroke();
      ctx.restore();
    } else if (time < 5.8) {
      // Phase 3: Explosive 90° Slingshot Launch (1.4s)
      isLaunching = true;
      const p = (time - 4.4) / 1.4;
      const launchX = nodeX + orbitRadius;
      shipX = launchX;
      shipY = nodeY - (p * p) * 175; // Accelerating upward ascent
      shipAngle = -Math.PI / 2; // Pure vertical North

      // High-Speed Propulsion Trail
      ctx.save();
      const trailGrad = ctx.createLinearGradient(launchX, nodeY, launchX, shipY);
      trailGrad.addColorStop(0, 'rgba(0, 240, 255, 0.1)');
      trailGrad.addColorStop(1, 'rgba(56, 189, 248, 0.85)');
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(launchX, nodeY);
      ctx.lineTo(shipX, shipY + 14);
      ctx.stroke();
      ctx.restore();
    } else {
      // Phase 4: Headroom transition (0.8s)
      shipX = nodeX + orbitRadius;
      shipY = -50;
      shipAngle = -Math.PI / 2;
    }

    // 7. Render Authentic PFEIL Spaceship
    if (shipY > -25 && shipY < h + 25) {
      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(shipAngle + Math.PI / 2);
      ctx.scale(1.25, 1.25);

      // Thruster Flame Particle Effects
      const flameLen = isLaunching ? (12 + Math.random() * 6) : (6 + Math.random() * 3);
      ctx.fillStyle = isLaunching ? '#fbbf24' : '#38bdf8';
      ctx.shadowColor = isLaunching ? '#fbbf24' : '#00f0ff';
      ctx.shadowBlur = 10;
      // Dual Thrusters at (-4, 8) and (4, 8)
      [-4, 4].forEach(tx => {
        ctx.beginPath();
        ctx.moveTo(tx - 2, 7);
        ctx.lineTo(tx + 2, 7);
        ctx.lineTo(tx, 7 + flameLen);
        ctx.closePath();
        ctx.fill();
      });

      // PFEIL Hull Geometry (Identical to in-game Spaceship.js)
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(11, 10);
      ctx.lineTo(4, 7);
      ctx.lineTo(0, 9);
      ctx.lineTo(-4, 7);
      ctx.lineTo(-11, 10);
      ctx.closePath();
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Neon Centerline & Cockpit Core
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 4);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -3, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /* =========================================================================
     PILOT PROFILE & REGISTRATION
     ========================================================================= */
  updateUserProfileNav() {
    if (!this.storage) return;
    const profile = this.storage.getPlayerProfile();
    const navNameEl = this.dom.menuProfileName || document.getElementById('menu-profile-name');
    if (navNameEl && profile) {
      navNameEl.textContent = profile.pilotName || 'SPIELER';
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

    const nameChanges = profile.nameChanges || 0;

    if (heroNameEl) heroNameEl.textContent = profile.pilotName || 'SPIELER';
    if (idBadgeEl) idBadgeEl.textContent = `ID: ${profile.playerId || 'usr_init'}`;
    if (nameEl) nameEl.textContent = profile.pilotName || 'SPIELER';
    if (idEl) idEl.textContent = profile.playerId || 'usr_init';
    if (statusEl) {
      statusEl.textContent = 'AKTIV';
    }
    if (hsEl) hsEl.textContent = `${this.storage.data.highScore || 0} m`;
    if (dateEl) {
      const d = profile.registeredAt ? new Date(profile.registeredAt).toLocaleDateString('de-DE') : 'Heute';
      dateEl.textContent = `Aktiv seit: ${d}`;
    }
    if (runsEl) runsEl.textContent = (stats.totalRuns || 0).toString();

    if (inputEl) {
      inputEl.value = profile.pilotName || '';
      if (nameChanges >= 1) {
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
      if (nameChanges >= 1) {
        noticeEl.textContent = 'NAME FESTGELEGT (1x GEÄNDERT)';
        noticeEl.style.color = '#94a3b8';
        noticeEl.style.background = 'rgba(255, 255, 255, 0.05)';
        noticeEl.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      } else {
        noticeEl.textContent = '1x NAMENSWECHSEL VERFÜGBAR';
        noticeEl.style.color = '#38bdf8';
        noticeEl.style.background = 'rgba(56, 189, 248, 0.08)';
        noticeEl.style.borderColor = 'rgba(56, 189, 248, 0.2)';
      }
    }

    if (saveBtn) {
      if (nameChanges >= 1) {
        saveBtn.disabled = true;
        saveBtn.style.display = 'none';
      } else {
        saveBtn.disabled = false;
        saveBtn.style.display = 'block';
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

  rerollProfileName(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
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
      if (heroNameEl) heroNameEl.textContent = res.profile.pilotName;
      if (inputEl) {
        inputEl.value = res.profile.pilotName;
        inputEl.disabled = true;
        inputEl.style.opacity = '0.55';
        inputEl.style.cursor = 'not-allowed';
      }
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.display = 'none';
      }
      if (noticeEl) {
        noticeEl.textContent = 'NAME FESTGELEGT (1x GEÄNDERT)';
        noticeEl.style.color = '#94a3b8';
        noticeEl.style.background = 'rgba(255, 255, 255, 0.05)';
        noticeEl.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
      this.updateUserProfileNav();

      if (msgEl) {
        msgEl.textContent = 'PROFIL GESPEICHERT';
        msgEl.style.color = '#10b981';
        msgEl.style.opacity = '1';
        setTimeout(() => { if (msgEl) msgEl.style.opacity = '0'; }, 2000);
      }

      if (this.audio) this.audio.playProceduralSfx('sfx_ui_click');
      if (window.AnalyticsService) {
        window.AnalyticsService.sendEvent('profile_update', { pilotName: res.profile.pilotName });
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
    if (this.dom.altitudeVal) this.dom.altitudeVal.textContent = altitude.toString();
    if (this.dom.bestVal) this.dom.bestVal.textContent = `${best}m`;
    if (this.dom.orbsVal) this.dom.orbsVal.textContent = cores.toString();
  }

  showComboBadge(text, color = '#fbbf24') {
    // Top-of-screen combo badge removed per user feedback.
    // Combo / Perfect text displays directly at the release point on the player.
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
      this.dom.dangerOverlay.style.opacity = Math.max(0, Math.min(0.9, ratio)).toString();
    }
  }

  showRecordFlash() {
    if (this.dom.flashOverlay) {
      this.dom.flashOverlay.classList.add('flash');
      setTimeout(() => this.dom.flashOverlay.classList.remove('flash'), 60);
    }
    if (this.dom.recordBanner) {
      this.dom.recordBanner.classList.add('show');
      setTimeout(() => this.dom.recordBanner.classList.remove('show'), 3200);
    }
  }

  showQuestToast(quest) {
    if (!this.dom.questToast) return;
    if (this.dom.questToastTitle) this.dom.questToastTitle.textContent = quest.title;
    if (this.dom.questToastReward) this.dom.questToastReward.innerHTML = `+${quest.reward} ${UIManager.COIN_SVG}`;

    this.dom.questToast.classList.add('show');
    setTimeout(() => {
      this.dom.questToast.classList.remove('show');
    }, 3800);

    this.updateActiveHUDQuest();
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
     GAME OVER SUMMARY
     ========================================================================= */
  populateGameOver(data = {}) {
    const altitude = data.altitude || 0;
    const cores = data.cores || 0;
    const crystals = data.crystals || 0;
    const isNewRecord = data.isNewRecord || false;
    const canRevive = data.canRevive !== false;

    if (this.dom.finalAltitude) {
      this.dom.finalAltitude.innerHTML = `<span class="hero-altitude-val">${Number(altitude).toLocaleString('de-DE')}</span><span class="hero-altitude-unit">m</span>`;
    }
    if (this.dom.finalOrbs) this.dom.finalOrbs.textContent = `+${Number(cores).toLocaleString('de-DE')}`;
    if (this.dom.finalCrystals) this.dom.finalCrystals.textContent = `+${Number(crystals).toLocaleString('de-DE')}`;
    if (this.dom.finalBest) this.dom.finalBest.textContent = `${Number(this.storage.data.highScore).toLocaleString('de-DE')} m`;

    if (this.dom.newRecordBadge) {
      this.dom.newRecordBadge.style.display = isNewRecord ? 'inline-flex' : 'none';
    }

    // Configure Interactive Revive Section (Second Chance)
    if (this.dom.reviveBox) {
      const currentCrystals = this.storage.data.hyperCrystals || 0;
      this.dom.reviveBox.style.display = 'block';

      if (canRevive) {
        if (currentCrystals >= 1) {
          if (this.dom.btnGameOverRevive) {
            this.dom.btnGameOverRevive.disabled = false;
          }
          if (this.dom.reviveBtnText) {
            this.dom.reviveBtnText.textContent = 'WIEDERBELEBEN';
          }
          if (this.dom.reviveStatusText) {
            this.dom.reviveStatusText.textContent = '1x pro Flug';
          }
        } else {
          if (this.dom.btnGameOverRevive) {
            this.dom.btnGameOverRevive.disabled = true;
          }
          if (this.dom.reviveBtnText) {
            this.dom.reviveBtnText.textContent = '0 KRISTALLE (WERBUNG BALD)';
          }
          if (this.dom.reviveStatusText) {
            this.dom.reviveStatusText.textContent = 'Finde seltene Kristalle im Tiefraum!';
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
        if (this.dom.reviveStatusText) {
          this.dom.reviveStatusText.textContent = 'Bereits genutzt';
        }
      }
    }

    // Check and display one-time upgrade notification if player has enough currency
    this.checkOneTimeUpgradeNotification();
  }

  /**
   * One-time notification for affordable upgrades (triggered at most once per item lifetime)
   */
  checkOneTimeUpgradeNotification() {
    if (!this.dom.gameoverUpgradeBanner || !this.storage || !this.shop) {
      return;
    }

    const currentStars = this.storage.data.cores;
    const notified = this.storage.data.notifiedUpgradeIds || [];

    // Collect all locked items the player can now afford
    const candidates = [];

    // 1. Ships
    for (const ship of CONSTANTS.SHIPS) {
      if (ship.cost > 0 && currentStars >= ship.cost && !this.shop.isUnlocked('ships', ship.id) && !notified.includes(ship.id)) {
        candidates.push({ ...ship, category: 'ships', catLabel: 'Raumschiff' });
      }
    }

    // 2. Trails
    for (const trail of CONSTANTS.TRAILS) {
      if (trail.cost > 0 && currentStars >= trail.cost && !this.shop.isUnlocked('trails', trail.id) && !notified.includes(trail.id)) {
        candidates.push({ ...trail, category: 'trails', catLabel: 'Schweif' });
      }
    }

    if (candidates.length > 0) {
      // Pick the first milestone candidate
      const target = candidates[0];

      // Mark as notified in persistent storage so it NEVER triggers again
      this.storage.markUpgradeNotified(target.id);

      if (this.dom.upgradeBannerText) {
        this.dom.upgradeBannerText.innerHTML = `Genug für <strong>${target.name}</strong> (${target.catLabel}, ${target.cost} ${UIManager.COIN_SVG})!`;
      }

      if (this.dom.btnUpgradeView) {
        this.dom.btnUpgradeView.onclick = () => {
          if (this.state) {
            this.state.changeState(StateManager.STATES.SHOP);
            this.openHangarTab(target.category);
            this.selectShopItem(target.category, target);
          }
        };
      }

      this.dom.gameoverUpgradeBanner.style.display = 'block';
    } else {
      this.dom.gameoverUpgradeBanner.style.display = 'none';
    }
  }

  /* =========================================================================
     SKINS & SHOP (Top-Seller Live Preview & Customization Engine)
     ========================================================================= */
  getPreviewSelection() {
    return {
      shipId: this.previewShipId || this.storage.data.selectedShip || 'dart',
      trailId: this.previewTrailId || this.storage.data.selectedTrail || 'neon_cyan',
      themeId: 'deep_space'
    };
  }

  isCurrentlyEquippedPreview() {
    const tabKey = this.activeShopTab || 'ships';
    if (!this.selectedShopItem) return true;
    return this.shop.isEquipped(tabKey, this.selectedShopItem.id);
  }

  openHangarTab(tabKey = 'ships') {
    this.activeShopTab = tabKey;
    if (this.dom.shopCurrencyVal) {
      this.dom.shopCurrencyVal.textContent = this.storage.data.cores.toString();
    }

    // Sync preview state with equipped items on tab open
    if (!this.previewShipId) this.previewShipId = this.storage.data.selectedShip;
    if (!this.previewTrailId) this.previewTrailId = this.storage.data.selectedTrail;

    // Tab buttons styling
    document.querySelectorAll('.shop-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabKey) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    let items = [];
    if (tabKey === 'ships') items = CONSTANTS.SHIPS;
    else if (tabKey === 'trails') items = CONSTANTS.TRAILS;
    else {
      this.activeShopTab = 'ships';
      items = CONSTANTS.SHIPS;
    }

    // Populate Grid with rich top-seller cards
    if (!this.dom.shopGrid) return;
    this.dom.shopGrid.innerHTML = '';

    const currentSelected = this.storage.data[`selected${this.shop.capitalize(tabKey).slice(0, -1)}`];

    items.forEach(item => {
      const isUnlocked = this.shop.isUnlocked(tabKey, item.id);
      const isEquipped = item.id === currentSelected;

      const card = document.createElement('div');
      card.className = `shop-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.dataset.id = item.id;

      // Generate preview swatch based on category
      let swatchHtml = '';
      if (tabKey === 'trails') {
        const c = item.color === 'rainbow' ? 'linear-gradient(90deg, #ff0055, #00f0ff, #fbbf24)' : item.color;
        swatchHtml = `<div class="trail-swatch" style="background:${c};"></div>`;
      } else {
        swatchHtml = `<div class="ship-icon-badge"><svg class="icon-svg" viewBox="0 0 24 24" style="width:12px;height:12px;"><polygon points="12 2 2 22 12 17 22 22 12 2"></polygon></svg></div>`;
      }

      card.innerHTML = `
        <div class="shop-card-main">
          ${swatchHtml}
          <div class="shop-card-labels">
            <span class="shop-card-name">${item.name}</span>
            <span class="shop-card-tier">${item.tier || ''}</span>
          </div>
        </div>
        <div class="shop-card-status">
          ${isEquipped ? '<span class="status-pill active">AKTIV</span>' : (isUnlocked ? '<span class="status-pill">IN BESITZ</span>' : `<span class="price-tag">${item.cost} ${UIManager.COIN_SVG}</span>`)}
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectShopItem(tabKey, item);
      });

      this.dom.shopGrid.appendChild(card);
    });

    // Teaser Card for future models (user will define new skins later)
    const teaser = document.createElement('div');
    teaser.className = 'shop-teaser-card';
    teaser.style.cssText = 'grid-column: 1 / -1; margin-top: 10px; padding: 14px 16px; background: rgba(15, 23, 42, 0.5); border: 1px dashed rgba(56, 189, 248, 0.25); border-radius: 10px; text-align: center;';
    teaser.innerHTML = '<span style="font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase;">WEITERE MODELLE IN ENTWICKLUNG</span>';
    this.dom.shopGrid.appendChild(teaser);

    // Select currently equipped item by default
    const defaultItem = items.find(i => i.id === currentSelected) || items[0];
    this.selectShopItem(tabKey, defaultItem);
  }

  selectShopItem(tabKey, item) {
    this.selectedShopItem = item;

    // Immediately update live preview model so player sees it instantly!
    if (tabKey === 'ships') this.previewShipId = item.id;
    if (tabKey === 'trails') this.previewTrailId = item.id;

    document.querySelectorAll('.shop-card').forEach(c => {
      if (c.dataset.id === item.id) c.classList.add('selected');
      else c.classList.remove('selected');
    });

    if (this.dom.shopItemTitle) this.dom.shopItemTitle.textContent = item.name;
    if (this.dom.shopItemDesc) {
      if (item.description) {
        this.dom.shopItemDesc.textContent = item.description;
      } else if (tabKey === 'trails') {
        this.dom.shopItemDesc.textContent = `Partikel-Schweif mit ${item.type} Ionen-Kanalisierung.`;
      }
    }

    const isUnlocked = this.shop.isUnlocked(tabKey, item.id);
    const isEquipped = this.shop.isEquipped(tabKey, item.id);

    if (this.dom.shopActionBtn) {
      if (isEquipped) {
        this.dom.shopActionBtn.textContent = 'AKTIV AUSGERÜSTET';
        this.dom.shopActionBtn.disabled = true;
        this.dom.shopActionBtn.className = 'btn-secondary active-equipped';
      } else if (isUnlocked) {
        this.dom.shopActionBtn.textContent = 'AUSRÜSTEN';
        this.dom.shopActionBtn.disabled = false;
        this.dom.shopActionBtn.className = 'btn-primary';
      } else {
        const canAfford = this.storage.data.cores >= item.cost;
        this.dom.shopActionBtn.innerHTML = `KAUFEN (${item.cost} ${UIManager.COIN_SVG})`;
        this.dom.shopActionBtn.disabled = !canAfford;
        this.dom.shopActionBtn.className = canAfford ? 'btn-gold' : 'btn-disabled';
      }
    }
  }

  handleShopAction() {
    if (!this.selectedShopItem) return;
    const tabKey = this.activeShopTab;
    const item = this.selectedShopItem;

    if (this.shop.isUnlocked(tabKey, item.id)) {
      this.shop.equipItem(tabKey, item.id);
      if (tabKey === 'ships') this.previewShipId = item.id;
      if (tabKey === 'trails') this.previewTrailId = item.id;
      if (tabKey === 'themes') this.previewThemeId = item.id;
      this.openHangarTab(tabKey);
    } else {
      const res = this.shop.buyItem(tabKey, item.id);
      if (res.success) {
        if (tabKey === 'ships') this.previewShipId = item.id;
        if (tabKey === 'trails') this.previewTrailId = item.id;
        if (tabKey === 'themes') this.previewThemeId = item.id;
        this.openHangarTab(tabKey);
      }
    }
  }

  /* =========================================================================
     DEDICATED MODALS (LEADERBOARD, QUESTS & STATS)
     ========================================================================= */
  populateLifetimeStats() {
    this.updateCurrency();
    this.renderStats();
  }

  updateCurrency() {
    const cores = (this.storage && this.storage.data && this.storage.data.cores != null)
      ? this.storage.data.cores.toString()
      : '0';
    const crystals = (this.storage && this.storage.data && this.storage.data.hyperCrystals != null)
      ? this.storage.data.hyperCrystals.toString()
      : '0';

    if (this.dom.menuCurrencyVal) this.dom.menuCurrencyVal.textContent = cores;
    if (this.dom.menuCrystalsVal) this.dom.menuCrystalsVal.textContent = crystals;
    if (this.dom.shopCurrencyVal) this.dom.shopCurrencyVal.textContent = cores;
    if (this.dom.shopCrystalsVal) this.dom.shopCrystalsVal.textContent = crystals;
    if (this.dom.orbsVal) this.dom.orbsVal.textContent = cores;
    this.updateUserProfileNav();
    this.updateUnclaimedBadges();
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
  }

  switchLeaderboardTab(tab) {
    this.activeLeaderboardTab = tab;
    if (this.dom.btnLbTabGlobal) {
      this.dom.btnLbTabGlobal.classList.toggle('active', tab === 'global');
    }
    if (this.dom.btnLbTabLocal) {
      this.dom.btnLbTabLocal.classList.toggle('active', tab === 'local');
    }
    this.renderLeaderboard();
  }

  renderGlobalLeaderboard() {
    this.renderLeaderboard();
  }

  renderLeaderboard() {
    if (!this.dom.globalLeaderboardList) return;
    this.dom.globalLeaderboardList.innerHTML = '';

    const profile = this.storage.getPlayerProfile();
    const playerName = profile.pilotName || 'Player';
    const bestAltitude = this.storage.data.highScore || 0;
    const region = (typeof StorageService !== 'undefined' && StorageService.getPlayerRegion)
      ? StorageService.getPlayerRegion()
      : { code: 'DE', name: 'Deutschland' };

    // Update local tab button label to show region code
    if (this.dom.btnLbTabLocal) {
      this.dom.btnLbTabLocal.textContent = `LOKAL (${region.code})`;
      this.dom.btnLbTabLocal.title = `Regionale Bestenliste für ${region.name}`;
    }

    // Retrieve genuine flights recorded in storage
    const storedRuns = (this.storage.data.leaderboard || []).map(r => ({
      name: r.name || playerName,
      altitude: r.altitude || 0,
      country: r.country || region.code,
      countryName: r.countryName || region.name,
      isPlayer: (r.name === playerName || !r.name)
    }));

    // Ensure the player's personal high score is represented if > 0
    if (bestAltitude > 0 && !storedRuns.some(r => r.altitude === bestAltitude && r.isPlayer)) {
      storedRuns.push({
        name: `${playerName} (DU)`,
        altitude: bestAltitude,
        country: region.code,
        countryName: region.name,
        isPlayer: true
      });
    }

    // Sort descending by altitude (highest flight first)
    storedRuns.sort((a, b) => b.altitude - a.altitude);

    let displayList = [];
    if (this.activeLeaderboardTab === 'global') {
      displayList = storedRuns.slice(0, 100);
    } else {
      // Local: Filter exclusively by player's country / region
      displayList = storedRuns.filter(r => r.country === region.code).slice(0, 100);
    }

    // Assign ranking numbers
    displayList.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    if (displayList.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'lb-empty-state';
      if (this.activeLeaderboardTab === 'global') {
        emptyBox.innerHTML = `
          <div class="lb-empty-title">KEINE WELTWEITEN EINTRÄGE</div>
          <div class="lb-empty-desc">Starte deinen ersten Flug, um den globalen Rekord aufzustellen.</div>
        `;
      } else {
        emptyBox.innerHTML = `
          <div class="lb-empty-title">KEINE REGIONALEN EINTRÄGE</div>
          <div class="lb-empty-desc">Starte einen Flug in ${region.name}, um die Rangliste anzuführen.</div>
        `;
      }
      this.dom.globalLeaderboardList.appendChild(emptyBox);
    } else {
      displayList.forEach(entry => {
        const row = document.createElement('div');
        const rankClass = entry.rank <= 3 ? `top-rank-${entry.rank}` : '';
        const playerClass = entry.isPlayer ? 'player-entry' : '';
        row.className = `leaderboard-row ${rankClass} ${playerClass}`.trim();
        // Strictly 3 columns: Rank, Name, Metres
        row.innerHTML = `
          <div class="lb-rank">#${entry.rank}</div>
          <div class="lb-name">${entry.name}</div>
          <div class="lb-alt">${entry.altitude.toLocaleString('de-DE')} m</div>
        `;
        this.dom.globalLeaderboardList.appendChild(row);
      });
    }

    // Sticky Player Rank Card
    const playerEntry = displayList.find(e => e.isPlayer);
    let rankDisplay = '#---';
    let titleDisplay = this.activeLeaderboardTab === 'global'
      ? 'GLOBAL (TOP 100)'
      : `LOKAL (${region.name.toUpperCase()})`;
    let deltaDisplay = 'Absolviere einen Flug zur Wertung';

    if (playerEntry) {
      rankDisplay = `#${playerEntry.rank}`;
      titleDisplay = `RANG #${playerEntry.rank} • ${this.activeLeaderboardTab === 'global' ? 'GLOBAL' : region.name.toUpperCase()}`;
      deltaDisplay = `Bestleistung: ${bestAltitude.toLocaleString('de-DE')} m`;
    } else if (bestAltitude > 0) {
      rankDisplay = '#1';
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
  }

  renderChallenges() {
    if (!this.missions) return;

    if (this.dom.dailyResetTimer) {
      this.dom.dailyResetTimer.textContent = `Reset in ${this.missions.getDailyTimeRemaining()}`;
    }
    if (this.dom.weeklyResetTimer) {
      this.dom.weeklyResetTimer.textContent = `Reset in ${this.missions.getWeeklyTimeRemaining()}`;
    }

    // Daily Quests
    if (this.dom.dailyQuestsList) {
      this.dom.dailyQuestsList.innerHTML = '';
      const dailies = this.missions.getDailyQuests();

      dailies.forEach(q => {
        const card = this.createChallengeCard(q);
        this.dom.dailyQuestsList.appendChild(card);
      });
    }

    // Weekly Quests
    if (this.dom.weeklyQuestsList) {
      this.dom.weeklyQuestsList.innerHTML = '';
      const weeklies = this.missions.getWeeklyQuests();

      weeklies.forEach(q => {
        const card = this.createChallengeCard(q);
        this.dom.weeklyQuestsList.appendChild(card);
      });
    }
  }

  createChallengeCard(q) {
    const card = document.createElement('div');
    const isReady = q.isComplete && !q.isClaimed;
    card.className = `quest-card ${isReady ? 'ready-to-claim' : ''} ${q.isClaimed ? 'is-claimed' : ''}`;

    const pct = Math.min(100, Math.floor((q.progress / q.target) * 100));

    const statusText = q.isClaimed
      ? 'EINGELÖST'
      : (q.isComplete
          ? 'FERTIG'
          : `${q.progress.toLocaleString('de-DE')} / ${q.target.toLocaleString('de-DE')}`);

    card.innerHTML = `
      <div class="quest-card-top">
        <span class="quest-card-title">${q.description || q.title}</span>
        <span class="quest-card-reward">+${q.reward.toLocaleString('de-DE')} ${UIManager.COIN_SVG}</span>
      </div>
      <div class="quest-bar-bg">
        <div class="quest-bar-fill" style="width:${pct}%"></div>
        <div class="quest-bar-text">${statusText}</div>
      </div>
      ${isReady ? `<button class="btn-claim" data-id="${q.id}">BELOHNUNG EINSAMMELN</button>` : ''}
    `;

    const claimBtn = card.querySelector('.btn-claim');
    if (claimBtn) {
      claimBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const success = this.missions.claimReward(q.id);
        if (success) {
          this.updateCurrency();
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
    const s = this.storage.data.settings;

    if (this.dom.sliderMaster) {
      this.dom.sliderMaster.value = Math.floor(s.masterVolume * 100);
      if (this.dom.valMaster) this.dom.valMaster.textContent = `${this.dom.sliderMaster.value}%`;
      this.dom.sliderMaster.addEventListener('input', (e) => {
        this.storage.data.settings.masterVolume = parseInt(e.target.value, 10) / 100;
        if (this.dom.valMaster) this.dom.valMaster.textContent = `${e.target.value}%`;
        this.storage.save();
        if (this.audio) this.audio.updateVolumes();
      });
    }

    if (this.dom.sliderMusic) {
      this.dom.sliderMusic.value = Math.floor(s.musicVolume * 100);
      if (this.dom.valMusic) this.dom.valMusic.textContent = `${this.dom.sliderMusic.value}%`;
      this.dom.sliderMusic.addEventListener('input', (e) => {
        this.storage.data.settings.musicVolume = parseInt(e.target.value, 10) / 100;
        if (this.dom.valMusic) this.dom.valMusic.textContent = `${e.target.value}%`;
        this.storage.save();
        if (this.audio) this.audio.updateVolumes();
      });
    }

    if (this.dom.sliderSfx) {
      this.dom.sliderSfx.value = Math.floor(s.sfxVolume * 100);
      if (this.dom.valSfx) this.dom.valSfx.textContent = `${this.dom.sliderSfx.value}%`;
      this.dom.sliderSfx.addEventListener('input', (e) => {
        this.storage.data.settings.sfxVolume = parseInt(e.target.value, 10) / 100;
        if (this.dom.valSfx) this.dom.valSfx.textContent = `${e.target.value}%`;
        this.storage.save();
        if (this.audio) this.audio.updateVolumes();
      });
    }

    if (this.dom.btnShake) {
      this.updateShakeButtonText();
      this.dom.btnShake.addEventListener('click', () => {
        let cur = this.storage.data.settings.screenShakeIntensity;
        if (cur >= 1.0) cur = 0.5;
        else if (cur >= 0.5) cur = 0.0;
        else cur = 1.0;
        this.storage.data.settings.screenShakeIntensity = cur;
        this.storage.save();
        this.updateShakeButtonText();
        if (this.audio) this.audio.playProceduralSfx('sfx_ui_click');
      });
    }
  }

  updateShakeButtonText() {
    if (!this.dom.btnShake) return;
    const cur = this.storage.data.settings.screenShakeIntensity;
    const pct = Math.floor(cur * 100);
    this.dom.btnShake.textContent = `${pct}%`;
  }
}
