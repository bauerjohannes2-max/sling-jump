const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };
  if (fs.existsSync(EDGE_PATH)) {
    launchOptions.executablePath = EDGE_PATH;
  } else {
    launchOptions.channel = 'msedge';
  }

  const browser = await chromium.launch(launchOptions);
  const assetsDir = path.join(__dirname, '..', 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const svgPath = 'file:///' + path.join(assetsDir, 'icon.svg').replace(/\\/g, '/');

  // 512x512
  const page512 = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page512.goto(svgPath);
  await page512.screenshot({ path: path.join(assetsDir, 'icon-512.png'), omitBackground: false });
  console.log('Created assets/icon-512.png (512x512)');

  // 192x192
  const page192 = await browser.newPage({ viewport: { width: 192, height: 192 }, deviceScaleFactor: 1 });
  await page192.goto(svgPath);
  await page192.screenshot({ path: path.join(assetsDir, 'icon-192.png'), omitBackground: false });
  console.log('Created assets/icon-192.png (192x192)');

  await browser.close();
  console.log('App icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
