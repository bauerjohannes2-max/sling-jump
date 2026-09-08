# Security Roadmap & Agent Execution Guide

This document defines the security architecture and incremental hardening roadmap for Space Jump.

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
- [x] **Step 7: Save State Schema Validation & Numeric Bounds Enforcement** (Completed - Commit `7d24951`)
- [x] **Step 8: Local TLS / HTTPS Transport Support for Mobile Dev** (Completed)
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

### [x] Step 8: Local TLS / HTTPS Transport Support for Mobile Dev
* **Status:** COMPLETED
* **Goal:** Protect network traffic across shared local Wi-Fi.
* **Files Modified:**
  * [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js), [`scripts/generate_certs.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/generate_certs.js), `package.json`, `.gitignore`
* **Implementation Details:**
  1. Added `--https` command-line flag and `HTTPS=true` environment variable support in `scripts/serve.js`.
  2. Implemented `scripts/generate_certs.js` supporting `mkcert` (for system-trusted certs) with automatic zero-dependency Node.js ECDSA P-256 self-signed certificate fallback.
  3. Added `npm run certs` and `npm run start:https` scripts to `package.json`.
  4. Server launches `https.createServer(...)` alongside automatic HTTP-to-HTTPS redirect (`301 Moved Permanently`) on standard HTTP port.
  5. Ignored `certs/` and `*.pem` in `.gitignore` to prevent committing private keys.
* **Verification:**
  * Automated unit & integration tests (`test_local_tls.js`): Generated certificates, verified HTTPS `GET /index.html` and `POST /api/player/sync`, and confirmed HTTP to HTTPS 301 redirection.
  * Playwright visual test `06`: Fresh `06b_pilot_profile.png` verified with 0 console errors.

---

### [x] Step 9: Production Backend Adapter (Supabase / Firebase)
* **Status:** COMPLETED
* **Goal:** Decouple cloud persistence from local `serve.js`, enabling seamless migration to Supabase/Firebase for serverless static hosting (GitHub Pages).
* **Files Modified:**
  * [`js/services/CloudBackend.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/CloudBackend.js) (NEW), [`js/services/StorageService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/StorageService.js), [`index.html`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/index.html)
* **Implementation Details:**
  1. Implemented `BaseCloudAdapter` interface specifying `sync(payload)`, `restore(playerId, passwordHash)`, `login(playerId, passwordHash)`, and `removePassword(playerId, passwordHash, sessionToken, state)`.
  2. Implemented `LocalNodeAdapter` executing fetch requests against `serve.js` endpoints (`/api/player/sync`, `/api/player/restore`, `/api/player/login`) maintaining full backward compatibility with zero manual config in development.
  3. Implemented `SupabaseAdapter` executing direct PostgREST REST calls against `rest/v1/<tableName>` with `apikey` and `Authorization: Bearer <anonKey>` headers, supporting serverless static deployments.
  4. Implemented `CloudBackend` singleton factory and registry supporting runtime switching (`CloudBackend.configure('supabase', ...)`), environment config detection (`window.SPACE_JUMP_CLOUD_CONFIG` or `localStorage`), and adapter injection.
  5. Refactored `StorageService` to route all cloud operations (`syncToCloud`, `restoreFromCloud`, `removePassword`, `login`) through `getCloudBackend()`.
* **Verification:**
  * Automated tests (`test_cloud_backend.js`): Verified `BaseCloudAdapter` abstract contract, `LocalNodeAdapter` URL normalization, `SupabaseAdapter` auth headers & endpoints, `CloudBackend` registry switching, and mock adapter delegation across all 4 persistence methods with 0 errors.
  * Playwright visual test `06`: Fresh `06b_pilot_profile.png` verified with 0 console errors.
