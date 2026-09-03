/**
 * Sling Jump - Spaceship Entity
 * Renders 6 distinct geometric vector ship hulls, customizable trails & physics.
 */
class Spaceship {
  constructor(x, y, shipId = 'dart', trailId = 'neon_cyan') {
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
    this.orbitSpeed = CONSTANTS.PHYSICS.MIN_ORBIT_SPEED;
    this.orbitDirection = 1;

    // Motion Trail buffer
    this.trailHistory = [];
    this.rotationAngle = 0; // For rotating parts like Orbit Ring
    this.shieldTimer = 0; // Quantum invulnerability shield timer (active after revive)
  }

  setCustomization(shipId, trailId) {
    this.shipId = shipId;
    this.trailId = trailId;
    const shipDef = CONSTANTS.SHIPS.find(s => s.id === shipId);
    if (shipDef) {
      this.radius = shipDef.radius;
    }
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
        particleSystem.spawnFloatingText(closestNode.x, closestNode.y + 25, 'RISSIG!', '#ef4444');
      }
      return false;
    }

    this.isHooked = true;
    this.hookedNode = closestNode;
    this.orbitRadius = Math.max(55, Math.min(dist, 110));
    this.orbitAngle = Math.atan2(dy, dx);

    const cross = dx * this.vy - dy * this.vx;
    this.orbitDirection = cross >= 0 ? 1 : -1;

    const currentSpeed = Math.hypot(this.vx, this.vy);
    this.orbitSpeed = Math.max(currentSpeed * 0.95, CONSTANTS.PHYSICS.MIN_ORBIT_SPEED);
    this.orbitSpeed = Math.min(this.orbitSpeed, CONSTANTS.PHYSICS.MAX_ORBIT_SPEED);

    this.vx = 0;
    this.vy = 0;

    closestNode.isHooked = true;

    if (audio) audio.playSfx('sfx_grapple_lock');
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
    }

    // Near perfect 90-degree steep launch check (tightened precision window: tangent within ~15 deg of vertical)
    const isPerfectLaunch = !forced && tangentY >= 0.965;
    let launchBonus = 0;
    if (isPerfectLaunch) {
      const comboLevel = Math.min(10, Math.max(1, comboCount));
      launchBonus = 45 + comboLevel * 20; // Progressive boost from +65 at x1 up to +245 at x10
    }

    this.vx = tangentX * this.orbitSpeed * releaseMultiplier;
    this.vy = tangentY * this.orbitSpeed * releaseMultiplier + launchBonus;

    if (this.vy > 0 && !forced && !isPerfectLaunch) {
      this.vy += 80;
    }

    if (node) {
      node.isHooked = false;
    }

    this.isHooked = false;
    this.hookedNode = null;

    if (setSlowMo) setSlowMo(false);

    if (!forced && audio) {
      audio.playSfx('sfx_slingshot_boost', { isBoost, isPerfect: isPerfectLaunch });
    }

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
          particleSystem.spawnThrust(this.x + offset.x, this.y + offset.y, backX * spd, backY * spd, thrustColor, isBoost ? 1.5 : (isPerfectLaunch ? 1.3 : 1));
        }
      }

      if (isBoost && !forced) {
        particleSystem.spawnFloatingText(this.x, this.y + 30, 'SUPER BOOST!', '#10b981', 22);
      } else if (isPerfectLaunch) {
        const comboTxt = comboCount > 1 ? `PERFEKT x${comboCount}!` : 'PERFEKT 90°!';
        const comboFontSize = Math.min(36, 26 + (comboCount || 1) * 1.5);
        particleSystem.spawnFloatingText(this.x, this.y + 35, comboTxt, '#fbbf24', comboFontSize, true);
        particleSystem.spawnSparks(this.x, this.y, 18, '#fbbf24');
      }
    }

    if (onReleaseCallback) {
      onReleaseCallback(isBoost, forced, isPerfectLaunch, tangentY);
    }
  }

  update(dt, screenWidth, particleSystem = null) {
    this.rotationAngle += dt * 4;
    if (this.shieldTimer > 0) {
      this.shieldTimer = Math.max(0, this.shieldTimer - dt);
    }

    // Trail recording
    this.trailHistory.unshift({ x: this.x, y: this.y, alpha: 1.0 });
    if (this.trailHistory.length > 22) this.trailHistory.pop();
    for (let t of this.trailHistory) {
      t.alpha -= dt * 1.8;
    }

    if (this.isHooked && this.hookedNode && !this.hookedNode.isBroken) {
      const angularVel = (this.orbitSpeed / this.orbitRadius) * this.orbitDirection;
      this.orbitAngle += angularVel * dt;

      this.x = this.hookedNode.x + Math.cos(this.orbitAngle) * this.orbitRadius;
      this.y = this.hookedNode.y + Math.sin(this.orbitAngle) * this.orbitRadius;

      this.angle = Math.atan2(
        Math.cos(this.orbitAngle) * this.orbitDirection,
        -Math.sin(this.orbitAngle) * this.orbitDirection
      );
    } else {
      this.vy -= CONSTANTS.PHYSICS.GRAVITY * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= Math.pow(0.985, dt * 60);
      this.angle = Math.atan2(this.vy, this.vx);

      // Spawn thruster plume during climb
      if (particleSystem && this.vy > 100 && Math.random() < 0.4) {
        const trailDef = CONSTANTS.TRAILS.find(t => t.id === this.trailId) || CONSTANTS.TRAILS[0];
        const color = trailDef.color === 'rainbow' ? `hsl(${(performance.now() * 0.5) % 360}, 100%, 60%)` : trailDef.color;
        particleSystem.spawnThrust(this.x, this.y, (Math.random() - 0.5) * 30, -100, color, 0.8);
      }
    }

    // Horizontal Screen-Wrap
    if (this.x < 0) {
      this.x += screenWidth;
      this.trailHistory = [];
    } else if (this.x > screenWidth) {
      this.x -= screenWidth;
      this.trailHistory = [];
    }
  }

  draw(context, camY, screenWidth, screenHeight, nearestNode = null, theme = null) {
    const screenY = screenHeight - (this.y - camY);

    // 1. Tether during orbit (Dotted trajectory line removed for clean arcade feel)
    if (this.isHooked && this.hookedNode) {
      this.drawTether(context, camY, screenHeight);
    }

    // 2. Motion Trail
    this.drawTrail(context, camY, screenWidth, screenHeight);

    // 3. Render Vector Ship Model
    context.save();
    context.translate(this.x, screenY);
    context.rotate(-this.angle + Math.PI / 2);

    this.renderShipModel(context, this.shipId, this.isHooked);

    context.restore();

    // 4. Quantum Revive Invulnerability Shield
    if (this.shieldTimer > 0) {
      const shieldAlpha = Math.min(1.0, this.shieldTimer * 1.5);
      const pulse = Math.sin(performance.now() * 0.008) * 0.12 + 0.90;
      context.save();
      context.translate(this.x, screenY);

      // Outer Pulsating Shield Glow
      context.strokeStyle = `rgba(217, 70, 239, ${shieldAlpha * 0.85})`;
      context.fillStyle = `rgba(217, 70, 239, ${shieldAlpha * 0.16})`;
      context.lineWidth = 2.0;
      context.shadowColor = '#d946ef';
      context.shadowBlur = 18;
      context.beginPath();
      context.arc(0, 0, (this.radius + 15) * pulse, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      // Rotating Hexagonal Energy Facets
      context.rotate(performance.now() * 0.0015);
      context.strokeStyle = `rgba(255, 255, 255, ${shieldAlpha * 0.6})`;
      context.lineWidth = 1.0;
      context.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const rx = Math.cos(ang) * (this.radius + 11);
        const ry = Math.sin(ang) * (this.radius + 11);
        if (i === 0) context.moveTo(rx, ry);
        else context.lineTo(rx, ry);
      }
      context.closePath();
      context.stroke();

      context.restore();
    }
  }

  drawTrail(context, camY, screenWidth, screenHeight) {
    if (this.trailHistory.length < 2) return;
    const trailDef = CONSTANTS.TRAILS.find(t => t.id === this.trailId) || CONSTANTS.TRAILS[0];

    context.save();
    for (let i = 1; i < this.trailHistory.length; i++) {
      const p1 = this.trailHistory[i - 1];
      const p2 = this.trailHistory[i];
      if (Math.abs(p1.x - p2.x) > screenWidth / 2) continue;

      const sy1 = screenHeight - (p1.y - camY);
      const sy2 = screenHeight - (p2.y - camY);

      let strokeColor = trailDef.color;
      if (trailDef.color === 'rainbow') {
        strokeColor = `hsl(${((i * 25) + performance.now() * 0.2) % 360}, 100%, 65%)`;
      }

      context.strokeStyle = strokeColor;
      context.globalAlpha = Math.max(0, p2.alpha * 0.4);
      context.lineWidth = Math.max(1, (22 - i) * 0.4);
      context.beginPath();
      context.moveTo(p1.x, sy1);
      context.lineTo(p2.x, sy2);
      context.stroke();
    }
    context.restore();
  }

  // Pure Vector Ship Geometries (No Images/Emojis)
  renderShipModel(context, shipId, isHooked) {
    const shipDef = CONSTANTS.SHIPS.find(s => s.id === shipId) || CONSTANTS.SHIPS[0];
    const trailDef = CONSTANTS.TRAILS.find(t => t.id === this.trailId) || CONSTANTS.TRAILS[0];
    const glowColor = trailDef.color === 'rainbow' ? '#00f0ff' : trailDef.color;

    context.shadowColor = glowColor;
    context.shadowBlur = 16;

    // Dynamic Engine Glow / Plume
    const flameSize = (Math.hypot(this.vx, this.vy) / 750) * 12 + 6;
    context.fillStyle = isHooked ? '#38bdf8' : glowColor;

    for (const offset of shipDef.thrusterOffsets) {
      context.beginPath();
      context.moveTo(offset.x - 2.5, offset.y);
      context.lineTo(offset.x, offset.y + flameSize + Math.random() * 3);
      context.lineTo(offset.x + 2.5, offset.y);
      context.closePath();
      context.fill();
    }

    context.fillStyle = '#0b1329';
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;

    switch (shipId) {
      case 'phoenix':
      case 'interceptor':
      case 'valkyrie': {
        // Tier 1: PHÖNIX - Swept Twin-Blade Fighter with energized wings
        context.beginPath();
        context.moveTo(0, -17);
        context.lineTo(6, -4);
        context.lineTo(16, 8);
        context.lineTo(8, 7);
        context.lineTo(0, 11);
        context.lineTo(-8, 7);
        context.lineTo(-16, 8);
        context.lineTo(-6, -4);
        context.closePath();
        context.fill();
        context.stroke();

        context.strokeStyle = glowColor;
        context.lineWidth = 1.8;
        context.beginPath();
        context.moveTo(-10, 5);
        context.lineTo(-3, -6);
        context.lineTo(0, -12);
        context.lineTo(3, -6);
        context.lineTo(10, 5);
        context.stroke();
        break;
      }
      case 'spectre':
      case 'stealth_wing': {
        // Tier 2: SPECTRE - Faceted Stealth Delta Interceptor with triple thrusters & energy core
        context.beginPath();
        context.moveTo(0, -16);
        context.lineTo(15, 6);
        context.lineTo(9, 11);
        context.lineTo(0, 7);
        context.lineTo(-9, 11);
        context.lineTo(-15, 6);
        context.closePath();
        context.fill();
        context.stroke();

        context.strokeStyle = glowColor;
        context.lineWidth = 1.5;
        context.strokeRect(-3, -3, 6, 6);

        context.fillStyle = glowColor;
        context.beginPath();
        context.arc(0, 0, 2.5, 0, Math.PI * 2);
        context.fill();
        break;
      }
      case 'titan':
      case 'dreadnought':
      case 'orbit_ring': {
        // Tier 3: NEXUS-TITAN - Heavy Armored Orbital Flagship with quad thrusters & rotating shield ring
        context.beginPath();
        context.moveTo(-6, -17);
        context.lineTo(6, -17);
        context.lineTo(14, -5);
        context.lineTo(15, 11);
        context.lineTo(7, 9);
        context.lineTo(0, 13);
        context.lineTo(-7, 9);
        context.lineTo(-15, 11);
        context.lineTo(-14, -5);
        context.closePath();
        context.fill();
        context.stroke();

        // Rotating Energy Ring
        context.strokeStyle = glowColor;
        context.lineWidth = 1.5;
        context.beginPath();
        context.arc(0, -2, 9, this.rotationAngle, this.rotationAngle + Math.PI * 1.5);
        context.stroke();

        // Armored Center Plate
        context.strokeRect(-4, -9, 8, 14);
        break;
      }
      default: {
        // Base Tier: PFEIL - Clean Agile Scout
        context.beginPath();
        context.moveTo(0, -15);
        context.lineTo(11, 10);
        context.lineTo(4, 7);
        context.lineTo(0, 9);
        context.lineTo(-4, 7);
        context.lineTo(-11, 10);
        context.closePath();
        context.fill();
        context.stroke();

        context.strokeStyle = glowColor;
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(0, -10);
        context.lineTo(0, 4);
        context.stroke();

        context.fillStyle = glowColor;
        context.beginPath();
        context.arc(0, -3, 2, 0, Math.PI * 2);
        context.fill();
        break;
      }
    }
  }

  drawAimPreview(context, camY, screenHeight, target) {
    if (!target || target.y < camY - 10) return;
    const targetScreenY = screenHeight - (target.y - camY);
    if (targetScreenY > screenHeight + 10 || targetScreenY < -50) return;

    const screenY = screenHeight - (this.y - camY);

    context.save();
    context.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    context.lineWidth = 1.5;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(this.x, screenY);
    context.lineTo(target.x, targetScreenY);
    context.stroke();

    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const dist = Math.max(55, Math.min(Math.hypot(dx, dy), 110));
    const startAng = Math.atan2(dy, dx);
    const cross = dx * this.vy - dy * this.vx;
    const dir = cross >= 0 ? 1 : -1;
    const endAng = startAng + (Math.PI * 0.8 * dir);

    context.strokeStyle = 'rgba(0, 240, 255, 0.55)';
    context.lineWidth = 2;
    context.setLineDash([3, 6]);
    context.beginPath();
    context.arc(target.x, targetScreenY, dist, startAng, endAng, dir === -1);
    context.stroke();

    context.restore();
  }

  drawTether(context, camY, screenHeight) {
    if (!this.hookedNode) return;
    const screenY = screenHeight - (this.y - camY);
    const nodeScreenY = screenHeight - (this.hookedNode.y - camY);

    context.save();
    const isBoost = this.hookedNode.type === 'BOOST';
    const isFragile = this.hookedNode.type === 'FRAGILE';

    let beamColor = '#00f0ff';
    if (isBoost) beamColor = '#10b981';
    if (isFragile) beamColor = '#ff4444';

    // Calculate tension ratio (0.0 to 1.0)
    const tension = Math.max(0, Math.min(1, (this.orbitSpeed - 700) / 550));
    
    // Dynamic pulsing based on time and tension
    const pulseRate = 10 + (tension * 20);
    const pulse = Math.sin(performance.now() / (1000 / pulseRate)) * 0.5 + 0.5;
    
    // Line width scales with tension and pulses slightly
    const baseWidth = 2.0 + (tension * 2.5);
    context.lineWidth = baseWidth + (pulse * 1.5 * tension);

    // Alpha depends on tension
    const alpha = 0.6 + (tension * 0.4) + (pulse * 0.2);
    context.globalAlpha = Math.min(1.0, alpha);

    context.strokeStyle = beamColor;
    context.shadowColor = beamColor;
    context.shadowBlur = 10 + (tension * 15) + (pulse * 5);

    context.beginPath();
    context.moveTo(this.x, screenY);
    // Add jitter based on tension
    const jitter = tension * 4;
    const midX = (this.x + this.hookedNode.x) / 2 + (Math.random() - 0.5) * jitter;
    const midY = (screenY + nodeScreenY) / 2 + (Math.random() - 0.5) * jitter;
    context.quadraticCurveTo(midX, midY, this.hookedNode.x, nodeScreenY);
    context.stroke();

    context.restore();
  }

  drawTrajectoryLaser(context, camY, screenWidth, screenHeight) {
    if (!this.hookedNode) return;
    const isBoost = this.hookedNode.type === 'BOOST';
    const boostMultiplier = isBoost ? CONSTANTS.PHYSICS.BOOST_MULTIPLIER : 1.0;

    const tangentX = -Math.sin(this.orbitAngle) * this.orbitDirection;
    const tangentY = Math.cos(this.orbitAngle) * this.orbitDirection;

    let simVx = tangentX * this.orbitSpeed * boostMultiplier;
    let simVy = tangentY * this.orbitSpeed * boostMultiplier;
    if (simVy > 0) simVy += 90;

    let simX = this.x;
    let simY = this.y;

    const simDt = 0.024;
    const totalSteps = 45;

    context.save();
    const laserColor = isBoost ? '#10b981' : '#00f0ff';
    context.fillStyle = laserColor;
    context.shadowColor = laserColor;
    context.shadowBlur = 10;

    for (let step = 0; step < totalSteps; step++) {
      simVy -= CONSTANTS.PHYSICS.GRAVITY * simDt;
      simVx *= Math.pow(0.985, simDt * 60);

      simX += simVx * simDt;
      simY += simVy * simDt;

      let wrapped = false;
      if (simX < 0) {
        simX += screenWidth;
        wrapped = true;
      } else if (simX > screenWidth) {
        simX -= screenWidth;
        wrapped = true;
      }

      const curScreenY = screenHeight - (simY - camY);

      if (!wrapped && step % 2 === 0) {
        const alpha = 1.0 - (step / totalSteps);
        const radius = Math.max(1.5, (1 - step / totalSteps) * 4);

        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(simX, curScreenY, radius, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.restore();
  }
}
