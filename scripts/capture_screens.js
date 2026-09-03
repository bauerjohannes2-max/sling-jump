const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const HTML_FILE = 'file:///' + path.join(__dirname, '..', 'index.html').replace(/\\/g, '/');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('Launching Chromium engine for full visual inspection...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  
  // Listen for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  console.log('Navigating to', HTML_FILE);
  await page.goto(HTML_FILE, { waitUntil: 'load' });
  await sleep(600);

  // 1. Main Menu
  console.log('Capturing: 01_main_menu.png');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_main_menu.png') });

  // 2. Open Hangar (Ships) - Test Live Skin Selection
  console.log('Capturing: 02_hangar_ships.png');
  await page.click('#btn-menu-shop');
  await sleep(400);
  await page.click('.shop-card[data-id="interceptor"]');
  await sleep(300);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_hangar_ships.png') });

  // 3. Hangar Trails tab - Test Live Trail Selection
  console.log('Capturing: 03_hangar_trails.png');
  await page.click('.shop-tab-btn[data-tab="trails"]');
  await sleep(300);
  await page.click('.shop-card[data-id="matrix_green"]');
  await sleep(300);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_hangar_trails.png') });

  // Close Hangar
  await page.click('#btn-shop-close');
  await sleep(300);

  // 4. Pilot Hub: Tab 1 - Global Leaderboard & Player Rank
  console.log('Capturing: 04_hub_leaderboard.png');
  await page.click('#btn-menu-stats');
  await sleep(400);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_hub_leaderboard.png') });

  // 5. Pilot Hub: Tab 2 - Daily & Weekly Challenges (Active Claim)
  console.log('Capturing: 05_hub_quests.png');
  await page.click('#tab-btn-quests');
  await sleep(300);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_hub_quests.png') });

  // 6. Pilot Hub: Tab 3 - Lifetime Stats
  console.log('Capturing: 06_hub_stats.png');
  await page.click('#tab-btn-stats');
  await sleep(300);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_hub_stats.png') });

  // Close Pilot Hub
  await page.click('#btn-stats-close');
  await sleep(300);

  // 7. Open Settings
  console.log('Capturing: 07_settings.png');
  await page.click('#btn-menu-settings');
  await sleep(400);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_settings.png') });

  // Close Settings
  await page.click('#btn-settings-close');
  await sleep(300);

  // 8. Gameplay HUD State
  console.log('Capturing: 08_gameplay_hud.png');
  await page.click('#btn-menu-play');
  await sleep(600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_gameplay_hud.png') });

  // 9. Pause Modal
  console.log('Capturing: 09_pause_modal.png');
  await page.click('#btn-hud-pause');
  await sleep(400);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_pause_modal.png') });

  // 10. Game Over State with Upgrade Banner
  console.log('Capturing: 10_game_over.png');
  await page.evaluate(() => {
    const pause = document.getElementById('pause-modal');
    if (pause) pause.classList.remove('visible');
    const modal = document.getElementById('gameover-modal');
    if (modal) {
      modal.classList.add('visible');
      document.getElementById('final-altitude').textContent = '482 m';
      document.getElementById('final-orbs').textContent = '12 (+600 Pkt)';
      document.getElementById('final-near-misses').textContent = '3 (+225 Pkt)';
      document.getElementById('final-score').textContent = '1307';
      document.getElementById('final-best').textContent = '620 m';
      document.getElementById('new-record-badge').style.display = 'block';

      // Test upgrade banner
      const banner = document.getElementById('gameover-upgrade-banner');
      if (banner) {
        banner.style.display = 'block';
        document.getElementById('upgrade-banner-text').innerHTML = 'Du hast genug Sterne für <strong>FALKE</strong> (Raumschiff, 250 Sterne)!';
      }
    }
  });
  await sleep(400);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_game_over.png') });

  // 11. Mobile Responsive Inspection (390x844)
  console.log('Capturing: 11_mobile_responsive.png');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await sleep(300);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_mobile_responsive.png') });

  console.log('\n--- AUTOMATION RESULTS ---');
  console.log(`Console Errors Found: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console Errors:', consoleErrors);
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully in /screenshots!');
}

run().catch(err => {
  console.error('Automation failed:', err);
  process.exit(1);
});
