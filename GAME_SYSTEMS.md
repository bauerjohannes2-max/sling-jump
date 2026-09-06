# Sling Jump - Game Systems & Technical Specification Manual

> Live Version: 5.17.0 | Architecture: Decoupled Vanilla Canvas 2D Engine | Standard: Zero GC, 60+ FPS

---

## 1. Core Loop & Input Mechanics

### 1.1 Game Loop Flow
1. **Idle/Menu:** Ambient starfield drift (34 px/s vertical parallax).
2. **Launch:** Player taps `START` -> Ship launches upward from platform.
3. **Grapple Hook:** Tap & hold -> Ship casts tether to nearest valid anchor node within reach (`radius <= 285px`).
4. **Slow-Motion Orbit:** Slow-mo (`timeScale = 0.35`) activates during hold. Ship enters circular orbit (`orbitRadius = 65px`, `orbitSpeed = 420 px/s`). Audio low-pass ducks to 650 Hz.
5. **Slingshot Release:** Tap release -> Tether snaps, `timeScale` snaps instantly to `1.0` (zero-latency launch). Tangential velocity vectors:
   $$v_x = \cos(\theta) \cdot v_{\text{impulse}}, \quad v_y = \sin(\theta) \cdot v_{\text{impulse}}$$
6. **Ascent & Void Hazard:** Screen scrolls upward. Red Void rises from bottom. Missing an anchor or hitting the Void triggers Game Over.

### 1.2 Mathematical Reach Solver
- **Catch Radius:** 285 px.
- **Node Spacing:** 160 px (Zone 1) to 320 px (Zone 7). Minimum buffer > 140 px guarantees 100% mathematical solvability on any generated seed.

---

## 2. Apex Combos & Dynamic Speed Scaling

### 2.1 90° Vertical Slingshot Precision
- Releases within $\pm 15^\circ$ of pure vertical upward flight ($\theta \in [-105^\circ, -75^\circ]$) trigger **PERFEKT / 90° SLINGSHOT**.
- Increments `slingshotCombo` by +1 up to Combo x10.
- Releases outside the apex window reset the combo counter to 0.

### 2.2 Combo Tier Multiplier Matrix
| Combo Tier | Speed Multiplier | Velocity Impulse Bonus | State / Visual FX |
| :---: | :---: | :---: | :--- |
| **Combo 1** | 1.00x | +0 px/s | Base flight, clean trail |
| **Combo 2** | 1.10x | +70 px/s | Cyan glow pulse |
| **Combo 3** | 1.20x | +140 px/s | Purple energetic particles |
| **Combo 4** | 1.30x | +210 px/s | Dynamic floating text |
| **Combo 5** | 1.42x | +280 px/s | **Hyper State** (Screen shake + chromatic trail) |
| **Combo 6** | 1.50x | +330 px/s | Dual particle jets |
| **Combo 7** | 1.60x | +380 px/s | Neon saturation boost |
| **Combo 8** | 1.70x | +430 px/s | High-frequency wake |
| **Combo 9** | 1.85x | +500 px/s | Near-hyperspace aura |
| **Combo 10** | 2.00x | +600 px/s | **Apex Hyperdrive** (Double base impulse) |

---

## 3. World Generation & 7-Zone Difficulty Matrix

Procedural generation (`WorldManager.js`) scales density, node types, and lethal hazards across 7 altitude zones:

| Zone | Altitude Range | Standard | Super-Boost | Moving | Fragile | Decoy | Hazard Mine | Gap Range | Challenge Profile |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Zone 1: Kalibrierung** | 0 – 250 m | 90% | 0% | 10% | 0% | 0% | 0% | 160 – 205 px | Wide gaps, gentle pendulum motion |
| **Zone 2: Erdorbit** | 250 – 750 m | 65% | 5% | 22% | 8% | 0% | 0% | 175 – 225 px | Early fragile nodes introduced |
| **Zone 3: Stratosphäre** | 750 – 2,000 m | 44% | 5% | 28% | 20% | 3% | 0% | 195 – 250 px | Tactical clock timers & decoys |
| **Zone 4: Mesosphäre** | 2,000 – 5,000 m | 34% | 4% | 30% | 26% | 6% | 0% | 215 – 270 px | Wide leaps, active pendulums |
| **Zone 5: Thermosphäre** | 5,000 – 9,000 m | 26% | 3% | 30% | 34% | 7% | ~6% | 230 – 290 px | High speed, space mines appear |
| **Zone 6: Tiefraum** | 9,000 – 14,000 m | 20% | 2% | 30% | 40% | 8% | ~10% | 240 – 305 px | Dense mines, rare crystals (>=8,000m) |
| **Zone 7: Meister-Kosmos** | 14,000 m+ | 16% | 2% | 30% | 44% | 8% | ~10% | 250 – 320 px | 74% dynamic nodes, maximum reach |

---

## 4. Entity Taxonomy & Behavioral Mechanics

### 4.1 Node Types
- **STANDARD (Anchor):** Solid cyan vector node. Permanent tether anchor.
- **SUPER_BOOST:** Magenta node. Grants 1.45x launch velocity impulse + 2.0s hazard mine immunity.
- **MOVING:** Horizontal sine wave oscillation:
  $$x(t) = x_0 + \sin(t \cdot \omega) \cdot A, \quad \omega \in [1.2, 2.4], \; A \in [45, 90]\text{px}$$
- **FRAGILE (Zeituhr):** 1.5s radial collapsing countdown ring. Shatters into shards on expiry or launch.
- **FISSURE / DECOY:** Glitched amber node. Shatters immediately upon grapple contact; requires instant recovery jump.
- **HAZARD_MINE:** Red pulsing spike orb. Lethal on ship collision unless protected by Super-Boost or Revive Shield.

### 4.2 Collectibles & Currencies
- **Credits (Common / Utility):** Stamped bullion coins with beveled rim, recessed contrast well, and precision-centered Rajdhani 'C' glyph matching the main menu SVG standard. Spawn in parabolic flight corridors. Primary currency for hangar unlocks. Value: 1 Credit = +10 score points. Rendered via zero-GC pre-rendered offscreen sprite cache (`EnergyOrb.cache['CREDIT_SPRITE']`, 72x72 supersampled 2x from 36x36 SVG standard) with radial glow buffer.
- **Sparks (Rare / Quantum / Revive):** Faceted 8-point prismatic stars with light refractions, depth shading, nucleus pip, and slow radial rotation, spawning in Zone 6+ (>= 8,000m). Used exclusively for Quantum Revives (cost: 1 Spark). Rendered via pre-rendered offscreen sprite cache (`EnergyOrb.cache['SPARK_SPRITE']`, 56x56) with quantum aura buffer.

---

## 5. Economy, Hangar & Quest Progression

### 5.1 Progression Assets
- **Ships:**
  - `dart` (Delta Dart): Default starter vessel. High agility.
  - `phoenix` (Phönix): Premium vector skin. Unlocked for 250 Credits.
- **Trails:** `neon_cyan` (starter), `crimson_flame`, `violet_plasma`.
- **Themes:** `deep_space` (default), `cyber_grid`, `solar_flare`.

### 5.2 Quests (Missions)
- **Daily Quests (3 active per 24h cycle):**
  1. `3.000m in einem Flug` (`altitude_single`, target: 3000, reward: 200 Credits)
  2. `25 Münzen sammeln` (`cores_cumulative`, target: 25, reward: 175 Credits)
  3. `5 Katapulte nutzen` (`boost_cumulative`, target: 5, reward: 200 Credits)
- **Weekly Quests (3 active per 7-day cycle):**
  1. `30.000m insgesamt` (`altitude_cumulative`, target: 30000, reward: 1500 Credits)
  2. `80 Münzen sammeln` (`cores_cumulative`, target: 80, reward: 1200 Credits)
  3. `5er-Combo schaffen` (`combo_single`, target: 5, reward: 1400 Credits)
- **Tracking Engines:**
  - `MissionManager.onCombo(comboLevel)` hooked directly into `GameEngine.js` launch callback.
  - `MissionManager.onSuperBoostUsed()` tracks both single-run and cumulative catapult launches.
  - `MissionManager.onRunFinished(totalAltitude)` accumulates lifetime meters into weekly marathon objectives.

---

## 6. Quantum Revive Engine

### 6.1 Mechanics
- On death with $\ge 1$ Spark: Player can trigger **ZWEITE CHANCE**.
- Consumes 1 Spark (`storage.data.hyperCrystals -= 1`).
- **Safe Repositioning:** Camera smoothly centers above death void:
  $$\text{cameraY} = \text{targetAnchor.y} - \text{viewportHeight} \cdot 0.58$$
- **Instant Hook:** Spaceship is automatically locked into upward orbit on the nearest safe anchor:
  $$\text{orbitRadius} = 65\text{px}, \quad \text{orbitSpeed} = 420\text{px/s}, \quad v_x = 0, \; v_y = 0$$
- **Invulnerability Shield:** 2.5s golden kinetic barrier protects against space mines and immediate re-fall.

---

## 7. UI, Leaderboard & Dock Architecture

### 7.1 Leaderboard Dock Icon & Dynamic Overlay
- **Dock Button (`#btn-menu-leaderboard`):** Minimalist SVG trophy icon in the bottom floating dock.
- **Unranked State (`bestAltitude <= 0`):**
  - **No overlay:** `#rank-pill-badge` is hidden (`display: none;`). The trophy icon is completely clean without any `#` badge.
- **Ranked State (`bestAltitude > 0`):**
  - Once the player completes their first flight and achieves meters, `UIManager.getPlayerRankNumber()` calculates placement against the deduplicated Global Top-100.
  - `#rank-pill-badge` dynamically appears as a glowing gold pill displaying `#${rank}` (e.g. `#1`, `#42`).

### 7.2 Leaderboard Modal
- Accessible via dock button. Displays Global Top-100 contender runs (deduplicated: 1 entry per pilot).
- Sticky player card at bottom:
  - If unranked: Displays `#---` with message "Absolviere einen Flug zur Wertung".
  - If ranked: Displays `#${rank}` with verified altitude in meters.

### 7.3 Front-Tab Modal Layering & Mission Tab Architecture
- Secondary overlays (`SETTINGS`, `STATS`, `LEADERBOARD`, `QUESTS`, `TUTORIAL`) render directly before the active main menu (`backdrop-filter: blur(16px)`).
- Dynamic gameplay nodes are hidden during menu/modal states to preserve background starfield clarity.
- **Mission Hub Architecture (`#quests-modal`):**
  - **Fixed Geometric Stability:** Enforces constant card height (`height: 580px; max-height: 88vh`) with `flex: 1; min-height: 0;` on `.quests-scroll-area`. Guarantees zero height-jumping or layout flutter when toggling category filters (`ALLE`, `TÄGLICH`, `WÖCHENTLICH`).
  - **Floating-Dock Glassmorphism Parity:** Mission cards (`.quest-card`) match the bottom navigation dock (`background: rgba(255, 255, 255, 0.035)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `backdrop-filter: blur(16px)`). Left accent bar (`::before`), mission icons, and redundant tags (`TAG` / `WOCHE`) stripped for commercial arcade minimalism. Redundant top overview banner removed to maximize vertical space for quest objectives.

### 7.4 Flight Debrief (Death Screen) Trajectory & Crash Reticle
- **Trajectory Spline Coincidence:** In `UIManager.updateDebriefTrajectory()`, procedural ascent curve applies an envelope $\sin(t \cdot \pi)$ to horizontal sway, guaranteeing that at $t = 1$ the spline coordinate mathematically equals the true crash point $(x_{\text{crash}}, y_{\text{crash}})$.
- **Tactical Impact Reticle:** Vector marker `#debrief-crash-pos` bound precisely to `endPoint = points[points.length - 1]`. Features high-contrast shockwave, 4 tactical corner pips, carmine outer cross (`#e11d48`), and glowing white inner cross (`#ffffff`). Origin centered at `0 0` with zero subpixel drift.
- **Debrief Body Vertical Elevation (`.debrief-body`):** Elevated by `translateY(-56px)` on desktop and tablet displays (with media queries `-20px` at $\le 740\text{px}$ height and `-8px` at $\le 620\text{px}$). Encompasses hero altitude score, chase progress bar, telemetry grid, and loot badges, establishing optical balance with the left trajectory telemetry rail (top tick $y \approx 138\text{px}$).

### 7.5 Settings Modal Architecture
- **Outer Shell Parity:** `.settings-modal-card` matches `.missions-modal-card` (`background: #0b0d13 !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9);`).
- **Floating-Dock Glassmorphism Parity:** Each setting row (`.setting-row`) mirrors `.floating-dock` (`background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; backdrop-filter: blur(16px); padding: 14px 18px;`).
- **Toggles & Actions:** `.btn-toggle` switches between active crimson glow (`rgba(225, 29, 72, 0.22)`) and translucent idle glass (`rgba(255, 255, 255, 0.04)`). Action buttons (`.btn-settings-update`, `.btn-settings-danger`) adopt unified glassmorphic pill aesthetics with responsive mobile scaling.

### 7.6 Profile Hub Architecture
- **Outer Shell Parity:** `.profile-modal-card` matches `.settings-modal-card` (`background: #0b0d13 !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9);`).
- **Floating-Dock Glassmorphism Parity:** Internal cards (`.profile-hero-card`, `.profile-edit-card`, `.profile-telemetry-card`) mirror `.floating-dock` (`background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; backdrop-filter: blur(16px);`).
- **Short User ID Architecture:** Generates 4-character uppercase alphanumeric IDs with hash prefix (`#XXXX`, e.g. `#EXGN`, `#8K2P`), replacing legacy long hash strings. Automatically migrates legacy IDs.
- **2x Free Name Change Allowance:** Persistent tracking via `profile.nameChanges`. Up to 2 free renames allowed (`MAX_FREE_CHANGES = 2`). Form dynamically reflects remaining quota (`2 KOSTENLOSE ÄNDERUNGEN VERFÜGBAR`, `1 KOSTENLOSE ÄNDERUNG VERFÜGBAR`, `NAME FESTGELEGT (0 ÄNDERUNGEN ÜBRIG)`). Input and submit button disable cleanly upon depletion.
- **Career Telemetry Card:** 3-column stats panel presenting lifetime Bestleistung, Flüge, and active pilot status.

---

## 8. Audio System Architecture

- **Engine (`AudioManager.js`):** Dual-tier Web Audio API structure.
  - **Tier 1 (Decoded Buffers):** `bgm_menu.mp3` (95 BPM), `bgm_gameplay.mp3` (128 BPM), `bgm_gameover.mp3` (80 BPM). Low-pass ducking filter (650 Hz in slow-mo). Pitch-ramp multipliers on combo chains.
  - **Tier 2 (Synthesizer Fallback):** Real-time multi-oscillator Web Audio synthesis if sound files fail to load or offline.

---

## 9. Engine Performance & Hardware Guardrails

### 9.1 Zero GC Frame Budget
- Pre-allocated Float32Array and typed buffers for particles and telemetry. Zero heap allocations inside `requestAnimationFrame`.
- Average JS execution budget: $\le 0.5\text{ms}$ per frame (out of $16.6\text{ms}$).

### 9.2 Debounced Persistence
- In-flight events (coin pickups, combos, altitudes) debounce storage writes by $\ge 1500\text{ms}$ (`saveDeferred`).
- Synchronous `localStorage.setItem()` writes are strictly limited to Game Over, revive, or shop transactions.

### 9.3 In-Game Telemetry Counter
- `Float32Array(30)` rolling delta ring buffer. Updates every 160ms with dynamic color grading:
  - $\ge 90\text{ FPS}$: Cyan (`#38bdf8`)
  - $\ge 55\text{ FPS}$: Emerald (`#10b981`)
  - $\ge 42\text{ FPS}$: Amber (`#fbbf24`)
  - $< 42\text{ FPS}$: Carmine (`#e11d48`)

---

## 10. Typography & Visual Rendering Standard

### 10.1 Typography Architecture
- **Numbers / Metrics / Counters / Currencies / Timers:** `Orbitron:wght@500;700` (`'Orbitron', monospace, sans-serif`). Enforced with `font-variant-numeric: tabular-nums` to eliminate layout jitter.
- **Text / UI / Menus / Buttons / Profile / Labels:** `Rajdhani:wght@500;600;700` (`'Rajdhani', sans-serif`). Clean geometric sans-serif with tracked uppercase styling.
- **Main Game Title ("SPACE JUMP"):** Modern aerospace dual-bevel logo lockup (`.title-lockup`) using `Oxanium:wght@800;900` (`'Oxanium', sans-serif`).
  - Slanted kinetic forward thrust (`transform: skewX(-10deg)`).
  - `SPACE`: High-brightness white text with letter spacing `0.26em` and extruded bottom shadow `0px 4px 0px #0f172a`.
  - `JUMP`: Chamfered outer frame (`.casing-frame`) with rose-to-burgundy gradient rim and black drop shadow (`0 6px 0 #000000`), housing inner crimson plate (`.casing-plate`, `#e11d48`) and bold white lettering with dark crimson extruded shadow (`0px 4px 0px #881337`).
- **Canvas Rendering Synchronization:** All canvas-rendered text and sprites await `document.fonts.ready` before rasterizing offscreen buffers.

### 10.2 Main Menu Currency Pill & Map Collectibles
- **Main Menu Currencies:** Minimalist lockup below logo displaying bullion Credit coin (featuring Rajdhani 'C') and 8-point quantum Spark star without text labels ("CREDITS" / "SPARKS" stripped) for maximum arcade minimalism.
- **In-Game Canvas Bullion (`EnergyOrb.js`):** Offscreen sprite rasterizer computes exact optical ink bounding box via `measureText('C')`:
  $$\text{drawX} = cx + \frac{\text{actualBoundingBoxLeft} - \text{actualBoundingBoxRight}}{2}$$
  $$\text{drawY} = cy + \frac{\text{actualBoundingBoxAscent} - \text{actualBoundingBoxDescent}}{2}$$
  Guarantees equal margins across all 4 quadrants inside the in-game gold coin core (within 1.0px discrete raster symmetry). Blurry outer orange glow (`COIN_GLOW`) removed from in-game collectibles to establish 100% visual parity with the crisp, beveled bullion coin in the main menu.

### 10.3 Mission Modal Card Architecture & Dock Parity
- **Container Styling (`.missions-modal-card`):**
  - Solid dark obsidian fill: `background: #0b0d13 !important;` (zero background bleed-through, zero glassmorph)
  - Subtle hairline boundary: `border: 1px solid rgba(255, 255, 255, 0.08) !important;`
  - Rounded geometry: `border-radius: 24px;`
  - High-depth aerospace shadow: `box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9), 0 0 1px rgba(255, 255, 255, 0.1);`
- **Fixed Height Geometry:** Strict height of `580px` (`max-height: 88vh`) with `display: flex; flex-direction: column;` prevents height jumps between tabs (`ALLE`, `TÄGLICH`, `WÖCHENTLICH`).
- **Internal Card Hierarchy (`.quest-card`):**
  - Floating-dock parity fill: `background: rgba(255, 255, 255, 0.035); backdrop-filter: blur(16px);` (exact match to main menu `.floating-dock`)
  - Hairline border: `border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px;`
  - Category tabs container: `background: #0e121b; border: 1px solid rgba(255, 255, 255, 0.08);`
  - Header: Left-aligned title (`14px` bold pure white `#ffffff`), top-right reward text (`+ ... C` in `Orbitron:wght@800` gold `#fbbf24` with vector bullion coin).
  - Clean description (`12.5px`, `#94a3b8`) followed by full-width progress bar and status actions.
  - Zero emojis across all cards, tabs, and headers.

### 10.4 Profile Modal & Cross-Device Cloud Sync Architecture
- **Container & Card Parity (`.profile-modal-card`):**
  - Solid `#0b0d13` base with 24px border radius and `rgba(255, 255, 255, 0.08)` border.
  - Floating-dock internal cards (`rgba(255, 255, 255, 0.035)`, 16px blur) for `.profile-hero-card`, `.profile-edit-card`, and `.profile-sync-card`.
- **Short User ID Architecture:** 4-character uppercase alphanumeric identifier with hash prefix (`#XXXX`, e.g. `#EXGN`). Automatically generated on initial session start; legacy IDs auto-migrated.
- **Name Change Policy:** 2 free name changes (`MAX_FREE_CHANGES = 2`). Notice banner is optically centered vertically and horizontally inside the status box (`display: flex; align-items: center; justify-content: center;`). Form locks upon exhaustion.
- **Cross-Device Cloud Sync & Recognition:**
  - `POST /api/player/sync`: Ingests and merges player game state in `data/players.json`.
  - `GET /api/player/:id`: Returns verified cloud state by player ID.
  - Zero-friction link sharing: Clicking "SPIELSTAND-LINK KOPIEREN" copies `?id=XXXX`. When opened on any browser or mobile device, state is automatically restored on initial page load.
  - Manual ID load: Players can enter any `#XXXX` code and click "LADEN" to restore progress immediately.

### 10.5 Tutorial Modal Architecture
- **Commercial Minimalism:** 100% text-driven guide (Alto's Adventure style) replacing legacy video/canvas loops. Zero CPU/GPU animation overhead.
- **Floating-Dock Cards:** 3 sequential cards (`01 / HALTEN` - Gravitations-Anker, `02 / ROTIEREN` - Orbit-Schwung, `03 / KATAPULTIEREN` - Apex-Launch).
- **CTA:** Single primary button `VERSTANDEN` with karminrot glow.

### 10.6 Leaderboard Modal Architecture
- **Outer Shell Parity:** `.leaderboard-modal-card` uses `#0b0d13` solid dark base, `1px solid rgba(255, 255, 255, 0.08)` hairline border, `24px` radius, and aerospace elevation shadow (`box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9)`).
- **Rigid Height Geometry:** Fixed height of `580px` (`max-height: 88vh` desktop, `560px` / `90vh` mobile) with `display: flex; flex-direction: column;` and `flex: 1; min-height: 0;` internal scroll area. Eliminates height jumps or dynamic bouncing when player counts vary.
- **Hero Standing Placement:** `.leaderboard-hero-card` positioned immediately below the header lockup at eye level. Prominently highlights the player's personal badge (e.g. `#2`), rank title (`RANG #2 • GLOBAL (TOP 100)`), personal best score (`4.820 m`), and uppercase status pill (`DEIN RANG`).
- **Podium & Row Polish:** Sleek micro-typography column header (`RANG`, `PILOT`, `REKORD`). Dynamic podium medal glow (Gold `#1`, Silver `#2`, Bronze `#3`), bold active player row highlight (`.player-entry`), and ultra-thin custom scrollbars.

### 10.7 Stats Modal Architecture
- **Outer Shell:** `.stats-modal-card` with stiff `height: 580px; max-height: 88vh;`, `#0b0d13` base, `24px` radius. Matches leaderboard and missions modals.
- **Hero Record Card:** `.stats-hero-card` with crimson accent border (`rgba(225, 29, 72, 0.35)`), SVG trend-up icon in crimson badge, bold Orbitron personal best value.
- **Stat Grid:** `.stats-grid-list` 2-column grid containing 10 `.stats-tile` cards: Geflogene Distanz, Gespielte Runden, Beste Combo, Gesammelte Coins, Gesammelte Sparks, Durchschn. Höhe, Slingshots, Near Misses, Missionen, Wiederbelebungen.
- **Tiles:** Floating-dock fill (`rgba(255, 255, 255, 0.035)`), `backdrop-filter: blur(16px)`, `14px` radius, hover lift micro-animation.

### 10.8 Cross-Device Password Authentication
- **Client-Side Hashing:** `StorageService.setPassword(plainText)` hashes via `crypto.subtle.digest('SHA-256', ...)` (Web Crypto API). Stored as hex string in `playerProfile.passwordHash`.
- **Sync Flow:** `syncToCloud()` includes `passwordHash` in POST payload. Server stores alongside player record in `players.json`.
- **Restore Validation:** `restoreFromCloud(id, password)` hashes password client-side, sends as `?pw=hash` query param. Server validates against stored hash. Returns 403 `FALSCHES PASSWORT` on mismatch.
- **UI:** Profile sync card shows password status badge, set/remove buttons. Load section includes password input field.

### 10.9 Tutorial Modal Text
- 3 monochrome step cards with Orbitron numbered badges (01, 02, 03):
  1. Halte den Bildschirm gedrückt, um dich an einem Knoten einzuklinken.
  2. Lasse im richtigen Winkel los, um an Höhe zu gewinnen.
  3. Im 90-Grad-Winkel bekommst du einen extra Boost.
