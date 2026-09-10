/**
 * Space Jump - GameEngine
 * Master Architecture Controller managing Game Loop, Micro-Freeze Hitstops,
 * Camera Physics, Near-Miss Detection, Input Dispatching and Rendering Pipeline.
 */
class GameEngine {
  constructor() {
    // Canvas & Context
    this.canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();
    // desynchronized canvases extra-copy under DOM overlays and desync rAF telemetry
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = 1;

    // Subsystems
    this.storage = new StorageService();
    this.audio = new AudioManager(this.storage);
    this.particles = new ParticleSystem(400, 40);
    this.input = new InputManager();
    this.world = new WorldManager(this.storage);
    this.shop = new ShopManager(this.storage, this.audio, this.world);
    this.missions = new MissionManager(this.storage, this.audio, null);

    this.state = new StateManager((newState, oldState, data) => {
      this.handleStateTransition(newState, oldState, data);
    });

    this.ui = new UIManager(
      this.storage,
      this.audio,
      this.shop,
      this.missions,
      this.input
    );
    this.ui.setStateManager(this.state);

    // Gameplay Entities & Run State
    this.player = null;
    this.cameraY = 0;
    this.isTutorial = false;
    this.tutorialPhase = 0;
    this.tutorialStep = 0;
    this.tutorialSlingshots = 0;
    this.tutorialFrozen = false;
    this.tutorialCelebrateTimer = 0;
    this.shipFrozen = false;
    this.hookSlowMo = false;
    this.momentSlowMoLeft = 0;
    this.momentSlowMoFactor = 0.28;
    this.earlyCatchCooldown = 0;
    this.maxAltitudeMeters = 0;
    this.startAltitudeY = 0;
    this.runCores = 0;
    this.runSlingshots = 0;
    this.runBestSwingMeters = 0;
    this.runNearMisses = 0;
    this.recordBrokenThisRun = false;
    this.gameStarted = false;
    this.nearestNode = null;

    // Time & Hitstop Micro-Freeze
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.hitstopTimer = 0; // ms
    this.screenShake = 0;
    this.lastFrameTime = performance.now();

    // High-Precision Real-Time Telemetry & Live FPS Ring Buffer (Zero GC)
    this.fpsCounter = {
      fps: 60.0,
      frameTimeMs: 16.7,
      minFps: 60,
      lastTelemetryTime: performance.now(),
      framesInInterval: 0,
      intervalDtSum: 0,
      intervalMaxDt: 0,
      recentDeltas: new Float32Array(30),
      deltaHead: 0,
      totalSamples: 0
    };

    // Wire Input Callbacks
    this.initInputWiring();
    this.initResizeListener();
  }

  initResizeListener() {
    const container = document.getElementById('game-container');
    const handleResize = () => {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.world.initStarfield(this.width, this.height);
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }
    handleResize();
  }

  initInputWiring() {
    this.input.onActionDown = () => {
      if (this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.TUTORIAL)) {
        this.handlePlayActionDown();
      }
    };

    this.input.onActionUp = () => {
      if (this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.TUTORIAL)) {
        this.handlePlayActionUp();
      }
    };

    this.input.onPauseToggle = () => {
      if (this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.TUTORIAL)) {
        this.state.changeState(StateManager.STATES.PAUSED);
      } else if (this.state.is(StateManager.STATES.PAUSED)) {
        this.state.changeState(StateManager.STATES.PLAYING);
      }
    };

    this.input.onRestartTrigger = () => {
      if (this.state.is(StateManager.STATES.GAME_OVER) || this.state.is(StateManager.STATES.PAUSED)) {
        this.startNewRun({ tutorial: this.isTutorial });
      }
    };
  }

  shouldStartTutorial() {
    if (this.ui && this.ui.isTutorialForcedByQuery()) return true;
    return !(this.storage.data.settings && this.storage.data.settings.tutorialCompleted);
  }

  handleStateTransition(newState, oldState, contextData) {
    this.ui.showState(newState, oldState, contextData);

    const startingRun = (
      (newState === StateManager.STATES.PLAYING || newState === StateManager.STATES.TUTORIAL) &&
      oldState !== StateManager.STATES.PAUSED
    );
    if (startingRun && (!contextData || !contextData.isRevive)) {
      this.startNewRun({ tutorial: !!(contextData && contextData.tutorial) });
    }

    if (newState === StateManager.STATES.MENU) {
      this.gameStarted = false;
      this.player = null;
      this.ui.hideTutorialTip();
    }
  }

  startNewRun(options = {}) {
    const tutorial = options.tutorial === true;
    this.isTutorial = tutorial;
    this.tutorialPhase = 0;
    this.tutorialStep = tutorial ? 1 : 0;
    this.tutorialSlingshots = 0;
    this.tutorialCelebrateTimer = 0;
    this.shipFrozen = false;
    this.hookSlowMo = false;
    this.momentSlowMoLeft = 0;
    this.momentSlowMoFactor = CONSTANTS.PHYSICS.MOMENT_SLOWMO_FACTOR;
    this.earlyCatchCooldown = 0;
    this.cameraY = 0;
    this.maxAltitudeMeters = 0;
    this.runCores = 0;
    this.runCrystals = 0;
    this.hasRevivedThisRun = false;
    this.reviveCheckpoint = null;
    this.runSlingshots = 0;
    this.runBestSwingMeters = 0;
    this.runNearMisses = 0;
    this.slingshotCombo = 0;
    this.lastSlingshotTime = 0;
    this.recordBrokenThisRun = false;
    this.gameStarted = true;
    this.isDying = false;
    this.nearestNode = null;
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.hitstopTimer = 0;
    this.screenShake = 0;
    this.runStartTime = Date.now();

    this.particles.reset();
    this.missions.resetRunMetrics();

    // World & Start Node
    const startNode = this.world.reset(this.width, this.height);

    // Initialize player with selected custom ship and trail positioned on startNode
    const shipId = this.storage.data.selectedShip;
    const trailId = this.storage.data.selectedTrail;
    this.player = new Spaceship(startNode.x, startNode.y - 145, shipId, trailId);
    this.player.isHooked = false;
    this.player.hookedNode = null;
    this.player.vx = 0;
    this.player.vy = CONSTANTS.PHYSICS.MIN_ORBIT_SPEED;
    this.player.orbitSpinScale = 1;
    this.startAltitudeY = this.player.y;

    // Node sits in front of the nose; ship slightly below mid-screen
    this.cameraY = this.player.y - this.height * 0.42;

    this.ui.updateHUD(0, this.storage.data.highScore, this.storage.data.cores);
    this.ui.setSlowMoVisual(false);
    this.ui.setDangerVisual(0);
    this.ui.setPressCueVisible(false);
    this.ui.setTrainingDoneVisible(false);

    if (tutorial) {
      this.ui.setTutorialSkipVisible(true);
    } else {
      this.ui.setTutorialSkipVisible(false);
    }

    this.state.changeState(StateManager.STATES.PLAYING);
  }

  completeTutorial(didPerfect = false) {
    if (!this.isTutorial) return;
    this.isTutorial = false;
    this.tutorialStep = 0;
    this.shipFrozen = false;
    if (this.timeScale < 0.08) this.timeScale = CONSTANTS.PHYSICS.MOMENT_SLOWMO_FACTOR;
    this.tutorialCelebrateTimer = 2.2;
    this.storage.data.settings.tutorialCompleted = true;
    this.storage.save();
    this.storage.addCores(50);
    this.ui.updateCurrency();
    this.ui.updatePlayButtonLabel();
    this.ui.setTutorialSkipVisible(false);
    this.ui.setPressCueVisible(false);
    this.ui.setTrainingDoneVisible(true);
    this.triggerMomentSlowMo(1.5, CONSTANTS.PHYSICS.MOMENT_SLOWMO_FACTOR);
  }

  skipTutorial() {
    if (!this.isTutorial) {
      this.ui.setTutorialSkipVisible(false);
      return;
    }
    this.isTutorial = false;
    this.tutorialStep = 0;
    this.shipFrozen = false;
    this.timeScale = 1;
    this.targetTimeScale = this.hookSlowMo ? CONSTANTS.PHYSICS.SLOWMO_FACTOR : 1.0;
    this.storage.data.settings.tutorialCompleted = true;
    this.storage.save();
    this.ui.updatePlayButtonLabel();
    this.ui.setTutorialSkipVisible(false);
    this.ui.setPressCueVisible(false);
    this.ui.setTrainingDoneVisible(false);
  }

  onTutorialHooked() {
    if (!this.isTutorial) return;
    this.shipFrozen = false;
    const slow = CONSTANTS.PHYSICS.TUTORIAL_RELEASE_SLOWMO || 0.05;
    this.timeScale = slow;
    this.targetTimeScale = slow;
    if (this.player) {
      this.player.orbitSpinScale = CONSTANTS.PHYSICS.TUTORIAL_ORBIT_SPIN;
    }
  }

  onTutorialReleased(isPerfectLaunch) {
    if (!this.isTutorial) return;
    this.tutorialSlingshots += 1;
    const needed = CONSTANTS.PHYSICS.TUTORIAL_CYCLES || 5;
    if (this.tutorialSlingshots >= needed) {
      this.completeTutorial(!!isPerfectLaunch);
    }
  }

  updateTutorialCoach() {
    if (!this.isTutorial || !this.player) return;
    if (this.player.isHooked) {
      this.player.orbitSpinScale = CONSTANTS.PHYSICS.TUTORIAL_ORBIT_SPIN;
    }
  }

  applyFirstOrbitFeel() {
    if (!this.player) return;
    if (this.isTutorial) {
      this.player.orbitSpinScale = CONSTANTS.PHYSICS.TUTORIAL_ORBIT_SPIN;
      return;
    }
    if (this.runSlingshots > 0) return;
    this.player.orbitSpinScale = CONSTANTS.PHYSICS.FIRST_ORBIT_SPIN;
  }

  hasHookableNodeNearby() {
    if (!this.player || !this.world || !this.world.nodes) return false;
    const range = CONSTANTS.PHYSICS.HOOK_RANGE * 1.12;
    for (let i = 0; i < this.world.nodes.length; i++) {
      const node = this.world.nodes[i];
      if (!node || node.isBroken || node.type === 'HAZARD' || node.type === 'DECOY') continue;
      if (Math.hypot(this.player.x - node.x, this.player.y - node.y) <= range) return true;
    }
    return false;
  }

  updateShipFreeze() {
    if (!this.isTutorial || !this.player || this.isDying || this.tutorialCelebrateTimer > 0) {
      this.shipFrozen = false;
      return;
    }
    if (this.player.isHooked) {
      this.shipFrozen = false;
      return;
    }
    if (this.shipFrozen) {
      this.player.vx = 0;
      this.player.vy = 0;
      return;
    }
    const freezeVy = CONSTANTS.PHYSICS.TUTORIAL_FREEZE_VY || -180;
    if (this.player.vy < freezeVy && this.hasHookableNodeNearby()) {
      this.shipFrozen = true;
      this.player.vx = 0;
      this.player.vy = 0;
    }
  }

  shouldShowPressCue() {
    if (!this.isTutorial || this.tutorialCelebrateTimer > 0 || !this.player || this.player.isHooked) {
      return false;
    }
    const node = this.nearestNode;
    const dist = node ? Math.hypot(this.player.x - node.x, this.player.y - node.y) : 9999;
    return this.shipFrozen || dist <= CONSTANTS.PHYSICS.HOOK_RANGE;
  }

  inEarlySafety() {
    return this.isTutorial === true;
  }

  triggerMomentSlowMo(seconds = 1.1, factor = CONSTANTS.PHYSICS.MOMENT_SLOWMO_FACTOR) {
    this.momentSlowMoLeft = Math.max(this.momentSlowMoLeft, seconds);
    this.momentSlowMoFactor = factor;
    this.targetTimeScale = factor;
    this.ui.setSlowMoVisual(true);
  }

  catchEarlyFall() {
    if (!this.player || this.player.isHooked || this.isDying) return false;
    if (!this.inEarlySafety()) return false;
    if (this.player.y > this.cameraY + 72) return false;

    this.player.y = this.cameraY + 88;
    this.player.vy = Math.max(380, Math.abs(this.player.vy) * 0.45 + 260);
    this.player.vx *= 0.72;
    this.triggerMomentSlowMo(0.45, 0.36);
    this.earlyCatchCooldown = 0.35;
    return true;
  }

  triggerScreenShake(amount) {
    const intensity = this.storage.data.settings.screenShakeIntensity || 1.0;
    this.screenShake = Math.max(this.screenShake, amount * intensity);
  }

  triggerHitstop(ms = 16) {
    // Strictly cap hitstop to 1 single frame (~16ms) to prevent perceived simulation lag
    this.hitstopTimer = Math.min(ms, 16);
  }

  setSlowMo(active) {
    this.hookSlowMo = !!active;
    if (this.momentSlowMoLeft > 0) {
      this.ui.setSlowMoVisual(true);
      return;
    }
    if (active && this.isTutorial) {
      this.targetTimeScale = CONSTANTS.PHYSICS.TUTORIAL_RELEASE_SLOWMO || 0.05;
    } else {
      this.targetTimeScale = active ? CONSTANTS.PHYSICS.SLOWMO_FACTOR : 1.0;
    }
    this.ui.setSlowMoVisual(active);
  }

  handlePlayActionDown() {
    this.audio.init();

    if (this.tutorialFrozen) return;

    if (!this.gameStarted && this.player && this.player.isHooked) {
      return;
    }

    if (this.player && !this.player.isHooked) {
      const targetNode = this.nearestNode || this.world.getNearestNode(this.player, this.cameraY);
      const hooked = targetNode ? this.player.tryHook(targetNode, this.audio, (s) => this.setSlowMo(s), this.particles, this.cameraY) : false;
      if (hooked) {
        this.shipFrozen = false;
        this.onTutorialHooked();
        this.applyFirstOrbitFeel();
        this.ui.setPressCueVisible(false);
      }
      if (!hooked && this.gameStarted) {
        if (this.particles) {
          const aimAngle = this.player.angle || -Math.PI / 2;
          this.particles.spawnThrust(
            this.player.x,
            this.player.y,
            Math.cos(aimAngle) * 120,
            Math.sin(aimAngle) * 120,
            'rgba(148, 163, 184, 0.7)',
            0.6
          );
        }
      }
    }
  }

  handlePlayActionUp() {
    if (this.tutorialFrozen) return;

    if (!this.gameStarted) {
      this.gameStarted = true;
    }

    if (this.player && this.player.isHooked) {
      this.runSlingshots++;
      this.missions.onSlingshotPerformed();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(8); } catch (e) {}
      }

      this.player.releaseHook(
        false,
        this.audio,
        (s) => this.setSlowMo(s),
        this.particles,
        (isBoost, forced, isPerfectLaunch, tangentY, newCombo) => {
          if (isBoost) {
            this.triggerScreenShake(4);
            this.missions.onSuperBoostUsed();
          } else if (isPerfectLaunch) {
            // Consecutive perfect 90-degree steep launch: chain combo up to x10!
            this.slingshotCombo = newCombo || Math.min(10, this.slingshotCombo + 1);
            if (this.player) this.player.combo = this.slingshotCombo;

            // Direct Immediate Rewards for Hitting 90°:
            // 1. Direct Bonus Currency (+1 to +10 coins matching combo!)
            const bonusCoins = this.slingshotCombo;
            this.runCores += bonusCoins;
            this.storage.addCores(bonusCoins);
            this.ui.updateCurrency();

            // Combo color escalation: from --neutral-cyan (x1-x2) toward --premium (x8-x10)
            const comboColors = ['#00f0ff', '#00f0ff', '#38bdf8', '#38bdf8', '#818cf8', '#a855f7', '#a855f7', '#c084fc', '#c084fc', '#d946ef'];
            const color = comboColors[Math.min(this.slingshotCombo - 1, comboColors.length - 1)];

            // Minimalist Arcade Combo Label: "PERFEKT" on x1, and "COMBO xN" on chains (Clean & Punchy)
            const label = this.slingshotCombo === 1
              ? 'PERFEKT'
              : `COMBO x${this.slingshotCombo}`;

            const comboFontSize = Math.min(32, 22 + this.slingshotCombo * 1.0);
            this.particles.spawnFloatingText(this.player.x, this.player.y + 40, label, color, comboFontSize, true);

            if (this.slingshotCombo >= 4) {
              this.triggerScreenShake(Math.min(4, this.slingshotCombo - 2));
            }
            this.storage.updateBestCombo(this.slingshotCombo);
            if (this.missions) this.missions.onCombo(this.slingshotCombo);
          } else {
            // Normal release resets combo - smooth flight with zero shake
            this.slingshotCombo = 0;
            if (this.player) this.player.combo = 0;
            if (this.ui) this.ui.hideComboBadge();
          }
          this.onTutorialReleased(!!isPerfectLaunch);
        },
        this.slingshotCombo
      );

      if (this.player) {
        const launchSpd = Math.hypot(this.player.vx, this.player.vy);
        const estSwing = Math.max(14, Math.round((launchSpd / 620) * 38));
        this.runBestSwingMeters = Math.max(this.runBestSwingMeters, estSwing);
      }
    }
  }

  handleNodeBreak(brokenNode) {
    this.triggerScreenShake(5);
    this.particles.spawnShards(brokenNode.x, brokenNode.y, 35, '#e11d48');
    this.particles.spawnFloatingText(brokenNode.x, brokenNode.y + 20, 'CRACK!', '#e11d48');

    if (this.player && this.player.hookedNode === brokenNode) {
      this.player.releaseHook(true, this.audio, (s) => this.setSlowMo(s), this.particles);
    }
  }

  triggerGameOver() {
    this.triggerScreenShake(8);
    this.triggerHitstop(16);
    if (this.audio && this.audio.fadeOutMusic) {
      this.audio.fadeOutMusic(0.22);
    }

    this.particles.spawnShards(this.player.x, this.player.y, 35, '#e11d48');

    // Target true peak altitude achieved by the pilot (never leave them stranded at the void bottom)
    const baseOrigin = (this.startAltitudeY !== undefined && this.startAltitudeY !== null) ? this.startAltitudeY : 380;
    const peakY = Math.max(baseOrigin, Math.floor(baseOrigin + this.maxAltitudeMeters / CONSTANTS.PHYSICS.METERS_PER_PIXEL));

    // Find closest valid anchor to peakY
    const safeCandidates = this.world.nodes.filter(n =>
      !n.isBroken &&
      n.type !== 'DECOY' &&
      n.type !== 'HAZARD' &&
      Math.abs(n.y - peakY) <= 320
    );
    safeCandidates.sort((a, b) => Math.abs(a.y - peakY) - Math.abs(b.y - peakY));
    const anchor = safeCandidates.length > 0 ? safeCandidates[0] : null;

    this.reviveCheckpoint = {
      cameraY: (anchor ? anchor.y : peakY) - this.height * 0.58,
      maxAltitudeMeters: this.maxAltitudeMeters,
      anchorY: anchor ? anchor.y : peakY,
      anchorX: anchor ? anchor.x : this.width / 2
    };

    // Run Record calculation
    const runResult = this.storage.recordRun(
      this.maxAltitudeMeters,
      this.runCores,
      this.runNearMisses,
      this.runSlingshots
    );

    this.missions.onRunFinished(this.maxAltitudeMeters);

    const durationSec = Math.max(1, Math.round((Date.now() - (this.runStartTime || Date.now())) / 1000));
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const flightTimeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Smooth cinematic post-death slow-mo drift and soft warning vignette
    this.timeScale = 0.35;
    const danger = document.getElementById('danger-overlay');
    if (danger) danger.classList.add('active');

    setTimeout(() => {
      this.timeScale = 1.0;
      if (danger) danger.classList.remove('active');
      this.state.changeState(StateManager.STATES.GAME_OVER, {
        altitude: this.maxAltitudeMeters,
        cores: this.runCores,
        crystals: this.runCrystals,
        nearMisses: this.runNearMisses,
        grapples: this.runSlingshots,
        bestSwing: this.runBestSwingMeters || (this.maxAltitudeMeters > 0 ? Math.min(this.maxAltitudeMeters, 24) : 0),
        flightTime: flightTimeStr,
        totalScore: runResult.totalScore,
        isNewRecord: runResult.isNewHighScore,
        canRevive: !this.hasRevivedThisRun
      });
    }, 750);
  }

  revivePlayer() {
    if (this.hasRevivedThisRun) return false;
    if (!this.storage.spendHyperCrystals(1)) return false;

    this.hasRevivedThisRun = true;
    this.storage.recordRevive();
    this.isDying = false;

    // Restore altitude and checkpoint at pilot's peak height
    const baseOrigin = (this.startAltitudeY !== undefined && this.startAltitudeY !== null) ? this.startAltitudeY : 380;
    const peakY = Math.max(baseOrigin, Math.floor(baseOrigin + this.maxAltitudeMeters / CONSTANTS.PHYSICS.METERS_PER_PIXEL));
    const cp = this.reviveCheckpoint || {
      cameraY: peakY - this.height * 0.58,
      maxAltitudeMeters: this.maxAltitudeMeters,
      anchorY: peakY,
      anchorX: this.width / 2
    };

    this.maxAltitudeMeters = cp.maxAltitudeMeters;
    this.gameStarted = true;

    // Find the closest safe anchor to cp.anchorY (sorted by closeness, never lowest first)
    const matchingNodes = this.world.nodes.filter(n =>
      !n.isBroken &&
      n.type !== 'DECOY' &&
      n.type !== 'HAZARD' &&
      Math.abs(n.y - cp.anchorY) < 180
    );
    matchingNodes.sort((a, b) => Math.abs(a.y - cp.anchorY) - Math.abs(b.y - cp.anchorY));

    let targetAnchor = matchingNodes.length > 0 ? matchingNodes[0] : null;

    if (!targetAnchor) {
      targetAnchor = new OrbitNode(cp.anchorX, cp.anchorY, 'STANDARD', this.width, cp.maxAltitudeMeters);
      this.world.nodes.push(targetAnchor);
    }

    // Guarantee targetAnchor is 100% solid STANDARD and safe
    targetAnchor.isBroken = false;
    targetAnchor.type = 'STANDARD';
    targetAnchor.isHazard = false;
    targetAnchor.isDecoy = false;
    targetAnchor.isHooked = true;

    // OPTIMIZATION: Replaced .filter() with in-place compaction to prevent GC spikes
    let keepNodesCount = 0;
    for (let i = 0; i < this.world.nodes.length; i++) {
      const n = this.world.nodes[i];
      if (n === targetAnchor || n.type !== 'HAZARD' || Math.hypot(n.x - targetAnchor.x, n.y - targetAnchor.y) > 320) {
        this.world.nodes[keepNodesCount++] = n;
      }
    }
    this.world.nodes.length = keepNodesCount;

    // Recenter camera with generous 58% lower buffer (Anchor sits in upper-middle at 42% from top)
    this.cameraY = targetAnchor.y - this.height * 0.58;

    // Direct, guaranteed hook attachment centered in the visible viewport
    this.player.x = targetAnchor.x + 65;
    this.player.y = targetAnchor.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isHooked = true;
    this.player.hookedNode = targetAnchor;
    this.player.orbitRadius = 65;
    this.player.orbitAngle = 0;
    this.player.orbitDirection = 1;
    this.player.orbitSpeed = 420; // Smooth, manageable entry orbit speed
    this.player.shieldTimer = 4.0; // 4 seconds quantum invulnerability shield
    this.player.trailHistory.length = 0; // Wipe any void plunge streak while preserving pool

    // Clear danger overlay & enable slow-mo visual
    this.ui.setDangerVisual(0);
    this.ui.setSlowMoVisual(true);

    // Shockwave & Quantum VFX
    this.triggerScreenShake(6);
    this.triggerHitstop(16);
    this.particles.spawnShockwave(targetAnchor.x, targetAnchor.y, '#d946ef', 90);
    this.particles.spawnShards(this.player.x, this.player.y, 40, '#d946ef');
    this.particles.spawnSparks(this.player.x, this.player.y, 25, '#f43f5e', 2.0);
    this.particles.spawnFloatingText(this.player.x, this.player.y + 45, 'WIEDERBELEBT!', '#d946ef', 34, true);

    // Guarantee 3 safe, solid ascending steps above the respawn node
    let lastLadderX = targetAnchor.x;
    for (let step = 1; step <= 3; step++) {
      const minStepY = targetAnchor.y + step * 150 - 45;
      const maxStepY = targetAnchor.y + step * 150 + 55;
      const hasNodeInStep = this.world.nodes.some(n =>
        !n.isBroken &&
        n.type !== 'DECOY' &&
        n.type !== 'HAZARD' &&
        n.y >= minStepY &&
        n.y <= maxStepY
      );
      if (!hasNodeInStep) {
        const stepY = targetAnchor.y + step * 155;
        const stepX = Math.max(90, Math.min(this.width - 90, lastLadderX + (step % 2 === 0 ? 110 : -110)));
        const stepAltitude = Math.max(0, Math.floor((stepY - (this.startAltitudeY || 0)) * CONSTANTS.PHYSICS.METERS_PER_PIXEL));
        const ladderNode = new OrbitNode(stepX, stepY, 'STANDARD', this.width, stepAltitude);
        this.world.nodes.push(ladderNode);
        lastLadderX = stepX;
      }
    }

    // Sort world nodes monotonically by altitude
    this.world.nodes.sort((a, b) => a.y - b.y);

    // Generate upcoming world ahead of camera
    this.world.generateUpTo(this.cameraY + this.height + 800, this.width, this.cameraY);

    // Transition back to PLAYING state with isRevive flag (bypasses startNewRun)
    this.state.changeState(StateManager.STATES.PLAYING, { isRevive: true });
    this.ui.updateHUD(this.maxAltitudeMeters, this.storage.data.highScore, this.storage.data.cores);
    this.ui.updateCurrency();
    return true;
  }

  /* =========================================================================
     MASTER LOOP & UPDATE CYCLE
     ========================================================================= */
  update(now) {
    const deltaMs = now - this.lastFrameTime;
    const rawDt = Math.min(deltaMs / 1000, 0.033);
    this.lastFrameTime = now;

    // High-Precision Real-Time Live FPS & Telemetry (Zero GC)
    if (deltaMs > 0 && deltaMs < 500) {
      this.fpsCounter.recentDeltas[this.fpsCounter.deltaHead] = deltaMs;
      this.fpsCounter.deltaHead = (this.fpsCounter.deltaHead + 1) % 30;
      this.fpsCounter.totalSamples++;

      this.fpsCounter.framesInInterval++;
      this.fpsCounter.intervalDtSum += deltaMs;
      if (deltaMs > this.fpsCounter.intervalMaxDt) {
        this.fpsCounter.intervalMaxDt = deltaMs;
      }

      const elapsed = now - this.fpsCounter.lastTelemetryTime;
      // Refresh telemetry every 160ms using the full interval, not a 4-frame spike window
      if (elapsed >= 160 && this.fpsCounter.totalSamples >= 3) {
        const intervalFrames = Math.max(1, this.fpsCounter.framesInInterval);
        const avgDt = this.fpsCounter.intervalDtSum / intervalFrames;
        const liveFps = avgDt > 0 ? 1000 / avgDt : 60;
        const worstDt = this.fpsCounter.intervalMaxDt > 0 ? this.fpsCounter.intervalMaxDt : avgDt;
        const minFps = Math.max(1, Math.round(1000 / worstDt));

        // Precision metrics: live clamp 1..360 FPS (supports 60Hz, 90Hz, 120Hz, 144Hz, 240Hz)
        this.fpsCounter.fps = Math.max(1, Math.min(360, liveFps));
        this.fpsCounter.frameTimeMs = avgDt;
        this.fpsCounter.minFps = minFps;

        this.fpsCounter.lastTelemetryTime = now;
        this.fpsCounter.framesInInterval = 0;
        this.fpsCounter.intervalDtSum = 0;
        this.fpsCounter.intervalMaxDt = 0;

        if (this.ui) {
          this.ui.updateFpsDisplay(this.fpsCounter.fps, this.fpsCounter.frameTimeMs, this.fpsCounter.minFps);
        }
      }
    }

    // Poll Gamepad
    this.input.update();

    // Hitstop Freeze Frame Handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= rawDt * 1000;
      return; // Freeze physics for punchy impact
    }

    if (this.tutorialCelebrateTimer > 0) {
      this.tutorialCelebrateTimer = Math.max(0, this.tutorialCelebrateTimer - rawDt);
      if (this.tutorialCelebrateTimer <= 0) {
        this.ui.setTrainingDoneVisible(false);
      }
    }
    if (this.earlyCatchCooldown > 0) {
      this.earlyCatchCooldown = Math.max(0, this.earlyCatchCooldown - rawDt);
    }
    if (this.momentSlowMoLeft > 0) {
      this.momentSlowMoLeft = Math.max(0, this.momentSlowMoLeft - rawDt);
      this.targetTimeScale = this.momentSlowMoFactor;
      if (this.momentSlowMoLeft <= 0) {
        this.targetTimeScale = this.hookSlowMo ? CONSTANTS.PHYSICS.SLOWMO_FACTOR : 1.0;
        this.ui.setSlowMoVisual(!!this.hookSlowMo);
      }
    }
    if (this.player && (this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.TUTORIAL))) {
      this.updateShipFreeze();
    }
    if (this.momentSlowMoLeft <= 0 && this.isTutorial && this.player && !this.isDying) {
      if (this.player.isHooked) {
        this.targetTimeScale = CONSTANTS.PHYSICS.TUTORIAL_RELEASE_SLOWMO || 0.05;
        this.ui.setSlowMoVisual(true);
      } else if (this.shipFrozen) {
        this.targetTimeScale = 0;
        this.timeScale = 0;
        this.ui.setSlowMoVisual(false);
      }
    }
    this.timeScale += (this.targetTimeScale - this.timeScale) * Math.min(1, rawDt * 16);
    const dt = rawDt * this.timeScale;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - rawDt * 36);
    }

    // STATE: MENU & Modals - Ambient Camera Drift (Top-to-Bottom Floating Stars)
    const isMenuScreen = this.state.is(StateManager.STATES.MENU) ||
      this.state.is(StateManager.STATES.SETTINGS) ||
      this.state.is(StateManager.STATES.STATS) ||
      this.state.is(StateManager.STATES.LEADERBOARD) ||
      this.state.is(StateManager.STATES.QUESTS);

    if (isMenuScreen) {
      this.cameraY += 34 * rawDt;
      this.nearestNode = null;
    }

    // STATE: PLAYING & TUTORIAL - Full Physics & Game Mechanics
    if ((this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.TUTORIAL)) && this.player) {
      // 1. Target Reticle & Nodes
      const nearestNode = this.world.getNearestNode(this.player, this.cameraY);
      this.nearestNode = nearestNode;
      for (const node of this.world.nodes) {
        node.update(dt, this.width, this.audio, (n) => this.handleNodeBreak(n));
        node.isTargeted = (
          !this.player.isHooked &&
          node === nearestNode &&
          Math.hypot(this.player.x - node.x, this.player.y - node.y) <= CONSTANTS.PHYSICS.HOOK_RANGE
        );
      }

      // 1b. Lethal Space Mine / Hazard Detonation Check
      for (const node of this.world.nodes) {
        if (node.type === 'HAZARD' && !node.isBroken) {
          const lethalDist = this.player.radius + node.radius + 6;
          const dist = Math.hypot(this.player.x - node.x, this.player.y - node.y);
          if (dist < lethalDist) {
            node.isBroken = true;
            this.triggerScreenShake(12);
            this.particles.spawnShards(node.x, node.y, 45, '#e11d48');
            this.particles.spawnSparks(node.x, node.y, 35, '#f97316', 2.5);

            if (this.player.isBoostProtected()) {
              // Green Super-Boost Immunity: Shatter mine cleanly without dying!
              this.particles.spawnShockwave(node.x, node.y, '#10b981', 80);
              this.particles.spawnFloatingText(node.x, node.y + 35, 'MINE ZERSTÖRT!', '#10b981', 26, true);
            } else if (!this.inEarlySafety() && (!this.player.shieldTimer || this.player.shieldTimer <= 0)) {
              this.particles.spawnFloatingText(node.x, node.y + 35, 'MINE DETONIERT!', '#e11d48', 32, true);
              this.isDying = true;
              this.triggerGameOver();
            } else {
              this.player.shieldTimer = 0.5;
              this.particles.spawnFloatingText(this.player.x, this.player.y - 30, 'SCHILD ABSORBIERT!', '#38bdf8', 22);
            }
            break;
          }
        }
      }

      // 2. Cores, Coins & Ultra-Rare Hyper-Kristalle
      for (const orb of this.world.energyOrbs) {
        orb.update(dt, this.player, this.particles);

        if (!orb.collected) {
          const dist = Math.hypot(this.player.x - orb.x, this.player.y - orb.y);
          if (dist < this.player.radius + orb.radius + 8) {
            orb.collected = true;

            if (orb.type === 'CRYSTAL') {
              this.runCrystals++;
              this.storage.addHyperCrystals(1);
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(16); } catch (e) {}
              }
              this.triggerScreenShake(3);

              this.particles.spawnFloatingText(orb.x, orb.y + 25, '+1 SPARK!', '#d946ef', 28, true);
              this.particles.spawnShards(orb.x, orb.y, 25, '#d946ef');
              this.particles.spawnSparks(orb.x, orb.y, 20, '#f43f5e', 1.8);
            } else {
              this.runCores++;
              this.storage.addCores(1);
              this.missions.onCoreCollected();

              this.particles.spawnFloatingText(orb.x, orb.y + 15, `+${CONSTANTS.SCORE.PARTICLE_VALUE}`, '#fbbf24');
              this.particles.spawnSparks(orb.x, orb.y, 14, '#fbbf24', 1.2);
            }

            this.ui.updateHUD(this.maxAltitudeMeters, this.storage.data.highScore, this.storage.data.cores);
            this.ui.updateCurrency(false);
          }
        }
      }

      // 3. Spaceship Dynamics
      if (!this.isDying) {
        if (this.shipFrozen) {
          this.player.vx = 0;
          this.player.vy = 0;
        } else {
          this.player.update(dt, this.width, this.particles);
        }

        if (this.input.actionHeld && !this.player.isHooked) {
          if (nearestNode && Math.hypot(this.player.x - nearestNode.x, this.player.y - nearestNode.y) <= CONSTANTS.PHYSICS.HOOK_RANGE) {
            const hooked = this.player.tryHook(nearestNode, this.audio, (s) => this.setSlowMo(s), this.particles, this.cameraY);
            if (hooked) {
              this.shipFrozen = false;
              this.onTutorialHooked();
              this.applyFirstOrbitFeel();
              this.ui.setPressCueVisible(false);
            }
          }
        }
      }

      if (this.isTutorial) {
        this.updateTutorialCoach();
      }
      this.ui.setPressCueVisible(false);

      // 4. Camera Follow (Upwards Only, centered at 50% screen height)
      if (this.gameStarted && !this.isDying) {
        const targetCamY = this.player.y - this.height * 0.50;
        if (targetCamY > this.cameraY) {
          this.cameraY = targetCamY;
        }

        // Altitude Score
        const baseOrigin = (this.startAltitudeY !== undefined && this.startAltitudeY !== null) ? this.startAltitudeY : 0;
        const currentMeters = Math.max(0, Math.floor((this.player.y - baseOrigin) * CONSTANTS.PHYSICS.METERS_PER_PIXEL));
        if (currentMeters > this.maxAltitudeMeters) {
          this.maxAltitudeMeters = currentMeters;
          this.missions.onAltitudeUpdate(this.maxAltitudeMeters, this.player.hookedNode && this.player.hookedNode.type === 'FRAGILE');
          this.ui.updateHUD(this.maxAltitudeMeters, this.storage.data.highScore, this.storage.data.cores);

          if (!this.isTutorial && this.storage.data.highScore > 0 && this.maxAltitudeMeters > this.storage.data.highScore && !this.recordBrokenThisRun) {
            this.recordBrokenThisRun = true;
            this.triggerMomentSlowMo(1.15, CONSTANTS.PHYSICS.MOMENT_SLOWMO_FACTOR);
            this.ui.showRecordFlash(this.storage.data.highScore, this.maxAltitudeMeters);
          }
        }

        // 5. Danger & Near-Miss Detection
        const playerScreenY = this.height - (this.player.y - this.cameraY);
        if (!this.inEarlySafety() && playerScreenY > this.height - 140) {
          const dangerRatio = (playerScreenY - (this.height - 140)) / 140;
          this.ui.setDangerVisual(dangerRatio);

          // Near Miss trigger if recovering from close call
          if (playerScreenY > this.height - 50 && this.player.vy > 250) {
            this.runNearMisses++;
            this.missions.onNearMiss();
            this.particles.spawnFloatingText(this.player.x, this.player.y + 25, 'NEAR MISS!', '#e11d48');
          }
        } else {
          this.ui.setDangerVisual(0);
        }

        // 6. Tutorial safety net if the freeze never triggers (no node in range)
        if (this.inEarlySafety() && !this.shipFrozen) {
          this.catchEarlyFall();
        }

        // 6b. Quantum Safety Trampoline (Bounce ship back up if falling near void during quantum shield)
        if (!this.inEarlySafety() && this.player.shieldTimer > 0 && this.player.y <= this.cameraY + 60) {
          this.player.vy = Math.max(540, Math.abs(this.player.vy) + 220);
          this.player.y = this.cameraY + 65;
          this.triggerScreenShake(5);
          this.particles.spawnShockwave(this.player.x, this.player.y, '#d946ef', 60);
          this.particles.spawnSparks(this.player.x, this.player.y, 25, '#d946ef', 2.0);
          this.particles.spawnFloatingText(this.player.x, this.player.y + 35, 'QUANTEN-RÜCKSTOSS!', '#d946ef', 22, true);
        }

        // 7. Death Collision (Disabled in Tutorial and during Active Shield)
        if (!this.inEarlySafety() && (!this.player.shieldTimer || this.player.shieldTimer <= 0) && this.player.y <= this.cameraY + CONSTANTS.PHYSICS.DEATH_BUFFER_PX && !this.isDying) {
          this.isDying = true;
          this.triggerGameOver();
        }
      }

      this.world.generateUpTo(this.cameraY + this.height + 700, this.width, this.cameraY);
    }

    // Update Particles
    this.particles.update(dt, CONSTANTS.PHYSICS.GRAVITY);
  }

  /* =========================================================================
     RENDERING PIPELINE
     ========================================================================= */
  render(now) {
    // Always paint the void at identity CSS-pixel transform first.
    // Speed-zoom used to scale that fill smaller than the canvas, so
    // leftover frames smeared into a ghost band at the top and bottom.
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const playerVy = (this.player && !this.player.isHooked) ? this.player.vy : 0;
    this.world.drawBackground(this.ctx, this.width, this.height, this.cameraY, now, playerVy);

    this.ctx.save();

    // Screenshake Offset
    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake * 2;
      const sy = (Math.random() - 0.5) * this.screenShake * 2;
      this.ctx.translate(sx, sy);
    }

    const isActiveRun = this.player && (
      this.state.is(StateManager.STATES.PLAYING) ||
      this.state.is(StateManager.STATES.TUTORIAL) ||
      this.state.is(StateManager.STATES.PAUSED)
    );

    // Dynamic Camera Zoom for Speed Sensation (gameplay only — not the void fill)
    if (isActiveRun && this.player.vy > 600) {
      const speedZoom = Math.max(0.85, 1.0 - ((this.player.vy - 600) / 4000));
      if (speedZoom < 1) {
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(speedZoom, speedZoom);
        this.ctx.translate(-this.width / 2, -this.height / 2);
      }
    }

    const theme = this.world.currentTheme;

    // 2. Nodes & Orbs (Suppressed in Main Menu and Menu Modal Tabs)
    const isMenuScreen = this.state.is(StateManager.STATES.MENU) ||
      this.state.is(StateManager.STATES.SETTINGS) ||
      this.state.is(StateManager.STATES.STATS) ||
      this.state.is(StateManager.STATES.LEADERBOARD) ||
      this.state.is(StateManager.STATES.QUESTS);

    if (!isMenuScreen) {
      for (const orb of this.world.energyOrbs) {
        orb.draw(this.ctx, this.cameraY, this.height, theme);
      }
      for (const node of this.world.nodes) {
        node.draw(this.ctx, this.cameraY, this.height, theme);
      }
    }

    // 3. Particles
    this.particles.draw(this.ctx, this.cameraY, this.height);

    // 4. Spaceship & Trajectory (Only when active run)
    if (isActiveRun) {
      this.player.draw(this.ctx, this.cameraY, this.width, this.height, this.nearestNode, theme);

      // 4b. Quiet ship callouts — only the action word, only when it matters
      if (this.player) {
        const playerScreenY = this.height - (this.player.y - this.cameraY);
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = '800 16px "Rajdhani", sans-serif';
        this.ctx.letterSpacing = '1.6px';
        const pulseAlpha = Math.sin(now / 140) * 0.25 + 0.75;
        const hintGreen = `rgba(74, 222, 128, ${pulseAlpha})`;

        if (this.isTutorial) {
          if (!this.player.isHooked && this.shouldShowPressCue()) {
            const side = this.player.x < this.width * 0.62 ? 1 : -1;
            this.ctx.textAlign = side > 0 ? 'left' : 'right';
            this.ctx.fillStyle = hintGreen;
            this.ctx.fillText('DRÜCKEN', this.player.x + side * 38, playerScreenY + 5);
            this.ctx.textAlign = 'center';
          } else if (this.player.isHooked && this.player.getLaunchTangentY() >= 0.82) {
            this.ctx.fillStyle = hintGreen;
            this.ctx.fillText('LOSLASSEN', this.player.x, playerScreenY - 40);
          }
        } else if (this.state.is(StateManager.STATES.PLAYING) && this.storage.data.stats.totalRuns < 3 && this.storage.data.highScore < 150) {
          if (this.player.isHooked) {
            const ty = this.player.getLaunchTangentY();
            if (ty >= 0.82) {
              this.ctx.fillStyle = hintGreen;
              this.ctx.fillText('LOSLASSEN', this.player.x, playerScreenY - 40);
            }
          }
        }
        this.ctx.restore();
      }
    }

    this.ctx.restore();

    // 5. Death Horizon (Rendered in unscaled screen coordinates across full viewport width)
    if (this.gameStarted && !this.inEarlySafety() && (this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.PAUSED))) {
      this.world.drawBottomDeathBoundary(this.ctx, now, this.width, this.height);
    }
  }

  start() {
    const loop = (now) => {
      this.update(now);
      this.render(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
