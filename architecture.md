# Sling Jump - Codebase Architecture Map

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
| [`js/services/AnalyticsService.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/services/AnalyticsService.js) | Telemetry service tracking run starts, deaths, currencies, and milestone metrics to local storage. |
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
