/**
 * Sling Jump - GameEngine
 * Master Architecture Controller managing Game Loop, Micro-Freeze Hitstops,
 * Camera Physics, Near-Miss Detection, Input Dispatching and Rendering Pipeline.
 */
class GameEngine {
  constructor() {
    // Canvas & Context
    this.canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.width = rect.width;
    this.height = rect.height;
    this.dpr = 1;

    // Subsystems
    this.storage = new StorageService();
    this.audio = new AudioManager(this.storage);
    this.particles = new ParticleSystem(
      this.storage.data.settings.performanceMode ? 300 : 600,
      40
    );
    this.input = new InputManager();
    this.world = new WorldManager(this.storage);
    this.shop = new ShopManager(this.storage, this.audio, this.world);
    this.missions = new MissionManager(this.storage, this.audio, (q) => {
      this.ui.showQuestToast(q);
    });

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
    this.tutorialFrozen = false;
    this.maxAltitudeMeters = 0;
    this.runCores = 0;
    this.runSlingshots = 0;
    this.runNearMisses = 0;
    this.recordBrokenThisRun = false;
    this.gameStarted = false;

    // Time & Hitstop Micro-Freeze
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.hitstopTimer = 0; // ms
    this.screenShake = 0;
    this.lastFrameTime = performance.now();

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

      // Also size hangar preview canvas
      if (this.ui.dom.hangarCanvas) {
        this.ui.dom.hangarCanvas.width = 240;
        this.ui.dom.hangarCanvas.height = 180;
      }
    };

    window.addEventListener('resize', handleResize);
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
      if (this.state.is(StateManager.STATES.PLAYING)) {
        this.state.changeState(StateManager.STATES.PAUSED);
      } else if (this.state.is(StateManager.STATES.PAUSED)) {
        this.state.changeState(StateManager.STATES.PLAYING);
      }
    };

    this.input.onRestartTrigger = () => {
      if (this.state.is(StateManager.STATES.GAME_OVER) || this.state.is(StateManager.STATES.PAUSED)) {
        this.startNewRun();
      }
    };
  }

  handleStateTransition(newState, oldState, contextData) {
    this.ui.showState(newState, oldState, contextData);

    if (newState === StateManager.STATES.PLAYING && oldState !== StateManager.STATES.PAUSED) {
      if (!contextData || !contextData.isRevive) {
        this.startNewRun();
      }
    }

    if (newState === StateManager.STATES.PLAYING && oldState === StateManager.STATES.PAUSED) {
      if (this.audio) this.audio.setDucking(false);
    }
  }

  startTutorial() {
    this.isTutorial = true;
    this.tutorialPhase = 0;
    this.tutorialFrozen = false;

    this.runAltitude = 0;
    this.maxAltitudeMeters = 0;
    this.runCores = 0;
    this.runSlingshots = 0;
    this.runNearMisses = 0;
    this.gameStarted = true;
    this.lastSlingshotTime = 0;
    this.slingshotCombo = 0;
    this.isDying = false;

    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.hitstopTimer = 0;
    this.screenShake = 0;
    this.runStartTime = Date.now();
    if (window.AnalyticsService) {
      window.AnalyticsService.trackRunStart('tutorial');
    }

    this.particles.reset();
    this.missions.resetRunMetrics();

    // Reset world and build custom tutorial curriculum
    this.world.nodes = [];
    this.world.energyOrbs = [];
    this.world.highestGeneratedY = 1400;

    const startNode = new OrbitNode(this.width / 2, 80, 'STANDARD', this.width, 0);
    this.world.nodes.push(startNode);

    // Node 1: STANDARD (Practice Swing)
    const node1 = new OrbitNode(this.width / 2, 240, 'STANDARD', this.width, 10);
    this.world.nodes.push(node1);
    this.world.addSafeStar(this.width / 2, 160, this.width);

    // Node 2: BOOST (Green Super-Boost Arrow)
    const node2 = new OrbitNode(this.width / 2 - 35, 430, 'BOOST', this.width, 30);
    this.world.nodes.push(node2);
    this.world.addSafeStar(this.width / 2 - 20, 335, this.width);

    // Node 3: FRAGILE (Timer / Countdown Dial)
    const node3 = new OrbitNode(this.width / 2 + 40, 700, 'FRAGILE', this.width, 60);
    this.world.nodes.push(node3);

    // Node 4: DECOY (Brittle / Broken Fissures)
    const node4 = new OrbitNode(this.width / 2 - 40, 910, 'DECOY', this.width, 85);
    this.world.nodes.push(node4);

    // Node 5: STANDARD (Safe Finish Anchor)
    const node5 = new OrbitNode(this.width / 2 + 30, 1040, 'STANDARD', this.width, 100);
    this.world.nodes.push(node5);
    this.world.addSafeStar(this.width / 2 + 30, 980, this.width);

    // Setup player on startNode
    const shipId = this.storage.data.selectedShip;
    const trailId = this.storage.data.selectedTrail;
    this.player = new Spaceship(this.width / 2 + 70, startNode.y, shipId, trailId);
    this.player.isHooked = true;
    this.player.hookedNode = startNode;
    this.player.orbitRadius = 70;
    this.player.orbitAngle = 0;
    this.player.orbitSpeed = 440;
    this.player.orbitDirection = 1;
    startNode.isHooked = true;

    this.cameraY = startNode.y - this.height * 0.50;

    this.state.changeState(StateManager.STATES.TUTORIAL);
    this.ui.updateHUD(0, this.storage.data.highScore, this.storage.data.cores);
    this.ui.showTutorialTip('SCHWUNG: LASS BEIM AUFWÄRTSSCHWUNG LOS!');
  }

  startNewRun() {
    this.isTutorial = false;
    this.tutorialFrozen = false;
    this.cameraY = 0;
    this.maxAltitudeMeters = 0;
    this.runCores = 0;
    this.runCrystals = 0;
    this.hasRevivedThisRun = false;
    this.reviveCheckpoint = null;
    this.runSlingshots = 0;
    this.runNearMisses = 0;
    this.slingshotCombo = 0;
    this.lastSlingshotTime = 0;
    this.recordBrokenThisRun = false;
    this.gameStarted = false;
    this.isDying = false;
    this.timeScale = 1.0;
    this.targetTimeScale = 1.0;
    this.hitstopTimer = 0;
    this.screenShake = 0;
    this.runStartTime = Date.now();
    if (window.AnalyticsService) {
      window.AnalyticsService.trackRunStart(this.isTutorial ? 'tutorial' : 'normal');
    }

    this.particles.reset();
    this.missions.resetRunMetrics();

    // World & Start Node
    const startNode = this.world.reset(this.width, this.height);

    // Initialize player with selected custom ship and trail positioned on startNode
    const shipId = this.storage.data.selectedShip;
    const trailId = this.storage.data.selectedTrail;
    this.player = new Spaceship(this.width / 2 + 70, startNode.y, shipId, trailId);
    this.player.isHooked = true;
    this.player.hookedNode = startNode;
    this.player.orbitRadius = 70;
    this.player.orbitAngle = 0;
    this.player.orbitSpeed = 460; // Calm, manageable starting entry speed
    this.player.orbitDirection = 1;
    startNode.isHooked = true;

    // Center camera so the player is positioned in the middle of the screen (50% viewport height)
    this.cameraY = startNode.y - this.height * 0.50;

    this.ui.updateHUD(0, this.storage.data.highScore, this.storage.data.cores);
    this.ui.setSlowMoVisual(true);
    this.ui.setDangerVisual(0);

    this.state.changeState(StateManager.STATES.PLAYING);
  }

  triggerScreenShake(amount) {
    const intensity = this.storage.data.settings.screenShakeIntensity || 1.0;
    this.screenShake = Math.max(this.screenShake, amount * intensity);
  }

  triggerHitstop(ms = CONSTANTS.PHYSICS.HITSTOP_DURATION_MS) {
    this.hitstopTimer = ms;
  }

  setSlowMo(active) {
    this.targetTimeScale = active ? CONSTANTS.PHYSICS.SLOWMO_FACTOR : 1.0;
    this.ui.setSlowMoVisual(active);
    if (this.audio) this.audio.setDucking(active);
  }

  handlePlayActionDown() {
    this.audio.init();

    if (this.tutorialFrozen) return;

    if (!this.gameStarted && this.player && this.player.isHooked) {
      return;
    }

    if (this.player && !this.player.isHooked) {
      const targetNode = this.world.getNearestNode(this.player, this.cameraY);
      const hooked = targetNode ? this.player.tryHook(targetNode, this.audio, (s) => this.setSlowMo(s), this.particles, this.cameraY) : false;
      if (!hooked && this.gameStarted) {
        if (this.audio) this.audio.playProceduralSfx('sfx_ui_click');
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

      this.player.releaseHook(
        false,
        this.audio,
        (s) => this.setSlowMo(s),
        this.particles,
        (isBoost, forced, isPerfectLaunch, tangentY) => {
          if (isBoost) {
            this.triggerScreenShake(4);
            this.triggerHitstop(20);
            this.missions.onSuperBoostUsed();
          } else if (isPerfectLaunch) {
            // Consecutive perfect 90-degree steep launch: chain combo up to x10!
            this.slingshotCombo = Math.min(10, this.slingshotCombo + 1);
            const comboColors = ['#fbbf24', '#f59e0b', '#a855f7', '#c084fc', '#ec4899', '#f43f5e', '#ef4444', '#06b6d4', '#38bdf8', '#10b981'];
            const color = comboColors[Math.min(this.slingshotCombo - 1, comboColors.length - 1)];

            // Single unified label: "PERFEKT 90°!" on x1, and "COMBO xN!" on chains (zero overlap)
            const label = this.slingshotCombo === 1
              ? 'PERFEKT 90°!'
              : (this.slingshotCombo >= 10
                ? 'MAX COMBO x10!'
                : (this.slingshotCombo >= 5 ? `HYPER x${this.slingshotCombo}!` : `COMBO x${this.slingshotCombo}!`));

            const comboFontSize = Math.min(38, 26 + this.slingshotCombo * 1.5);
            this.particles.spawnFloatingText(this.player.x, this.player.y + 40, label, color, comboFontSize, true);
            if (this.ui) this.ui.showComboBadge(label, color);

            if (this.slingshotCombo >= 4) {
              this.triggerScreenShake(Math.min(4, this.slingshotCombo - 2));
            }
            this.triggerHitstop(Math.min(18, 6 + this.slingshotCombo));
            this.storage.updateBestCombo(this.slingshotCombo);
          } else {
            // Normal release resets combo - smooth flight with zero shake
            this.slingshotCombo = 0;
            if (this.ui) this.ui.hideComboBadge();
          }
        },
        this.slingshotCombo
      );
    }
  }

  handleNodeBreak(brokenNode) {
    this.triggerScreenShake(5);
    this.particles.spawnShards(brokenNode.x, brokenNode.y, 35, '#ff3344');
    this.particles.spawnFloatingText(brokenNode.x, brokenNode.y + 20, 'CRACK!', '#ef4444');

    if (this.player && this.player.hookedNode === brokenNode) {
      this.player.releaseHook(true, this.audio, (s) => this.setSlowMo(s), this.particles);
    }
  }

  triggerGameOver() {
    this.triggerScreenShake(8);
    this.triggerHitstop(60);
    this.audio.playSfx('sfx_crash');

    this.particles.spawnShards(this.player.x, this.player.y, 35, '#ef4444');

    // Save accurate crash checkpoint state immediately
    const safeCandidates = this.world.nodes.filter(n => !n.isBroken && n.type !== 'DECOY' && n.y >= this.cameraY);
    const anchor = safeCandidates.length > 0
      ? safeCandidates[0]
      : (this.world.nodes[this.world.nodes.length - 1] || null);

    this.reviveCheckpoint = {
      cameraY: this.cameraY,
      maxAltitudeMeters: this.maxAltitudeMeters,
      anchorY: anchor ? anchor.y : this.cameraY + this.height * 0.45,
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

    if (window.AnalyticsService) {
      window.AnalyticsService.trackRunEnd({
        finalAltitudeMeters: this.maxAltitudeMeters,
        cores: this.runCores,
        crystals: this.runCrystals,
        nearMisses: this.runNearMisses,
        isNewRecord: runResult.isNewHighScore,
        shipId: this.player ? this.player.shipId : 'dart',
        durationSeconds: (Date.now() - (this.runStartTime || Date.now())) / 1000
      });
    }

    setTimeout(() => {
      this.state.changeState(StateManager.STATES.GAME_OVER, {
        altitude: this.maxAltitudeMeters,
        cores: this.runCores,
        crystals: this.runCrystals,
        nearMisses: this.runNearMisses,
        totalScore: runResult.totalScore,
        isNewRecord: runResult.isNewHighScore,
        canRevive: !this.hasRevivedThisRun
      });
    }, 700);
  }

  revivePlayer() {
    if (this.hasRevivedThisRun) return false;
    if (!this.storage.spendHyperCrystals(1)) return false;

    this.hasRevivedThisRun = true;
    this.storage.recordRevive();
    this.isDying = false;

    // Restore altitude and camera state from checkpoint
    const cp = this.reviveCheckpoint || {
      cameraY: this.cameraY,
      maxAltitudeMeters: this.maxAltitudeMeters,
      anchorY: this.cameraY + this.height * 0.45,
      anchorX: this.width / 2
    };

    this.cameraY = cp.cameraY;
    this.maxAltitudeMeters = cp.maxAltitudeMeters;
    this.gameStarted = true;

    // Find or create a safe solid anchor node at the crash height
    let targetAnchor = this.world.nodes.find(n => !n.isBroken && n.type !== 'DECOY' && Math.abs(n.y - cp.anchorY) < 250);
    if (!targetAnchor) {
      targetAnchor = new OrbitNode(cp.anchorX, cp.anchorY, 'STANDARD', this.width, cp.maxAltitudeMeters);
      this.world.nodes.push(targetAnchor);
    }

    targetAnchor.isBroken = false;

    // Hook player directly to this safe anchor with quantum invulnerability shield
    this.player.x = targetAnchor.x + 65;
    this.player.y = targetAnchor.y;
    this.player.vx = 0;
    this.player.vy = 260;
    this.player.orbitSpeed = 820;
    this.player.orbitAngle = 0;
    this.player.orbitDirection = 1;
    this.player.orbitRadius = 65;
    this.player.shieldTimer = 4.0; // 4 seconds quantum invulnerability shield

    // Directly hook player to anchor
    this.player.tryHook(targetAnchor, this.audio, (s) => this.setSlowMo(s), this.particles, this.cameraY);

    // Shockwave & Quantum VFX
    this.triggerScreenShake(6);
    this.triggerHitstop(16);
    this.particles.spawnShards(this.player.x, this.player.y, 40, '#d946ef');
    this.particles.spawnSparks(this.player.x, this.player.y, 25, '#f43f5e', 2.0);
    this.particles.spawnFloatingText(this.player.x, this.player.y + 40, 'WIEDERBELEBT!', '#d946ef', 34, true);

    // Audio
    this.audio.playProceduralSfx('sfx_slingshot_boost', { isBoost: true });

    // Generate upcoming world ahead of camera
    this.world.generateUpTo(this.cameraY + this.height + 700, this.width, this.cameraY);

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
    const rawDt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    // Poll Gamepad
    this.input.update();

    // Hitstop Freeze Frame Handling
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= rawDt * 1000;
      return; // Freeze physics for punchy impact
    }

    this.timeScale += (this.targetTimeScale - this.timeScale) * Math.min(1, rawDt * 16);
    const dt = rawDt * this.timeScale;

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - rawDt * 36);
    }

    // STATE: MENU - Ambient Camera Drift
    if (this.state.is(StateManager.STATES.MENU)) {
      this.cameraY += 28 * rawDt;
      this.world.generateUpTo(this.cameraY + this.height + 600, this.width, this.cameraY);
      for (const node of this.world.nodes) {
        node.update(rawDt, this.width, null, null);
      }
    }

    // STATE: SHOP - Update Live Hangar Preview (Dynamic live selection)
    if (this.state.is(StateManager.STATES.SHOP)) {
      const preview = this.ui.getPreviewSelection();
      const isEquipped = this.ui.isCurrentlyEquippedPreview();
      this.shop.renderPreview(this.ui.dom.hangarCanvas, preview.shipId, preview.trailId, preview.themeId, isEquipped);
    }

    // STATE: PLAYING & TUTORIAL - Full Physics & Game Mechanics
    if (this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.TUTORIAL)) {
      // 1. Target Reticle & Nodes
      const nearestNode = this.world.getNearestNode(this.player, this.cameraY);
      for (const node of this.world.nodes) {
        node.update(dt, this.width, this.audio, (n) => this.handleNodeBreak(n));
        node.isTargeted = (
          !this.player.isHooked &&
          node === nearestNode &&
          Math.hypot(this.player.x - node.x, this.player.y - node.y) <= CONSTANTS.PHYSICS.HOOK_RANGE
        );
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
              this.audio.playProceduralSfx('sfx_slingshot_boost', { isBoost: true });
              this.triggerHitstop(24);
              this.triggerScreenShake(3);

              this.particles.spawnFloatingText(orb.x, orb.y + 25, '+1 KRISTALL!', '#d946ef', 28, true);
              this.particles.spawnShards(orb.x, orb.y, 25, '#d946ef');
              this.particles.spawnSparks(orb.x, orb.y, 20, '#f43f5e', 1.8);
            } else {
              this.runCores++;
              this.storage.addCores(1);
              this.audio.playCorePickup();
              this.missions.onCoreCollected();

              this.triggerHitstop(10);
              this.particles.spawnFloatingText(orb.x, orb.y + 15, `+${CONSTANTS.SCORE.PARTICLE_VALUE}`, '#fbbf24');
              this.particles.spawnSparks(orb.x, orb.y, 14, '#fbbf24', 1.2);
            }

            this.ui.updateHUD(this.maxAltitudeMeters, this.storage.data.highScore, this.storage.data.cores);
            this.ui.updateCurrency();
          }
        }
      }

      // 3. Spaceship Dynamics
      this.player.update(dt, this.width, this.particles);

      if (this.input.actionHeld && !this.player.isHooked) {
        if (nearestNode && Math.hypot(this.player.x - nearestNode.x, this.player.y - nearestNode.y) <= CONSTANTS.PHYSICS.HOOK_RANGE) {
          this.player.tryHook(nearestNode, this.audio, (s) => this.setSlowMo(s), this.particles, this.cameraY);
        }
      }

      // 4. Camera Follow (Upwards Only, centered at 50% screen height)
      if (this.gameStarted) {
        const targetCamY = this.player.y - this.height * 0.50;
        if (targetCamY > this.cameraY) {
          this.cameraY = targetCamY;
        }

        // Altitude Score
        const currentMeters = Math.max(0, Math.floor(this.player.y * CONSTANTS.PHYSICS.METERS_PER_PIXEL));
        if (currentMeters > this.maxAltitudeMeters) {
          this.maxAltitudeMeters = currentMeters;
          this.missions.onAltitudeUpdate(this.maxAltitudeMeters, this.player.hookedNode && this.player.hookedNode.type === 'FRAGILE');
          this.ui.updateHUD(this.maxAltitudeMeters, this.storage.data.highScore, this.storage.data.cores);

          if (!this.isTutorial && this.storage.data.highScore > 0 && this.maxAltitudeMeters > this.storage.data.highScore && !this.recordBrokenThisRun) {
            this.recordBrokenThisRun = true;
            this.triggerHitstop(40);
            this.audio.playProceduralSfx('sfx_slingshot_boost', { isBoost: true });
            this.ui.showRecordFlash();
          }
        }

        // 5. Danger & Near-Miss Detection
        const playerScreenY = this.height - (this.player.y - this.cameraY);
        if (!this.isTutorial && playerScreenY > this.height - 140) {
          const dangerRatio = (playerScreenY - (this.height - 140)) / 140;
          this.ui.setDangerVisual(dangerRatio);

          // Near Miss trigger if recovering from close call
          if (playerScreenY > this.height - 50 && this.player.vy > 250) {
            this.runNearMisses++;
            this.missions.onNearMiss();
            this.particles.spawnFloatingText(this.player.x, this.player.y + 25, 'NEAR MISS!', '#ef4444');
            this.audio.playSfx('sfx_near_miss');
            this.triggerHitstop(25);
          }
        } else {
          this.ui.setDangerVisual(0);
        }

        // 6. Live Interactive Tutorial Progress (Seamless & Non-Freezing)
        if (this.isTutorial && this.player) {
          if (this.player.y < 200) {
            this.ui.showTutorialTip('SCHWUNG: LASS BEIM SCHWUNG NACH OBEN LOS (90°)');
          } else if (this.player.y < 420) {
            this.ui.showTutorialTip('TURBO-KNOTEN: GRÜNER PFEIL FÜR DOPPELTEN SCHUB');
          } else if (this.player.y < 680) {
            this.ui.showTutorialTip('ZEITUHR: TICKT AB! SCHNELL WEITERSPRINGEN');
          } else if (this.player.y < 920) {
            this.ui.showTutorialTip('BRÜCHIGER KNOTEN: RISSIG! NICHT GREIFEN, ÜBERSPRINGEN');
          } else if (this.player.y >= 980) {
            // Tutorial Completed! Seamlessly transition into regular run with +50 bonus currency
            this.isTutorial = false;
            this.storage.addCores(50);
            this.ui.updateCurrency();
            this.particles.spawnFloatingText(this.player.x, this.player.y + 45, 'TRAINING ABGESCHLOSSEN!', '#10b981');
            this.ui.showTutorialTip('TRAINING ERFOLGREICH! +50 GOLD BONUS');
            setTimeout(() => this.ui.hideTutorialTip(), 3500);
          }

          // Frustration-free tutorial respawn
          if (this.player.y < this.cameraY - 20) {
            const safeNodes = this.world.nodes.filter(n => n.type === 'STANDARD' && !n.isBroken && n.y <= this.player.y + 200);
            const anchor = safeNodes.length > 0 ? safeNodes[safeNodes.length - 1] : this.world.nodes[0];
            this.player.x = anchor.x;
            this.player.y = anchor.y - 50;
            this.player.vx = 0;
            this.player.vy = 280;
            this.player.tryHook(anchor, this.audio, null, this.particles, this.cameraY);
            this.ui.showTutorialTip('WIEDERHOLUNG: HALTE GEDRÜCKT ZUM EINHAKEN');
          }
        }

        // 7. Death Collision (Disabled in Tutorial and during Active Shield)
        if (!this.isTutorial && (!this.player.shieldTimer || this.player.shieldTimer <= 0) && this.player.y <= this.cameraY + CONSTANTS.PHYSICS.DEATH_BUFFER_PX && !this.isDying) {
          this.isDying = true;
          this.triggerGameOver();
        }
      }

      if (!this.isTutorial) {
        this.world.generateUpTo(this.cameraY + this.height + 700, this.width, this.cameraY);
      }
    }

    // Update Particles
    this.particles.update(dt, CONSTANTS.PHYSICS.GRAVITY);
  }

  /* =========================================================================
     RENDERING PIPELINE
     ========================================================================= */
  render(now) {
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

    // Dynamic Camera Zoom for Speed Sensation
    if (isActiveRun) {
      let speedZoom = 1.0;
      if (this.player.vy > 600) {
        speedZoom = Math.max(0.85, 1.0 - ((this.player.vy - 600) / 4000));
      }
      if (speedZoom !== 1.0) {
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(speedZoom, speedZoom);
        this.ctx.translate(-this.width / 2, -this.height / 2);
      }
    }

    // 1. Background Fill, Stars & Hyperspace Warp Streaks
    const playerVy = (this.player && !this.player.isHooked) ? this.player.vy : 0;
    this.world.drawBackground(this.ctx, this.width, this.height, this.cameraY, now, playerVy);

    const theme = this.world.currentTheme;

    // 2. Nodes & Orbs
    for (const orb of this.world.energyOrbs) {
      orb.draw(this.ctx, this.cameraY, this.height, theme);
    }
    for (const node of this.world.nodes) {
      node.draw(this.ctx, this.cameraY, this.height, theme);
    }

    // 3. Particles
    this.particles.draw(this.ctx, this.cameraY, this.height);

    // 4. Spaceship & Trajectory (Only when active run)
    if (isActiveRun) {
      const nearestNode = this.world.getNearestNode(this.player, this.cameraY);
      this.player.draw(this.ctx, this.cameraY, this.width, this.height, nearestNode, theme);

      // 4b. Dynamic Onboarding Tooltips (For fresh runs)
      if (!this.isTutorial && this.state.is(StateManager.STATES.PLAYING) && this.storage.data.totalRuns < 3 && this.storage.data.highScore < 150) {
        const playerScreenY = this.height - (this.player.y - this.cameraY);
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.font = '900 12px Montserrat, sans-serif';
        this.ctx.letterSpacing = '1.5px';
        const pulseAlpha = Math.sin(now / 150) * 0.3 + 0.7;

        if (this.player.isHooked) {
          this.ctx.fillStyle = `rgba(56, 189, 248, ${pulseAlpha})`;
          this.ctx.fillText("LOSLASSEN!", this.player.x, playerScreenY - 35);
        } else if (this.gameStarted && this.player.vy < 0 && nearestNode && Math.hypot(this.player.x - nearestNode.x, this.player.y - nearestNode.y) <= CONSTANTS.PHYSICS.HOOK_RANGE) {
          this.ctx.fillStyle = `rgba(0, 240, 255, ${pulseAlpha})`;
          this.ctx.fillText("DRÜCKEN & HALTEN", this.player.x, playerScreenY + 45);
        }
        this.ctx.restore();
      }
    }

    this.ctx.restore();

    // 5. Death Horizon (Rendered in unscaled screen coordinates across full viewport width)
    if (this.gameStarted && !this.isTutorial && (this.state.is(StateManager.STATES.PLAYING) || this.state.is(StateManager.STATES.PAUSED))) {
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
