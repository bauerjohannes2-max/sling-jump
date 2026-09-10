/**
 * Space Jump - Spaceship Entity
 * Renders canonical vector ship hulls, customizable trails & physics.
 */
class Spaceship {
  constructor(x, y, shipId = 'pfeil', trailId = 'neon_cyan') {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 12;
    this.angle = Math.PI / 2;

    this.shipId = shipId;
    this.trailId = trailId;

    this.isHooked = false;
    this.hookedNode = null;
    this.orbitRadius = 75;
    this.orbitAngle = 0;
    this.orbitSpinScale = 1;
    this.orbitSpeed = CONSTANTS.PHYSICS.MIN_ORBIT_SPEED;
    this.orbitDirection = 1;

    // Pre-allocated Motion Trail buffer (Zero GC allocation)
    this.maxTrailLength = 12;
    this._trailColor = '#00f0ff';
    this.trailHistory = [];
    this.trailPool = [];
    for (let i = 0; i < this.maxTrailLength; i++) {
      this.trailPool.push({ x: 0, y: 0, alpha: 0 });
    }
    this.rotationAngle = 0; // For rotating parts like Orbit Ring
    this.shieldTimer = 0; // Quantum invulnerability shield timer (active after revive)
    this.combo = 0; // Current active consecutive 90-deg launch combo
    this.isSuperBoosting = false; // Green super-boost shield until you grapple another orbit
    this.boostTimer = 0;
  }

  getComboSpeedMultiplier() {
    const factors = (CONSTANTS && CONSTANTS.PHYSICS && CONSTANTS.PHYSICS.COMBO_SPEED_FACTORS) || [1.0, 1.03, 1.06, 1.09, 1.12, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30];
    const idx = Math.min(Math.max(0, this.combo), factors.length - 1);
    return factors[idx];
  }

  getComboLaunchBonus() {
    const bonuses = (CONSTANTS && CONSTANTS.PHYSICS && CONSTANTS.PHYSICS.COMBO_LAUNCH_BONUSES) || [0, 25, 45, 65, 85, 105, 125, 145, 165, 185, 200];
    const idx = Math.min(Math.max(0, this.combo), bonuses.length - 1);
    return bonuses[idx];
  }

  setCustomization(shipId, trailId) {
    this.shipId = shipId;
    this.trailId = trailId;
    const shipDef = CONSTANTS.SHIPS.find(s => s.id === shipId);
    if (shipDef) {
      this.radius = shipDef.radius;
    }
    const trailDef = CONSTANTS.TRAILS.find(t => t.id === trailId) || CONSTANTS.TRAILS[0];
    this._trailColor = (trailDef && trailDef.color) || '#00f0ff';
  }

  tryHook(closestNode, audio, setSlowMo, particleSystem, cameraY = null) {
    if (this.isHooked || !closestNode || closestNode.isBroken) return false;
    if (cameraY !== null && closestNode.y < cameraY - 15) return false;

    const dx = this.x - closestNode.x;
    const dy = this.y - closestNode.y;
    const dist = Math.hypot(dx, dy);

    if (dist > CONSTANTS.PHYSICS.HOOK_RANGE) return false;

    // DECOY / BREAK CIRCLE: shatters instantly upon grapple attempt, giving 0 grapple lock and 0 momentum!
    if (closestNode.type === 'DECOY') {
      closestNode.breakNode(audio, null);
      if (particleSystem) {
        particleSystem.spawnShards(closestNode.x, closestNode.y, 25, '#f97316');
      }
      return false;
    }

    this.isHooked = true;
    this.hookedNode = closestNode;
    this.isSuperBoosting = false;
    this.boostTimer = 0;
    this.orbitRadius = Math.max(55, Math.min(dist, 110));
    this.orbitAngle = Math.atan2(dy, dx);

    const cross = dx * this.vy - dy * this.vx;
    this.orbitDirection = cross >= 0 ? 1 : -1;

    const currentSpeed = Math.hypot(this.vx, this.vy);
    const comboMult = this.getComboSpeedMultiplier();
    this.orbitSpeed = Math.max(currentSpeed * 0.95, CONSTANTS.PHYSICS.MIN_ORBIT_SPEED * comboMult);
    this.orbitSpeed = Math.min(this.orbitSpeed, CONSTANTS.PHYSICS.MAX_ORBIT_SPEED * comboMult);
    this.orbitSpinScale = 1;

    this.vx = 0;
    this.vy = 0;

    closestNode.isHooked = true;

    if (setSlowMo) setSlowMo(true);
    if (particleSystem) {
      particleSystem.spawnSparks(this.x, this.y, 10, '#00f0ff');
    }

    return true;
  }

  releaseHook(forced = false, audio = null, setSlowMo = null, particleSystem = null, onReleaseCallback = null, comboCount = 0) {
    if (!this.isHooked) return;

    const node = this.hookedNode;
    const isBoost = node && node.type === 'BOOST';

    const tangentX = -Math.sin(this.orbitAngle) * this.orbitDirection;
    const tangentY = Math.cos(this.orbitAngle) * this.orbitDirection;

    let releaseMultiplier = 1.0;
    if (isBoost && !forced) {
      releaseMultiplier = CONSTANTS.PHYSICS.BOOST_MULTIPLIER;
      this.isSuperBoosting = true;
    }

    // Razor-sharp 90-degree steep launch check (tightened threshold: ~5.7 deg of pure vertical)
    const threshold = (CONSTANTS && CONSTANTS.PHYSICS && CONSTANTS.PHYSICS.PERFECT_LAUNCH_THRESHOLD) || 0.995;
    const isPerfectLaunch = !forced && tangentY >= threshold;

    if (isPerfectLaunch) {
      this.combo = Math.min(10, (comboCount || this.combo) + 1);
    } else if (!forced) {
      this.combo = 0;
    }

    const comboMult = this.getComboSpeedMultiplier();
    const launchBonus = isPerfectLaunch ? this.getComboLaunchBonus() : 0;

    // Direct launch speed scaling: Base orbit * releaseMultiplier * combo speed multiplier!
    const effectiveLaunchSpeed = this.orbitSpeed * releaseMultiplier * comboMult;
    this.vx = tangentX * effectiveLaunchSpeed;
    this.vy = tangentY * effectiveLaunchSpeed + launchBonus;

    if (this.vy > 0 && !forced && !isPerfectLaunch) {
      this.vy += 80;
    }

    // Quantum Revive Safety: Guarantee strong upward boost during shield (prevents downward plunge)
    if (this.shieldTimer > 0 && !forced) {
      this.vy = Math.max(this.vy, 320);
    }

    // Numerical sanity check against NaN / Infinity
    if (!Number.isFinite(this.vx)) this.vx = 0;
    if (!Number.isFinite(this.vy)) this.vy = 0;

    if (node) {
      node.isHooked = false;
    }

    this.isHooked = false;
    this.hookedNode = null;

    if (setSlowMo) setSlowMo(false);

    if (particleSystem) {
      const shipDef = CONSTANTS.SHIPS.find(s => s.id === this.shipId) || CONSTANTS.SHIPS[0];
      const trailDef = CONSTANTS.TRAILS.find(t => t.id === this.trailId) || CONSTANTS.TRAILS[0];
      const thrustColor = isBoost ? '#10b981' : (isPerfectLaunch ? '#fbbf24' : (trailDef.color === 'rainbow' ? '#00f0ff' : trailDef.color));

      for (const offset of shipDef.thrusterOffsets) {
        for (let i = 0; i < (isBoost ? 6 : (isPerfectLaunch ? 5 : 3)); i++) {
          const spread = (Math.random() - 0.5) * 0.5;
          const backX = -tangentX + spread;
          const backY = -tangentY + spread;
          const spd = (Math.random() * 200 + 80) * (isBoost ? 1.6 : (isPerfectLaunch ? 1.4 : 1));
          particleSystem.spawnThrust(this.x + offset.x, this.y + offset.y, backX * spd, backY * spd, thrustColor, (isBoost ? 1.5 : (isPerfectLaunch ? 1.3 : 1)) * comboMult);
        }
      }

      if (isBoost && !forced) {
        particleSystem.spawnFloatingText(this.x, this.y + 30, 'SUPER BOOST!', '#10b981', 22);
      } else if (isPerfectLaunch) {
        // Shockwave ring at launch location + sparks scaled with combo!
        if (node) {
          particleSystem.spawnShockwave(node.x, node.y, '#fbbf24', 50 + this.combo * 4);
        }
        particleSystem.spawnSparks(this.x, this.y, 16 + this.combo * 2, '#fbbf24', 1.2 + this.combo * 0.1);
      }
    }

    if (onReleaseCallback) {
      onReleaseCallback(isBoost, forced, isPerfectLaunch, tangentY, this.combo);
    }
  }

  getLaunchTangentY() {
    if (!this.isHooked) return 0;
    return Math.cos(this.orbitAngle) * this.orbitDirection;
  }

  update(dt, screenWidth, particleSystem = null) {
    this.rotationAngle += dt * 4;
    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    }

    // Zero-allocation pre-allocated trail recording
    const pt = this.trailHistory.length >= this.maxTrailLength
      ? this.trailHistory.pop()
      : this.trailPool[this.trailHistory.length];
    pt.x = this.x;
    pt.y = this.y;
    pt.alpha = 1.0;
    this.trailHistory.unshift(pt);

    for (let i = 0; i < this.trailHistory.length; i++) {
      this.trailHistory[i].alpha -= dt * 1.8;
    }

    if (this.isHooked && this.hookedNode && !this.hookedNode.isBroken) {
      const spin = (this.orbitSpinScale > 0 && Number.isFinite(this.orbitSpinScale)) ? this.orbitSpinScale : 1;
      const angularVel = (this.orbitSpeed / this.orbitRadius) * this.orbitDirection * spin;
      this.orbitAngle += angularVel * dt;

      this.x = this.hookedNode.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      this.y = this.hookedNode.y + Math.sin(this.orbitAngle) * this.orbitRadius;

      this.angle = Math.atan2(
        Math.cos(this.orbitAngle) * this.orbitDirection,
        -Math.sin(this.orbitAngle) * this.orbitDirection
      );
    } else {
      // Natural, constant gravity at all times (no artificial upward floatiness)
      this.vy -= CONSTANTS.PHYSICS.GRAVITY * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= Math.pow(0.985, dt * 60);
      this.angle = Math.atan2(this.vy, this.vx);

      // Spawn thruster plume during climb
      if (particleSystem && this.vy > 100 && Math.random() < 0.4) {
        const trailDef = CONSTANTS.TRAILS.find(t => t.id === this.trailId) || CONSTANTS.TRAILS[0];
        const color = trailDef.color === 'rainbow' ? `hsl(${(performance.now() * 0.5) % 360}, 100%, 60%)` : trailDef.color;
        particleSystem.spawnThrust(this.x, this.y, (Math.random() - 0.5) * 30, -100, color, 0.8 * this.getComboSpeedMultiplier());
      }

      // Hypersonic Speed Streaks for combo >= 2
      if (this.combo >= 2 && particleSystem && Math.random() < 0.35 + this.combo * 0.05) {
        const streakColor = this.combo >= 5 ? '#a855f7' : '#38bdf8';
        particleSystem.spawnSpeedStreaks(this.x, this.y, 1, streakColor);
      }
    }

    // Horizontal Screen-Wrap
    if (this.x < 0) {
      this.x += screenWidth;
      this.trailHistory.length = 0;
    } else if (this.x > screenWidth) {
      this.x -= screenWidth;
      this.trailHistory.length = 0;
    }
  }

  isBoostProtected() {
    if (this.boostTimer > 0 || this.isSuperBoosting) return true;
    return !!(this.isHooked && this.hookedNode && this.hookedNode.type === 'BOOST');
  }

  isMineImmune() {
    return this.shieldTimer > 0 || this.isBoostProtected();
  }

  draw(context, camY, screenWidth, screenHeight, nearestNode = null, theme = null) {
    const screenY = screenHeight - (this.y - camY);

    // 1. Grappling Tether line removed for ultra-clean minimalist gameplay visual
    // (Player orbits nodes cleanly with no connecting line)

    // 2. Motion Trail
    this.drawTrail(context, camY, screenWidth, screenHeight);

    // 3. Render Vector Ship Model
    context.save();
    context.translate(this.x, screenY);
    context.rotate(-this.angle + Math.PI / 2);

    this.renderShipModel(context, this.shipId);

    context.restore();

    // 4. Invulnerability: green jump-orbit shield, otherwise purple revive shield
    if (this.isBoostProtected()) {
      this.drawShield(context, screenY, 'boost');
    } else if (this.shieldTimer > 0) {
      this.drawShield(context, screenY, 'revive');
    }
  }

  drawShield(context, screenY, kind) {
    const isBoost = kind === 'boost';
    const now = performance.now();
    const alpha = isBoost ? 1 : Math.min(1.0, this.shieldTimer * 1.5);
    const pulse = Math.sin(now * (isBoost ? 0.012 : 0.008)) * 0.12 + 0.90;
    const rgb = isBoost ? '16, 185, 129' : '217, 70, 239';
    const radius = (this.radius + (isBoost ? 18 : 15)) * pulse;

    context.save();
    context.translate(this.x, screenY);

    context.strokeStyle = `rgba(${rgb}, ${alpha * 0.92})`;
    context.fillStyle = `rgba(${rgb}, ${alpha * (isBoost ? 0.22 : 0.16)})`;
    context.lineWidth = isBoost ? 2.6 : 2.0;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    if (isBoost) {
      context.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.7})`;
      context.lineWidth = 1.5;
      context.setLineDash([6, 5]);
      context.beginPath();
      context.arc(0, 0, radius + 8, 0, Math.PI * 2);
      context.stroke();
      context.setLineDash([]);
    }

    context.rotate(now * (isBoost ? 0.0024 : 0.0015));
    context.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
    context.lineWidth = 1.15;
    context.beginPath();
    const hexR = this.radius + (isBoost ? 14 : 11);
    for (let i = 0; i < 6; i++) {
      const ang = (i * Math.PI) / 3;
      const rx = Math.cos(ang) * hexR;
      const ry = Math.sin(ang) * hexR;
      if (i === 0) context.moveTo(rx, ry);
      else context.lineTo(rx, ry);
    }
    context.closePath();
    context.stroke();
    context.restore();
  }

  drawTrail(context, camY, screenWidth, screenHeight) {
    const n = this.trailHistory.length;
    if (n < 2) return;

    context.save();
    context.strokeStyle = this._trailColor || '#00f0ff';
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.globalAlpha = 0.38;
    context.lineWidth = 5;
    context.beginPath();
    let started = false;
    for (let i = 0; i < n; i++) {
      const p = this.trailHistory[i];
      if (i > 0 && Math.abs(p.x - this.trailHistory[i - 1].x) > screenWidth / 2) {
        started = false;
        continue;
      }
      const sy = screenHeight - (p.y - camY);
      if (!started) {
        context.moveTo(p.x, sy);
        started = true;
      } else {
        context.lineTo(p.x, sy);
      }
    }
    context.stroke();
    context.restore();
  }

  renderShipModel(context, shipId) {
    if (typeof ShipArt !== 'undefined') {
      ShipArt.renderCanvas(context, shipId);
    }
  }
}

