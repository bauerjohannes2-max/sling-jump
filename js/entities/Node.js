/**
 * Sling Jump - OrbitNode Entity
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

    // Moving Node properties
    this.startX = x;
    const speedScale = Math.min(1.75, 1.0 + (altitude / 800) * 0.45);
    this.moveSpeed = (Math.random() * 40 + 55) * speedScale * (Math.random() < 0.5 ? 1 : -1);
    this.moveRange = Math.min(screenWidth * 0.25, 120);
    this.movePhase = Math.random() * Math.PI * 2;

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

  update(dt, screenWidth, audio, onBreak) {
    if (this.type === 'HAZARD') {
      this.pulse += dt * 5.5; // Rapid aggressive warning pulse
      this.rotation += dt * 1.35; // Menacing continuous rotation
      return;
    }

    this.pulse += dt * 3.2;

    if (this.type === 'MOVING') {
      this.movePhase += (this.moveSpeed / this.moveRange) * dt;
      this.x = this.startX + Math.sin(this.movePhase) * this.moveRange;
      if (this.x < 45) this.x = 45;
      if (this.x > screenWidth - 45) this.x = screenWidth - 45;
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

  draw(context, camY, height, theme = null) {
    if (this.isBroken) return;

    // OPTIMIZATION: Sub-pixel Interpolation Bypass (| 0)
    const screenY = (height - (this.y - camY)) | 0;
    if (screenY < -200 || screenY > height + 200) return;

    if (!OrbitNode.cache) {
      OrbitNode.cache = {};
    }

    const getCachedGlow = (gColor) => {
      if (!OrbitNode.cache[gColor]) {
        const c = document.createElement('canvas');
        c.width = 72; c.height = 72;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(36, 36, 2, 36, 36, 34);
        grad.addColorStop(0, gColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(36, 36, 34, 0, Math.PI * 2);
        ctx.fill();
        OrbitNode.cache[gColor] = c;
      }
      return OrbitNode.cache[gColor];
    };

    const getCachedCore = (cColor, isDecoy) => {
      const key = `${cColor}_${isDecoy}`;
      if (!OrbitNode.cache[key]) {
        const c = document.createElement('canvas');
        c.width = 44; c.height = 44;
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
    };

    // OPTIMIZATION: Removed save/restore where possible. Manual transform reversal.
    const px = this.x | 0;
    context.translate(px, screenY);

    let coreColor = theme ? theme.primary : '#00f0ff';
    let glowColor = 'rgba(0, 240, 255, 0.45)';
    let outerRadius = this.radius + Math.sin(this.pulse) * 2.5;

    if (this.type === 'HAZARD') {
      // --- LETHAL SPACE MINE / BOMB ENTITY ---
      const warningRadius = this.radius + 18 + Math.sin(this.pulse) * 3;
      context.save();
      context.strokeStyle = '#ef4444';
      context.lineWidth = 1.8;
      context.globalAlpha = 0.55 + Math.sin(this.pulse) * 0.25;
      context.setLineDash([4, 4]);
      context.beginPath();
      context.arc(0, 0, warningRadius, 0, Math.PI * 2);
      context.stroke();
      context.restore();

      // OPTIMIZATION: Pre-rendered Red Danger Aura
      context.drawImage(getCachedGlow('rgba(239, 68, 68, 0.7)'), -36, -36);

      context.rotate(this.rotation || 0);

      const numSpikes = 8;
      const baseR = this.radius;
      const spikeR = this.radius + 9;

      context.fillStyle = '#991b1b';
      context.strokeStyle = '#f87171';
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

      context.fillStyle = '#fca5a5';
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
        coreColor = ratio > 0.65 ? '#ef4444' : (ratio > 0.35 ? '#f97316' : '#eab308');
        glowColor = ratio > 0.65 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(234, 179, 8, 0.55)';
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
      const lockPulse = (Math.sin(performance.now() * 0.008) + 1) * 0.5;
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
      context.save();
      context.rotate(performance.now() * 0.0005);
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

      context.restore();
    }

    // OPTIMIZATION: 2. Outer Soft Aura (Pre-rendered drawn dynamically scaled)
    const dSize = outerRadius + 14;
    context.drawImage(getCachedGlow(glowColor), -dSize, -dSize, dSize * 2, dSize * 2);

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
      // 12 Clock-Tick Hash Marks around perimeter (communicates TIMER immediately)
      const tickRingR = outerRadius + 7;
      context.strokeStyle = coreColor;
      context.lineWidth = 1.6;
      context.globalAlpha = 0.8;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const innerR = (i % 3 === 0) ? tickRingR - 5 : tickRingR - 3;
        context.beginPath();
        context.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        context.lineTo(Math.cos(angle) * (tickRingR + 1), Math.sin(angle) * (tickRingR + 1));
        context.stroke();
      }

      if (this.isHooked) {
        // Active Countdown Sweep Gauge
        const progress = Math.max(0, 1 - (this.fragileTimer / this.maxFragileDuration));
        context.strokeStyle = coreColor;
        context.shadowColor = coreColor;
        context.shadowBlur = 12;
        context.lineWidth = 4.2;
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
      context.shadowColor = '#f97316';
      context.shadowBlur = 8;
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

    // 7 & 8. Inner Solid Core and Rim (Pre-rendered)
    context.globalAlpha = 1.0;
    context.drawImage(getCachedCore(coreColor, this.type === 'DECOY'), -22, -22);

    context.translate(-px, -screenY);
  }
}
