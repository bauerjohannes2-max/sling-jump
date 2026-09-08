# Space Jump - Codebase Architecture Map

> **Protocol:** Map First. Read this file before grepping or scanning any `.js` or `.css` files. Never dump full JS files into context.

---

## 1. Core File Manifest & Responsibilities

| File Path | Primary Responsibility |
| :--- | :--- |
| [`js/main.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/main.js) | Bootstraps application, registers services, wires DOM events, and instantiates the game engine. |
| [`js/config/Constants.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/config/Constants.js) | Global immutable configuration defining physics constants, score values, ship/trail catalogs, and audio configs. |
| [`js/engine/GameEngine.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/GameEngine.js) | Master engine orchestrating 60 FPS loop, physics integration, collision detection, camera tracking, and run lifecycles. |
| [`js/engine/InputManager.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/InputManager.js) | Normalizes multi-touch, mouse, and keyboard inputs into unified action events (`down`, `held`, `up`). |
| [`js/engine/MissionManager.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/MissionManager.js) | Evaluates daily/weekly quest criteria, tracks in-flight progression metrics, and disburses rewards. |
| [`js/engine/ParticleSystem.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/ParticleSystem.js) | Pre-allocated zero-GC particle system rendering engine plumes, shockwaves, floating text, and shards. |
| [`js/engine/ShopManager.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/ShopManager.js) | Manages cosmetic skin and trail purchases, unlock validations, and active loadout state. |
| [`js/engine/StateManager.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/StateManager.js) | Finite State Machine managing transitions between Menu, Playing, Paused, GameOver, and Hub modals. |
| [`js/engine/UIManager.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/UIManager.js) | Updates HUD elements, handles modal visibility, displays toasts, and renders reactive UI components. |
| [`js/entities/EnergyOrb.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/entities/EnergyOrb.js) | In-world collectible entity representing collectable Credits (golden cores) and rare Sparks (quantum crystals). |
| [`js/entities/Node.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/entities/Node.js) | Celestial anchor entity (`OrbitNode`) implementing Standard, Boost, Moving, Fragile, Decoy, and Hazard behaviors. |
| [`js/entities/Spaceship.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/entities/Spaceship.js) | Player avatar handling orbital momentum, slingshot release dynamics, collision boundaries, and vector graphics. |
| [`js/audio/AudioManager.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/audio/AudioManager.js) | Web Audio API sound controller managing procedural audio synthesis, sound effects, and music ducking. |
| [`js/services/CloudBackend.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/CloudBackend.js) | Pluggable cloud storage adapter interface decoupling persistence from serve.js (LocalNodeAdapter, SupabaseAdapter). |
| [`js/services/StorageService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/StorageService.js) | Persistent state manager persisting profile, scores, inventory, and leaderboards with debounced writes. |
| [`js/world/WorldManager.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/world/WorldManager.js) | Procedural world generator constructing ascending anchor trajectories, difficulty curves, and starfields. |

---

## 2. Game Loop & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                  MAIN LOOP (60 FPS)                              |
|                                                                                   |
|  [InputManager] ---> [GameEngine.update] ---> [Spaceship.update]                  |
|                             |                         |                           |
|                             v                         v                           |
|                   [WorldManager.generate]    [Orbit/Physics Solve]                |
|                             |                         |                           |
|                             v                         v                           |
|                   [Collision & Bounds]       [Camera Upward Follow]               |
|                             |                         |                           |
|                             +------------+------------+                           |
|                                          |                                        |
|                                          v                                        |
|                             [ParticleSystem.update]                               |
|                                          |                                        |
|                                          v                                        |
|                         [Render Canvas & UIManager.HUD]                           |
+-----------------------------------------------------------------------------------+
```

### Execution Flow
1. **Delta Time Clamp:** Frame delta is computed and strictly clamped (`dt <= 0.033s`) in `GameEngine.update` to guarantee tunneling protection.
2. **Input Processing:** `InputManager` captures touch/click states. If held within range of an `OrbitNode`, `Spaceship.tryHook` captures the ship into an orbit.
3. **Physics & Momentum:** Releasing input triggers `Spaceship.releaseHook`, converting circular angular momentum into directional tangential velocity with combo multipliers.
4. **World Generation:** As player climbs, `WorldManager.generateUpTo` dynamically populates procedural nodes ahead of the camera based on altitude zone difficulty.
5. **Score & Persistence:** Altitude meters (`maxAltitudeMeters`) increment relative to start baseline. On game over or purchase, `StorageService` commits state with debounced writes (1500ms delay during active flight; synchronous on game over).

---

## 3. Typography & Visual Standards

- **Two-Font System & Title Branding:**
  - **Metrics / Numbers:** `'Orbitron', monospace, sans-serif` (`--font-numbers`), configured with tabular numerals (`tabular-nums`) for scores, meters, currencies, combos, and counters.
  - **General UI / Text:** `'Rajdhani', sans-serif` (`--font-ui`) for labels, buttons, modals, profile names, callouts, and onboarding guides.
  - **Main Game Title ("SPACE JUMP"):** Modern aerospace dual-bevel logo lockup (`.title-lockup`) using `'Oxanium', sans-serif; 900` with kinetic shear (`transform: skewX(-10deg)`).
    - `SPACE`: High-brightness white text with letter spacing `0.26em` and extruded bottom shadow `0px 4px 0px #0f172a`.
    - `JUMP`: Chamfered outer frame (`.casing-frame`) with rose-to-burgundy gradient rim and black drop shadow (`0 6px 0 #000000`), housing inner crimson plate (`.casing-plate`, `#e11d48`) and bold white lettering with dark crimson extruded shadow (`0px 4px 0px #881337`).
- **Asset Rendering & Currencies:**
  - Zero generic fallback fonts (`Inter`, `Montserrat`, `Sora`, `Segoe UI`, `Arial` removed).
  - Main menu currency pill features restored bullion coin (with Rajdhani 'C') and 8-point quantum spark, stripped of text labels ("CREDITS" / "SPARKS") for commercial arcade minimalism.
  - In-game bullion coin (`EnergyOrb.js`) is 100% visually synchronized with main menu SVG (outer beveled rim, specular ring, dark recessed well, zero blurring halo). Offscreen sprite rasterizer dynamically computes mathematical glyph center via `measureText('C')` ($\Delta y = (\text{actualAscent} - \text{actualDescent}) / 2$) and hooks into `document.fonts.load('700 46px "Rajdhani"')` & `document.fonts.ready` to guarantee perfect discrete raster centering.
- **Harmonized Title Red Palette (`#e11d48`):**
  - Project-wide red theme synchronized to the title plate `#e11d48` across CSS variables (`--accent-crimson`, `--danger`, `--btn-crimson-*`), buttons, ship chevrons, mine entities, collision shards, death laser horizon, and debrief reticle.
- **Mission Hub Architecture (`#quests-modal`):**
  - Rigid height geometry (`580px`, `flex: 1; min-height: 0;` scroll area) guarantees absolute stability with zero height shifting across category filter changes (`ALLE`, `TÄGLICH`, `WÖCHENTLICH`).
  - Solid dark modal base (`#0b0d13` modal fill, `1px solid rgba(255, 255, 255, 0.08)` border) with floating-dock parity fill (`rgba(255, 255, 255, 0.035)`, `backdrop-filter: blur(16px)`) applied to `.quest-card`.
  - Minimalist direct category filter navigation (`ALLE`, `TÄGLICH`, `WÖCHENTLICH`) positioned directly below title lockup without redundant progress header bar for maximum vertical space and clarity.
- **Profile Hub Architecture (`#profile-modal`):**
  - Solid dark modal base (`#0b0d13` modal fill, `1px solid rgba(255, 255, 255, 0.08)` border, `24px` radius) with floating-dock parity fill (`rgba(255, 255, 255, 0.035)`, `backdrop-filter: blur(16px)`) across all internal cards (`.profile-hero-card`, `.profile-edit-card`, `.profile-sync-card`).
  - **Collision-Resistant 8-Character Player ID Architecture:** Generates 8-character uppercase Crockford Base32 IDs with hyphen and hash prefix (`#XXXX-XXXX`, e.g. `#8K2P-9J7M`, $30^8 \approx 6.5 \times 10^{11}$ combinations) eliminating birthday collision risks while preserving full backward compatibility with legacy 4-character accounts (`#XXXX`).
  - **2x Free Name Change Policy:** Players receive 2 free name changes (`MAX_FREE_CHANGES = 2`) tracked persistently in `StorageService`, with reactive centered status badges ("NOCH 2 NAMENSÄNDERUNGEN VERFÜGBAR") and input locking upon exhaustion.
  - **Cross-Device Cloud Sync Architecture:**
    - Seamless 0-click onboarding: `POST /api/player/sync` and secure `POST /api/player/restore` (with legacy `GET /api/player/:id` fallback) persisted in `data/players.json`.
    - One-click shareable link (`?id=XXXX`) auto-loads user profile across browsers and devices on boot.
    - **Hardened Authentication & Sync Protection:** Enforces strict password validation with `crypto.timingSafeEqual` before allowing save state overwrites on `POST /api/player/sync`. Credentials in restore requests are transmitted securely via `POST /api/player/restore` JSON body rather than cleartext URL query parameters. Backward compatible — unprotected accounts sync freely.
    - **Rate Limiting & Brute-Force Lockout Defense:** In-memory rate limiting throttles API endpoints to 60 req/min per IP, and enforces a 60-second lockout after 5 consecutive failed password attempts (`HTTP 429 Too Many Requests` with `Retry-After: 60`). Prevents automated enumeration of the 4-character ID space and credential dictionary attacks.
    - **CORS & Input Hardening:** Enforces strict origin whitelist (`localhost`, LAN subnets, GitHub Pages) rejecting untrusted origins with 403, limits request payloads to 100KB (`413 Payload Too Large`), validates Player ID format via regex, and sanitizes prototype-polluting keys (`__proto__`, `constructor`) from player states.
    - **Server-Side PBKDF2 Cryptographic Salting:** Derives password verification hashes on the server via `crypto.pbkdf2Sync(clientHash, salt, 100000, 32, 'sha256')` with unique 16-byte random salts per account. Server stores `{ salt, derivedHash }` in `data/players.json`, neutralizing rainbow tables against leaked client SHA-256 hashes. Transparently verifies and upgrades legacy unsalted accounts on successful auth.
    - **Ephemeral Session Tokens (Zero Per-Request Credentials):** Issues 30-day 256-bit session tokens (`crypto.randomBytes(32)`) via `POST /api/player/login` and on authenticated restore/sync. Routine active syncs transmit `Authorization: Bearer <token>` or `payload.sessionToken` with zero password hash transmission across the network. Expired or forged tokens are rejected with 401 Unauthorized.
    - **Save State Schema Validation & Numeric Bounds Enforcement:** Server sanitizes all ingested player states via `sanitizeState()` before writing to `playersStore`. Enforces strict numeric bounds (`highScore` $\le 500,000$, `cores` $\le 1,000,000$, `hyperCrystals` $\le 1,000$, `bestCombo` $\le 100$) and validates equipment identifiers (`selectedShip`, `selectedTrail`, `selectedTheme`) against registered assets in `Constants.js` to block arbitrary client-side state manipulation.
    - **Local TLS / HTTPS Transport Support:** Optional `--https` mode (`npm run start:https`) and certificate manager (`npm run certs`, `scripts/generate_certs.js`) providing encrypted transport across local Wi-Fi. Supports system-trusted certificates via `mkcert` with automatic zero-dependency Node.js ECDSA P-256 self-signed fallback, paired with an HTTP-to-HTTPS redirect server (`301 Moved Permanently`) on standard HTTP ports.
    - **Pluggable Cloud Backend Adapter Architecture:** Decouples game persistence from `serve.js` via `BaseCloudAdapter` interface implemented by `LocalNodeAdapter` (development default communicating with `serve.js`) and `SupabaseAdapter` (serverless production communicating with Supabase PostgREST endpoints using `apikey` and bearer tokens). Managed by `CloudBackend` factory supporting runtime switching (`configure('supabase', ...)`), environment auto-detection (`window.SPACE_JUMP_CLOUD_CONFIG`), and test injection with zero changes to core gameplay loops.
- **Tutorial Modal Architecture (`#tutorial-modal`):**
  - Commercial arcade minimalism (Alto's Adventure style) with solid `#0b0d13` base and floating-dock parity cards.
  - 100% text-driven guide (zero video, zero runtime canvas animation loops) with 3 monochrome step cards:
    1. `01`: Halte den Bildschirm gedrückt, um dich an einem Knoten einzuklinken.
    2. `02`: Lasse im richtigen Winkel los, um an Höhe zu gewinnen.
    3. `03`: Im 90-Grad-Winkel bekommst du einen extra Boost.
  - Minimalist crimson action button (`VERSTANDEN`).
- **Stats Hub Architecture (`#stats-modal`):**
  - Solid dark modal base (`#0b0d13` base, `1px solid rgba(255, 255, 255, 0.08)`, `24px` radius) matching Leaderboard, Settings, Profile, and Missions.
  - Rigid height geometry (`580px` desktop, `560px` mobile, `flex: 1; min-height: 0;` scroll area) ensuring zero height fluctuations.
  - Hero Record Card (`.stats-hero-card`) with crimson accent border, SVG trend icon, bold Orbitron personal best value.
  - 2-column grid of 10 stat tiles (`.stats-tile`) with floating-dock parity fill, hover micro-animations, and custom crimson scrollbar.
- **Leaderboard Hub Architecture (`#leaderboard-modal`):**
  - Solid dark modal base (`#0b0d13` base, `1px solid rgba(255, 255, 255, 0.08)`, `24px` radius, `box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9)`) matching Settings, Profile, and Missions.
  - Rigid height geometry (`580px` desktop, `560px` mobile, `flex: 1; min-height: 0;` scroll area) ensuring zero height fluctuations or layout jitter as more players populate the table.
  - Eye-level Hero Player Standing Card (`.leaderboard-hero-card` / `#player-rank-card`) positioned immediately below the header with bold Orbitron rank badge, title, personal best score, and status pill (`DEIN RANG`).
  - Sleek column header bar (`RANG`, `PILOT`, `REKORD`) and scrollable table rows with top 3 podium highlights (Gold, Silver, Bronze) and active player highlighting (`.player-entry`).
