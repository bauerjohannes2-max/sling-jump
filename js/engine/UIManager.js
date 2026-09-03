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

      // Global Leaderboard & Player Rank
      globalLeaderboardList: document.getElementById('global-leaderboard-list'),
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
      btnPerf: document.getElementById('btn-perf')
    };

    this.initSettingsUI();
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
    this.showTutorialSlide(slide);
    this.dom.tutorialModal.classList.add('visible');
    this.startTutorialAnimation();
  }

  closeTutorialModal() {
    if (!this.dom.tutorialModal) return;
    this.dom.tutorialModal.classList.remove('visible');
    this.stopTutorialAnimation();
  }

  showTutorialSlide(slideNumber) {
    this.activeTutorialSlide = slideNumber;
    const s1 = document.getElementById('tut-slide-1');
    const s2 = document.getElementById('tut-slide-2');
    if (s1 && s2) {
      if (slideNumber === 1) {
        s1.style.display = 'flex';
        s2.style.display = 'none';
      } else {
        s1.style.display = 'none';
        s2.style.display = 'flex';
      }
    }
  }

  startTutorialAnimation() {
    this.stopTutorialAnimation();
    const slingCanvas = document.getElementById('tut-sling-canvas');
    const circlesCanvas = document.getElementById('tut-circles-canvas');
    const slingCtx = slingCanvas ? slingCanvas.getContext('2d') : null;
    const circlesCtx = circlesCanvas ? circlesCanvas.getContext('2d') : null;

    const loop = (timestamp) => {
      if (this.activeTutorialSlide === 1 && slingCtx && slingCanvas) {
        this.renderTutorialSlide1(slingCtx, slingCanvas.width, slingCanvas.height, timestamp);
      } else if (this.activeTutorialSlide === 2 && circlesCtx && circlesCanvas) {
        this.renderTutorialSlide2(circlesCtx, circlesCanvas.width, circlesCanvas.height, timestamp);
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

    // Deep space background gradient
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 1.5);
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
    bgGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Background stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    const starCoords = [[40, 30], [80, 110], [130, 20], [240, 25], [290, 120], [330, 45], [190, 140]];
    starCoords.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    const cycle = 3.8;
    const time = (t / 1000) % cycle;
    const nodeX = 180;
    const nodeY = 70;
    const orbitRadius = 46;

    // Game Orbit Node Visual (Matching OrbitNode exactly)
    ctx.save();
    ctx.translate(nodeX, nodeY);
    // Outer dashed lock ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 24 + Math.sin(t * 0.005) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Glow halo
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    let shipX = 0;
    let shipY = 0;
    let shipAngle = 0;
    let phaseText = '';
    let phaseColor = '#38bdf8';

    if (time < 0.9) {
      // Approach Phase
      const progress = time / 0.9;
      shipX = 50 + progress * (nodeX - orbitRadius - 50);
      shipY = 140 - progress * (140 - nodeY);
      shipAngle = -Math.PI / 4;
      phaseText = '1. GEDRÜCKT HALTEN = EINHAKEN';
      phaseColor = '#38bdf8';
    } else if (time < 2.3) {
      // Orbit / Swing Phase
      const progress = (time - 0.9) / 1.4;
      const startAngle = Math.PI; // 180 deg (left)
      const currentAngle = startAngle - progress * (Math.PI * 1.5); // counterclockwise around to -Math.PI/2 (top)
      shipX = nodeX + Math.cos(currentAngle) * orbitRadius;
      shipY = nodeY + Math.sin(currentAngle) * orbitRadius;
      shipAngle = currentAngle - Math.PI / 2;

      // Active tether beam
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(nodeX, nodeY);
      ctx.lineTo(shipX, shipY);
      ctx.stroke();
      ctx.restore();

      // Orbital arc trace
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, orbitRadius, startAngle, currentAngle, true);
      ctx.stroke();
      ctx.restore();

      phaseText = '1. HALTEN = SCHWUNG AUFBAUEN';
      phaseColor = '#38bdf8';
    } else if (time < 3.5) {
      // Release & Catapult Launch Phase
      const progress = (time - 2.3) / 1.2;
      shipX = nodeX;
      shipY = (nodeY - orbitRadius) - progress * 90;
      shipAngle = -Math.PI / 2; // facing straight up

      // Boost trajectory trail
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(nodeX, nodeY - orbitRadius);
      ctx.lineTo(shipX, shipY + 14);
      ctx.stroke();
      ctx.restore();

      phaseText = '2. LOSLASSEN = KRAFTVOLLER FLUG!';
      phaseColor = '#fbbf24';
    } else {
      shipX = nodeX;
      shipY = -50;
      phaseText = 'SCHWUNGVOLL IN DEN WELTRAUM';
      phaseColor = '#38bdf8';
    }

    // Render Spaceship Model
    if (shipY > -20 && shipY < h + 20) {
      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(shipAngle + Math.PI / 2);
      ctx.scale(1.3, 1.3);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(7, 8);
      ctx.lineTo(0, 4);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = phaseColor;
      ctx.beginPath();
      ctx.arc(0, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Update Phase Badge DOM
    const badge = document.getElementById('tut-phase-badge');
    if (badge) {
      badge.textContent = phaseText;
      badge.style.color = phaseColor;
      badge.style.borderColor = phaseColor;
    }
  }

  renderTutorialSlide2(ctx, w, h, t) {
    ctx.clearRect(0, 0, w, h);

    // Instantiate real game OrbitNode entities so tutorial mirrors game circles dynamically
    if (!this.tutNodes && typeof OrbitNode !== 'undefined') {
      this.tutNodes = [
        { node: new OrbitNode(38, 55, 'STANDARD', w, 0), label: 'STANDARD' },
        { node: new OrbitNode(108, 55, 'BOOST', w, 0), label: 'BOOST' },
        { node: new OrbitNode(180, 55, 'MOVING', w, 0), label: 'BEWEGLICH' },
        { node: new OrbitNode(252, 55, 'FRAGILE', w, 0), label: 'FRAGIL' },
        { node: new OrbitNode(322, 55, 'DECOY', w, 0), label: 'KÖDER' }
      ];
    }

    if (!this.tutNodes) return;

    const theme = { primary: '#00f0ff', accent: '#fbbf24' };
    const dt = 0.016;

    this.tutNodes.forEach(item => {
      // Update entity state for live procedural animation
      item.node.pulse += dt * 3.2;

      // Directly invoke the game entity draw method!
      // In OrbitNode.draw(context, camY, height): screenY = height - (y - camY)
      // height = 100, y = 55, camY = 0 => screenY = 45 (vertically centered in 100px canvas)
      item.node.draw(ctx, 0, 100, theme);

      // Clean typographic badge
      ctx.save();
      ctx.font = '800 8px Orbitron, monospace';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, item.node.x, 90);
      ctx.restore();
    });
  }

  /* =========================================================================
     PILOT PROFILE & REGISTRATION
     ========================================================================= */
  openProfileModal() {
    if (!this.dom.profileModal) return;
    const profile = this.storage.getPlayerProfile();
    const stats = this.storage.data.stats || {};
    
    const nameEl = document.getElementById('profile-display-name');
    const idEl = document.getElementById('profile-display-id');
    const statusEl = document.getElementById('profile-status-badge');
    const hsEl = document.getElementById('profile-display-highscore');
    const dateEl = document.getElementById('profile-registered-date');
    const runsEl = document.getElementById('profile-runs-count');
    const inputEl = document.getElementById('profile-name-input');

    if (nameEl) nameEl.textContent = profile.pilotName || 'PILOT';
    if (idEl) idEl.textContent = profile.playerId || 'SJ-INIT';
    if (statusEl) {
      statusEl.textContent = profile.registered ? 'REGISTRIERT' : 'GAST-MODUS';
      statusEl.style.color = profile.registered ? '#10b981' : '#f59e0b';
    }
    if (hsEl) hsEl.textContent = `${this.storage.data.highScore || 0} m`;
    if (dateEl) {
      const d = profile.registeredAt ? new Date(profile.registeredAt).toLocaleDateString('de-DE') : 'Heute';
      dateEl.textContent = `Aktiv seit: ${d}`;
    }
    if (runsEl) runsEl.textContent = `${stats.totalRuns || 0} Flüge`;
    if (inputEl) inputEl.value = profile.pilotName || '';

    this.dom.profileModal.classList.add('visible');
  }

  closeProfileModal() {
    if (this.dom.profileModal) this.dom.profileModal.classList.remove('visible');
  }

  saveProfile(e) {
    if (e) e.preventDefault();
    const inputEl = document.getElementById('profile-name-input');
    const name = inputEl ? inputEl.value : '';
    this.storage.registerPlayer(name);
    this.openProfileModal();
    if (this.audio) this.audio.playProceduralSfx('sfx_ui_click');
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
    if (!this.dom.hudComboBadge) return;
    this.dom.hudComboBadge.textContent = text;
    this.dom.hudComboBadge.style.color = color;
    this.dom.hudComboBadge.style.borderColor = color;
    this.dom.hudComboBadge.style.boxShadow = `0 0 24px ${color}88, inset 0 0 12px ${color}33`;
    this.dom.hudComboBadge.style.display = 'block';

    clearTimeout(this.comboBadgeTimer);
    this.comboBadgeTimer = setTimeout(() => {
      this.hideComboBadge();
    }, 2200);
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

    if (this.dom.finalAltitude) this.dom.finalAltitude.textContent = `${altitude} m`;
    if (this.dom.finalOrbs) this.dom.finalOrbs.textContent = `+${cores}`;
    if (this.dom.finalCrystals) this.dom.finalCrystals.textContent = `+${crystals}`;
    if (this.dom.finalBest) this.dom.finalBest.textContent = `${this.storage.data.highScore} m`;

    if (this.dom.newRecordBadge) {
      this.dom.newRecordBadge.style.display = isNewRecord ? 'block' : 'none';
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
            this.dom.reviveStatusText.textContent = '1x pro Flug • Inkl. 3s Schutzschild';
          }
        } else {
          if (this.dom.btnGameOverRevive) {
            this.dom.btnGameOverRevive.disabled = true;
          }
          if (this.dom.reviveBtnText) {
            this.dom.reviveBtnText.textContent = '0 KRISTALLE (WERBUNG BALD)';
          }
          if (this.dom.reviveStatusText) {
            this.dom.reviveStatusText.textContent = 'Finde seltene Kristalle im Flug!';
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
          this.dom.reviveStatusText.textContent = '1x pro Flug möglich.';
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
      this.dom.menuQuestsBadge.textContent = `${unclaimed} BEREIT`;
      this.dom.menuQuestsBadge.style.display = unclaimed > 0 ? 'inline-block' : 'none';
    }
  }

  renderGlobalLeaderboard() {
    if (!this.dom.globalLeaderboardList) return;
    this.dom.globalLeaderboardList.innerHTML = '';

    const topList = CONSTANTS.GLOBAL_LEADERBOARD_TOP || [];
    
    if (topList.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = 'leaderboard-empty';
      emptyMsg.style.padding = '20px';
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = '#94a3b8';
      emptyMsg.style.fontSize = '12px';
      emptyMsg.innerHTML = '<i>Noch keine Online-Daten verfügbar.</i><br>Dein persönlicher Rekord wird hier bald mit der Welt verglichen!';
      this.dom.globalLeaderboardList.appendChild(emptyMsg);
    } else {
      topList.forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = `leaderboard-row top-rank-${idx + 1}`;
        row.innerHTML = `
          <div class="lb-rank">#${entry.rank}</div>
          <div class="lb-name">${entry.name}</div>
          <div class="lb-ship">${entry.ship}</div>
          <div class="lb-alt">${entry.altitude}m</div>
          <div class="lb-score">${entry.score.toLocaleString('de-DE')} Pkt</div>
          <div class="lb-date">${entry.date}</div>
        `;
        this.dom.globalLeaderboardList.appendChild(row);
      });
    }

    // Calculate realistic player global percentile rank
    const bestAltitude = this.storage.data.highScore || 0;
    let rank = 10000;
    let percentile = 99;
    let deltaText = 'Erreiche 20m für deinen ersten weltweiten Rang.';

    if (bestAltitude > 0) {
      if (bestAltitude >= 2480) {
        rank = 1;
        percentile = 0.01;
        deltaText = 'Unangefochtene weltweite Spitze!';
      } else if (bestAltitude >= 2000) {
        rank = Math.max(2, Math.floor(10 - (bestAltitude - 2000) / 60));
        percentile = (rank / 100).toFixed(2);
        deltaText = `Du fliegst in der absoluten Elite!`;
      } else if (bestAltitude >= 1000) {
        rank = Math.floor(10 + (2000 - bestAltitude) * 0.45);
        percentile = ((rank / 10000) * 100).toFixed(1);
        deltaText = `Noch ${Math.max(1, 1020 - bestAltitude > 0 ? 1020 - bestAltitude : 20)}m bis zu den Top 10`;
      } else {
        rank = Math.max(12, Math.floor(10000 - Math.pow(bestAltitude / 1000, 0.75) * 9500));
        percentile = Math.max(1, Math.min(99, ((rank / 10000) * 100).toFixed(1)));
        const nextTarget = Math.ceil((bestAltitude + 35) / 10) * 10;
        deltaText = `Noch ${nextTarget - bestAltitude}m bis Rang #${rank - 45}`;
      }
    }

    if (this.dom.playerRankBadge) {
      this.dom.playerRankBadge.textContent = bestAltitude > 0 ? `#${rank.toLocaleString('de-DE')}` : '#---';
    }
    if (this.dom.playerRankPercentile) {
      this.dom.playerRankPercentile.textContent = bestAltitude > 0
        ? `TOP ${percentile}% DER WELT (10.000 PILOTEN)`
        : 'NOCH KEIN FLUG ABSOLVIERT';
    }
    if (this.dom.playerRankDelta) {
      this.dom.playerRankDelta.textContent = deltaText;
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

    let actionHtml = '';
    if (q.isClaimed) {
      actionHtml = '<span class="badge-claimed">EINGELÖST</span>';
    } else if (q.isComplete) {
      actionHtml = `<button class="btn-claim" data-id="${q.id}">BELOHNUNG EINSAMMELN</button>`;
    } else {
      actionHtml = `<span>${q.progress} / ${q.target} (${pct}%)</span>`;
    }

    card.innerHTML = `
      <div class="quest-card-top">
        <span class="quest-card-title">${q.title}</span>
        <span class="quest-card-reward">+${q.reward} ${UIManager.COIN_SVG}</span>
      </div>
      <div class="quest-card-desc">${q.description}</div>
      <div class="quest-bar-bg">
        <div class="quest-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="quest-card-foot">
        <div class="quest-action-slot">${actionHtml}</div>
      </div>
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

    if (this.dom.btnPerf) {
      this.updatePerfButtonText();
      this.dom.btnPerf.addEventListener('click', () => {
        this.storage.data.settings.performanceMode = !this.storage.data.settings.performanceMode;
        this.storage.save();
        this.updatePerfButtonText();
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

  updatePerfButtonText() {
    if (!this.dom.btnPerf) return;
    const active = this.storage.data.settings.performanceMode;
    this.dom.btnPerf.textContent = active ? 'AN' : 'AUS';
  }
}
