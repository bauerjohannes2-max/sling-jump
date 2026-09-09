/**
 * Space Jump - Shared ship hull / nozzle / shock-plasma renderer.
 * Hangar SVG and in-game canvas both consume CONSTANTS.SHIPS geometry.
 */
const ShipArt = (() => {
  const FLAME_INSET = 0.8;
  const BELL_DEPTH = 2.6;
  const COLLAR = '#fb7185';
  const PLASMA = '#e11d48';
  const HOT = '#fb7185';
  const WHITE = '#ffffff';

  function getShip(shipId) {
    if (typeof CONSTANTS === 'undefined' || !Array.isArray(CONSTANTS.SHIPS)) return null;
    return CONSTANTS.SHIPS.find(s => s.id === shipId) || CONSTANTS.SHIPS[0];
  }

  function parsePoints(points) {
    if (Array.isArray(points)) {
      if (points.length && typeof points[0] === 'object') return points;
      return points.map(pair => {
        const [x, y] = String(pair).split(',').map(Number);
        return { x, y };
      });
    }
    return String(points).trim().split(/\s+/).map(pair => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    });
  }

  function flamePulse(now) {
    const t = (Math.sin((now || performance.now()) * 0.028) + 1) * 0.5;
    return {
      scaleY: 0.94 + t * 0.10,
      opacity: 0.92 + t * 0.08
    };
  }

  function flameWidths(nozzle) {
    return {
      outerW: nozzle.bell * 0.92,
      hotW: nozzle.width * 0.72,
      whiteW: nozzle.width * 0.38,
      hotH: nozzle.flameHeight * 0.58,
      whiteH: nozzle.flameHeight * 0.34
    };
  }

  function drawPolygon(ctx, points, fill, stroke, strokeWidth) {
    const pts = parsePoints(points);
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function drawHull(ctx, ship, locked) {
    const parts = ship.hull || [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      drawPolygon(
        ctx,
        part.points,
        locked ? '#03050b' : part.fill,
        locked ? 'rgba(255,255,255,0.28)' : (part.stroke || '#ffffff'),
        part.strokeWidth || 1.6
      );
    }
  }

  function drawFlame(ctx, nozzle, pulse) {
    const x = nozzle.x;
    const y = nozzle.y + FLAME_INSET;
    const h = nozzle.flameHeight;
    const w = flameWidths(nozzle);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, pulse.scaleY);

    ctx.globalAlpha = pulse.opacity * 0.95;
    ctx.fillStyle = PLASMA;
    ctx.beginPath();
    ctx.moveTo(-w.outerW, 0);
    ctx.lineTo(0, h);
    ctx.lineTo(w.outerW, 0);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = pulse.opacity * 0.92;
    ctx.fillStyle = HOT;
    ctx.beginPath();
    ctx.moveTo(-w.hotW, 0);
    ctx.lineTo(0, w.hotH);
    ctx.lineTo(w.hotW, 0);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.moveTo(-w.whiteW, 0);
    ctx.lineTo(0, w.whiteH);
    ctx.lineTo(w.whiteW, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawNozzle(ctx, nozzle) {
    const { x, y, width, bell } = nozzle;
    const depth = BELL_DEPTH;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = '#080f1c';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(x - width, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + bell, y + depth);
    ctx.lineTo(x - bell, y + depth);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = COLLAR;
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(width, bell * 0.72), 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderCanvas(ctx, shipId, options) {
    const ship = getShip(shipId);
    if (!ship || !ctx) return;
    const locked = !!(options && options.locked);
    const pulse = flamePulse(options && options.now);
    const nozzles = ship.nozzles || [];

    if (!locked) {
      for (let i = 0; i < nozzles.length; i++) drawFlame(ctx, nozzles[i], pulse);
    }
    drawHull(ctx, ship, locked);
    if (!locked) {
      for (let i = 0; i < nozzles.length; i++) drawNozzle(ctx, nozzles[i]);
    }
  }

  function hullSvg(ship, locked) {
    return (ship.hull || []).map((part) => {
      const fill = locked ? '#03050b' : part.fill;
      const stroke = locked ? 'rgba(255,255,255,0.28)' : (part.stroke || '#ffffff');
      return `<polygon points="${part.points}" fill="${fill}" stroke="${stroke}" stroke-width="${part.strokeWidth}" stroke-linejoin="round"></polygon>`;
    }).join('');
  }

  function flameSvg(nozzle) {
    const y = nozzle.y + FLAME_INSET;
    const h = nozzle.flameHeight;
    const w = flameWidths(nozzle);
    return `<g transform="translate(${nozzle.x},${y})"><g class="ship-flame">` +
      `<polygon points="${-w.outerW},0 0,${h} ${w.outerW},0" fill="${PLASMA}" opacity="0.95"></polygon>` +
      `<polygon points="${-w.hotW},0 0,${w.hotH} ${w.hotW},0" fill="${HOT}" opacity="0.92"></polygon>` +
      `<polygon points="${-w.whiteW},0 0,${w.whiteH} ${w.whiteW},0" fill="${WHITE}"></polygon>` +
      `</g></g>`;
  }

  function nozzleSvg(nozzle) {
    const depth = BELL_DEPTH;
    return `<g class="ship-nozzle">` +
      `<polygon points="${nozzle.x - nozzle.width},${nozzle.y} ${nozzle.x + nozzle.width},${nozzle.y} ${nozzle.x + nozzle.bell},${nozzle.y + depth} ${nozzle.x - nozzle.bell},${nozzle.y + depth}" fill="#080f1c" stroke="#ffffff" stroke-width="1.15" stroke-linejoin="round"></polygon>` +
      `<ellipse cx="${nozzle.x}" cy="${nozzle.y}" rx="${Math.max(nozzle.width, nozzle.bell * 0.72)}" ry="0.9" fill="${COLLAR}"></ellipse>` +
      `</g>`;
  }

  function toSvg(shipId, options) {
    const ship = getShip(shipId);
    if (!ship) return '';
    const locked = !!(options && options.locked);
    const nozzles = ship.nozzles || [];
    const flames = locked ? '' : nozzles.map(flameSvg).join('');
    const bells = locked ? '' : nozzles.map(nozzleSvg).join('');
    return `${flames}${hullSvg(ship, locked)}${bells}`;
  }

  return { renderCanvas, toSvg, getShip, parsePoints };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShipArt;
}
