/**
 * Sling Jump - Development TLS Certificate Generator
 * Generates local SSL/TLS certificates for mobile HTTPS testing.
 * Supports mkcert (system-trusted) with automatic zero-dependency Node.js fallback.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const CERTS_DIR = path.join(ROOT_DIR, 'certs');
const KEY_FILE = path.join(CERTS_DIR, 'key.pem');
const CERT_FILE = path.join(CERTS_DIR, 'cert.pem');

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

// Minimalist ASN.1 DER helpers for zero-dependency X.509 generation
function derEncodeLength(len) {
  if (len < 128) return Buffer.from([len]);
  const bytes = [];
  let temp = len;
  while (temp > 0) {
    bytes.unshift(temp & 0xff);
    temp >>= 8;
  }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}

function derTag(tag, buffer) {
  return Buffer.concat([Buffer.from([tag]), derEncodeLength(buffer.length), buffer]);
}

function derSequence(...buffers) {
  return derTag(0x30, Buffer.concat(buffers));
}

function derInteger(buf) {
  if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0x00]), buf]);
  return derTag(0x02, buf);
}

function derOid(oidStr) {
  const parts = oidStr.split('.').map(Number);
  const bytes = [parts[0] * 40 + parts[1]];
  for (let i = 2; i < parts.length; i++) {
    let val = parts[i];
    const subBytes = [];
    subBytes.unshift(val & 0x7f);
    val >>= 7;
    while (val > 0) {
      subBytes.unshift(0x80 | (val & 0x7f));
      val >>= 7;
    }
    bytes.push(...subBytes);
  }
  return derTag(0x06, Buffer.from(bytes));
}

function derUtcTime(date) {
  const pad = n => String(n).padStart(2, '0');
  const str = `${String(date.getUTCFullYear()).slice(-2)}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
  return derTag(0x17, Buffer.from(str, 'ascii'));
}

function derName(commonName) {
  const attrType = derOid('2.5.4.3'); // commonName
  const attrVal = derTag(0x0c, Buffer.from(commonName, 'utf8')); // UTF8String
  const attr = derSequence(attrType, attrVal);
  const rdn = derTag(0x31, attr); // SET
  return derSequence(rdn);
}

function derSanExtension(domains, ips) {
  const generalNames = [];
  for (const d of domains) {
    generalNames.push(derTag(0x82, Buffer.from(d, 'ascii'))); // dNSName [2]
  }
  for (const ip of ips) {
    const parts = ip.split('.').map(Number);
    if (parts.length === 4) {
      generalNames.push(derTag(0x87, Buffer.from(parts))); // iPAddress [7]
    }
  }
  const sanSeq = derSequence(...generalNames);
  const extnId = derOid('2.5.29.17'); // id-ce-subjectAltName
  const extnValue = derTag(0x04, sanSeq); // OCTET STRING
  return derSequence(extnId, extnValue);
}

function generateSelfSignedCert(options = {}) {
  const commonName = options.commonName || 'localhost';
  const domains = options.domains || ['localhost'];
  const ips = options.ips || ['127.0.0.1'];

  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1'
  });

  const spkiDer = publicKey.export({ type: 'spki', format: 'der' });
  const serial = crypto.randomBytes(8);
  const algId = derSequence(derOid('1.2.840.10045.4.3.2')); // ecdsa-with-SHA256

  const now = new Date();
  const notBefore = new Date(now.getTime() - 60000);
  const notAfter = new Date(now.getTime() + 365 * 24 * 3600 * 1000);
  const validity = derSequence(derUtcTime(notBefore), derUtcTime(notAfter));

  const subject = derName(commonName);
  const issuer = subject;

  const version = derTag(0xa0, derTag(0x02, Buffer.from([0x02]))); // v3 (2)
  const extensionsSeq = derSequence(derSanExtension(domains, ips));
  const extensions = derTag(0xa3, extensionsSeq);

  const tbsCert = derSequence(
    version,
    derInteger(serial),
    algId,
    issuer,
    validity,
    subject,
    spkiDer,
    extensions
  );

  const signature = crypto.sign('sha256', tbsCert, privateKey);
  const sigBitString = Buffer.concat([Buffer.from([0x00]), signature]);
  const certDer = derSequence(tbsCert, algId, derTag(0x03, sigBitString));

  const certPem = `-----BEGIN CERTIFICATE-----\n${certDer.toString('base64').match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----\n`;
  const keyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

  return { cert: certPem, key: keyPem };
}

function isMkcertInstalled() {
  try {
    const res = spawnSync('mkcert', ['-version'], { stdio: 'pipe', encoding: 'utf8' });
    return res.status === 0;
  } catch (e) {
    return false;
  }
}

function generateCerts() {
  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
  }

  const localIp = getLocalIpAddress();

  if (isMkcertInstalled()) {
    console.log('[TLS] mkcert gefunden! Erzeuge systemweit vertrauenswuerdige Zertifikate...');
    spawnSync('mkcert', ['-install'], { stdio: 'inherit' });
    const mkcertResult = spawnSync('mkcert', [
      '-key-file', KEY_FILE,
      '-cert-file', CERT_FILE,
      'localhost',
      '127.0.0.1',
      '::1',
      localIp
    ], { stdio: 'inherit' });

    if (mkcertResult.status === 0 && fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
      console.log(`[TLS] Zertifikate erfolgreich mit mkcert erstellt: ${CERT_FILE}`);
      return { keyFile: KEY_FILE, certFile: CERT_FILE, type: 'mkcert' };
    }
  }

  console.log('[TLS] Erzeuge selbstsigniertes Entwickler-Zertifikat (ECDSA P-256)...');
  const { cert, key } = generateSelfSignedCert({
    commonName: 'SlingJumpDev',
    domains: ['localhost'],
    ips: ['127.0.0.1', localIp]
  });

  fs.writeFileSync(KEY_FILE, key, 'utf8');
  fs.writeFileSync(CERT_FILE, cert, 'utf8');

  console.log(`[TLS] Zertifikate erstellt:\n  Key:  ${KEY_FILE}\n  Cert: ${CERT_FILE}`);
  console.log('[HINT] Fuer vollstaendig vertrauenswuerdige Zertifikate ohne Browser-Warnung:');
  console.log('       winget install FiloSottile.mkcert  (Windows)');
  console.log('       brew install mkcert                (macOS)');
  console.log('       Anschliessend: npm run certs\n');

  return { keyFile: KEY_FILE, certFile: CERT_FILE, type: 'self-signed' };
}

if (require.main === module) {
  generateCerts();
}

module.exports = {
  generateCerts,
  generateSelfSignedCert,
  isMkcertInstalled,
  KEY_FILE,
  CERT_FILE,
  CERTS_DIR
};
