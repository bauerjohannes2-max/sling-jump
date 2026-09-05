const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

async function diagnose() {
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

  const diagnosis = await page.evaluate(async () => {
    const eng = window._gameEngine;
    eng.state.changeState(StateManager.STATES.PLAYING);

    const frameLogs = [];

    // Instrument update & render
    const origUpdate = eng.update.bind(eng);
    const origRender = eng.render.bind(eng);

    let lastRAF = performance.now();

    for (let f = 0; f < 180; f++) {
      await new Promise(r => requestAnimationFrame(now => {
        const rafDelta = now - lastRAF;
        lastRAF = now;

        const t0 = performance.now();
        origUpdate(now);
        const updateTime = performance.now() - t0;

        const t1 = performance.now();
        origRender(now);
        const renderTime = performance.now() - t1;

        if (rafDelta > 20) {
          frameLogs.push({
            frame: f,
            rafDelta: Math.round(rafDelta * 10) / 10,
            updateTime: Math.round(updateTime * 100) / 100,
            renderTime: Math.round(renderTime * 100) / 100,
            totalJsTime: Math.round((updateTime + renderTime) * 100) / 100,
            screenShake: eng.screenShake,
            timeScale: eng.timeScale,
            particleCount: eng.particles.particles.filter(p => p.active).length,
            nodeCount: eng.world.nodes.length,
            orbCount: eng.world.energyOrbs.length
          });
        }
        r();
      }));
    }

    return frameLogs;
  });

  await browser.close();

  console.log('\n================ FRAME JANK DIAGNOSIS ================');
  console.log(`Total Jank Frames (>20ms): ${diagnosis.length}`);
  console.log('Sample of top jank frames:');
  console.table(diagnosis.slice(0, 20));
  console.log('======================================================\n');
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
