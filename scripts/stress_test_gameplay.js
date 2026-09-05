const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function testActiveGameplayFps() {
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

  const stats = await page.evaluate(async () => {
    const eng = window._gameEngine;
    eng.state.changeState(StateManager.STATES.PLAYING);
    eng.gameStarted = true;

    // Track frame intervals
    const deltas = [];
    let last = performance.now();
    let tracking = true;

    const onFrame = (now) => {
      if (!tracking) return;
      deltas.push(now - last);
      last = now;
      requestAnimationFrame(onFrame);
    };
    requestAnimationFrame(onFrame);

    // Simulate 5 seconds of active gameplay with rapid events:
    // Every 100ms: pick up a coin, launch slingshot, update altitude, spawn particles
    const start = performance.now();
    let eventCount = 0;

    while (performance.now() - start < 4000) {
      // Simulate slingshot launch
      eng.runSlingshots++;
      eng.missions.onSlingshotPerformed();

      // Simulate coin pickup
      eng.runCores++;
      eng.storage.addCores(1);
      eng.missions.onCoreCollected();
      eng.ui.updateHUD(eng.maxAltitudeMeters, eng.storage.data.highScore, eng.storage.data.cores);
      eng.ui.updateCurrency();

      // Simulate altitude climb
      eng.maxAltitudeMeters += 5;
      eng.missions.onAltitudeUpdate(eng.maxAltitudeMeters, false);

      // Simulate combo trigger
      eng.slingshotCombo = (eng.slingshotCombo % 5) + 1;
      eng.storage.updateBestCombo(eng.slingshotCombo);

      // Spawn particles
      eng.particles.spawnSparks(eng.player.x, eng.player.y, 8, '#00f0ff');
      eng.particles.spawnFloatingText(eng.player.x, eng.player.y + 20, '+50', '#fbbf24', 16, false);

      eventCount++;
      await new Promise(r => setTimeout(r, 60)); // Event every 60ms
    }

    tracking = false;

    // Calculate metrics
    const sorted = [...deltas.slice(5)].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / sorted.length;
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const max = sorted[sorted.length - 1];

    return {
      frames: sorted.length,
      avgFps: (1000 / avg).toFixed(1),
      avgDt: avg.toFixed(2),
      p95Dt: p95.toFixed(2),
      p99Dt: p99.toFixed(2),
      maxDt: max.toFixed(2),
      low1PctFps: (1000 / p99).toFixed(1),
      hitchesOver20ms: sorted.filter(d => d > 20).length,
      hitchesOver25ms: sorted.filter(d => d > 25).length,
      hitchesOver33ms: sorted.filter(d => d > 33.3).length,
      eventCount
    };
  });

  await browser.close();

  console.log('\n================ STRESS TEST RESULTS (COINS, COMBOS, LAUNCHES) ================');
  console.log(`Total Frames:       ${stats.frames}`);
  console.log(`Simulated Events:   ${stats.eventCount}`);
  console.log(`Average FPS:        ${stats.avgFps} fps (avg dt: ${stats.avgDt} ms)`);
  console.log(`95th Percentile dt: ${stats.p95Dt} ms`);
  console.log(`99th Percentile dt: ${stats.p99Dt} ms (1% Low: ${stats.low1PctFps} fps)`);
  console.log(`Max Frame Time:     ${stats.maxDt} ms`);
  console.log(`Hitches > 20ms:     ${stats.hitchesOver20ms}`);
  console.log(`Hitches > 25ms:     ${stats.hitchesOver25ms}`);
  console.log(`Hitches > 33.3ms:   ${stats.hitchesOver33ms}`);
  console.log('=================================================================================\n');

  return stats;
}

testActiveGameplayFps().catch(err => {
  console.error(err);
  process.exit(1);
});
