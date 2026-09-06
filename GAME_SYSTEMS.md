# Sling Jump - Game Systems & Technical Specification Manual

> Live Version: 5.10.0 | Architecture: Decoupled Vanilla Canvas 2D Engine | Standard: Zero GC, 60+ FPS

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
- **Credits (Common / Utility):** Stamped bullion coins with beveled rim, recessed contrast well, and precision-centered Rajdhani 'C' glyph. Spawn in parabolic flight corridors. Primary currency for hangar unlocks. Value: 1 Credit = +10 score points. Rendered via zero-GC pre-rendered offscreen sprite cache (`EnergyOrb.cache['CREDIT_SPRITE']`, 48x48) with radial glow buffer.
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
- **Daily Quests:** 3 active per 24h reset cycle (e.g. reach 350m, collect 12 credits, perform 3 boosts). Reward: 15–30 Credits.
- **Weekly Quests:** 2 active per 7-day reset cycle (e.g. 8,000m cumulative altitude, 100 credits). Reward: 75–150 Credits + 1 Spark.

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

### 7.3 Front-Tab Modal Layering
- Secondary overlays (`SETTINGS`, `STATS`, `LEADERBOARD`, `QUESTS`, `TUTORIAL`) render directly before the active main menu (`backdrop-filter: blur(16px)`).
- Dynamic gameplay nodes are hidden during menu/modal states to preserve background starfield clarity.

### 7.4 Flight Debrief (Death Screen) Trajectory & Crash Reticle
- **Trajectory Spline Coincidence:** In `UIManager.updateDebriefTrajectory()`, procedural ascent curve applies an envelope $\sin(t \cdot \pi)$ to horizontal sway, guaranteeing that at $t = 1$ the spline coordinate mathematically equals the true crash point $(x_{\text{crash}}, y_{\text{crash}})$.
- **Tactical Impact Reticle:** Vector marker `#debrief-crash-pos` bound precisely to `endPoint = points[points.length - 1]`. Features high-contrast shockwave, 4 tactical corner pips, crimson outer cross (`#ff1e42`), and glowing white inner cross (`#ffffff`). Origin centered at `0 0` with zero subpixel drift.

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
  - $< 42\text{ FPS}$: Crimson (`#ef4444`)
