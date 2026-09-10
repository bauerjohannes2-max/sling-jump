const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const dir = Buffer.alloc(16);
  dir.writeUInt8(size >= 256 ? 0 : size, 0);
  dir.writeUInt8(size >= 256 ? 0 : size, 1);
  dir.writeUInt8(0, 2);
  dir.writeUInt8(0, 3);
  dir.writeUInt16LE(1, 4);
  dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(pngBuffer.length, 8);
  dir.writeUInt32LE(22, 12);

  return Buffer.concat([header, dir, pngBuffer]);
}

async function exportIcons() {
  const sourcePath = path.join(__dirname, '..', 'design', 'space-jump-icon-v4-hero-cockpit.png');
  if (!fs.existsSync(sourcePath)) {
    throw new Error('Icon source not found at: ' + sourcePath);
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

  const imgBase64 = fs.readFileSync(sourcePath).toString('base64');
  const dataUri = `data:image/png;base64,${imgBase64}`;
  const rootDir = path.join(__dirname, '..');
  const assetsDir = path.join(rootDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  async function renderIcon(size, targetFilename, destDir = assetsDir) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: #050814; }
          img { width: ${size}px; height: ${size}px; object-fit: cover; display: block; }
        </style>
      </head>
      <body>
        <img src="${dataUri}" alt="" />
      </body>
      </html>
    `;
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(html);
    await page.waitForFunction(() => {
      const img = document.querySelector('img');
      return img && img.complete && img.naturalWidth > 0;
    });
    const targetPath = path.join(destDir, targetFilename);
    await page.screenshot({ path: targetPath, omitBackground: false });
    console.log(`[IconExporter] Created ${targetFilename} (${size}x${size})`);
    return targetPath;
  }

  const png512 = await renderIcon(512, 'icon-512.png');
  await renderIcon(512, 'app-icon-punch-512.png');
  await renderIcon(192, 'icon-192.png');
  await renderIcon(192, 'app-icon-punch-192.png');
  await renderIcon(180, 'apple-touch-icon-punch.png', rootDir);
  await renderIcon(64, 'favicon.png');
  const icoPngPath = await renderIcon(32, 'favicon-32.png');

  const png512Uri = 'data:image/png;base64,' + fs.readFileSync(png512).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#050814"/>
  <image href="${png512Uri}" width="512" height="512" preserveAspectRatio="xMidYMid slice"/>
</svg>
`;
  fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgContent);
  console.log('[IconExporter] Updated assets/icon.svg');

  const icoPng = fs.readFileSync(icoPngPath);
  fs.writeFileSync(path.join(__dirname, '..', 'favicon.ico'), pngToIco(icoPng, 32));
  fs.unlinkSync(icoPngPath);
  console.log('[IconExporter] Updated favicon.ico');

  await browser.close();
  console.log('[IconExporter] All icon assets exported successfully!');
}

exportIcons().catch(err => {
  console.error('[IconExporter] Error:', err);
  process.exit(1);
});
