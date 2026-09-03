const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function exportIcons() {
  const generatedIconPath = 'C:\\Users\\hannes.bauer\\.gemini\\antigravity\\brain\\b5a7b095-beb3-495f-8efb-383519c52e31\\sling_jump_app_icon_1788474304091.jpg';
  
  if (!fs.existsSync(generatedIconPath)) {
    throw new Error('Generated icon file not found at: ' + generatedIconPath);
  }

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
  const page = await browser.newPage();
  
  const imgBase64 = fs.readFileSync(generatedIconPath).toString('base64');
  const dataUri = `data:image/jpeg;base64,${imgBase64}`;

  const assetsDir = path.join(__dirname, '..', 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  // Helper to render and capture at exact resolution
  async function renderIcon(size, targetFilename) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center; }
          img { width: 100%; height: 100%; object-fit: cover; border-radius: ${Math.round(size * 0.22)}px; }
        </style>
      </head>
      <body>
        <img src="${dataUri}" />
      </body>
      </html>
    `;
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html);
    await page.waitForTimeout(100);
    const targetPath = path.join(assetsDir, targetFilename);
    await page.screenshot({ path: targetPath, omitBackground: false });
    console.log(`[IconExporter] Created ${targetFilename} (${size}x${size})`);
  }

  await renderIcon(512, 'icon-512.png');
  await renderIcon(192, 'icon-192.png');
  await renderIcon(64, 'favicon.png');

  // Also write SVG wrapper for SVG consumers
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <clipPath id="iconSquircle">
      <rect width="512" height="512" rx="112" ry="112" />
    </clipPath>
  </defs>
  <image href="${dataUri}" width="512" height="512" clip-path="url(#iconSquircle)" />
</svg>`;
  fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgContent);
  console.log('[IconExporter] Updated assets/icon.svg');

  await browser.close();
  console.log('[IconExporter] All icon assets exported successfully!');
}

exportIcons().catch(err => {
  console.error('[IconExporter] Error:', err);
  process.exit(1);
});
