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
- [ ] **Step 4: Server-Side Cryptographic Salt & Key Derivation (PBKDF2)**
- [ ] **Step 5: Ephemeral Session Tokens (Eliminate Per-Request Credential Transmission)**
- [ ] **Step 6: Collision-Resistant 8-Character Player ID Architecture**
- [ ] **Step 7: Save State Schema Validation & Numeric Bounds Enforcement**
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

### [ ] Step 4: Server-Side Cryptographic Salt & Key Derivation (PBKDF2)
* **Status:** NEXT UP
* **Problem:** Server stores raw client SHA-256 in `data/players.json`. If leaked, rainbow tables can precompute passwords.
* **Goal:** Store only slow, salted key derivations on the server.
* **Files to Modify:**
  * [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js)
* **Implementation Details:**
  1. For new or updated passwords, generate 16-byte random salt: `const salt = crypto.randomBytes(16).toString('hex');`
  2. Derive password key using standard PBKDF2: `crypto.pbkdf2Sync(clientHash, salt, 100000, 32, 'sha256').toString('hex')`
  3. In `playersStore[rawId]`, store `{ salt, derivedHash }` instead of raw `passwordHash`.
  4. **Backward Compatibility:** If an existing record has `passwordHash` (string) without `salt`, verify against the raw hash. Upon successful authentication, transparently upgrade the record to the salted PBKDF2 format.
* **Verification:**
  * Automated test: Verify new accounts get unique salts, identical passwords produce distinct stored hashes, and legacy unsalted records auto-upgrade seamlessly.

---

### [ ] Step 5: Ephemeral Session Tokens (Eliminate Per-Request Password Hashes)
* **Goal:** Stop transmitting password hashes on active periodic syncs (`saveDeferred` every few seconds).
* **Files to Modify:**
  * [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js), [`js/services/StorageService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/StorageService.js)
* **Implementation Details:**
  1. Add `POST /api/player/login` endpoint that accepts `{ playerId, passwordHash }`.
  2. If valid, server generates an ephemeral session token: `crypto.randomBytes(32).toString('hex')` with 30-day expiration.
  3. Server stores token map in memory (or `data/sessions.json`): `{ token: { playerId, expiresAt } }`.
  4. `POST /api/player/sync` accepts `Authorization: Bearer <token>` or `{ sessionToken }`.
  5. Password hash is only transmitted once during login or password changes.
* **Verification:**
  * Automated test: Login produces token, subsequent syncs succeed using token alone, expired/invalid tokens return 401 Unauthorized.

---

### [ ] Step 6: Collision-Resistant 8-Character Player ID Architecture
* **Goal:** Increase ID entropy to eliminate birthday collision risks.
* **Files to Modify:**
  * [`js/services/StorageService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/StorageService.js), [`index.html`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/index.html), [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js)
* **Implementation Details:**
  1. Update `StorageService.generateUniqueUserId()` to produce 8 characters with a hyphen: `#XXXX-XXXX` ($30^8 = 6.5 \times 10^{11}$ combinations).
  2. Adjust HTML input `maxlength` from `7` to `10`.
  3. Update `ID_REGEX` on server to accept 4 to 10 characters (`/^#[23456789ABCDEFGHJKLMNPQRSTUVWXYZ-]{4,10}$/`).
  4. Preserve full backward compatibility for existing 4-character accounts.
* **Verification:**
  * Test generation format, restore with both legacy `#XXXX` and new `#XXXX-XXXX` formats.

---

### [ ] Step 7: Save State Schema Validation & Numeric Bounds Enforcement
* **Goal:** Prevent clients from injecting corrupted or astronomically manipulated save data (e.g. `cores: 1e99`, `NaN`, negative high scores).
* **Files to Modify:**
  * [`scripts/serve.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/scripts/serve.js)
* **Implementation Details:**
  1. Define explicit schema bounds:
     * `highScore`: positive finite integer, max 500,000.
     * `cores`: positive finite integer, max 1,000,000.
     * `hyperCrystals`: positive finite integer, max 1,000.
     * `selectedShip`, `selectedTrail`, `selectedTheme`: must be one of predefined registered asset keys in `Constants.js`.
  2. Clamp or reject out-of-bound state fields before saving to `playersStore`.
* **Verification:**
  * Automated test: Attempting to save `cores: 999999999` or `highScore: "invalid"` gets clamped or rejected.

---

### [ ] Step 8: Local TLS / HTTPS Transport Support for Mobile Dev
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
