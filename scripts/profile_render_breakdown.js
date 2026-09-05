const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function profileRenderBreakdown() {
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  };

  if (fs.existsSync(EDGE_PATH)) {
    launchOptions.executablePath = EDGE_PATH;
  } else {
    launchOptions.channel = 'msedge';
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 450, height: 850 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();
  await page.goto(HTML_FILE, { waitUntil: 'load' });
  await page.waitForFunction(() => window._gameEngine && window._gameEngine.state);

  const breakdown = await page.evaluate(() => {
    const eng = window._gameEngine;
    eng.state.changeState(StateManager.STATES.PLAYING);
    eng.gameStarted = true;

    // Populate particles & nodes
    eng.particles.spawnShards(eng.player.x, eng.player.y, 50, '#ef4444');
    eng.particles.spawnSparks(eng.player.x, eng.player.y, 50, '#00f0ff');
    eng.particles.spawnFloatingText(eng.player.x, eng.player.y + 40, 'COMBO x5', '#fbbf24', 32, true);
    eng.particles.spawnFloatingText(eng.player.x, eng.player.y + 70, '+50 GOLD', '#fbbf24', 16, false);

    const times = {
      background: [],
      nodes: [],
      orbs: [],
      particles: [],
      player: [],
      deathBoundary: []
    };

    const ctx = eng.ctx;
    const width = eng.width;
    const height = eng.height;
    const theme = eng.world.currentTheme;

    for (let frame = 0; frame < 120; frame++) {
      const now = performance.now();
      eng.update(now);

      // Background
      let t0 = performance.now();
      eng.world.drawBackground(ctx, width, height, eng.cameraY, now, eng.player.vy);
      times.background.push(performance.now() - t0);

      // Orbs
      t0 = performance.now();
      for (const orb of eng.world.energyOrbs) {
        orb.draw(ctx, eng.cameraY, height, theme);
      }
      times.orbs.push(performance.now() - t0);

      // Nodes
      t0 = performance.now();
      for (const node of eng.world.nodes) {
        node.draw(ctx, eng.cameraY, height, theme);
      }
      times.nodes.push(performance.now() - t0);

      // Particles
      t0 = performance.now();
      eng.particles.draw(ctx, eng.cameraY, height);
      times.particles.push(performance.now() - t0);

      // Player
      t0 = performance.now();
      eng.player.draw(ctx, eng.cameraY, width, height, eng.nearestNode, theme);
      times.player.push(performance.now() - t0);

      // Death Boundary
      t0 = performance.now();
      eng.world.drawBottomDeathBoundary(ctx, now, width, height);
      times.deathBoundary.push(performance.now() - t0);
    }

    const calc = (arr) => ({
      avg: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3),
      max: Math.max(...arr).toFixed(3)
    });

    return {
      background: calc(times.background),
      orbs: calc(times.orbs),
      nodes: calc(times.nodes),
      particles: calc(times.particles),
      player: calc(times.player),
      deathBoundary: calc(times.deathBoundary)
    };
  });

  await browser.close();

  console.log('\n================ RENDER BREAKDOWN (120 FRAMES) ================');
  console.log(`Background:     Avg: ${breakdown.background.avg} ms | Max: ${breakdown.background.max} ms`);
  console.log(`Nodes:          Avg: ${breakdown.nodes.avg} ms | Max: ${breakdown.nodes.max} ms`);
  console.log(`Orbs:           Avg: ${breakdown.orbs.avg} ms | Max: ${breakdown.orbs.max} ms`);
  console.log(`Particles:      Avg: ${breakdown.particles.avg} ms | Max: ${breakdown.particles.max} ms`);
  console.log(`Player:         Avg: ${breakdown.player.avg} ms | Max: ${breakdown.player.max} ms`);
  console.log(`Death Boundary: Avg: ${breakdown.deathBoundary.avg} ms | Max: ${breakdown.deathBoundary.max} ms`);
  console.log('=================================================================\n');
}

profileRenderBreakdown().catch(err => {
  console.error('[Breakdown] Error:', err);
  process.exit(1);
});
