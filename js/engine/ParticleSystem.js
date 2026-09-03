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
  }

  reset() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles[i].active = false;
    }
    for (let i = 0; i < this.maxTexts; i++) {
      this.texts[i].active = false;
    }
  }

  getFreeParticle() {
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.particles[i].active) return this.particles[i];
    }
    return this.particles[0]; // Recycle oldest if full
  }

  getFreeText() {
    for (let i = 0; i < this.maxTexts; i++) {
      if (!this.texts[i].active) return this.texts[i];
    }
    return this.texts[0];
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

  draw(context, camY, screenHeight) {
    context.save();

    // 1. Draw Active Particles
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      const sy = screenHeight - (p.y - camY);
      if (sy < -150 || sy > screenHeight + 150) continue;

      const alpha = Math.max(0, p.life);

      const isPerf = Boolean(window._gameEngine && window._gameEngine.storage && window._gameEngine.storage.data.settings.performanceMode);

      if (p.type === 'shard') {
        context.save();
        context.translate(p.x, sy);
        context.rotate(p.angle);
        context.globalAlpha = alpha;
        context.fillStyle = p.color;
        if (!isPerf) {
          context.shadowColor = p.color;
          context.shadowBlur = 8;
        }
        context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        context.restore();
      } else if (p.type === 'shockwave') {
        const curRadius = p.size * (1.0 - alpha);
        context.save();
        context.globalAlpha = alpha * 0.85;
        context.strokeStyle = p.color;
        context.lineWidth = 2.5 * alpha;
        if (!isPerf) {
          context.shadowColor = p.color;
          context.shadowBlur = 12;
        }
        context.beginPath();
        context.arc(p.x, sy, curRadius, 0, Math.PI * 2);
        context.stroke();
        context.restore();
      } else if (p.type === 'streak') {
        context.save();
        context.globalAlpha = alpha * 0.7;
        context.strokeStyle = p.color;
        context.lineWidth = 2;
        if (!isPerf) {
          context.shadowColor = p.color;
          context.shadowBlur = 8;
        }
        context.beginPath();
        context.moveTo(p.x, sy);
        context.lineTo(p.x, sy + p.size);
        context.stroke();
        context.restore();
      } else {
        context.globalAlpha = p.type === 'thrust' ? alpha * 0.75 : alpha;
        context.fillStyle = p.color;
        if (!isPerf) {
          context.shadowColor = p.color;
          context.shadowBlur = p.type === 'thrust' ? 10 : 8;
        }
        context.beginPath();
        context.arc(p.x, sy, p.size * (p.type === 'spark' ? alpha : 1), 0, Math.PI * 2);
        context.fill();
      }
    }

    // 2. Draw Floating Texts with high-contrast outline and punchy combo scaling
    for (let i = 0; i < this.maxTexts; i++) {
      const t = this.texts[i];
      if (!t.active) continue;

      const sy = screenHeight - (t.y - camY);
      if (sy < -60 || sy > screenHeight + 60) continue;

      const alpha = Math.max(0, t.life);
      const isPerf = Boolean(window._gameEngine && window._gameEngine.storage && window._gameEngine.storage.data.settings.performanceMode);

      context.save();
      context.globalAlpha = alpha;
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      if (t.isCombo) {
        // Punchy scale pop on combo spawn
        const popScale = 1.0 + Math.sin(alpha * Math.PI) * 0.35;
        context.translate(t.x, sy);
        context.scale(popScale, popScale);

        const fontSize = t.size || 28;
        context.font = `900 ${fontSize}px 'Orbitron', 'Inter', sans-serif`;

        // Heavy dark backdrop outline for crystal-clear readability
        context.strokeStyle = 'rgba(4, 7, 13, 0.95)';
        context.lineWidth = 6;
        context.lineJoin = 'round';
        context.strokeText(t.text, 0, 0);

        // Radiant Neon Glow & Fill
        context.fillStyle = t.color;
        if (!isPerf) {
          context.shadowColor = t.color;
          context.shadowBlur = 20;
        }
        context.fillText(t.text, 0, 0);
      } else {
        const fontSize = t.size || 16;
        context.font = `800 ${fontSize}px 'Orbitron', 'Inter', sans-serif`;
        context.strokeStyle = 'rgba(4, 7, 13, 0.9)';
        context.lineWidth = 3.5;
        context.strokeText(t.text, t.x, sy);

        context.fillStyle = t.color;
        if (!isPerf) {
          context.shadowColor = t.color;
          context.shadowBlur = 10;
        }
        context.fillText(t.text, t.x, sy);
      }

      context.restore();
    }

    context.restore();
  }
}
