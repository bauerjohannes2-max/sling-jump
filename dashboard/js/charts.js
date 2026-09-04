/**
 * Sling Jump Analytics - Zero-Dependency High-Performance SVG Chart Engine
 * Clean, modern SaaS data visualizations without third-party bloat.
 * Zero Emojis, crisp SVG vector geometry, accessible tooltips.
 */
(function(window) {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function createSvgElement(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
    return el;
  }

  /**
   * Renders a responsive smooth Area/Line Chart
   */
  function renderAreaChart(container, points, options = {}) {
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 640;
    const height = options.height || 220;
    const padding = { top: 20, right: 24, bottom: 30, left: 45 };

    if (!points || points.length < 2) {
      container.innerHTML = '<div class="chart-empty">Nicht genügend Datenpunkte vorhanden</div>';
      return;
    }

    const svg = createSvgElement('svg', {
      viewBox: `0 0 ${width} ${height}`,
      width: '100%',
      height: height,
      class: 'sj-chart-svg'
    });

    const values = points.map(p => p.value);
    const maxVal = Math.max(...values, 10);
    const minVal = 0;
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Grid lines (horizontal)
    const gridLevels = 4;
    for (let i = 0; i <= gridLevels; i++) {
      const y = padding.top + (chartH / gridLevels) * i;
      const valLabel = Math.round(maxVal - (maxVal / gridLevels) * i);
      const line = createSvgElement('line', {
        x1: padding.left,
        y1: y,
        x2: width - padding.right,
        y2: y,
        stroke: 'rgba(255, 255, 255, 0.06)',
        'stroke-dasharray': '3,3'
      });
      svg.appendChild(line);

      const text = createSvgElement('text', {
        x: padding.left - 8,
        y: y + 3,
        fill: '#64748b',
        'font-size': '10',
        'font-weight': '600',
        'text-anchor': 'end',
        'font-family': 'Rajdhani, sans-serif'
      });
      text.textContent = valLabel;
      svg.appendChild(text);
    }

    // Gradient definitions
    const defs = createSvgElement('defs');
    const gradId = 'areaGrad_' + Math.random().toString(36).substring(2, 7);
    const grad = createSvgElement('linearGradient', {
      id: gradId,
      x1: '0',
      y1: '0',
      x2: '0',
      y2: '1'
    });
    grad.appendChild(createSvgElement('stop', { offset: '0%', 'stop-color': options.color || '#38bdf8', 'stop-opacity': '0.35' }));
    grad.appendChild(createSvgElement('stop', { offset: '100%', 'stop-color': options.color || '#38bdf8', 'stop-opacity': '0.0' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    // Calculate Coordinates
    const coords = points.map((p, idx) => {
      const x = padding.left + (chartW / (points.length - 1)) * idx;
      const y = padding.top + chartH - ((p.value - minVal) / (maxVal - minVal || 1)) * chartH;
      return { x, y, label: p.label, value: p.value };
    });

    // Generate Path
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const cur = coords[i];
      const cx = (prev.x + cur.x) / 2;
      pathD += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${padding.top + chartH} L ${coords[0].x} ${padding.top + chartH} Z`;

    // Filled Area
    svg.appendChild(createSvgElement('path', {
      d: areaD,
      fill: `url(#${gradId})`
    }));

    // Stroke Line
    svg.appendChild(createSvgElement('path', {
      d: pathD,
      fill: 'none',
      stroke: options.color || '#38bdf8',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }));

    // Data Dots & X-Labels
    coords.forEach((pt, idx) => {
      // Circle dot
      const dot = createSvgElement('circle', {
        cx: pt.x,
        cy: pt.y,
        r: '3.5',
        fill: '#080b10',
        stroke: options.color || '#38bdf8',
        'stroke-width': '2',
        class: 'chart-dot'
      });
      svg.appendChild(dot);

      // Label every few points to prevent overcrowding
      const step = Math.max(1, Math.floor(points.length / 7));
      if (idx % step === 0 || idx === points.length - 1) {
        const xText = createSvgElement('text', {
          x: pt.x,
          y: height - 8,
          fill: '#64748b',
          'font-size': '10',
          'font-weight': '600',
          'text-anchor': 'middle',
          'font-family': 'Rajdhani, sans-serif'
        });
        xText.textContent = pt.label;
        svg.appendChild(xText);
      }
    });

    container.appendChild(svg);
  }

  /**
   * Renders a Horizontal Bar Chart for Channel & Category breakdown
   */
  function renderHorizontalBarChart(container, items, options = {}) {
    if (!container) return;
    container.innerHTML = '';

    if (!items || items.length === 0) {
      container.innerHTML = '<div class="chart-empty">Keine Daten verfügbar</div>';
      return;
    }

    const maxVal = Math.max(...items.map(it => it.value), 1);
    const wrap = document.createElement('div');
    wrap.className = 'bar-chart-wrap';

    items.forEach(item => {
      const pct = Math.round((item.value / maxVal) * 100);
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `
        <div class="bar-label-col">
          <span class="bar-title">${item.label}</span>
          <span class="bar-meta">${item.sub || ''}</span>
        </div>
        <div class="bar-track-col">
          <div class="bar-fill" style="width: ${pct}%; background-color: ${item.color || options.defaultColor || '#38bdf8'};"></div>
        </div>
        <div class="bar-val-col">${item.formattedValue || item.value}</div>
      `;
      wrap.appendChild(row);
    });

    container.appendChild(wrap);
  }

  /**
   * Renders a Multi-Step Marketing / Gameplay Conversion Funnel
   */
  function renderFunnel(container, steps) {
    if (!container) return;
    container.innerHTML = '';

    if (!steps || steps.length === 0) {
      container.innerHTML = '<div class="chart-empty">Keine Trichter-Daten verfügbar</div>';
      return;
    }

    const maxCount = steps[0].count || 1;
    const wrap = document.createElement('div');
    wrap.className = 'funnel-container';

    steps.forEach((step, idx) => {
      const relativePct = Math.round((step.count / maxCount) * 100);
      const prevStep = idx > 0 ? steps[idx - 1] : null;
      const stepConversion = prevStep ? Math.round((step.count / prevStep.count) * 100) : 100;
      const dropOff = prevStep ? (100 - stepConversion) : 0;

      const card = document.createElement('div');
      card.className = 'funnel-step-card';
      card.innerHTML = `
        <div class="funnel-top">
          <span class="funnel-step-num">STUFE 0${idx + 1}</span>
          <span class="funnel-conv-badge ${idx === 0 ? 'root' : ''}">
            ${idx === 0 ? '100% BASIS' : `${stepConversion}% KONVERTIERT (-${dropOff}% DROP)`}
          </span>
        </div>
        <div class="funnel-name">${step.label}</div>
        <div class="funnel-track">
          <div class="funnel-fill" style="width: ${relativePct}%;"></div>
        </div>
        <div class="funnel-bottom">
          <span class="funnel-count">${step.count.toLocaleString()}</span>
          <span class="funnel-overall">${relativePct}% des Gesamtfunnels</span>
        </div>
      `;
      wrap.appendChild(card);
    });

    container.appendChild(wrap);
  }

  /**
   * Renders an Altitude Drop-off Zone Heatmap
   */
  function renderAltitudeZones(container, zones) {
    if (!container) return;
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'zone-heatmap-wrap';

    const maxDeaths = Math.max(...zones.map(z => z.deaths), 1);

    zones.forEach(z => {
      const deathPct = Math.round((z.deaths / maxDeaths) * 100);
      const col = document.createElement('div');
      col.className = 'zone-card';
      col.innerHTML = `
        <div class="zone-header">
          <span class="zone-badge" style="border-color: ${z.color}; color: ${z.color};">${z.zoneName}</span>
          <span class="zone-range">${z.range}</span>
        </div>
        <div class="zone-bar-vertical">
          <div class="zone-bar-fill" style="height: ${deathPct}%; background: ${z.color};"></div>
        </div>
        <div class="zone-metrics">
          <div class="zone-deaths-val">${z.deaths}</div>
          <div class="zone-deaths-sub">Abstürze (${z.deathPercent}%)</div>
          <div class="zone-hazard-tag">${z.primaryHazard}</div>
        </div>
      `;
      wrap.appendChild(col);
    });

    container.appendChild(wrap);
  }

  window.SJCharts = {
    renderAreaChart,
    renderHorizontalBarChart,
    renderFunnel,
    renderAltitudeZones
  };

})(window);
