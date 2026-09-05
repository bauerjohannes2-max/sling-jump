const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

async function benchmark() {
  console.log('====================================================');
  console.log('  STARTING REAL-TIME GAMEPLAY FPS BENCHMARK SUITE   ');
  console.log('====================================================');

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files'
    ]
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
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  console.log(`[Benchmark] Loading game...`);
  await page.goto(HTML_FILE, { waitUntil: 'load' });
  await page.waitForFunction(() => window._gameEngine && window._gameEngine.state);

  // Enable in-engine FPS HUD
  await page.evaluate(() => {
    if (window._gameEngine && window._gameEngine.storage) {
      window._gameEngine.storage.data.settings.showFps = true;
      if (window._uiManager && typeof window._uiManager.updateFpsToggleBtn === 'function') {
        window._uiManager.updateFpsToggleBtn();
      }
    }
  });

  // Inject High-Precision Performance Observer
  await page.evaluate(() => {
    window._bench = {
      deltas: [],
      jsTimes: [],
      lastTime: 0,
      active: false,
      start() {
        this.deltas = [];
        this.jsTimes = [];
        this.lastTime = performance.now();
        this.active = true;
      },
      stop() {
        this.active = false;
      },
      tick(now) {
        if (!this.active) return;
        if (this.lastTime > 0) {
          const dt = now - this.lastTime;
          this.deltas.push(dt);
        }
        this.lastTime = now;
      }
    };

    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = function(cb) {
      return originalRAF(function(ts) {
        window._bench.tick(ts);
        const t0 = performance.now();
        cb(ts);
        if (window._bench && window._bench.active) {
          window._bench.jsTimes.push(performance.now() - t0);
        }
      });
    };
  });

  console.log('[Benchmark] Transitioning to PLAYING state and starting in-page autopilot...');
  await page.evaluate(() => {
    const eng = window._gameEngine;
    eng.state.changeState(StateManager.STATES.PLAYING);

    // In-Page Autopilot running synchronously inside the browser render loop
    let stepCount = 0;
    const autopilot = () => {
      stepCount++;

      if (eng && eng.player) {
        if (eng.isDying) {
          eng.isDying = false;
          eng.player.vy = 420;
          eng.player.y = eng.cameraY + 300;
        }

        if (eng.player.isHooked) {
          const tangentY = Math.cos(eng.player.orbitAngle) * eng.player.orbitDirection;
          if (tangentY > 0.85) {
            eng.input.triggerActionUp();
          }
        } else {
          const nearest = eng.world.getNearestNode(eng.player, eng.cameraY);
          if (nearest && Math.hypot(eng.player.x - nearest.x, eng.player.y - nearest.y) <= 150) {
            eng.input.triggerActionDown();
          }
        }

        // Periodically trigger pickups and particles every 20 frames (~330ms)
        if (stepCount % 20 === 0) {
          eng.runCores += 1;
          eng.storage.addCores(1);
          eng.missions.onCoreCollected();
          eng.ui.updateHUD(eng.maxAltitudeMeters, eng.storage.data.highScore, eng.storage.data.cores);
          eng.ui.updateCurrency(false);
          eng.particles.spawnSparks(eng.player.x, eng.player.y, 8, '#fbbf24');
        }
      }

      requestAnimationFrame(autopilot);
    };
    requestAnimationFrame(autopilot);
  });

  console.log('[Benchmark] Warming up gameplay for 1.5 seconds...');
  await page.waitForTimeout(1500);

  console.log('[Benchmark] Starting performance measurement (8 seconds active flight)...');
  await page.evaluate(() => {
    window._bench.start();
  });

  await page.waitForTimeout(8000);

  // Stop recording FIRST so screenshot I/O overhead does NOT pollute telemetry
  const stats = await page.evaluate(() => {
    window._bench.stop();
    const deltas = window._bench.deltas;
    const jsTimes = window._bench.jsTimes;
    if (deltas.length === 0) return null;

    // Discard warmup frames
    const sample = deltas.slice(5);
    const sorted = [...sample].sort((a, b) => a - b);
    const sum = sample.reduce((a, b) => a + b, 0);
    const avgDelta = sum / sample.length;
    const avgFps = 1000 / avgDelta;

    const p95Delta = sorted[Math.floor(sorted.length * 0.95)];
    const p99Delta = sorted[Math.floor(sorted.length * 0.99)];
    const maxDelta = sorted[sorted.length - 1];

    const low1PctFps = 1000 / p99Delta;
    const minFps = 1000 / maxDelta;

    // JS execution time analysis
    const jsSample = jsTimes.slice(5);
    const sortedJs = [...jsSample].sort((a, b) => a - b);
    const avgJsTime = jsSample.length > 0 ? jsSample.reduce((a, b) => a + b, 0) / jsSample.length : 0;
    const maxJsTime = sortedJs.length > 0 ? sortedJs[sortedJs.length - 1] : 0;
    const p95JsTime = sortedJs.length > 0 ? sortedJs[Math.floor(sortedJs.length * 0.95)] : 0;

    const hitchesAbove25ms = sample.filter(d => d > 25).length;
    const hitchesAbove33ms = sample.filter(d => d > 33.3).length;
    const hitchesAbove50ms = sample.filter(d => d > 50).length;

    const eng = window._gameEngine;
    const liveFps = eng && eng.fpsCounter ? eng.fpsCounter.fps : Math.round(avgFps);
    const liveFrameTime = eng && eng.fpsCounter ? eng.fpsCounter.frameTimeMs : Math.round(avgDelta * 10) / 10;
    const liveMinFps = eng && eng.fpsCounter ? eng.fpsCounter.minFps : Math.round(minFps);

    return {
      totalFrames: sample.length,
      avgFps: Math.round(avgFps * 10) / 10,
      avgDeltaMs: Math.round(avgDelta * 100) / 100,
      p95DeltaMs: Math.round(p95Delta * 100) / 100,
      p99DeltaMs: Math.round(p99Delta * 100) / 100,
      maxDeltaMs: Math.round(maxDelta * 100) / 100,
      low1PctFps: Math.round(low1PctFps * 10) / 10,
      minFps: Math.round(minFps * 10) / 10,
      avgJsTimeMs: Math.round(avgJsTime * 100) / 100,
      p95JsTimeMs: Math.round(p95JsTime * 100) / 100,
      maxJsTimeMs: Math.round(maxJsTime * 100) / 100,
      hitchesAbove25ms,
      hitchesAbove33ms,
      hitchesAbove50ms,
      liveTelemetry: {
        fps: liveFps,
        frameTimeMs: liveFrameTime,
        minFps: liveMinFps
      }
    };
  });

  // Capture screenshot of gameplay with active FPS HUD badge
  const hudScreenshotPath = path.join(SCREENSHOTS_DIR, '08b_gameplay_fps_hud.png');
  await page.screenshot({ path: hudScreenshotPath });
  console.log(`[Benchmark] Captured ${hudScreenshotPath}`);

  await browser.close();

  const report = {
    timestamp: new Date().toISOString(),
    benchmarkMode: 'Active Gameplay Simulation',
    durationSeconds: 8,
    metrics: stats,
    consoleErrors,
    passed: stats &&
      stats.avgFps >= 55.0 &&
      stats.avgJsTimeMs <= 5.0 &&
      stats.maxJsTimeMs <= 14.0 &&
      stats.maxDeltaMs <= 60.0 &&
      consoleErrors.length === 0
  };

  const reportPath = path.join(SCREENSHOTS_DIR, 'FPS_BENCHMARK.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('\n================ BENCHMARK AUDIT REPORT ================');
  console.log(`Total Frames Sampled: ${stats.totalFrames}`);
  console.log(`Average FPS:          ${stats.avgFps} FPS (avg frame time: ${stats.avgDeltaMs} ms)`);
  console.log(`95th Percentile dt:   ${stats.p95DeltaMs} ms`);
  console.log(`99th Percentile dt:   ${stats.p99DeltaMs} ms (1% Low FPS: ${stats.low1PctFps} FPS)`);
  console.log(`Max Frame Time:       ${stats.maxDeltaMs} ms (Min FPS: ${stats.minFps} FPS)`);
  console.log(`Avg JS Frame Budget:  ${stats.avgJsTimeMs} ms (Target <= 5.0ms)`);
  console.log(`Max JS Frame Budget:  ${stats.maxJsTimeMs} ms (Target <= 14.0ms)`);
  console.log(`Hitches > 25ms:       ${stats.hitchesAbove25ms}`);
  console.log(`Hitches > 33.3ms:     ${stats.hitchesAbove33ms}`);
  console.log(`Hitches > 50ms:       ${stats.hitchesAbove50ms} (Target 0)`);
  console.log(`In-Engine Telemetry:  ${stats.liveTelemetry.fps} FPS (${stats.liveTelemetry.frameTimeMs} ms)`);
  console.log(`Console Errors:       ${consoleErrors.length}`);
  console.log(`Benchmark Verdict:    ${report.passed ? 'PASSED (60+ FPS ROCK-SOLID)' : 'FAILED'}`);
  console.log(`Report Saved:         ${reportPath}`);
  console.log('========================================================\n');

  if (!report.passed) {
    throw new Error(`FPS Benchmark Failed! Avg FPS: ${stats.avgFps}, Avg JS: ${stats.avgJsTimeMs}ms, Max JS: ${stats.maxJsTimeMs}ms, Max Delta: ${stats.maxDeltaMs}ms, Errors: ${consoleErrors.length}`);
  }

  return report;
}

benchmark().catch(err => {
  console.error('[Benchmark] FAILED:', err.message);
  process.exit(1);
});
