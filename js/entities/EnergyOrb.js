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

    // 1. Cache Prismatic Spark Glow
    const c1 = document.createElement('canvas');
    c1.width = 64; c1.height = 64;
    const ctx1 = c1.getContext('2d');
    const glow1 = ctx1.createRadialGradient(32, 32, 2, 32, 32, 30);
    glow1.addColorStop(0, 'rgba(232, 121, 249, 0.95)');
    glow1.addColorStop(0.35, 'rgba(147, 51, 234, 0.50)');
    glow1.addColorStop(0.7, 'rgba(88, 28, 135, 0.20)');
    glow1.addColorStop(1, 'rgba(88, 28, 135, 0)');
    ctx1.fillStyle = glow1;
    ctx1.beginPath();
    ctx1.arc(32, 32, 30, 0, Math.PI * 2);
    ctx1.fill();
    EnergyOrb.cache['CRYSTAL_GLOW'] = c1;

    // 2. Cache Bullion Credit Glow
    const c2 = document.createElement('canvas');
    c2.width = 48; c2.height = 48;
    const ctx2 = c2.getContext('2d');
    const glow2 = ctx2.createRadialGradient(24, 24, 2, 24, 24, 22);
    glow2.addColorStop(0, 'rgba(253, 230, 138, 0.90)');
    glow2.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
    glow2.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx2.fillStyle = glow2;
    ctx2.beginPath();
    ctx2.arc(24, 24, 22, 0, Math.PI * 2);
    ctx2.fill();
    EnergyOrb.cache['COIN_GLOW'] = c2;

    EnergyOrb.buildSprites();
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        EnergyOrb.buildSprites(true);
      });
    }
  }

  static buildSprites(force = false) {
    if (!EnergyOrb.cache) EnergyOrb.cache = {};

    // 3. Pre-render Aerospace Credits Bullion Coin (48x48)
    const cCoin = EnergyOrb.cache['CREDIT_SPRITE'] || document.createElement('canvas');
    cCoin.width = 48; cCoin.height = 48;
    const ctxCoin = cCoin.getContext('2d');
    ctxCoin.clearRect(0, 0, 48, 48);

    // Outer Beveled Rim
    const rimGrad = ctxCoin.createLinearGradient(10, 8, 38, 40);
    rimGrad.addColorStop(0, '#fde68a');
    rimGrad.addColorStop(0.35, '#f59e0b');
    rimGrad.addColorStop(1, '#78350f');
    ctxCoin.fillStyle = rimGrad;
    ctxCoin.beginPath();
    ctxCoin.arc(24, 24, 15.5, 0, Math.PI * 2);
    ctxCoin.fill();
    ctxCoin.strokeStyle = '#260b02';
    ctxCoin.lineWidth = 0.9;
    ctxCoin.stroke();

    // Specular Highlight Inner Ring
    ctxCoin.strokeStyle = 'rgba(254, 240, 138, 0.45)';
    ctxCoin.lineWidth = 0.6;
    ctxCoin.beginPath();
    ctxCoin.arc(24, 24, 14.1, 0, Math.PI * 2);
    ctxCoin.stroke();

    // Recessed Dark Contrast Well
    const wellGrad = ctxCoin.createRadialGradient(24, 24, 2, 24, 24, 12.5);
    wellGrad.addColorStop(0, '#5c2409');
    wellGrad.addColorStop(0.85, '#240a02');
    wellGrad.addColorStop(1, '#140501');
    ctxCoin.fillStyle = wellGrad;
    ctxCoin.beginPath();
    ctxCoin.arc(24, 24, 12.3, 0, Math.PI * 2);
    ctxCoin.fill();
    ctxCoin.strokeStyle = '#1a0601';
    ctxCoin.lineWidth = 0.75;
    ctxCoin.stroke();

    // Precision Centered Bold 'C'
    ctxCoin.fillStyle = '#fef08a';
    ctxCoin.textAlign = 'center';
    ctxCoin.textBaseline = 'middle';
    ctxCoin.font = '700 19px "Rajdhani", sans-serif';
    ctxCoin.fillText('C', 24, 24.5);
    EnergyOrb.cache['CREDIT_SPRITE'] = cCoin;

    // 4. Pre-render Aerospace Sparks 8-Point Prismatic Star (56x56)
    const cSpark = EnergyOrb.cache['SPARK_SPRITE'] || document.createElement('canvas');
    cSpark.width = 56; cSpark.height = 56;
    const ctxSpark = cSpark.getContext('2d');
    ctxSpark.clearRect(0, 0, 56, 56);

    // 8-Point Star Polygon
    const starGrad = ctxSpark.createRadialGradient(28, 28, 2, 28, 28, 24);
    starGrad.addColorStop(0, '#e879f9');
    starGrad.addColorStop(0.5, '#9333ea');
    starGrad.addColorStop(1, '#581c87');
    ctxSpark.fillStyle = starGrad;
    ctxSpark.strokeStyle = '#d8b4fe';
    ctxSpark.lineWidth = 1.1;
    ctxSpark.lineJoin = 'round';
    ctxSpark.beginPath();
    ctxSpark.moveTo(28, 5);   // top tip
    ctxSpark.lineTo(33, 22);  // top-right shoulder
    ctxSpark.lineTo(51, 28);  // right tip
    ctxSpark.lineTo(33, 34);  // bottom-right shoulder
    ctxSpark.lineTo(28, 51);  // bottom tip
    ctxSpark.lineTo(23, 34);  // bottom-left shoulder
    ctxSpark.lineTo(5, 28);   // left tip
    ctxSpark.lineTo(23, 22);  // top-left shoulder
    ctxSpark.closePath();
    ctxSpark.fill();
    ctxSpark.stroke();

    // Top Specular Refractions
    ctxSpark.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctxSpark.beginPath();
    ctxSpark.moveTo(28, 5);
    ctxSpark.lineTo(33, 22);
    ctxSpark.lineTo(28, 28);
    ctxSpark.closePath();
    ctxSpark.fill();

    ctxSpark.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctxSpark.beginPath();
    ctxSpark.moveTo(5, 28);
    ctxSpark.lineTo(23, 22);
    ctxSpark.lineTo(28, 28);
    ctxSpark.closePath();
    ctxSpark.fill();

    // Bottom Depth Shading
    ctxSpark.fillStyle = 'rgba(59, 7, 100, 0.45)';
    ctxSpark.beginPath();
    ctxSpark.moveTo(28, 51);
    ctxSpark.lineTo(33, 34);
    ctxSpark.lineTo(28, 28);
    ctxSpark.closePath();
    ctxSpark.fill();

    ctxSpark.fillStyle = 'rgba(59, 7, 100, 0.32)';
    ctxSpark.beginPath();
    ctxSpark.moveTo(51, 28);
    ctxSpark.lineTo(33, 34);
    ctxSpark.lineTo(28, 28);
    ctxSpark.closePath();
    ctxSpark.fill();

    // Laser Cleave Lines
    ctxSpark.strokeStyle = 'rgba(245, 208, 254, 0.55)';
    ctxSpark.lineWidth = 0.8;
    ctxSpark.beginPath();
    ctxSpark.moveTo(33, 22);
    ctxSpark.lineTo(23, 34);
    ctxSpark.moveTo(23, 22);
    ctxSpark.lineTo(33, 34);
    ctxSpark.stroke();

    // Core Nucleus Pip
    ctxSpark.fillStyle = '#f5d0fe';
    ctxSpark.beginPath();
    ctxSpark.arc(28, 28, 2.0, 0, Math.PI * 2);
    ctxSpark.fill();

    EnergyOrb.cache['SPARK_SPRITE'] = cSpark;
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

      // 2. Slow Radiant 8-Point Prismatic Star
      context.rotate(this.pulse * 0.35);
      const sW = 56 * pulseScale;
      const sH = 56 * pulseScale;
      context.drawImage(EnergyOrb.cache['SPARK_SPRITE'], -sW * 0.5, -sH * 0.5, sW, sH);
      context.rotate(-this.pulse * 0.35);

    } else {
      // 1. Outer Radiant Glow (Pre-rendered)
      context.drawImage(EnergyOrb.cache['COIN_GLOW'], -24, -24);

      const pulseScale = 1 + Math.sin(this.pulse) * 0.08;
      const cW = 48 * pulseScale;
      const cH = 48 * pulseScale;

      // 2. Pre-rendered Stamped Bullion Credit Coin
      context.drawImage(EnergyOrb.cache['CREDIT_SPRITE'], -cW * 0.5, -cH * 0.5, cW, cH);
    }

    context.translate(-px, -screenY);
  }
}
