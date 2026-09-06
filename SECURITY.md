# Security Roadmap & Agent Execution Guide

This document defines the security architecture and incremental hardening roadmap for Sling Jump.

> **Instruction for AI Agents:**  
> When given the prompt: `"/goal okay now implement the next tiny step towards more security."`  
> 1. Read this file to identify the **first uncompleted step** (marked with `[ ]`).  
> 2. Implement that step atomically without breaking backwards compatibility.  
> 3. Verify with an automated test in `scratch/` + Playwright runner (`node scripts/playwright_runner.js 06`).  
> 4. Ensure 0 console errors and 0 uncaught exceptions.  
> 5. Update `architecture.md`, `GAME_SYSTEMS.md`, `GAME_STATUS.md`, and mark the step `[x]` in this document.  
> 6. Commit the changes to git.

---

## Roadmap Progress

- [x] **Step 1: Auth Bypass Patch & POST Restore Migration** (Completed - Commit `5a0763e`)
- [x] **Step 2: In-Memory Rate Limiting & Brute-Force Lockout** (Completed - Commit `a4d6ab0`)
- [x] **Step 3: CORS Whitelisting, 100KB Body Ceiling & Prototype Sanitization** (Completed - Commit `17345e8`)
- [x] **Step 4: Server-Side Cryptographic Salt & Key Derivation (PBKDF2)** (Completed)
- [x] **Step 5: Ephemeral Session Tokens (Eliminate Per-Request Credential Transmission)** (Completed)
- [x] **Step 6: Collision-Resistant 8-Character Player ID Architecture** (Completed - Commit `02bbf60`)
- [x] **Step 7: Save State Schema Validation & Numeric Bounds Enforcement** (Completed)
- [ ] **Step 8: Local TLS / HTTPS Transport Support for Mobile Dev**
- [ ] **Step 9: Production Backend Adapter (Supabase / Firebase)**

---

## Detailed Step Specifications

### [x] Step 1: Auth Bypass Patch & POST Restore Migration
* **Target:** [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js), [`js/services/StorageService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/StorageService.js)
* **Accomplished:**
  * Enforced password verification in `POST /api/player/sync`. Requests missing credentials on password-protected accounts return `403 FALSCHES PASSWORT`.
  * Added `safeCompareHashes()` using `crypto.timingSafeEqual` against timing side-channels.
  * Migrated restore endpoint from URL query string (`GET /api/player/:id?pw=hash`) to secure request body (`POST /api/player/restore`).
  * Added authenticated password removal (`removePassword: true` with valid hash).

---

### [x] Step 2: In-Memory Rate Limiting & Brute-Force Lockout
* **Target:** [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js), [`js/services/StorageService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/StorageService.js)
* **Accomplished:**
  * Global IP rate limit: Max 60 req/min per IP on `/api/player/*` endpoints. Returns `429 Too Many Requests` with `Retry-After` header.
  * Account brute-force defense: Max 5 consecutive failed password guesses per `IP:PlayerId`. Triggers 60-second lockout.
  * Client handles 429 and shows countdown toast notification.
  * Swept by 5-minute unreferenced interval timer.

---

### [x] Step 3: CORS Whitelisting, 100KB Body Ceiling & Prototype Sanitization
* **Target:** [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js)
* **Accomplished:**
  * Strict origin whitelist (`localhost`, 127.0.0.1, private LAN subnets `192.168.*`, `10.*`, `172.16-31.*`, and `https://bauerjohannes2-max.github.io`). External untrusted origins blocked with 403.
  * Body parsing rewritten to `readJsonBody()` with 100KB hard ceiling (`MAX_BODY_BYTES = 100 * 1024`) returning `413 Payload Too Large`.
  * Player ID syntax enforced via regex (`/^#[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4,10}$/`).
  * `sanitizeState()` strips prototype pollution keys (`__proto__`, `constructor`, `prototype`).

---

### [x] Step 4: Server-Side Cryptographic Salt & Key Derivation (PBKDF2)
* **Status:** COMPLETED
* **Accomplished:**
  * Server now derives slow, salted password hashes via `crypto.pbkdf2Sync(clientHash, salt, 100000, 32, 'sha256')`.
  * Generates cryptographically secure 16-byte random salts per account (`crypto.randomBytes(16).toString('hex')`).
  * Stores `{ salt, derivedHash }` in `playersStore[rawId].passwordHash` instead of clear/unsalted client hashes. Identical passwords produce completely distinct salts and derived hashes.
  * Preserves full backward compatibility: legacy records with raw string hashes are verified and transparently upgraded to PBKDF2 on successful authentication during sync or restore.

---

### [x] Step 5: Ephemeral Session Tokens (Eliminate Per-Request Password Hashes)
* **Status:** COMPLETED
* **Accomplished:**
  * Implemented `POST /api/player/login` endpoint issuing 30-day cryptographically secure 256-bit session tokens (`crypto.randomBytes(32)`).
  * Persisted session tokens in `data/sessions.json` with memory cache, validation, and auto-sweep on expiration.
  * Updated `POST /api/player/sync` to authenticate via `Authorization: Bearer <token>` or `payload.sessionToken`, returning 401 on invalid/expired tokens.
  * Completely eliminated password hash transmission on recurring in-flight syncs (`StorageService.syncToCloud`). Password hash is only transmitted during login or initial password creation.
  * Transparent issuance: `POST /api/player/restore` and `POST /api/player/sync` return `sessionToken` upon authenticated requests.
  * Session revocation: Updating or removing a password revokes active session tokens.

---

### [x] Step 6: Collision-Resistant 8-Character Player ID Architecture
* **Status:** COMPLETED
* **Goal:** Increase ID entropy to eliminate birthday collision risks.
* **Files Modified:**
  * [`js/services/StorageService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/StorageService.js), [`index.html`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/index.html), [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js)
* **Implementation Details:**
  1. `StorageService.generateUniqueUserId()` generates 8 characters with a hyphen: `#XXXX-XXXX` from Crockford Base32 characters ($30^8 = 6.5 \times 10^{11}$ combinations).
  2. Adjusted HTML `#sync-player-id-input` `maxlength` from `7` to `10` and updated placeholder to `#EXGN-8K2P`.
  3. Updated `ID_REGEX` on server to accept hyphen: `/^#[23456789ABCDEFGHJKLMNPQRSTUVWXYZ-]{4,10}$/`.
  4. Preserved full backward compatibility: `StorageService.migrate()` and server endpoints accept both legacy 4-char (`#XXXX`) and new 8-char (`#XXXX-XXXX`) accounts.
* **Verification:**
  * Automated tests: 500 ID generations verified matching `#XXXX-XXXX` without collisions, legacy/new migration preserved, server sync & restore validated with 0 errors.
  * Playwright visual test `06`: Fresh `06b_pilot_profile.png` verified with 0 console errors.

---

### [x] Step 7: Save State Schema Validation & Numeric Bounds Enforcement
* **Status:** COMPLETED
* **Goal:** Prevent clients from injecting corrupted or astronomically manipulated save data (e.g. `cores: 1e99`, `NaN`, negative high scores).
* **Files Modified:**
  * [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js), [`js/config/Constants.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/config/Constants.js)
* **Implementation Details:**
  1. Defined explicit schema bounds:
     * `highScore`: positive finite integer, max 500,000.
     * `cores`: positive finite integer, max 1,000,000.
     * `hyperCrystals`: positive finite integer, max 1,000.
     * `selectedShip`, `selectedTrail`, `selectedTheme`: strictly validated against registered catalog keys in `Constants.js` (`VALID_SHIPS`, `VALID_TRAILS`, `VALID_THEMES`).
     * `unlockedShips`, `unlockedTrails`, `unlockedThemes`: filtered to recognized catalog IDs with starter defaults guaranteed.
     * `stats`: clamped numeric values (`bestCombo` max 100, stats max 100M).
     * Sub-objects recursively stripped of prototype pollution properties.
  2. Integrated bounds enforcement into `sanitizeState()` before persisting in `playersStore`.
* **Verification:**
  * Automated unit & integration tests (`test_schema_bounds.js`): Verified upper bounds clamping (`cores=1M`, `highScore=500k`, `hyperCrystals=1k`), negative number normalization, catalog fallback to `'dart'`, `'neon_cyan'`, `'deep_space'`, prototype pollution neutrality, and server sync/restore verification.
  * Playwright visual test `06`: Fresh `06b_pilot_profile.png` verified with 0 console errors.

---

### [ ] Step 8: Local TLS / HTTPS Transport Support for Mobile Dev
* **Status:** NEXT UP
* **Goal:** Protect network traffic across shared local Wi-Fi.
* **Files to Modify:**
  * [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js), `package.json`
* **Implementation Details:**
  1. Add flag `--https` or check for `certs/key.pem` and `certs/cert.pem`.
  2. If present or requested, launch `https.createServer(...)` alongside HTTP redirect.
  3. Provide `npm run certs` script to generate local trusted certificates via `mkcert`.

---

### [ ] Step 9: Production Backend Adapter (Supabase / Firebase)
* **Goal:** True production-grade global persistence without hosting `serve.js`.
* **Files to Modify:**
  * New adapter file `js/services/CloudBackend.js`
* **Implementation Details:**
  1. Implement pluggable storage provider interface in `StorageService`.
  2. Default to local node server (`serve.js`) in development.
  3. Support seamless transition to Supabase Database + Auth for production deployment on GitHub Pages.
