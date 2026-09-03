/**
 * Sling Jump - ShopManager (Ingame Hangar)
 * Manages item unlocking, currency transactions, equipment, and interactive Hangar 2D/3D vector previews.
 */
class ShopManager {
  constructor(storageService, audioManager, worldManager) {
    this.storage = storageService;
    this.audio = audioManager;
    this.world = worldManager;

    this.previewAngle = 0;
    this.previewThrustTimer = 0;
  }

  isUnlocked(category, id) {
    const list = this.storage.data[`unlocked${this.capitalize(category)}`];
    return Array.isArray(list) && list.includes(id);
  }

  isEquipped(category, id) {
    return this.storage.data[`selected${this.capitalize(category).slice(0, -1)}`] === id;
  }

  capitalize(str) {
    // ships -> Ships, trails -> Trails, themes -> Themes
    if (str.endsWith('s')) str = str.slice(0, -1);
    return str.charAt(0).toUpperCase() + str.slice(1) + 's';
  }

  getItemDef(category, id) {
    if (category === 'ships') return CONSTANTS.SHIPS.find(s => s.id === id);
    if (category === 'trails') return CONSTANTS.TRAILS.find(t => t.id === id);
    return null;
  }

  buyItem(category, id) {
    const item = this.getItemDef(category, id);
    if (!item) return { success: false, message: 'Item nicht gefunden' };

    if (this.isUnlocked(category, id)) {
      return { success: false, message: 'Bereits freigeschaltet' };
    }

    if (this.storage.data.cores < item.cost) {
      if (this.audio) this.audio.playProceduralSfx('sfx_ui_click');
      return { success: false, message: 'Nicht genug Coins' };
    }

    // Deduct and unlock
    this.storage.spendCores(item.cost);
    const key = `unlocked${this.capitalize(category)}`;
    this.storage.data[key].push(id);
    this.equipItem(category, id);

    if (this.audio) this.audio.playSfx('sfx_slingshot_boost', { isBoost: true });
    return { success: true, message: `${item.name} freigeschaltet!` };
  }

  equipItem(category, id) {
    const key = `selected${this.capitalize(category).slice(0, -1)}`;
    this.storage.data[key] = id;
    this.storage.save();

    if (category === 'themes' && this.world) {
      this.world.setTheme(id);
    }

    if (this.audio) this.audio.playSfx('sfx_ui_click');
    return true;
  }

  // Live Interactive Hangar Preview Renderer (Top-Seller Style)
  renderPreview(canvas, shipId, trailId, themeId, isEquipped = false) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    this.previewAngle += 0.022;
    this.previewThrustTimer += 0.06;

    const theme = CONSTANTS.THEMES.find(t => t.id === themeId) || CONSTANTS.THEMES[0];
    const shipDef = CONSTANTS.SHIPS.find(s => s.id === shipId) || CONSTANTS.SHIPS[0];
    const trailDef = CONSTANTS.TRAILS.find(t => t.id === trailId) || CONSTANTS.TRAILS[0];

    // 1. Dynamic Universe Theme Background
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);

    // 2. Radial Hologram Pedestal
    const pedestal = ctx.createRadialGradient(width / 2, height / 2 + 10, 5, width / 2, height / 2 + 10, 65);
    pedestal.addColorStop(0, theme.voidGlow || 'rgba(0, 240, 255, 0.25)');
    pedestal.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = pedestal;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 + 10, 65, 0, Math.PI * 2);
    ctx.fill();

    // 4. Orbit Ring around ship in preview
    ctx.save();
    ctx.strokeStyle = theme.primary;
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 + 6, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 5. Orbiting Hologram Node
    const nodeAngle = this.previewAngle * 1.6;
    const nx = width / 2 + Math.cos(nodeAngle) * 52;
    const ny = (height / 2 + 6) + Math.sin(nodeAngle) * 52;
    ctx.save();
    ctx.fillStyle = theme.primary;
    ctx.shadowColor = theme.primary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Live Status Badge on Preview Stage (Top-Seller UI Best Practice)
    ctx.save();
    ctx.font = '900 10px sans-serif';
    ctx.letterSpacing = '1px';
    const tagText = isEquipped ? 'AKTIV AUSGERÜSTET' : 'LIVE-VORSCHAU';
    const tagColor = isEquipped ? '#00f0ff' : '#fbbf24';
    const tagBg = isEquipped ? 'rgba(0, 240, 255, 0.15)' : 'rgba(251, 191, 36, 0.15)';
    const tagBorder = isEquipped ? 'rgba(0, 240, 255, 0.5)' : 'rgba(251, 191, 36, 0.5)';

    const textWidth = ctx.measureText(tagText).width;
    const pillW = textWidth + 16;
    const pillH = 18;
    const pillX = width / 2 - pillW / 2;
    const pillY = 12;

    ctx.fillStyle = tagBg;
    ctx.strokeStyle = tagBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = tagColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, width / 2, pillY + pillH / 2);
    ctx.restore();

    // 7. Render Selected Vector Ship Hull with Selected Trail
    ctx.save();
    ctx.translate(width / 2, height / 2 + 6);
    ctx.scale(2.2, 2.2);

    const glowColor = trailDef.color === 'rainbow' ? `hsl(${(performance.now() * 0.2) % 360}, 100%, 65%)` : trailDef.color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 16;

    // Animated Thruster Plumes
    const flameSize = 8 + Math.sin(this.previewThrustTimer * 8) * 3;
    ctx.fillStyle = glowColor;
    for (const offset of shipDef.thrusterOffsets) {
      ctx.beginPath();
      ctx.moveTo(offset.x - 2, offset.y);
      ctx.lineTo(offset.x, offset.y + flameSize);
      ctx.lineTo(offset.x + 2, offset.y);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#0b1329';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;

    // Precise Hull Vector Geometries
    switch (shipId) {
      case 'interceptor':
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(14, 11);
        ctx.lineTo(7, 8);
        ctx.lineTo(0, 12);
        ctx.lineTo(-7, 8);
        ctx.lineTo(-14, 11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = glowColor;
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.lineTo(0, 5);
        ctx.stroke();
        break;
      case 'stealth_wing':
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(15, 6);
        ctx.lineTo(10, 10);
        ctx.lineTo(0, 6);
        ctx.lineTo(-10, 10);
        ctx.lineTo(-15, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = glowColor;
        ctx.fillRect(-3, -2, 6, 4);
        break;
      case 'orbit_ring':
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, 8, this.previewAngle * 3, this.previewAngle * 3 + Math.PI * 1.5);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'valkyrie':
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(5, -4);
        ctx.lineTo(16, 8);
        ctx.lineTo(6, 6);
        ctx.lineTo(0, 9);
        ctx.lineTo(-6, 6);
        ctx.lineTo(-16, 8);
        ctx.lineTo(-5, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = glowColor;
        ctx.beginPath();
        ctx.moveTo(-8, 3);
        ctx.lineTo(-2, -5);
        ctx.moveTo(8, 3);
        ctx.lineTo(2, -5);
        ctx.stroke();
        break;
      case 'dreadnought':
        ctx.beginPath();
        ctx.moveTo(-5, -16);
        ctx.lineTo(5, -16);
        ctx.lineTo(13, -4);
        ctx.lineTo(13, 11);
        ctx.lineTo(6, 9);
        ctx.lineTo(0, 12);
        ctx.lineTo(-6, 9);
        ctx.lineTo(-13, 11);
        ctx.lineTo(-13, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = glowColor;
        ctx.strokeRect(-4, -8, 8, 12);
        break;
      default:
        // Apex Dart
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(11, 10);
        ctx.lineTo(4, 7);
        ctx.lineTo(0, 9);
        ctx.lineTo(-4, 7);
        ctx.lineTo(-11, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 4);
        ctx.stroke();
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(0, -3, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }
}
