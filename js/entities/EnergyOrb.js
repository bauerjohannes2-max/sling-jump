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

  draw(context, camY, height, theme = null) {
    if (this.collected) return;
    const screenY = height - (this.y - camY);
    if (screenY < -200 || screenY > height + 200) return;

    context.save();
    context.translate(this.x, screenY);

    if (this.type === 'CRYSTAL') {
      // =========================================================================
      // ULTRA-RARE HYPER-KRISTALL: Radiant Quantum Violet Diamond Vector Geometry
      // =========================================================================
      const pulseScale = 1 + Math.sin(this.pulse) * 0.12;

      // 1. High-Intensity Quantum Aura
      const glow = context.createRadialGradient(0, 0, 1, 0, 0, 30);
      glow.addColorStop(0, 'rgba(217, 70, 239, 0.9)');
      glow.addColorStop(0.4, 'rgba(192, 132, 252, 0.35)');
      glow.addColorStop(1, 'rgba(217, 70, 239, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(0, 0, 30, 0, Math.PI * 2);
      context.fill();

      // 2. Rotating Radiant Diamond Rays
      context.save();
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
      context.restore();

      // 3. Faceted Outer Quantum Diamond
      const w1 = 9 * pulseScale;
      const h1 = 14 * pulseScale;
      context.save();
      context.fillStyle = 'rgba(217, 70, 239, 0.35)';
      context.strokeStyle = '#d946ef';
      context.lineWidth = 2.0;
      context.shadowColor = '#d946ef';
      context.shadowBlur = 12;

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
      context.shadowColor = '#ffffff';
      context.shadowBlur = 8;

      context.beginPath();
      context.moveTo(0, -h2);
      context.lineTo(w2, 0);
      context.lineTo(0, h2);
      context.lineTo(-w2, 0);
      context.closePath();
      context.fill();
      context.stroke();

      // 5. Center Pulsing Star Spark
      context.fillStyle = '#f43f5e';
      context.shadowBlur = 0;
      context.beginPath();
      context.arc(0, 0, 2.2, 0, Math.PI * 2);
      context.fill();

      context.restore();
    } else {
      // =========================================================================
      // STANDARD GOLD COIN
      // =========================================================================
      const coreColor = theme ? theme.accent : '#fbbf24';

      // Outer Radiant Glow
      const glow = context.createRadialGradient(0, 0, 1, 0, 0, 22);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.85)');
      glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.25)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(0, 0, 22, 0, Math.PI * 2);
      context.fill();

      const pulseScale = 1 + Math.sin(this.pulse) * 0.08;
      const coinR = 10 * pulseScale;

      // 1. Outer Golden Coin Ring
      context.fillStyle = 'rgba(251, 191, 36, 0.22)';
      context.strokeStyle = coreColor;
      context.lineWidth = 1.8;
      context.beginPath();
      context.arc(0, 0, coinR, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      // 2. Inner Faceted Vector Diamond
      const dW = 5.5 * pulseScale;
      const dH = 7.0 * pulseScale;
      context.fillStyle = '#ffffff';
      context.strokeStyle = '#f59e0b';
      context.lineWidth = 1.2;
      context.shadowColor = coreColor;
      context.shadowBlur = 8;
      context.beginPath();
      context.moveTo(0, -dH);
      context.lineTo(dW, 0);
      context.lineTo(0, dH);
      context.lineTo(-dW, 0);
      context.closePath();
      context.fill();
      context.stroke();

      // 3. Center Core Spark Dot
      context.shadowBlur = 0;
      context.fillStyle = coreColor;
      context.beginPath();
      context.arc(0, 0, 1.8, 0, Math.PI * 2);
      context.fill();
    }

    context.restore();
  }
}
