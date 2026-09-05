/**
 * Sling Jump - EnergyOrb Entity
 * Collectible Energy Core with Magnetic Attractor & Vector Crystal Rendering
 */
class EnergyOrb {
  constructor(x, y, type = 'COIN') {
    this.x = x;
    this.y = y;
    this.type = type; // 'COIN' or 'CRYSTAL' (Hyper-Kristall)
    this.vx = 0;
    this.vy = 0;
    this.radius = type === 'CRYSTAL' ? 13 : 9;
    this.pulse = Math.random() * Math.PI * 2;
    this.collected = false;
  }

  update(dt, player = null, particles = null) {
    this.pulse += dt * (this.type === 'CRYSTAL' ? 5 : 4);
  }

  static initCache() {
    if (EnergyOrb.cache) return;
    EnergyOrb.cache = {};

    // Cache Crystal Glow
    const c1 = document.createElement('canvas');
    c1.width = 64; c1.height = 64;
    const ctx1 = c1.getContext('2d');
    const glow1 = ctx1.createRadialGradient(32, 32, 1, 32, 32, 30);
    glow1.addColorStop(0, 'rgba(217, 70, 239, 0.9)');
    glow1.addColorStop(0.4, 'rgba(192, 132, 252, 0.35)');
    glow1.addColorStop(1, 'rgba(217, 70, 239, 0)');
    ctx1.fillStyle = glow1;
    ctx1.beginPath();
    ctx1.arc(32, 32, 30, 0, Math.PI * 2);
    ctx1.fill();
    EnergyOrb.cache['CRYSTAL_GLOW'] = c1;

    // Cache Coin Glow
    const c2 = document.createElement('canvas');
    c2.width = 48; c2.height = 48;
    const ctx2 = c2.getContext('2d');
    const glow2 = ctx2.createRadialGradient(24, 24, 1, 24, 24, 22);
    glow2.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
    glow2.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
    glow2.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx2.fillStyle = glow2;
    ctx2.beginPath();
    ctx2.arc(24, 24, 22, 0, Math.PI * 2);
    ctx2.fill();
    EnergyOrb.cache['COIN_GLOW'] = c2;
  }

  draw(context, camY, height, theme = null) {
    if (this.collected) return;
    
    // OPTIMIZATION: Sub-pixel Interpolation Bypass (| 0)
    const screenY = (height - (this.y - camY)) | 0;
    if (screenY < -200 || screenY > height + 200) return;

    if (!EnergyOrb.cache) EnergyOrb.initCache();

    // OPTIMIZATION: Removed save/restore. Manual transform reversal.
    const px = this.x | 0;
    context.translate(px, screenY);

    if (this.type === 'CRYSTAL') {
      const pulseScale = 1 + Math.sin(this.pulse) * 0.12;

      // 1. High-Intensity Quantum Aura (Pre-rendered)
      context.drawImage(EnergyOrb.cache['CRYSTAL_GLOW'], -32, -32);

      // 2. Rotating Radiant Diamond Rays
      context.rotate(this.pulse * 0.6);
      context.strokeStyle = 'rgba(244, 63, 94, 0.7)';
      context.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) {
        context.beginPath();
        context.moveTo(0, -18 * pulseScale);
        context.lineTo(0, 18 * pulseScale);
        context.stroke();
        context.rotate(Math.PI / 4);
      }
      // Reverse rotate from loop (4 * PI/4 = PI)
      context.rotate(-Math.PI);
      context.rotate(-this.pulse * 0.6);

      // 3. Faceted Outer Quantum Diamond
      const w1 = 9 * pulseScale;
      const h1 = 14 * pulseScale;
      context.fillStyle = 'rgba(217, 70, 239, 0.35)';
      context.strokeStyle = '#d946ef';
      context.lineWidth = 2.0;

      context.beginPath();
      context.moveTo(0, -h1);
      context.lineTo(w1, 0);
      context.lineTo(0, h1);
      context.lineTo(-w1, 0);
      context.closePath();
      context.fill();
      context.stroke();

      // 4. Inner Brilliant White Core Prism
      const w2 = 4.5 * pulseScale;
      const h2 = 8.0 * pulseScale;
      context.fillStyle = '#ffffff';
      context.strokeStyle = '#f43f5e';
      context.lineWidth = 1.2;

      context.beginPath();
      context.moveTo(0, -h2);
      context.lineTo(w2, 0);
      context.lineTo(0, h2);
      context.lineTo(-w2, 0);
      context.closePath();
      context.fill();
      context.stroke();

      // 5. Center Pulsing Star Spark (Replaced arc with fillRect)
      context.fillStyle = '#f43f5e';
      context.fillRect(-2, -2, 4, 4);

    } else {
      const coreColor = theme ? theme.accent : '#fbbf24';

      // 1. Outer Radiant Glow (Pre-rendered)
      context.drawImage(EnergyOrb.cache['COIN_GLOW'], -24, -24);

      const pulseScale = 1 + Math.sin(this.pulse) * 0.08;
      const coinR = 10 * pulseScale;

      // 2. Outer Golden Coin Ring
      context.fillStyle = 'rgba(251, 191, 36, 0.22)';
      context.strokeStyle = coreColor;
      context.lineWidth = 1.8;
      
      // Removed arc - replaced with highly optimized octagon for ring
      context.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rx = Math.cos(a) * coinR;
        const ry = Math.sin(a) * coinR;
        if (i === 0) context.moveTo(rx, ry);
        else context.lineTo(rx, ry);
      }
      context.closePath();
      context.fill();
      context.stroke();

      // 3. Inner Faceted Vector Diamond
      const dW = 5.5 * pulseScale;
      const dH = 7.0 * pulseScale;
      context.fillStyle = '#ffffff';
      context.strokeStyle = '#f59e0b';
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(0, -dH);
      context.lineTo(dW, 0);
      context.lineTo(0, dH);
      context.lineTo(-dW, 0);
      context.closePath();
      context.fill();
      context.stroke();

      // 4. Center Core Spark Dot (Replaced arc with fillRect)
      context.fillStyle = coreColor;
      context.fillRect(-2, -2, 4, 4);
    }

    context.translate(-px, -screenY);
  }
}
