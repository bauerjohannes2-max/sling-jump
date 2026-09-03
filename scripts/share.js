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
  console.log('\n======================================================');
  console.log('       SLING JUMP - WORLDWIDE PUBLIC MOBILE LINK      ');
  console.log('======================================================\n');

  if (publicUrl) {
    console.log(`  PUBLIC HTTPS URL: ${publicUrl}\n`);
    if (qrcode) {
      console.log('  SCAN MIT DEM SMARTPHONE (Weltweit ueberall aufrufbar):\n');
      qrcode.generate(publicUrl, { small: true }, (qr) => {
        console.log(qr);
      });
    }
  } else {
    console.log('  No public tunnel available. Use local network URL:');
    console.log(`  ${networkUrl}\n`);
  }

  console.log('======================================================');
  console.log('  Server & Tunnel aktiv! Druecke Strg+C zum Beenden.');
  console.log('======================================================\n');
}

if (require.main === module) {
  shareGame();
}

module.exports = { shareGame };
