/**
 * Space Jump - OrbitNode Entity
 * Supports: STANDARD, FRAGILE, BOOST, MOVING types, Lock-On Reticle & Dynamic Theming
 */
class OrbitNode {
  constructor(x, y, type = 'STANDARD', screenWidth = window.innerWidth, altitude = 0) {
    this.x = x;
    this.y = y;
    this.type = type; // STANDARD, BOOST, MOVING, FRAGILE, DECOY
    this.radius = 17;
    this.pulse = Math.random() * Math.PI * 2;
    this.altitude = altitude;

    // Moving Node properties — constant-speed shuttle (no sine dwell at the ends)
    this.startX = x;
    const speedScale = Math.min(1.75, 1.0 + (altitude / 800) * 0.45);
    this.moveSpeed = (Math.random() * 40 + 55) * speedScale * (Math.random() < 0.5 ? 1 : -1);
    this.moveRange = Math.min(screenWidth * 0.25, 120);
    this.movePhase = Math.random() * Math.PI * 2;
    this.moveOffset = 0;
    this.moveDir = this.moveSpeed >= 0 ? 1 : -1;
    this.moveSpeedAbs = Math.abs(this.moveSpeed);
    if (type === 'MOVING') {
      this.initMovingPath(screenWidth);
    }

    // Fragile Node properties (scales slightly faster with altitude)
    this.maxFragileDuration = Math.max(0.72, (CONSTANTS.PHYSICS.FRAGILE_DURATION || 0.90) - (altitude / 1500) * 0.18);
    this.fragileTimer = 0;
    this.isHooked = false;
    this.isBroken = false;
    this.tickCounter = 0;

    // Decoy (Fake) Node properties: breaks immediately on grapple
    this.isDecoy = (type === 'DECOY');

    // Hazard / Space Mine properties (lethal explosive contact above 10,000m)
    this.isHazard = (type === 'HAZARD');
    if (this.isHazard) {
      this.radius = 18;
      this.rotation = Math.random() * Math.PI * 2;
    }

    // Visual Lock-On state
    this.isTargeted = false;
  }

  initMovingPath(screenWidth, requestedRange) {
    const pad = 52;
    const width = Math.max(pad * 2 + 8, screenWidth || 0);
    const requested = (requestedRange != null) ? requestedRange : this.moveRange;
    const maxLeft = Math.max(24, this.startX - pad);
    const maxRight = Math.max(24, width - pad - this.startX);
    this.moveRange = Math.max(24, Math.min(requested, maxLeft, maxRight));
    this.moveSpeedAbs = Math.abs(this.moveSpeed) || 70;
    this.moveDir = this.moveSpeed >= 0 ? 1 : -1;
    const seed = (this.movePhase != null) ? this.movePhase : 0;
    this.moveOffset = Math.sin(seed) * this.moveRange * 0.72;
    this.x = this.startX + this.moveOffset;
  }

  update(dt, screenWidth, audio, onBreak) {
    if (this.type === 'HAZARD') {
      this.pulse += dt * 5.5; // Rapid aggressive warning pulse
      this.rotation += dt * 1.35; // Menacing continuous rotation
      return;
    }

    this.pulse += dt * 3.2;

    if (this.type === 'MOVING') {
      const span = this.moveRange;
      const speed = this.moveSpeedAbs || Math.abs(this.moveSpeed) || 70;
      this.moveOffset += this.moveDir * speed * dt;
      if (this.moveOffset > span) {
        this.moveOffset = span - (this.moveOffset - span);
        this.moveDir = -1;
      } else if (this.moveOffset < -span) {
        this.moveOffset = -span - (this.moveOffset + span);
        this.moveDir = 1;
      }
      if (this.moveOffset > span) this.moveOffset = span;
      if (this.moveOffset < -span) this.moveOffset = -span;
      this.x = this.startX + this.moveOffset;
    }

    if (this.type === 'DECOY' && this.isHooked && !this.isBroken) {
      // Fake node shatters instantly upon grapple!
      this.breakNode(audio, onBreak);
      return;
    }

    if (this.type === 'FRAGILE' && this.isHooked && !this.isBroken) {
      this.fragileTimer += dt;
      this.tickCounter += dt;
      if (this.tickCounter > 0.16) {
        if (audio) audio.playProceduralSfx('sfx_ui_click');
        this.tickCounter = 0;
      }

      if (this.fragileTimer >= this.maxFragileDuration) {
        this.breakNode(audio, onBreak);
      }
    }
  }

  breakNode(audio, onBreak) {
    this.isBroken = true;
    if (audio) audio.playSfx('sfx_node_shatter');
    if (onBreak) onBreak(this);
  }

  static getCacheScale() {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
    // Match the game canvas cap (2) but never drop below 2x CSS, so 1x screens still get a crisp downsample.
    return Math.max(2, Math.min(dpr, 2));
  }

  static makeHiDpiCanvas(cssSize) {
    const scale = OrbitNode.getCacheScale();
    const c = document.createElement('canvas');
    c.width = Math.round(cssSize * scale);
    c.height = Math.round(cssSize * scale);
    const ctx = c.getContext('2d');
    ctx.setTransform(c.width / cssSize, 0, 0, c.height / cssSize, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    return c;
  }

  static blitCached(context, canvas, dx, dy, cssSize) {
    const prevSmooth = context.imageSmoothingEnabled;
    const prevQual = context.imageSmoothingQuality;
    context.imageSmoothingEnabled = true;
    if (typeof prevQual === 'string') context.imageSmoothingQuality = 'high';
    context.drawImage(canvas, dx, dy, cssSize, cssSize);
    context.imageSmoothingEnabled = prevSmooth;
    if (typeof prevQual === 'string') context.imageSmoothingQuality = prevQual;
  }

  static getCachedGlow(gColor) {
    if (!OrbitNode.cache) OrbitNode.cache = {};
    const scale = OrbitNode.getCacheScale();
    const key = `glow_${gColor}_${scale}`;
    if (!OrbitNode.cache[key]) {
      const c = OrbitNode.makeHiDpiCanvas(72);
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(36, 36, 2, 36, 36, 34);
      grad.addColorStop(0, gColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(36, 36, 34, 0, Math.PI * 2);
      ctx.fill();
      OrbitNode.cache[key] = c;
    }
    return OrbitNode.cache[key];
  }

  static getCachedCore(cColor, isDecoy) {
    if (!OrbitNode.cache) OrbitNode.cache = {};
    const scale = OrbitNode.getCacheScale();
    const key = `core_${cColor}_${isDecoy}_${scale}`;
    if (!OrbitNode.cache[key]) {
      const c = OrbitNode.makeHiDpiCanvas(44);
      const ctx = c.getContext('2d');
      ctx.shadowColor = cColor;
      ctx.shadowBlur = 14;
      ctx.fillStyle = isDecoy ? '#7c2d12' : '#ffffff';
      ctx.beginPath();
      ctx.arc(22, 22, 9.35, 0, Math.PI * 2); // 17 * 0.55
      ctx.fill();

      ctx.strokeStyle = cColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(22, 22, 17, 0, Math.PI * 2); // radius 17
      ctx.stroke();
      OrbitNode.cache[key] = c;
    }
    return OrbitNode.cache[key];
  }

  draw(context, camY, height, theme = null) {
    if (this.isBroken) return;

    // OPTIMIZATION: Sub-pixel Interpolation Bypass (| 0)
    const screenY = (height - (this.y - camY)) | 0;
    if (screenY < -200 || screenY > height + 200) return;

    const px = this.x | 0;
    context.translate(px, screenY);

    let coreColor = theme ? theme.primary : '#00f0ff';
    let glowColor = 'rgba(0, 240, 255, 0.45)';
    const outerRadius = this.radius + Math.sin(this.pulse) * 2.5;

    if (this.type === 'HAZARD') {
      // --- LETHAL SPACE MINE / BOMB ENTITY ---
      const warningRadius = this.radius + 18 + Math.sin(this.pulse) * 3;
      context.save();
      context.strokeStyle = '#e11d48';
      context.lineWidth = 1.8;
      context.globalAlpha = 0.55 + Math.sin(this.pulse) * 0.25;
      context.setLineDash([4, 4]);
      context.beginPath();
      context.arc(0, 0, warningRadius, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      // OPTIMIZATION: Pre-rendered Red Danger Aura
      OrbitNode.blitCached(context, OrbitNode.getCachedGlow('rgba(225, 29, 72, 0.7)'), -36, -36, 72);

      context.rotate(this.rotation || 0);

      const numSpikes = 8;
      const baseR = this.radius;
      const spikeR = this.radius + 9;

      context.fillStyle = '#9f1239';
      context.strokeStyle = '#fda4af';
      context.lineWidth = 1.8;
      
      // OPTIMIZATION: Eliminate shadowBlur in Hazard hull drawing
      context.beginPath();
      for (let i = 0; i < numSpikes; i++) {
        const a1 = (i / numSpikes) * Math.PI * 2;
        const aTip = a1 + (Math.PI / numSpikes);
        const a2 = ((i + 1) / numSpikes) * Math.PI * 2;

        if (i === 0) {
          context.moveTo(Math.cos(a1) * baseR, Math.sin(a1) * baseR);
        }
        context.lineTo(Math.cos(aTip) * spikeR, Math.sin(aTip) * spikeR);
        context.lineTo(Math.cos(a2) * baseR, Math.sin(a2) * baseR);
      }
      context.closePath();
      context.fill();
      context.stroke();

      context.fillStyle = '#1e0505';
      context.beginPath();
      context.arc(0, 0, baseR * 0.65, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#fda4af';
      for (let b = 0; b < 3; b++) {
        const bAngle = (b / 3) * Math.PI * 2 + (this.rotation * -0.5);
        context.beginPath();
        context.arc(0, 0, baseR * 0.52, bAngle - 0.38, bAngle + 0.38);
        context.lineTo(0, 0);
        context.closePath();
        context.fill();
      }

      context.fillStyle = '#ffffff';
      context.fillRect(-3, -3, 6, 6); // Replaced arc with fillRect

      context.rotate(-(this.rotation || 0));
      context.translate(-px, -screenY);
      return;
    }

    if (this.type === 'DECOY') {
      coreColor = '#f97316';
      glowColor = 'rgba(249, 115, 22, 0.45)';
    } else if (this.type === 'FRAGILE') {
      const ratio = this.isHooked ? (this.fragileTimer / this.maxFragileDuration) : 0;
      if (this.isHooked) {
        coreColor = ratio > 0.65 ? '#e11d48' : (ratio > 0.35 ? '#f97316' : '#eab308');
        glowColor = ratio > 0.65 ? 'rgba(225, 29, 72, 0.7)' : 'rgba(234, 179, 8, 0.55)';
      } else {
        coreColor = '#eab308';
        glowColor = 'rgba(234, 179, 8, 0.45)';
      }
    } else if (this.type === 'BOOST') {
      coreColor = '#10b981';
      glowColor = 'rgba(16, 185, 129, 0.55)';
    } else if (this.type === 'MOVING') {
      coreColor = '#c084fc';
      glowColor = 'rgba(192, 132, 252, 0.5)';
    }

    if (this.isTargeted && !this.isHooked) {
      const lockPulse = (Math.sin(this.pulse) + 1) * 0.5;
      const targetRingRadius = outerRadius + 18 + lockPulse * 8;

      context.save();
      context.strokeStyle = theme ? theme.primary : '#00f0ff';
      context.lineWidth = 2.5;
      context.globalAlpha = 0.85 + lockPulse * 0.15;
      context.beginPath();
      context.arc(0, 0, targetRingRadius, 0, Math.PI * 2);
      context.stroke();

      const bracketLen = 7;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(0, -targetRingRadius - 4);
      context.lineTo(0, -targetRingRadius + bracketLen);
      context.moveTo(0, targetRingRadius + 4);
      context.lineTo(0, targetRingRadius - bracketLen);
      context.moveTo(-targetRingRadius - 4, 0);
      context.lineTo(-targetRingRadius + bracketLen, 0);
      context.moveTo(targetRingRadius + 4, 0);
      context.lineTo(targetRingRadius - bracketLen, 0);
      context.stroke();
      context.restore();
    }

    if (!this.isHooked) {
      context.globalAlpha = 0.85 + Math.sin(this.pulse) * 0.15;
      OrbitNode.blitCached(context, OrbitNode.getCachedGlow(glowColor), -36, -36, 72);
      context.globalAlpha = 1;
    }

    // 3. Orbit Target Ring
    context.save();
    context.strokeStyle = coreColor;

    context.lineWidth = 2.0;
    context.globalAlpha = 0.7 + Math.sin(this.pulse * 1.5) * 0.25;

    if (this.type === 'DECOY') {
      // Brittle broken segments with visible gaps
      context.setLineDash([7, 6]);
      context.lineWidth = 2.2;
    } else if (this.type === 'FRAGILE') {
      // Stopwatch dial rim
      context.setLineDash([4, 4]);
    }

    context.beginPath();
    context.arc(0, 0, outerRadius + 6, 0, Math.PI * 2);
    context.stroke();
    context.restore();

    // 4. Moving node track indicator
    if (this.type === 'MOVING') {
      context.save();
      context.strokeStyle = 'rgba(192, 132, 252, 0.25)';
      context.setLineDash([4, 4]);
      context.beginPath();
      context.moveTo(this.startX - this.moveRange - this.x, 0);
      context.lineTo(this.startX + this.moveRange - this.x, 0);
      context.stroke();
      context.restore();
    }

    // 5. FRAGILE: Prominent Stopwatch / Clock Visuals
    if (this.type === 'FRAGILE') {
      context.save();
      // 12 Clock-Tick Hash Marks around perimeter (single batched path)
      const tickRingR = outerRadius + 7;
      context.strokeStyle = coreColor;
      context.lineWidth = 1.6;
      context.globalAlpha = 0.8;
      context.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const innerR = (i % 3 === 0) ? tickRingR - 5 : tickRingR - 3;
        context.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        context.lineTo(Math.cos(angle) * (tickRingR + 1), Math.sin(angle) * (tickRingR + 1));
      }
      context.stroke();

      if (this.isHooked) {
        // Active Countdown Sweep Gauge
        const progress = Math.max(0, 1 - (this.fragileTimer / this.maxFragileDuration));
        context.strokeStyle = coreColor;
        context.lineWidth = 3.6;
        context.globalAlpha = 1.0;
        context.beginPath();
        context.arc(0, 0, outerRadius + 11, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * progress));
        context.stroke();
      } else {
        // Idle Rotating Stopwatch Needle in Center
        const handAngle = this.pulse * 2.2;
        context.strokeStyle = '#ffffff';
        context.lineWidth = 1.8;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(Math.cos(handAngle) * (this.radius * 0.75), Math.sin(handAngle) * (this.radius * 0.75));
        context.stroke();
      }
      context.restore();
    }

    // 6. Super-Boost: Clear prominent arrow pointing UP (towards the top!)
    if (this.type === 'BOOST') {
      context.save();
      const arrowPulse = Math.sin(this.pulse * 3) * 3;
      context.fillStyle = '#10b981';
      context.strokeStyle = '#34d399';
      context.lineWidth = 2;

      // Draw large upward arrow centered on top of node
      context.beginPath();
      context.moveTo(0, -outerRadius - 16 + arrowPulse); // Arrow tip (pointing UP)
      context.lineTo(8, -outerRadius - 6 + arrowPulse);  // Right wing
      context.lineTo(3, -outerRadius - 6 + arrowPulse);
      context.lineTo(3, -outerRadius + 2 + arrowPulse);  // Stem
      context.lineTo(-3, -outerRadius + 2 + arrowPulse);
      context.lineTo(-3, -outerRadius - 6 + arrowPulse);
      context.lineTo(-8, -outerRadius - 6 + arrowPulse); // Left wing
      context.closePath();
      context.fill();
      context.stroke();

      // Second smaller upward chevron below
      context.beginPath();
      context.moveTo(0, -outerRadius + 4 + arrowPulse);
      context.lineTo(5, -outerRadius + 10 + arrowPulse);
      context.lineTo(-5, -outerRadius + 10 + arrowPulse);
      context.closePath();
      context.fill();

      context.restore();
    }

    // 6b. DECOY: Prominent Jagged Fracture Cracks & Brittle Split Body
    if (this.type === 'DECOY') {
      context.save();
      // Thick primary jagged zigzag crack through node
      context.strokeStyle = '#ffffff';
      context.lineWidth = 2.2;
      context.beginPath();
      context.moveTo(-13, -12);
      context.lineTo(-5, -4);
      context.lineTo(2, -1);
      context.lineTo(-1, 5);
      context.lineTo(12, 13);
      context.stroke();

      // Secondary jagged fissure branching off
      context.strokeStyle = '#fdba74';
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(-5, -4);
      context.lineTo(-10, 3);
      context.moveTo(2, -1);
      context.lineTo(8, -7);
      context.stroke();
      context.restore();
    }

    // 7 & 8. Inner core bloom (HiDPI sprite) plus live vector disc/rim so the circle stays sharp.
    context.globalAlpha = 1.0;
    OrbitNode.blitCached(context, OrbitNode.getCachedCore(coreColor, this.type === 'DECOY'), -22, -22, 44);
    context.fillStyle = this.type === 'DECOY' ? '#7c2d12' : '#ffffff';
    context.beginPath();
    context.arc(0, 0, 9.35, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = coreColor;
    context.lineWidth = 2.5;
    context.beginPath();
    context.arc(0, 0, 17, 0, Math.PI * 2);
    context.stroke();

    context.translate(-px, -screenY);
  }
}
