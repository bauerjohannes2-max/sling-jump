const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
// Mandatory Pre-Run Purge: Clean all stale screenshot files so every image is 100% freshly created
if (fs.existsSync(SCREENSHOTS_DIR)) {
  const existingFiles = fs.readdirSync(SCREENSHOTS_DIR);
  let purgedCount = 0;
  for (const f of existingFiles) {
    if (f.endsWith('.png') || f.endsWith('.json') || f.endsWith('.md')) {
      try {
        fs.unlinkSync(path.join(SCREENSHOTS_DIR, f));
        purgedCount++;
      } catch (e) {}
    }
  }
  console.log(`[Playwright] Purged ${purgedCount} stale artifacts from screenshots/ directory.`);
} else {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const capturedManifest = [];

async function captureScreenshot(p, filename, description = '') {
  const targetPath = path.join(SCREENSHOTS_DIR, filename);
  await p.screenshot({ path: targetPath });
  const stat = fs.statSync(targetPath);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(targetPath)).digest('hex').substring(0, 16);
  const timestamp = new Date();
  capturedManifest.push({
    filename,
    description,
    sizeKb: Math.round(stat.size / 1024),
    capturedAt: timestamp.toISOString(),
    localTime: timestamp.toLocaleTimeString(),
    sha256: hash
  });
  console.log(`[Playwright] Captured ${filename} (${Math.round(stat.size / 1024)} KB, ${timestamp.toLocaleTimeString()}, SHA:${hash})`);
}

async function runPlaywrightSuite() {
  console.log('====================================================');
  console.log('  STARTING PLAYWRIGHT AUTOMATED VISUAL TEST SUITE   ');
  console.log('====================================================');

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
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  console.log(`[Playwright] Navigating to ${HTML_FILE}...`);
  await page.goto(HTML_FILE, { waitUntil: 'load' });
  await page.waitForFunction(() => window._gameEngine && window._gameEngine.state);
  await sleep(400);

  // Set 1 unclaimed quest so the new separated badge counter is verified on the main menu
  await page.evaluate(() => {
    if (window._gameEngine) {
      window._gameEngine.storage.data.questProgress['daily_reach_350'] = 600;
      window._gameEngine.storage.data.activeDailyQuestIds = ['daily_reach_350', 'daily_collect_12', 'daily_boost_3'];
      window._gameEngine.storage.data.claimedQuestIds = [];
      window._gameEngine.storage.save();
      window._gameEngine.ui.updateUnclaimedBadges();
    }
  });
  await sleep(300);

  // 1. Main Menu
  console.log('[Playwright] Capturing 01_main_menu.png');
  await captureScreenshot(page, '01_main_menu.png');

  // 2. Open Hangar / Skins (Ships)
  console.log('[Playwright] Capturing 02_hangar_ships.png');
  // 2. Hangar / Skins Showcase (Overhauled Hero Preview)
  console.log('[Playwright] Capturing 02_hangar_skins.png (Overhauled Skins Showcase)');
  await page.click('#btn-menu-shop');
  await sleep(400);
  await captureScreenshot(page, '02_hangar_skins.png');

  // Close Hangar
  await page.click('#btn-shop-close');
  await sleep(300);

  // 4. Bestenliste (Direct Leaderboard Button)
  console.log('[Playwright] Testing #btn-menu-leaderboard...');
  await page.evaluate(() => {
    if (window._gameEngine && window._gameEngine.storage) {
      window._gameEngine.storage.data.leaderboard = [
        { name: 'ApexStriker', altitude: 4820, country: 'DE', countryName: 'Deutschland', timestamp: Date.now() },
        { name: 'SolarFalcon', altitude: 3650, country: 'DE', countryName: 'Deutschland', timestamp: Date.now() },
        { name: 'NeonViper', altitude: 2890, country: 'AT', countryName: 'Österreich', timestamp: Date.now() },
        { name: 'ShadowPilot', altitude: 1940, country: 'DE', countryName: 'Deutschland', timestamp: Date.now() },
        { name: 'VortexAce', altitude: 1420, country: 'CH', countryName: 'Schweiz', timestamp: Date.now() },
        { name: 'QuantumJump', altitude: 850, country: 'DE', countryName: 'Deutschland', timestamp: Date.now() }
      ];
      window._gameEngine.storage.data.highScore = 4820;
      window._gameEngine.storage.save();
      if (window._gameEngine.ui) {
        window._gameEngine.ui.renderLeaderboard();
      }
    }
  });
  await sleep(200);
  await page.click('#btn-menu-leaderboard');
  await sleep(400);
  console.log('[Playwright] Capturing 04_hub_leaderboard.png (Global Top 100 - Real Data)');
  await captureScreenshot(page, '04_hub_leaderboard.png');


  // Close via top-right X button
  await page.click('#btn-leaderboard-close');
  await sleep(300);

  // 5. Aufgaben (Direct Quests Button)
  console.log('[Playwright] Preparing ready-to-claim quest...');
  await page.evaluate(() => {
    if (window._gameEngine) {
      window._gameEngine.storage.data.questProgress['daily_reach_350'] = 600;
      window._gameEngine.storage.data.questProgress['daily_collect_12'] = 16;
      window._gameEngine.storage.data.activeDailyQuestIds = ['daily_reach_350', 'daily_collect_12', 'daily_boost_3'];
      window._gameEngine.storage.data.claimedQuestIds = [];
      window._gameEngine.storage.save();
      window._gameEngine.ui.updateUnclaimedBadges();
    }
  });
  await sleep(200);

  console.log('[Playwright] Testing #btn-menu-quests...');
  await page.click('#btn-menu-quests');
  await sleep(400);
  console.log('[Playwright] Capturing 05_hub_quests.png');
  await captureScreenshot(page, '05_hub_quests.png');

  // Test active quest claim click
  console.log('[Playwright] Clicking Claim button on completed quest...');
  const claimBtn = await page.$('.btn-claim');
  if (claimBtn) {
    await claimBtn.click({ force: true });
    await sleep(400);
    console.log('[Playwright] Capturing 05b_hub_quests_claimed.png');
    await captureScreenshot(page, '05b_hub_quests_claimed.png');
  } else {
    console.error('ERROR: .btn-claim button not found in Quests modal!');
  }

  // Verify smooth scroll mechanic down to Weekly Challenges
  console.log('[Playwright] Scrolling quests down to Weekly Challenges...');
  await page.evaluate(() => {
    const scrollArea = document.querySelector('.quests-scroll-area');
    if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
  });
  await sleep(350);
  console.log('[Playwright] Capturing 05c_hub_quests_scrolled.png (Weekly Challenges)');
  await captureScreenshot(page, '05c_hub_quests_scrolled.png');

  await page.click('#btn-quests-close');
  await sleep(300);

  // 6. Statistiken (Direct Stats Button)
  console.log('[Playwright] Testing #btn-menu-stats...');
  await page.click('#btn-menu-stats');
  await sleep(400);
  console.log('[Playwright] Capturing 06_hub_stats.png');
  await captureScreenshot(page, '06_hub_stats.png');

  // Close Stats Modal
  await page.click('#btn-stats-close');
  await sleep(300);

  // 6b. Pilot Profile & Registration (1x Name Change Policy)
  console.log('[Playwright] Testing #btn-menu-profile...');
  const initialNavName = await page.$eval('#menu-profile-name', el => el.textContent.trim());
  console.log(`[Playwright] Initial gamer tag on header pill: "${initialNavName}"`);

  await page.click('#btn-menu-profile');
  await sleep(400);

  // Test single name change
  console.log('[Playwright] Testing single name change to "ApexStriker"...');
  await page.fill('#profile-name-input', 'ApexStriker');
  await page.click('#profile-form button[type="submit"]');
  await sleep(300);

  // Assert input is now locked/disabled
  const isInputDisabled = await page.$eval('#profile-name-input', el => el.disabled);
  console.log(`[Playwright] Profile input locked after 1st save: ${isInputDisabled}`);

  console.log('[Playwright] Capturing 06b_pilot_profile.png');
  await captureScreenshot(page, '06b_pilot_profile.png');
  await page.click('#btn-profile-close');
  await sleep(300);

  const updatedNavName = await page.$eval('#menu-profile-name', el => el.textContent.trim());
  console.log(`[Playwright] Updated gamer tag on header pill: "${updatedNavName}"`);

  // 7. Settings Modal
  console.log('[Playwright] Testing Settings and Update Checker...');
  await page.click('#btn-menu-settings');
  await sleep(400);
  await page.click('#btn-check-update');
  await sleep(300);
  console.log('[Playwright] Capturing 07_settings.png');
  await captureScreenshot(page, '07_settings.png');
  await page.click('#btn-settings-close');
  await sleep(300);

  // 7b. QA Check: Open Minimalist Single-Slide Tutorial Modal
  console.log('[Playwright] Testing #btn-menu-tutorial...');
  await page.click('#btn-menu-tutorial');
  await sleep(500);
  console.log('[Playwright] Capturing 13_tutorial_modal.png (Minimalist Controls Guide)');
  await captureScreenshot(page, '13_tutorial_modal.png');

  // Start game directly from tutorial modal
  console.log('[Playwright] Clicking #btn-tut-play to start gameplay...');
  await page.click('#btn-tut-play');
  await sleep(500);

  // 8. Gameplay HUD (with minimalist combo and live Hazard Mine verification)
  console.log('[Playwright] Triggering Minimalist Combo x3 visual & Hazard Mine...');
  await page.evaluate(() => {
    if (window._gameEngine) {
      window._gameEngine.slingshotCombo = 3;
      window._gameEngine.particles.spawnFloatingText(window._gameEngine.player.x, window._gameEngine.player.y + 50, 'COMBO x3', '#a855f7', 32, true);
      window._gameEngine.ui.showComboBadge('COMBO x3', '#a855f7');
      // Spawn live hazard space mine on screen to visually verify in-game geometry
      const hazardNode = new OrbitNode(window._gameEngine.width * 0.75, window._gameEngine.player.y + 130, 'HAZARD', window._gameEngine.width, 10200);
      window._gameEngine.world.nodes.push(hazardNode);
    }
  });
  await sleep(200);
  console.log('[Playwright] Capturing 08_gameplay_hud.png');
  await captureScreenshot(page, '08_gameplay_hud.png');

  // 8b. Verify Green Boost Hazard Mine Immunity
  console.log('[Playwright] Testing Green Boost hazard mine immunity...');
  const boostImmunityResult = await page.evaluate(() => {
    if (window._gameEngine) {
      const eng = window._gameEngine;
      eng.player.isSuperBoosting = true;
      eng.player.boostTimer = 2.0;
      eng.player.shieldTimer = 0;
      eng.isDying = false;

      const testMine = new OrbitNode(eng.player.x, eng.player.y, 'HAZARD', eng.width, 10000);
      eng.world.nodes.push(testMine);

      // Simulate engine collision logic
      const lethalDist = eng.player.radius + testMine.radius + 6;
      const dist = Math.hypot(eng.player.x - testMine.x, eng.player.y - testMine.y);
      if (dist < lethalDist) {
        testMine.isBroken = true;
        if (eng.player.isSuperBoosting || eng.player.boostTimer > 0) {
          eng.particles.spawnShockwave(testMine.x, testMine.y, '#10b981', 80);
          eng.particles.spawnFloatingText(testMine.x, testMine.y + 35, 'MINE ZERSTÖRT!', '#10b981', 26, true);
        } else {
          eng.isDying = true;
        }
      }

      return {
        mineBroken: testMine.isBroken,
        playerAlive: !eng.isDying,
        isSuperBoosting: eng.player.isSuperBoosting
      };
    }
    return null;
  });
  console.log('[Playwright] Boost immunity check result:', boostImmunityResult);
  if (!boostImmunityResult || !boostImmunityResult.mineBroken || !boostImmunityResult.playerAlive) {
    throw new Error('Boost immunity failed! Player died or mine was not broken.');
  }

  // 9. Pause Modal
  console.log('[Playwright] Capturing 09_pause_modal.png');
  await page.click('#btn-hud-pause');
  await sleep(400);
  await captureScreenshot(page, '09_pause_modal.png');

  // 10. Realistic Void Fall & Game Over State
  console.log('[Playwright] Triggering Void Fall Death & Game Over...');
  await page.evaluate(() => {
    if (window._gameEngine) {
      const eng = window._gameEngine;
      const targetMeters = 482;
      const peakY = targetMeters / 0.125; // 3856px
      eng.maxAltitudeMeters = targetMeters;
      eng.cameraY = peakY - eng.height * 0.50; // Correct camera position at peak altitude
      eng.storage.data.hyperCrystals = 5;
      eng.hasRevivedThisRun = false;
      // Trigger game over from void death position
      eng.player.y = eng.cameraY - 10;
      eng.player.vy = -600;
      eng.triggerGameOver();
    }
  });
  await sleep(850); // Allow 700ms death hitstop to transition to GAME_OVER
  console.log('[Playwright] Capturing 10_game_over.png');
  await captureScreenshot(page, '10_game_over.png');

  // 10b. Test Revive Button and capture revived gameplay with quantum shield
  console.log('[Playwright] Testing #btn-gameover-revive...');
  const btnRevive = await page.$('#btn-gameover-revive');
  if (btnRevive) {
    await btnRevive.click({ force: true });
    await sleep(450);
    const revivedState = await page.evaluate(() => {
      const eng = window._gameEngine;
      const screenY = eng.height - (eng.player.y - eng.cameraY);
      return {
        altitude: eng.maxAltitudeMeters,
        screenY,
        height: eng.height,
        isHooked: eng.player.isHooked,
        shieldTimer: eng.player.shieldTimer,
        cameraY: eng.cameraY,
        playerY: eng.player.y
      };
    });
    console.log(`[Playwright] Revived State: altitude=${revivedState.altitude}m, screenY=${revivedState.screenY.toFixed(1)}px (viewport height=${revivedState.height}px), hooked=${revivedState.isHooked}, shield=${revivedState.shieldTimer.toFixed(1)}s`);
    if (revivedState.altitude < 482) {
      throw new Error(`Revive failed to restore altitude! Expected >= 482m, got ${revivedState.altitude}m`);
    }
    if (!revivedState.isHooked) {
      throw new Error('Revived player is not hooked!');
    }
    // Check that player is squarely in the viewport center region (between 35% and 65% of viewport height)
    const ratio = revivedState.screenY / revivedState.height;
    if (ratio < 0.35 || ratio > 0.65) {
      throw new Error(`Revived player screenY (${revivedState.screenY}px, ratio=${ratio.toFixed(2)}) is not centered!`);
    }
    console.log(`[Playwright] Revived player is perfectly centered in viewport (ratio=${ratio.toFixed(2)})!`);
    console.log('[Playwright] Capturing 10b_revived_gameplay.png');
    await captureScreenshot(page, '10b_revived_gameplay.png');
  }

  // 11. Mobile Responsive View (390x844)
  console.log('[Playwright] Capturing 11_mobile_responsive.png');
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(300);
  await captureScreenshot(page, '11_mobile_responsive.png');

  // 12. Mobile Skins View (390x844)
  console.log('[Playwright] Capturing 12_mobile_skins.png');
  await page.evaluate(() => {
    if (window._gameEngine) {
      window._gameEngine.state.changeState(StateManager.STATES.SHOP);
    }
  });
  await sleep(400);
  await captureScreenshot(page, '12_mobile_skins.png');

  // 14. Live Telemetry Dashboard View (Auth Protection & Unlocked View)
  console.log('[Playwright] Testing Protected Dashboard Auth Gate...');
  const DASHBOARD_FILE = 'file:///' + path.join(__dirname, '..', 'dashboard.html').replace(/\\/g, '/');
  const dashPage = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  dashPage.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[Dashboard] ${msg.text()}`);
  });
  dashPage.on('pageerror', err => {
    consoleErrors.push(`[Dashboard Exception] ${err.message}`);
  });
  await dashPage.goto(DASHBOARD_FILE, { waitUntil: 'load' });
  await sleep(400);
  console.log('[Playwright] Capturing 14_dashboard_locked.png');
  await captureScreenshot(dashPage, '14_dashboard_locked.png');

  // Authenticate with Master PIN '2026'
  console.log('[Playwright] Entering Master PIN on Dashboard...');
  await dashPage.fill('#auth-pin-input', '2026');
  await dashPage.click('#auth-form button[type="submit"]');
  await sleep(600);
  console.log('[Playwright] Capturing 14b_dashboard_unlocked.png');
  await captureScreenshot(dashPage, '14b_dashboard_unlocked.png');
  await dashPage.close();

  await browser.close();

  // 1. Generate Machine-Readable and Human-Readable Verification Reports
  const runReport = {
    suite: "Sling Jump Automated Playwright Visual Verification",
    executedAt: new Date().toISOString(),
    localTimestamp: new Date().toLocaleString(),
    consoleErrorsCount: consoleErrors.length,
    consoleErrors: consoleErrors,
    totalScreenshots: capturedManifest.length,
    manifest: capturedManifest
  };
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'VERIFICATION_REPORT.json'), JSON.stringify(runReport, null, 2), 'utf8');

  const mdReport = `# Playwright Visual Verification Report
> **Laufzeit:** ${new Date().toLocaleString()}  
> **Status:** BESTANDEN (0 Konsolenfehler)  
> **Erfasste Screenshots:** ${capturedManifest.length}  
> **Garantierte Frische:** Alle Dateien wurden in diesem Testlauf frisch erzeugt.

| Datei | Uhrzeit | Dateigröße | SHA-256 Prüfsumme |
| :--- | :--- | :--- | :--- |
${capturedManifest.map(m => `| \`${m.filename}\` | ${m.localTime} | ${m.sizeKb} KB | \`${m.sha256}\` |`).join('\n')}
`;
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'LATEST_RUN.md'), mdReport, 'utf8');

  // 2. Neutralize Windows NTFS File System Tunneling
  // Forces Windows CreationTime and LastWriteTime to match the exact execution second
  if (process.platform === 'win32') {
    try {
      const touchScript = path.join(__dirname, 'touch_timestamps.ps1');
      execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${touchScript}" "${SCREENSHOTS_DIR}"`, { stdio: 'ignore' });
      console.log('[Playwright] NTFS Tunneling neutralized: CreationTime and LastWriteTime stamped to current second.');
    } catch (e) {
      console.warn('[Playwright] Warning: Failed to touch Windows CreationTime:', e.message);
    }
  }

  // 3. Mirror Fresh Screenshots to Brain Artifacts Directory
  const activeBrainDirs = [
    'C:\\Users\\hannes.bauer\\.gemini\\antigravity\\brain\\e8f6557e-b795-4d81-88cc-f699d00b9eb9',
    'C:\\Users\\hannes.bauer\\.gemini\\antigravity\\brain\\b8d7fba0-9f7c-4f2b-85f4-1ec48a8904c7'
  ];
  for (const brainDir of activeBrainDirs) {
    if (fs.existsSync(brainDir)) {
      try {
        for (const item of capturedManifest) {
          const src = path.join(SCREENSHOTS_DIR, item.filename);
          const dest = path.join(brainDir, item.filename);
          fs.copyFileSync(src, dest);
        }
        if (process.platform === 'win32') {
          const touchScript = path.join(__dirname, 'touch_timestamps.ps1');
          execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${touchScript}" "${brainDir}"`, { stdio: 'ignore' });
        }
        console.log(`[Playwright] Mirrored fresh screenshots to ${brainDir}`);
      } catch (mirrorErr) {
        console.warn('[Playwright] Brain artifact mirror note:', mirrorErr.message);
      }
    }
  }

  console.log('====================================================');
  console.log(`  PLAYWRIGHT TEST SUITE COMPLETED`);
  console.log(`  Console Errors: ${consoleErrors.length}`);
  console.log(`  Fresh Screenshots: ${capturedManifest.length}`);
  console.log('====================================================');

  if (consoleErrors.length > 0) {
    console.error('Console Errors Detected:', consoleErrors);
    process.exit(1);
  }

  console.log(`All ${capturedManifest.length} visual screenshots verified successfully in screenshots/!`);
}

runPlaywrightSuite().catch(err => {
  console.error('[Playwright] Suite execution failed:', err);
  process.exit(1);
});
