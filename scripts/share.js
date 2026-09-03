/**
 * Sling Jump - Instant Public Phone Sharing via Tunnel
 * Starts local server and creates a secure HTTPS tunnel so anyone can open the game
 * on any smartphone over cellular (4G/5G) or external Wi-Fi.
 * STRICT RULE: No Emojis anywhere in code, logs, or UI.
 */
const { startServer } = require('./serve');

let untun = null;
try {
  untun = require('untun');
} catch (e) {}

let localtunnel = null;
try {
  localtunnel = require('localtunnel');
} catch (e) {}

let qrcode = null;
try {
  qrcode = require('qrcode-terminal');
} catch (e) {}

const PORT = parseInt(process.env.PORT, 10) || 3000;

async function shareGame() {
  const { server, localUrl, networkUrl } = startServer(PORT);
  let publicUrl = null;

  // 1. Try Cloudflare Tunnel (untun) - rock-solid, zero password screens, fast worldwide CDN
  if (untun && typeof untun.startTunnel === 'function') {
    try {
      console.log('[Share] Establishing Cloudflare Quick Tunnel...');
      const tunnel = await untun.startTunnel({ port: PORT });
      publicUrl = await tunnel.getURL();
      console.log('[Share] Cloudflare Tunnel established successfully.');
    } catch (cfErr) {
      console.warn('[Share] Cloudflare Tunnel attempt failed:', cfErr.message);
    }
  }

  // 2. Fallback to localtunnel if Cloudflare wasn't available
  if (!publicUrl && localtunnel) {
    try {
      console.log('[Share] Falling back to localtunnel...');
      const tunnel = await localtunnel({ port: PORT });
      publicUrl = tunnel.url;
      tunnel.on('error', (err) => console.warn('[Share] localtunnel error:', err.message));
    } catch (ltErr) {
      console.warn('[Share] localtunnel attempt failed:', ltErr.message);
    }
  }

  // Output Links & QR Code
  const PERMANENT_URL = 'https://bauerjohannes2-max.github.io/sling-jump/';

  console.log('\n======================================================');
  console.log('       SLING JUMP - PERMANENTER LIVE-LINK             ');
  console.log('======================================================\n');
  console.log('  DAUERHAFTER LINK FUER FREUNDE & FAMILIE (24/7 ONLINE):');
  console.log(`  ${PERMANENT_URL}\n`);
  console.log('  * Funktioniert IMMER weltweit (auf jedem Smartphone/PC)');
  console.log('  * Kein lokaler Server / kein Laptop-Betrieb notwendig!');
  console.log('  * Automatisches PWA-Caching fuer Offline-Spielbarkeit\n');

  if (qrcode) {
    console.log('  QR-CODE ZUM DIREKTEN SCANNEN:\n');
    qrcode.generate(PERMANENT_URL, { small: true }, (qr) => {
      console.log(qr);
    });
  }

  if (publicUrl) {
    console.log(`\n  Temporaerer Dev-Tunnel: ${publicUrl}`);
  }
  console.log(`  Lokales Netzwerk:       ${networkUrl}\n`);
  console.log('======================================================\n');
}

if (require.main === module) {
  shareGame();
}

module.exports = { shareGame };
