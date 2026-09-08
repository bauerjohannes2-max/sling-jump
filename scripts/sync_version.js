#!/usr/bin/env node
/**
 * Space Jump - Version Stamper
 *
 * package.json is the single source of truth for the app version. This script writes that
 * version into every place the browser and the service worker read it from, so cache busters,
 * the PWA cache name and the on-screen build tag can never drift apart again.
 *
 *   node scripts/sync_version.js          stamp all targets
 *   node scripts/sync_version.js --check  exit 1 if any target is out of sync (used by CI)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHECK_ONLY = process.argv.includes('--check');

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const write = (rel, content) => fs.writeFileSync(path.join(ROOT, rel), content, 'utf8');

const VERSION = JSON.parse(read('package.json')).version;

function buildStamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}-` +
    `${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}`;
}

const targets = [
  {
    file: 'version.json',
    transform(source) {
      const current = JSON.parse(source);
      if (current.version === VERSION) return source;
      const now = new Date();
      return JSON.stringify({
        version: VERSION,
        build: buildStamp(now),
        updatedAt: now.toISOString()
      }) + '\n';
    }
  },
  {
    file: 'sw.js',
    transform: (source) => source
      .replace(/^( \* Version: ).*$/m, `$1${VERSION}`)
      .replace(/const CACHE_NAME = 'space-jump-v[^']*';/, `const CACHE_NAME = 'space-jump-v${VERSION}';`)
  },
  {
    file: 'js/config/Constants.js',
    transform: (source) => source.replace(/VERSION: '[^']*'/, `VERSION: '${VERSION}'`)
  },
  {
    file: 'index.html',
    transform: (source) => source
      .replace(/\?v=[0-9A-Za-z._-]+/g, `?v=${VERSION}`)
      .replace(/var APP_VERSION = '[^']*';/, `var APP_VERSION = '${VERSION}';`)
      .replace(/SPACE JUMP v[0-9A-Za-z._-]+/g, `SPACE JUMP v${VERSION}`)
  }
];

const stale = [];

for (const target of targets) {
  const source = read(target.file);
  const next = target.transform(source);
  if (next === source) continue;
  stale.push(target.file);
  if (!CHECK_ONLY) write(target.file, next);
}

if (CHECK_ONLY) {
  if (stale.length > 0) {
    console.error(`Version drift against package.json (${VERSION}):`);
    stale.forEach((f) => console.error(`  - ${f}`));
    console.error('Run "npm run version:sync" and commit the result.');
    process.exit(1);
  }
  console.log(`All version references match package.json (${VERSION}).`);
} else if (stale.length > 0) {
  console.log(`Stamped ${VERSION} into:`);
  stale.forEach((f) => console.log(`  - ${f}`));
} else {
  console.log(`Already at ${VERSION}; nothing to do.`);
}
