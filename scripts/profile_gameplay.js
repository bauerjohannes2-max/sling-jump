const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function profileGameplay() {
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
  console.log(`[Profile] Loading ${HTML_FILE}...`);
  await page.goto(HTML_FILE, { waitUntil: 'load' });
  await page.waitForFunction(() => window._gameEngine && window._gameEngine.state);

  const profileData = await page.evaluate(() => {
    const eng = window._gameEngine;
    
    // Seed realistic save data with leaderboard entries
    for (let i = 0; i < 60; i++) {
      eng.storage.data.leaderboard.push({
        id: 'user_' + i,
        name: 'Pilot_' + i,
        altitude: 1000 + i * 50,
        score: 5000 + i * 200,
        date: new Date().toISOString()
      });
    }

    // Measure raw synchronous localStorage.setItem execution time
    const saveTimes = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      localStorage.setItem(eng.storage.key, JSON.stringify(eng.storage.data));
      saveTimes.push(performance.now() - t0);
    }

    // Measure MissionManager.onSlingshotPerformed() execution time
    const slingshotTimes = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      eng.missions.onSlingshotPerformed();
      slingshotTimes.push(performance.now() - t0);
    }

    // Measure MissionManager.onCoreCollected() execution time
    const coreTimes = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      eng.missions.onCoreCollected();
      coreTimes.push(performance.now() - t0);
    }

    // Measure update() & render() during active run
    eng.state.changeState(StateManager.STATES.PLAYING);
    eng.gameStarted = true;
    
    // Spawn 80 particles
    eng.particles.spawnShards(eng.player.x, eng.player.y, 40, '#ef4444');
    eng.particles.spawnSparks(eng.player.x, eng.player.y, 40, '#00f0ff');
    eng.particles.spawnFloatingText(eng.player.x, eng.player.y + 40, 'COMBO x5', '#fbbf24', 32, true);

    const updateTimes = [];
    const renderTimes = [];
    for (let i = 0; i < 60; i++) {
      const now = performance.now();
      const t0 = performance.now();
      eng.update(now);
      updateTimes.push(performance.now() - t0);

      const t1 = performance.now();
      eng.render(now);
      renderTimes.push(performance.now() - t1);
    }

    return {
      avgSyncSaveMs: saveTimes.reduce((a, b) => a + b, 0) / saveTimes.length,
      maxSyncSaveMs: Math.max(...saveTimes),
      avgSlingshotActionMs: slingshotTimes.reduce((a, b) => a + b, 0) / slingshotTimes.length,
      maxSlingshotActionMs: Math.max(...slingshotTimes),
      avgCorePickupMs: coreTimes.reduce((a, b) => a + b, 0) / coreTimes.length,
      maxCorePickupMs: Math.max(...coreTimes),
      avgUpdateMs: updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length,
      maxUpdateMs: Math.max(...updateTimes),
      avgRenderMs: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
      maxRenderMs: Math.max(...renderTimes)
    };
  });

  await browser.close();

  console.log('\n================ PROFILE DATA ================');
  console.log(`Sync localStorage.setItem:  Avg: ${profileData.avgSyncSaveMs.toFixed(3)} ms | Max: ${profileData.maxSyncSaveMs.toFixed(3)} ms`);
  console.log(`onSlingshotPerformed():     Avg: ${profileData.avgSlingshotActionMs.toFixed(3)} ms | Max: ${profileData.maxSlingshotActionMs.toFixed(3)} ms`);
  console.log(`onCoreCollected():          Avg: ${profileData.avgCorePickupMs.toFixed(3)} ms | Max: ${profileData.maxCorePickupMs.toFixed(3)} ms`);
  console.log(`GameEngine.update():        Avg: ${profileData.avgUpdateMs.toFixed(3)} ms | Max: ${profileData.maxUpdateMs.toFixed(3)} ms`);
  console.log(`GameEngine.render():        Avg: ${profileData.avgRenderMs.toFixed(3)} ms | Max: ${profileData.maxRenderMs.toFixed(3)} ms`);
  console.log('==============================================\n');
}

profileGameplay().catch(err => {
  console.error('[Profile] Error:', err);
  process.exit(1);
});
