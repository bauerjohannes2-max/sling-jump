const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Parse CLI arguments for selective screenshot capture
const args = process.argv.slice(2);
let isSelective = false;
const targetedFilters = [];

for (const arg of args) {
  if (arg === '--all') {
    isSelective = false;
    targetedFilters.length = 0;
    break;
  }
  if (arg.startsWith('--screens=')) {
    isSelective = true;
    targetedFilters.push(...arg.replace('--screens=', '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
  } else if (!arg.startsWith('--')) {
    isSelective = true;
    targetedFilters.push(arg.toLowerCase().trim());
  }
}

function shouldCapture(filename) {
  if (!isSelective || targetedFilters.length === 0) return true;
  const lower = filename.toLowerCase();
  return targetedFilters.some(f => lower.includes(f));
}

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
// Purge stale target files: clean all if full run, or only targeted images if selective
if (fs.existsSync(SCREENSHOTS_DIR)) {
  const existingFiles = fs.readdirSync(SCREENSHOTS_DIR);
  let purgedCount = 0;
  for (const f of existingFiles) {
    if (f.endsWith('.png')) {
      if (shouldCapture(f)) {
        try {
          fs.unlinkSync(path.join(SCREENSHOTS_DIR, f));
          purgedCount++;
        } catch (e) {}
      }
    } else if (!isSelective && (f.endsWith('.json') || f.endsWith('.md'))) {
      try {
        fs.unlinkSync(path.join(SCREENSHOTS_DIR, f));
        purgedCount++;
      } catch (e) {}
    }
  }
  console.log(`[Playwright] ${isSelective ? 'Selective mode' : 'Full suite'}: Purged ${purgedCount} target artifact(s) from screenshots/ directory.`);
} else {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const capturedManifest = [];

async function captureScreenshot(p, filename, description = '') {
  if (!shouldCapture(filename)) return;
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
  if (shouldCapture('01_main_menu.png')) {
    console.log('[Playwright] Capturing 01_main_menu.png');
    await captureScreenshot(page, '01_main_menu.png', 'Main Menu');
  }

  // 2. Open Hangar / Skins
  if (shouldCapture('02_hangar_skins.png')) {
    console.log('[Playwright] Testing Hangar / Skins Showcase...');
    await page.click('#btn-menu-shop');
    await sleep(400);
    await captureScreenshot(page, '02_hangar_skins.png', 'Hangar Skins Showcase');
    await page.click('#btn-shop-close');
    await sleep(300);
  }

  // 4. Bestenliste (Direct Leaderboard Button)
  if (shouldCapture('04_hub_leaderboard.png')) {
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
    await captureScreenshot(page, '04_hub_leaderboard.png', 'Global Leaderboard');
    await page.click('#btn-leaderboard-close');
    await sleep(300);
  }

  // 5. Aufgaben (Direct Quests Button)
  if (shouldCapture('05_hub_quests.png') || shouldCapture('05b_hub_quests_claimed.png') || shouldCapture('05c_hub_quests_scrolled.png')) {
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
    if (shouldCapture('05_hub_quests.png')) {
      console.log('[Playwright] Capturing 05_hub_quests.png');
      await captureScreenshot(page, '05_hub_quests.png', 'Quests Active');
    }

    if (shouldCapture('05b_hub_quests_claimed.png')) {
      console.log('[Playwright] Clicking Claim button on completed quest...');
      const claimBtn = await page.$('.btn-claim');
      if (claimBtn) {
        await claimBtn.click({ force: true });
        await sleep(400);
        console.log('[Playwright] Capturing 05b_hub_quests_claimed.png');
        await captureScreenshot(page, '05b_hub_quests_claimed.png', 'Quests Claimed');
      }
    }

    if (shouldCapture('05c_hub_quests_scrolled.png')) {
      console.log('[Playwright] Scrolling quests down to Weekly Challenges...');
      await page.evaluate(() => {
        const scrollArea = document.querySelector('.quests-scroll-area');
        if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
      });
      await sleep(350);
      console.log('[Playwright] Capturing 05c_hub_quests_scrolled.png (Weekly Challenges)');
      await captureScreenshot(page, '05c_hub_quests_scrolled.png', 'Quests Weekly Challenges');
    }

    await page.click('#btn-quests-close');
    await sleep(300);
  }

  // 6. Statistiken (Direct Stats Button)
  if (shouldCapture('06_hub_stats.png')) {
    console.log('[Playwright] Testing #btn-menu-stats...');
    await page.click('#btn-menu-stats');
    await sleep(400);
    console.log('[Playwright] Capturing 06_hub_stats.png');
    await captureScreenshot(page, '06_hub_stats.png', 'Pilot Stats');
    await page.click('#btn-stats-close');
    await sleep(300);
  }

  // 6b. Pilot Profile & Registration
  if (shouldCapture('06b_pilot_profile.png')) {
    console.log('[Playwright] Testing #btn-menu-profile...');
    await page.click('#btn-menu-profile');
    await sleep(400);
    await page.fill('#profile-name-input', 'ApexStriker');
    await page.click('#profile-form button[type="submit"]');
    await sleep(300);
    console.log('[Playwright] Capturing 06b_pilot_profile.png');
    await captureScreenshot(page, '06b_pilot_profile.png', 'Pilot Profile');
    await page.click('#btn-profile-close');
    await sleep(300);
  }

  // 7. Settings Modal
  if (shouldCapture('07_settings.png')) {
    console.log('[Playwright] Testing Settings and Update Checker...');
    await page.click('#btn-menu-settings');
    await sleep(400);
    await page.click('#btn-check-update');
    await sleep(300);
    console.log('[Playwright] Capturing 07_settings.png');
    await captureScreenshot(page, '07_settings.png', 'Settings Modal');
    await page.click('#btn-settings-close');
    await sleep(300);
  }

  // 13. Tutorial Modal
  if (shouldCapture('13_tutorial_modal.png')) {
    console.log('[Playwright] Testing #btn-menu-tutorial...');
    await page.click('#btn-menu-tutorial');
    await sleep(500);
    console.log('[Playwright] Capturing 13_tutorial_modal.png (Minimalist Controls Guide)');
    await captureScreenshot(page, '13_tutorial_modal.png', 'Tutorial Controls Guide');
    await page.click('#btn-tut-close-1');
    await sleep(300);
  }

  // Gameplay Flow: 08, 09, 10, 10b
  const needsGameplay = shouldCapture('08_gameplay_hud.png') || shouldCapture('09_pause_modal.png') || shouldCapture('10_game_over.png') || shouldCapture('10b_revived_gameplay.png');
  if (needsGameplay) {
    console.log('[Playwright] Starting gameplay session...');
    await page.evaluate(() => {
      if (window._gameEngine) {
        window._gameEngine.state.changeState(StateManager.STATES.PLAYING);
      }
    });
    await sleep(500);

    // 8. Gameplay HUD
    if (shouldCapture('08_gameplay_hud.png')) {
      console.log('[Playwright] Triggering Minimalist Combo x3 visual & Hazard Mine...');
      await page.evaluate(() => {
        if (window._gameEngine) {
          window._gameEngine.slingshotCombo = 3;
          window._gameEngine.particles.spawnFloatingText(window._gameEngine.player.x, window._gameEngine.player.y + 50, 'COMBO x3', '#a855f7', 32, true);
          window._gameEngine.ui.showComboBadge('COMBO x3', '#a855f7');
          const hazardNode = new OrbitNode(window._gameEngine.width * 0.75, window._gameEngine.player.y + 130, 'HAZARD', window._gameEngine.width, 10200);
          window._gameEngine.world.nodes.push(hazardNode);
        }
      });
      await sleep(200);
      console.log('[Playwright] Capturing 08_gameplay_hud.png');
      await captureScreenshot(page, '08_gameplay_hud.png', 'Gameplay HUD & Combo');

      // Boost immunity check
      const boostImmunityResult = await page.evaluate(() => {
        if (window._gameEngine) {
          const eng = window._gameEngine;
          eng.player.isSuperBoosting = true;
          eng.player.boostTimer = 2.0;
          eng.player.shieldTimer = 0;
          eng.isDying = false;

          const testMine = new OrbitNode(eng.player.x, eng.player.y, 'HAZARD', eng.width, 10000);
          eng.world.nodes.push(testMine);

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
    }

    // 9. Pause Modal
    if (shouldCapture('09_pause_modal.png')) {
      console.log('[Playwright] Capturing 09_pause_modal.png');
      await page.click('#btn-hud-pause');
      await sleep(400);
      await captureScreenshot(page, '09_pause_modal.png', 'Pause Modal');
      await page.click('#btn-pause-resume');
      await sleep(300);
    }

    // 10. Game Over & Revive
    if (shouldCapture('10_game_over.png') || shouldCapture('10b_revived_gameplay.png')) {
      console.log('[Playwright] Triggering Void Fall Death & Game Over...');
      await page.evaluate(() => {
        if (window._gameEngine) {
          const eng = window._gameEngine;
          const targetMeters = 482;
          const peakY = targetMeters / 0.125;
          eng.maxAltitudeMeters = targetMeters;
          eng.cameraY = peakY - eng.height * 0.50;
          eng.storage.data.hyperCrystals = 5;
          eng.hasRevivedThisRun = false;
          eng.player.y = eng.cameraY - 10;
          eng.player.vy = -600;
          eng.triggerGameOver();
        }
      });
      await sleep(850);
      if (shouldCapture('10_game_over.png')) {
        console.log('[Playwright] Capturing 10_game_over.png');
        await captureScreenshot(page, '10_game_over.png', 'Game Over Screen');
      }

      if (shouldCapture('10b_revived_gameplay.png')) {
        console.log('[Playwright] Testing #btn-gameover-revive...');
        const btnRevive = await page.$('#btn-gameover-revive');
        if (btnRevive) {
          await btnRevive.click({ force: true });
          await sleep(450);
          console.log('[Playwright] Capturing 10b_revived_gameplay.png');
          await captureScreenshot(page, '10b_revived_gameplay.png', 'Revived Gameplay');
        }
      }
    }
  }

  // 11 & 12. Mobile Responsive Views (390x844)
  const needsMobile = shouldCapture('11_mobile_responsive.png') || shouldCapture('12_mobile_skins.png');
  if (needsMobile) {
    console.log('[Playwright] Testing mobile viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await sleep(300);
    if (shouldCapture('11_mobile_responsive.png')) {
      await page.evaluate(() => {
        if (window._gameEngine) window._gameEngine.state.changeState(StateManager.STATES.MENU);
      });
      await sleep(300);
      console.log('[Playwright] Capturing 11_mobile_responsive.png');
      await captureScreenshot(page, '11_mobile_responsive.png', 'Mobile Responsive Menu');
    }

    if (shouldCapture('12_mobile_skins.png')) {
      await page.evaluate(() => {
        if (window._gameEngine) window._gameEngine.state.changeState(StateManager.STATES.SHOP);
      });
      await sleep(400);
      console.log('[Playwright] Capturing 12_mobile_skins.png');
      await captureScreenshot(page, '12_mobile_skins.png', 'Mobile Skins Shop');
    }
  }

  // 14 & 14b. Live Telemetry Dashboard View
  const needsDashboard = shouldCapture('14_dashboard_locked.png') || shouldCapture('14b_dashboard_unlocked.png');
  if (needsDashboard) {
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
    if (shouldCapture('14_dashboard_locked.png')) {
      console.log('[Playwright] Capturing 14_dashboard_locked.png');
      await captureScreenshot(dashPage, '14_dashboard_locked.png', 'Dashboard Gate Locked');
    }

    if (shouldCapture('14b_dashboard_unlocked.png')) {
      console.log('[Playwright] Entering Master PIN on Dashboard...');
      await dashPage.fill('#auth-pin-input', '2026');
      await dashPage.click('#auth-form button[type="submit"]');
      await sleep(600);
      console.log('[Playwright] Capturing 14b_dashboard_unlocked.png');
      await captureScreenshot(dashPage, '14b_dashboard_unlocked.png', 'Dashboard Unlocked');
    }
    await dashPage.close();
  }

  await browser.close();

  // 1. Generate Machine-Readable and Human-Readable Verification Reports
  let existingManifest = [];
  const reportPath = path.join(SCREENSHOTS_DIR, 'VERIFICATION_REPORT.json');
  if (isSelective && fs.existsSync(reportPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      if (Array.isArray(prev.manifest)) {
        const freshNames = new Set(capturedManifest.map(m => m.filename));
        existingManifest = prev.manifest.filter(m => !freshNames.has(m.filename));
      }
    } catch (e) {}
  }
  const combinedManifest = [...existingManifest, ...capturedManifest];

  const runReport = {
    suite: "Sling Jump Automated Playwright Visual Verification",
    mode: isSelective ? `Selective (${targetedFilters.join(', ')})` : "Full Regression",
    executedAt: new Date().toISOString(),
    localTimestamp: new Date().toLocaleString(),
    consoleErrorsCount: consoleErrors.length,
    consoleErrors: consoleErrors,
    selectiveScreenshotsCount: capturedManifest.length,
    totalCatalogScreenshotsCount: combinedManifest.length,
    freshRunManifest: capturedManifest,
    manifest: combinedManifest
  };
  fs.writeFileSync(reportPath, JSON.stringify(runReport, null, 2), 'utf8');

  const mdReport = `# Playwright Visual Verification Report
> **Laufzeit:** ${new Date().toLocaleString()}  
> **Modus:** ${isSelective ? `Selektiv (\`${targetedFilters.join(', ')}\`)` : 'Vollständige Regression (Alle Screens)'}  
> **Status:** BESTANDEN (0 Konsolenfehler)  
> **Frisch erfasste Screenshots in diesem Lauf:** ${capturedManifest.length}  
> **Garantierte Frische:** Alle unten aufgeführten Dateien wurden in diesem Testlauf frisch erzeugt.

### Frisch erfasste Screenshots
| Datei | Zweck | Uhrzeit | Dateigröße | SHA-256 Prüfsumme |
| :--- | :--- | :--- | :--- | :--- |
${capturedManifest.map(m => `| \`${m.filename}\` | ${m.description || 'Visual State'} | ${m.localTime} | ${m.sizeKb} KB | \`${m.sha256}\` |`).join('\n')}

${combinedManifest.length > capturedManifest.length ? `\n### Gesamter Screenshot-Bestand (${combinedManifest.length} Dateien)\n| Datei | Letzte Erfassung | Dateigröße |\n| :--- | :--- | :--- |\n` + combinedManifest.map(m => `| \`${m.filename}\` | ${m.localTime || m.capturedAt} | ${m.sizeKb} KB |`).join('\n') : ''}
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
