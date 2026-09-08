# Space Jump — Architecture

Read this file first for how the pieces fit. Do not dump whole JS or CSS files into context.

| Document | Role |
| --- | --- |
| `architecture.md` | Layers, files, loop, server, PWA |
| `docs/visual-standards.md` | Fonts, palette, modal geometry |
| `GAME_SYSTEMS.md` | Physics, nodes, zones, formulas |
| `GAME_STATUS.md` | Changelog |
| `.agents/rules/standards.md` | Agent workflow (the only copy) |

There is no analytics dashboard and no telemetry ingest. The live product is the canvas game, its PWA shell, and the LAN/API server.

## Layers

| Layer | Files | Notes |
| --- | --- | --- |
| Presentation | `index.html`, `css/style.css`, `UIManager` | One HTML document, one stylesheet, one UI controller |
| Simulation | `GameEngine`, `WorldManager`, entities, `ParticleSystem` | Healthiest layer; the engine still owns run lifecycle, camera, scoring |
| Domain | `StorageService`, `ShopManager`, `MissionManager` | Shop owns purchases; storage mixes save format, cloud sync, and auth |
| Transport | `CloudBackend` (`LocalNodeAdapter`, `SupabaseAdapter`) | Local adapter matches `serve.js`; Supabase is weaker and unused by default |
| Infrastructure | `scripts/serve.js`, `sw.js`, `scripts/`, `data/` | Static + player API, service worker, JSON stores |

Dependencies should flow downward. `ParticleSystem` still reads performance mode through `window._gameEngine`.

## Files

| Path | Role |
| --- | --- |
| `js/main.js` | Bootstrap, DOM wiring, engine instance |
| `js/config/Constants.js` | Physics, catalogs, audio ids; version stamped from `package.json` |
| `js/engine/GameEngine.js` | Loop, physics, camera, run lifecycle |
| `js/engine/InputManager.js` | Touch, mouse, keyboard |
| `js/engine/MissionManager.js` | Daily/weekly quests |
| `js/engine/ParticleSystem.js` | Pre-allocated particles |
| `js/engine/ShopManager.js` | Cosmetic buys and loadout |
| `js/engine/StateManager.js` | Menu, playing, paused, game over, hub modals |
| `js/engine/UIManager.js` | HUD and modals |
| `js/entities/*` | Ship, nodes, orbs |
| `js/audio/AudioManager.js` | Web Audio |
| `js/services/StorageService.js` | Local save, profile, leaderboard |
| `js/services/CloudBackend.js` | Cloud adapters |
| `js/world/WorldManager.js` | Procedural climb |
| `index.html` | Shell, script order, cache busters |
| `sw.js` | Network-first for code, stale-while-revalidate for media, `/api/` bypassed |
| `scripts/serve.js` | Static files, player API, TLS, rate limits |
| `scripts/playwright_runner.js` | Visual suite |
| `scripts/smoke_serve.js` | HTTP smoke test |
| `data/players.json`, `data/sessions.json` | Cloud saves and session tokens |

`package.json` is the version source. `npm run version:check` fails if copies drift.

## Game loop

```
InputManager --> GameEngine.update --> Spaceship.update
                      |                      |
                      v                      v
              WorldManager.generate    orbit / launch physics
                      |                      |
                      v                      v
              collisions / bounds      camera follow
                      +----------+----------+
                                 v
                         ParticleSystem
                                 v
                      canvas + UIManager HUD
```

1. Frame delta is clamped (`dt <= 0.033s`) in `GameEngine.update`.
2. Held input near a node hooks the ship; release converts orbit into launch velocity.
3. `WorldManager.generateUpTo` builds nodes ahead of the camera by altitude zone.
4. `StorageService` debounces writes during a run and writes synchronously on game over.

## Server and PWA

`scripts/serve.js` (`npm start`, optional `npm run start:https`):

- `POST /api/player/login`, `POST /api/player/sync`, `POST /api/player/restore`
- `GET /api/player/*` answers `410` (legacy query-string restore is gone)
- `GET /api/version`
- Player and session JSON use atomic temp-file + rename; sync reloads before write
- CORS allow-list, 100KB body cap, PBKDF2 password hashes, 30-day session tokens
- Rate limits and lockouts are in-memory on purpose

There is no `/dashboard` and no `/api/telemetry`.

`CloudBackend` talks to this server by default. `SupabaseAdapter` exists for a future hosted backend and is not the LAN path.

`sw.js` precaches the game shell (not API traffic). The client version check against `version.json` / `/api/version` is the update path.
