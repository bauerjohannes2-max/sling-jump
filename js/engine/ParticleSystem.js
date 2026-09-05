/**
 * Sling Jump - ParticleSystem
 * Pre-allocated object pool (Zero Garbage Collection during gameplay)
 * Supports: Sparks, Engine Thrust, Fracture Shards, and Floating Text Popups.
 */
class ParticleSystem {
  constructor(maxParticles = 600, maxTexts = 40) {
    this.maxParticles = maxParticles;
    this.maxTexts = maxTexts;

    // Particle Pool Arrays
    this.particles = new Array(maxParticles);
    this.texts = new Array(maxTexts);

    // Initialize fixed memory buffers
    for (let i = 0; i < maxParticles; i++) {
      this.particles[i] = {
        active: false,
        type: 'spark', // spark, thrust, shard
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        life: 0,
        maxLife: 1,
        decay: 1,
        color: '#00f0ff',
        angle: 0,
        rotSpeed: 0
      };
    }

    for (let i = 0; i < maxTexts; i++) {
      this.texts[i] = {
        active: false,
        x: 0,
        y: 0,
        text: '',
        color: '#fbbf24',
        life: 0,
        maxLife: 1,
        decay: 1.4
      };
    }
    this.particleIndex = 0;
    this.textIndex = 0;
  }

  reset() {
    this.particleIndex = 0;
    this.textIndex = 0;
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles[i].active = false;
    }
    for (let i = 0; i < this.maxTexts; i++) {
      this.texts[i].active = false;
    }
  }

  getFreeParticle() {
    // Fast O(1) circular ring buffer allocation
    const p = this.particles[this.particleIndex];
    this.particleIndex = (this.particleIndex + 1) % this.maxParticles;
    return p;
  }

  getFreeText() {
    // Fast O(1) circular ring buffer allocation
    const t = this.texts[this.textIndex];
    this.textIndex = (this.textIndex + 1) % this.maxTexts;
    return t;
  }

  spawnSparks(x, y, count = 12, color = '#00f0ff', speedMult = 1.0) {
    for (let i = 0; i < count; i++) {
      const p = this.getFreeParticle();
      const ang = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 140 + 40) * speedMult;

      p.active = true;
      p.type = 'spark';
      p.x = x;
      p.y = y;
      p.vx = Math.cos(ang) * spd;
      p.vy = Math.sin(ang) * spd;
      p.size = Math.random() * 2.5 + 1.2;
      p.life = 1.0;
      p.maxLife = 1.0;
      p.decay = Math.random() * 2.5 + 2.0;
      p.color = color;
    }
  }

  spawnThrust(x, y, vx, vy, color = '#00f0ff', sizeMult = 1.0) {
    const p = this.getFreeParticle();
    p.active = true;
    p.type = 'thrust';
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.size = (Math.random() * 3.5 + 2.0) * sizeMult;
    p.life = 1.0;
    p.maxLife = 1.0;
    p.decay = Math.random() * 3.0 + 3.5;
    p.color = color;
  }

  spawnShards(x, y, count = 20, color = '#ef4444') {
    for (let i = 0; i < count; i++) {
      const p = this.getFreeParticle();
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 280 + 70;

      p.active = true;
      p.type = 'shard';
      p.x = x;
      p.y = y;
      p.vx = Math.cos(ang) * spd;
      p.vy = Math.sin(ang) * spd;
      p.size = Math.random() * 4 + 2;
      p.life = 1.0;
      p.maxLife = 1.0;
      p.decay = Math.random() * 1.5 + 1.2;
      p.color = color;
      p.angle = Math.random() * Math.PI * 2;
      p.rotSpeed = (Math.random() - 0.5) * 12;
    }
  }

  spawnShockwave(x, y, color = '#fbbf24', maxRadius = 55) {
    const p = this.getFreeParticle();
    p.active = true;
    p.type = 'shockwave';
    p.x = x;
    p.y = y;
    p.vx = 0;
    p.vy = 0;
    p.size = maxRadius;
    p.life = 1.0;
    p.maxLife = 1.0;
    p.decay = 2.8;
    p.color = color;
  }

  spawnSpeedStreaks(x, y, count = 3, color = '#38bdf8') {
    for (let i = 0; i < count; i++) {
      const p = this.getFreeParticle();
      p.active = true;
      p.type = 'streak';
      p.x = x + (Math.random() - 0.5) * 160;
      p.y = y + Math.random() * 80;
      p.vx = 0;
      p.vy = -(Math.random() * 320 + 380);
      p.size = Math.random() * 25 + 15;
      p.life = 1.0;
      p.maxLife = 1.0;
      p.decay = 4.2;
      p.color = color;
    }
  }

  spawnFloatingText(x, y, text, color = '#fbbf24', size = 16, isCombo = false) {
    const t = this.getFreeText();
    t.active = true;
    t.x = x;
    t.y = y;
    t.text = text;
    t.color = color;
    t.size = size;
    t.isCombo = isCombo;
    t.life = 1.0;
    t.maxLife = 1.0;
    t.decay = isCombo ? 0.7 : 1.0;
  }

  update(dt, gravity = 560) {
    // Update Particles
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      if (p.type === 'shard') {
        p.vy -= gravity * 0.5 * dt;
        p.angle += p.rotSpeed * dt;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        p.active = false;
      }
    }

    // Update Floating Texts
    for (let i = 0; i < this.maxTexts; i++) {
      const t = this.texts[i];
      if (!t.active) continue;

      t.y += 42 * dt;
      t.life -= t.decay * dt;

      if (t.life <= 0) {
        t.active = false;
      }
    }
  }

  initCache() {
    if (this.cachedGlows) return;
    this.cachedGlows = {};
    const createGlow = (color, type, isPerf) => {
      const cvs = document.createElement('canvas');
      const size = type === 'thrust' ? 40 : (type === 'streak' ? 30 : 32);
      cvs.width = size * 2;
      cvs.height = size * 2;
      const ctx = cvs.getContext('2d');
      const center = size;
      
      ctx.fillStyle = color;
      if (!isPerf) {
        ctx.shadowColor = color;
        ctx.shadowBlur = type === 'thrust' ? 10 : 8;
      }
      
      if (type === 'streak') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(center, center - 10);
        ctx.lineTo(center, center + 10);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(center, center, type === 'thrust' ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
      }
      return cvs;
    };
    this.createGlow = createGlow;
  }

  getGlow(color, type, isPerf) {
    if (!this.cachedGlows) this.initCache();
    // Quantize dynamic HSL colors to prevent unbounded offscreen canvas growth
    let normalizedColor = color;
    if (color && typeof color === 'string' && color.startsWith('hsl')) {
      const match = color.match(/hsl\((\d+(\.\d+)?)/);
      if (match) {
        const h = Math.round(parseFloat(match[1]) / 15) * 15 % 360;
        normalizedColor = `hsl(${h},100%,60%)`;
      }
    }
    const key = `${normalizedColor}_${type}_${isPerf}`;
    if (!this.cachedGlows[key]) {
      this.cachedGlows[key] = this.createGlow(normalizedColor, type, isPerf);
    }
    return this.cachedGlows[key];
  }

  draw(context, camY, screenHeight) {
    const isPerf = Boolean(window._gameEngine && window._gameEngine.storage && window._gameEngine.storage.data.settings.performanceMode);

    // 1. Draw Active Particles
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      // OPTIMIZATION: Sub-pixel Interpolation Bypass (| 0)
      const sy = (screenHeight - (p.y - camY)) | 0;
      if (sy < -150 || sy > screenHeight + 150) continue;

      const alpha = Math.max(0, p.life);

      if (p.type === 'shard') {
        // High-performance crisp fractured shard (zero shadowBlur in loop)
        const px = p.x | 0;
        context.translate(px, sy);
        context.rotate(p.angle);
        context.globalAlpha = alpha;
        context.fillStyle = p.color;
        const halfSize = (p.size / 2) | 0;
        context.fillRect(-halfSize, -halfSize, p.size | 0, p.size | 0);
        context.rotate(-p.angle);
        context.translate(-px, -sy);
      } else if (p.type === 'shockwave') {
        const curRadius = p.size * (1.0 - alpha);
        context.globalAlpha = alpha * 0.85;
        context.strokeStyle = p.color;
        context.lineWidth = 2.5 * alpha;
        context.beginPath();
        context.arc(p.x | 0, sy, curRadius, 0, Math.PI * 2);
        context.stroke();
      } else if (p.type === 'streak') {
        context.globalAlpha = alpha * 0.75;
        context.strokeStyle = p.color;
        context.lineWidth = 2;
        context.beginPath();
        const px = p.x | 0;
        context.moveTo(px, sy);
        context.lineTo(px, sy + (p.size | 0));
        context.stroke();
      } else {
        // High-Performance Off-Screen Glow Texture Stamp
        context.globalAlpha = p.type === 'thrust' ? alpha * 0.75 : alpha;
        const glowImg = this.getGlow(p.color, p.type, isPerf);
        const drawSize = p.type === 'spark' ? p.size * alpha : p.size;
        context.drawImage(glowImg, (p.x - drawSize) | 0, (sy - drawSize) | 0, (drawSize * 2) | 0, (drawSize * 2) | 0);
      }
    }

    // 2. Draw Floating Texts
    for (let i = 0; i < this.maxTexts; i++) {
      const t = this.texts[i];
      if (!t.active) continue;

      const sy = (screenHeight - (t.y - camY)) | 0;
      if (sy < -60 || sy > screenHeight + 60) continue;

      const alpha = Math.max(0, t.life);
      const isPerf = Boolean(window._gameEngine && window._gameEngine.storage && window._gameEngine.storage.data.settings.performanceMode);

      context.globalAlpha = alpha;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      if (t.isCombo) {
        const popScale = 1.0 + Math.sin(alpha * Math.PI) * 0.35;
        const px = t.x | 0;
        context.translate(px, sy);
        context.scale(popScale, popScale);

        const fontSize = t.size || 28;
        context.font = `900 ${fontSize}px 'Orbitron', 'Inter', sans-serif`;

        context.strokeStyle = 'rgba(4, 7, 13, 0.95)';
        context.lineWidth = 6;
        context.lineJoin = 'round';
        context.strokeText(t.text, 0, 0);

        context.fillStyle = t.color;
        if (!isPerf) {
          context.shadowColor = t.color;
          context.shadowBlur = 20;
        }
        context.fillText(t.text, 0, 0);

        // Reverse scale/translate
        context.scale(1 / popScale, 1 / popScale);
        context.translate(-px, -sy);
        if (!isPerf) context.shadowBlur = 0;
      } else {
        const fontSize = t.size || 16;
        context.font = `800 ${fontSize}px 'Orbitron', 'Inter', sans-serif`;
        context.strokeStyle = 'rgba(4, 7, 13, 0.9)';
        context.lineWidth = 3.5;
        const px = t.x | 0;
        context.strokeText(t.text, px, sy);

        context.fillStyle = t.color;
        if (!isPerf) {
          context.shadowColor = t.color;
          context.shadowBlur = 10;
        }
        context.fillText(t.text, px, sy);
        if (!isPerf) context.shadowBlur = 0;
      }
    }
    context.globalAlpha = 1.0;
  }
}
