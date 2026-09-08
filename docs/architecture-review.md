# Space Jump — Architecture Review

Reviewed at commit `09ebc50`, 8 September 2026. All findings are read-only observations; no
behaviour was changed while producing this document.

The project is a vanilla-JS canvas game with a PWA shell, a Node dev/API server and a separate
analytics dashboard. There is no build step, no bundler, and no test or lint tooling. Roughly
12,000 lines of hand-written JavaScript, CSS and HTML are spread across four layers.

## Verdict

The layer split (`entities`, `engine`, `services`, `world`, `config`) is sound, and the simulation
code is the healthiest part of the repository. The problems are around it:

- **No module boundaries.** Four files have grown past 1,000 lines, and modules reach into each
  other through `window`.
- **No single source of truth** for version, config or run state. The same value is defined three
  to five times, and the copies have already drifted apart.
- **No tooling.** A call to a method that does not exist ships unnoticed.

| Severity | Count |
| --- | --- |
| Critical | 2 |
| High | 8 |
| Medium | 9 |
| Low | 4 |

Phase 1 (F1, F2, F4, F5, F9, F16) and Phase 2 (F3, F6, F7, F12, F13, F14, F18) have since been
fixed on this branch, along with the follow-up bug F23; each is marked below. Everything else is
still open.

## Findings

### Critical

#### F1 — `initHangar()` is called but never defined

`js/main.js:183`, `js/main.js:735`

`UIManager` has no `initHangar` method. The call at line 183 sits unguarded inside the sync-load
click handler, so it throws a `TypeError` before `initSettingsUI()` and `openProfileModal()` can
run. The call at line 735 is inside a catch-all `try`, so URL-based restore silently stops halfway
through its refresh sequence.

*Fix:* delete both calls, or implement `initHangar()` as the menu carousel refresh.

**Fixed.** Both sites now call the hangar carousel's own `renderMenuShip()`, reached from the outer
scope through a `refreshHangar` reference assigned inside `bindUIButtons()`.

#### F2 — Service worker precache keys never match real requests

`sw.js:8-35` versus `index.html:845-861`

`PRECACHE_ASSETS` stores unversioned URLs such as `./js/main.js`, but the page requests
`./js/main.js?v=5.18.0`. Cache keys include the query string, and `caches.match` is called without
`ignoreSearch`, so every precached JS and CSS entry is dead weight. Offline start currently works
only for `index.html` and `version.json`.

*Fix:* call `caches.match(request, { ignoreSearch: true })` in the offline fallback path.

**Fixed.** All three `caches.match` calls in `sw.js` now pass `ignoreSearch: true`.

### High

#### F3 — Five different version strings in one repository

`index.html:7`, `:22`, `:26`, `:703`, `:845`; `js/config/Constants.js:7`

The manifest and icons use `?v=4.7.1`, the stylesheet `?v=4.8.0`, the inline `APP_VERSION` constant
`4.8.0` (this is what drives the localStorage cache purge), the script tags `?v=5.18.0`, and the
settings label reads `v5.18.1`. Meanwhile `package.json`, `version.json`, `sw.js` and
`Constants.VERSION` all agree on `5.18.1`. The purge logic therefore compares against a version that
nothing else in the project uses.

*Fix:* read one version (`version.json`) and stamp the query strings from it at serve time.

**Fixed.** `package.json` is now the single source. `scripts/sync_version.js` stamps it into the
`index.html` cache busters, `APP_VERSION`, the settings label, `Constants.VERSION`, the service
worker cache name and `version.json`; `npm run version:check` fails when any copy drifts, and CI
runs that check.

#### F4 — Stored XSS through leaderboard names

`js/engine/UIManager.js:1195`, `js/services/StorageService.js:230`

Pilot names are only trimmed and cut to 16 characters, then interpolated into `innerHTML`.
`UIManager` assigns `innerHTML` in 15 places, and names also arrive from the cloud sync API, so a
crafted name executes in every viewer's session.

*Fix:* build rows with `createElement`/`textContent`, or escape the value before interpolation.

**Fixed.** Leaderboard rows are assembled from `createElement` cells with `textContent`.

#### F5 — Analytics reads the wrong global

`js/services/AnalyticsService.js:96`, `js/main.js:9-10`

Bootstrap assigns `window._gameEngine`, but `AnalyticsService` checks `window.game` before reading
the player profile. That branch never runs, so every telemetry event is attributed anonymously.

*Fix:* inject `StorageService` into `AnalyticsService` at construction instead of looking it up on
`window`.

**Fixed.** `AnalyticsService.init(storage)` receives `engine.storage`; the localStorage path remains
as a fallback when nothing is injected.

#### F6 — JSON persistence is a lost-update race

`scripts/serve.js:78`, `:105`, `:133`

Every write rewrites the whole file with `writeFileSync` from an in-memory store that is loaded once
at boot and never reconciled with disk. Two concurrent syncs drop one update, and a crash mid-write
truncates the file. `reloadPlayers()` exists but is never called from a request path.

*Fix:* write to a temporary file and `rename` it into place, and serialize writes per player ID.

**Partly fixed.** All three stores now go through `writeJsonStore()`, which writes a temp file and
renames it over the target, and read failures are logged instead of swallowed. The lost-update race
between two concurrent syncs of the same player remains open.

#### F7 — The dashboard calls an endpoint its own server does not have

`dashboard/js/app.js:190`, `dashboard/server.js:50`

The dashboard fetches `/api/telemetry/stats`, which only exists in `scripts/serve.js`. The
standalone dashboard server exposes `/api/analytics/summary`, so LIVE mode silently falls back to
localStorage.

*Fix:* agree on one route name and use it in both servers.

**Fixed.** Both servers now answer `GET /api/telemetry/stats` with the same payload shape.

#### F8 — Dashboard access control lives in the client

`dashboard/js/app.js:9`, `:114`

A hardcoded hash plus a plaintext PIN comparison gate the dashboard in the browser only. The
analytics API behind it is unauthenticated and `/api/telemetry/stats` sends `CORS *`, so anyone on
the LAN can read it directly.

*Fix:* move the gate to the server and require a token on the analytics routes.

#### F9 — Legacy GET restore puts the password hash in the URL

`scripts/serve.js:785-858`

`POST /api/player/restore` replaced it and no client calls the GET form anymore, but the route is
still live, so hashes land in access logs, proxies and browser history.

*Fix:* delete the GET handler.

**Fixed.** The handler is gone; `GET /api/player/*` now answers `410 Gone` pointing at the POST
endpoint.

#### F10 — Two god objects and a monolith server

`js/engine/UIManager.js` (1,714 lines), `js/engine/GameEngine.js` (1,001), `scripts/serve.js` (1,137)

`UIManager` mixes the DOM cache, overlays, profile, HUD, debrief, leaderboard, missions, stats and
settings, with roughly 100 `getElementById` calls. `GameEngine` owns the loop plus run lifecycle,
tutorial layout, camera, scoring and revive, and reaches into the DOM directly at
`js/engine/GameEngine.js:470`. `scripts/serve.js` is simultaneously a static file server, router,
auth system, rate limiter, TLS manager and database.

*Fix:* split by feature — one UI controller per modal, `RunController`/`CameraController` out of the
engine, and `server/routes` plus `server/stores` out of `serve.js`.

### Medium

#### F11 — No module system, only load order

`index.html:845-861`

Seventeen classic script tags in a hand-maintained dependency order; classes and `CONSTANTS` become
implicit globals. Modules reach back through `window` — `ParticleSystem` reads
`window._gameEngine.storage.data.settings` — so the dependency graph is invisible to tooling and
unenforced.

*Fix:* switch to `type="module"` with explicit imports and a single entry point.

#### F12 — Orphaned shop subsystem

`js/engine/UIManager.js:49`, `:157`

`UIManager` caches `#shop-modal` and `#slider-master`, and `StateManager.STATES.SHOP` is still
handled in the engine, but none of that markup exists in `index.html`. The upgrade banner tries to
enter the SHOP state, which now renders nothing.

*Fix:* delete the SHOP state and the hangar-tab code, or restore the markup.

**Fixed.** The SHOP state, the hangar-tab grid renderer, the 190-line `ShopManager.renderPreview()`,
the game-over upgrade banner, the volume-slider bindings and the tutorial animation stubs are gone,
together with `scripts/capture_screens.js`, which drove that removed UI.

#### F13 — The ship economy is implemented twice

`js/main.js:232-245`, `:342-345` versus `js/config/Constants.js:100-120`

The menu carousel keeps its own ship catalog with hardcoded SVG and a cost of 500, and spends cores
directly through `StorageService` instead of `ShopManager.buyItem`. Two price lists and two unlock
paths for the same two ships.

*Fix:* drive the carousel from `CONSTANTS.SHIPS` and route purchases through `ShopManager`.

**Fixed.** The carousel maps `CONSTANTS.SHIPS` to artwork, renders the price from the catalog and
buys through `ShopManager.buyItem()`, which also equips the purchase.

#### F14 — The dashboard exists three times

`dashboard.html`, `dashboard/index.html`, `manifest-dashboard.json`

`dashboard.html` and `dashboard/index.html` are about 95% identical, differing in asset path
prefixes and a PWA guard. `serve.js` rewrites `/dashboard` to the root copy, the game menu links the
nested copy, and the standalone server serves the nested copy. `manifest-dashboard.json` is
referenced by nothing.

*Fix:* keep `dashboard/index.html`, make the root path a redirect, and delete
`manifest-dashboard.json`.

**Fixed.** `dashboard.html` and `manifest-dashboard.json` are deleted, `/dashboard` serves
`dashboard/index.html`, and the screenshot runner points at the surviving copy.

#### F15 — Run state has no owner

`js/engine/StateManager.js:30-38`, `js/engine/GameEngine.js:47`, `js/engine/MissionManager.js:12`

`StateManager` is 42 lines of FSM routing only. Actual state is spread over `GameEngine` fields,
`StorageService.data`, entity fields and `UIManager` caches. `runCores` exists on both `GameEngine`
and `MissionManager`, and the combo is mirrored onto the player every frame.

*Fix:* introduce one `RunState` object owned by `GameEngine` that the others read.

#### F16 — `CloudBackend.js` is missing from the precache list

`sw.js:8-35`, `index.html:846`

The script is loaded on every page view but is not in `PRECACHE_ASSETS`, so a cold offline install
has no copy of it even once F2 is fixed.

*Fix:* add `./js/services/CloudBackend.js` to `PRECACHE_ASSETS`.

**Fixed.** The file is in `PRECACHE_ASSETS`.

#### F17 — Auth defenses evaporate on restart

`scripts/serve.js:242`, `:243`, `:303-305`

IP rate limits, brute-force lockouts and the online-player count are plain in-memory `Map`s, so a
restart clears them. The expiry sweeper deletes tokens from the store without calling
`saveSessions()`, so memory and disk drift apart.

*Fix:* persist the sweep, and document rate-limit state as intentionally volatile.

#### F18 — No lint, format, CI or type checking

`package.json:5-25`

There is no ESLint, Prettier, `.editorconfig`, `tsconfig` or workflow file. Four npm test scripts
all run the same Playwright screenshot script, which contains two assertions and exits non-zero on
console errors. No HTTP or persistence tests exist, and `SECURITY.md` points at a `test_local_tls.js`
that is not in the repository.

*Fix:* add ESLint plus a GitHub Actions job that runs the Playwright runner and a `serve.js` smoke
test.

**Partly fixed.** `eslint.config.js`, `npm run lint` and `.github/workflows/ci.yml` exist, the
duplicate test aliases are gone, and the Playwright runner now falls back to bundled Chromium when
Edge is absent so it can run outside the dev machine. CI runs lint plus the version-drift check;
Playwright and a `serve.js` smoke test are not wired into CI yet, and there is still no formatter
or type checking.

#### F23 — Cloud restore does not adopt the restored account's identity

`js/services/StorageService.js:422-433`

`restoreFromCloud` replaces local data with `migrate(res.player.state)` and attaches the returned
session token to whatever profile comes out of that. It never forces `cleanId` onto the profile, so
if the stored state carries no `playerProfile`, the client invents a fresh random ID and holds a
token issued for a different account. Every later `POST /api/player/sync` then fails with
`401 UNGUELTIGES ODER ABGELAUFENES TOKEN`, and the player's progress silently stops syncing.

Observed while verifying the Phase 1 fixes: restoring `#ABCD-EFGH` produced a local profile of
`#RQAD-8W85`, and the next sync was rejected.

*Fix:* set `playerProfile.playerId = cleanId` after the migrate step, and treat a state without a
profile as a failed restore.

**Fixed.** `restoreFromCloud` now writes `cleanId` onto the restored profile. Verified end to end:
restoring an account whose stored state had no profile yields the account's own ID, and the next
sync is accepted with `200` instead of `401`.

### Low

#### F19 — Two browser automation stacks

`package.json:19-24`, `scripts/capture_screens.js:1`

`puppeteer-core` is pulled in for `capture_screens.js` alone, which captures an older subset of what
`playwright_runner.js` already covers and does not fail on console errors.

*Fix:* delete `capture_screens.js` and the `puppeteer-core` dependency.

**Fixed.** Both are gone; `playwright_runner.js` is the only automation stack.

#### F20 — German UI copy is hardcoded everywhere

`index.html`, `js/engine/UIManager.js`, `js/engine/GameEngine.js`, `js/config/Constants.js`

Display strings live inline in markup, engine logic and quest definitions. Only `de-DE` number
formatting exists. Adding a second locale means touching every layer.

*Fix:* extract a `strings.de.js` keyed map and keep constants language-free.

#### F21 — Tuning values hardcoded outside `Constants.js`

`js/engine/GameEngine.js:215`, `:275`, `:819-820`, `:836-844`

Orbit radii, camera buffers, the 140px danger zone, menu drift speed, tutorial altitude thresholds
and combo colors sit inline in the engine, while `Constants.js` is the declared home for
configuration.

*Fix:* add `CAMERA`, `TUTORIAL` and `GAMEPLAY` sections to `Constants.js`.

#### F22 — Nine root documents, none describing the current system

`architecture.md:63-113`

`architecture.md` opens with a read-this-first protocol, then spends 50 of its 102 lines on
typography, palette hex values and modal pixel heights. It never mentions `serve.js`, the dashboard,
the `scripts/` folder or the service worker. `AgentRules.md`, `GEMINI.md` and
`.agents/rules/standards.md` overlap with each other.

*Fix:* move the visual changelog into a design document and let `architecture.md` cover all four
layers.

## File size concentration

Four files carry more than 1,000 lines each and together account for roughly 8,200 of the project's
~12,000 hand-written lines. Each is a merge-conflict magnet, and none has an obvious place for a new
feature to go.

| File | Lines |
| --- | ---: |
| `css/style.css` | 4,360 |
| `js/engine/UIManager.js` | 1,714 |
| `scripts/serve.js` | 1,137 |
| `js/engine/GameEngine.js` | 1,001 |
| `index.html` | 793 |
| `js/main.js` | 674 |
| `dashboard/js/app.js` | 641 |
| `js/services/StorageService.js` | 576 |
| `scripts/playwright_runner.js` | 529 |
| `js/world/WorldManager.js` | 497 |

## Things defined more than once

This is the strongest single pattern in the review. Every item below has at least two definitions,
and in every case the copies have already diverged.

| Concept | Copies | Drift observed | Status |
| --- | --- | --- | --- |
| App version | `index.html` (×4), `Constants.js`, `package.json`, `version.json`, `sw.js` | 4.7.1 / 4.8.0 / 5.18.0 / 5.18.1 live simultaneously | Fixed — stamped from `package.json`, drift check in CI |
| Ship catalog and prices | `main.js` menu array, `Constants.SHIPS`, `ShopManager` cases | Different display names; `ShopManager` still handles removed ships | Fixed — `Constants.SHIPS` owns the catalog |
| Dashboard app | `dashboard.html`, `dashboard/index.html`, three manifests | Only the nested copy has the PWA guard; one manifest is unreferenced | Fixed — one copy, one manifest |
| Run counters | `GameEngine.runCores`, `MissionManager.runCores` | Two owners of the same per-run number | Open (F15) |
| Player API contract | `serve.js` routes, `LocalNodeAdapter`, `SupabaseAdapter` | The Supabase path skips PBKDF2 and issues non-server tokens | Open |
| Screenshot tooling | `playwright_runner.js`, `capture_screens.js` | The second script uses Puppeteer and ignores console errors | Fixed — Puppeteer script deleted |

## Dead or unreachable code

Removing these is the cheapest win available: no behaviour change, several hundred lines gone, and
the remaining code stops describing features that no longer exist.

| Item | Location | Why it is dead | Status |
| --- | --- | --- | --- |
| Shop modal UI | `UIManager.js:49`, `888-1007` | `#shop-modal` is not in `index.html` | Removed |
| Hangar preview renderer | `ShopManager.renderPreview()` | Only the removed SHOP state drew it | Removed |
| Game-over upgrade banner | `UIManager.checkOneTimeUpgradeNotification()` | `#gameover-upgrade-banner` is not in `index.html` | Removed |
| Volume sliders | `UIManager.js:157` | `#slider-master` is not in `index.html` | Removed |
| `GameEngine.startTutorial` | `GameEngine.js:151-227` | The tutorial modal goes straight to `PLAYING` | Open |
| Quest toast wiring | `UIManager.js:63-65` | Cached references are never used | Open |
| Tutorial animation stubs | `UIManager.js:311-312` | Empty function bodies | Removed |
| Legacy GET restore | `serve.js:785-858` | No client calls it | Removed (410) |
| `capture_screens.js` | `scripts/` | Superseded by `playwright_runner.js` | Removed |
| `manifest-dashboard.json` | repository root | Referenced by no HTML | Removed |

ESLint now catches the same class of leftovers automatically; the pass that introduced it removed
unused locals from `UIManager`, `AudioManager`, `GameEngine`, `share.js`, `setup_audio.js` and the
dashboard scripts.

## Layer map

| Layer | Files | State today |
| --- | --- | --- |
| Presentation | `index.html`, `css/style.css`, `UIManager` | One 793-line document, one 4,360-line stylesheet, one 1,714-line controller |
| Simulation | `GameEngine`, `WorldManager`, entities, `ParticleSystem` | Cleanest layer; the engine still owns run lifecycle, tutorial and camera |
| Domain services | `StorageService`, `ShopManager`, `MissionManager`, `AnalyticsService` | `ShopManager` now owns purchases and `AnalyticsService` takes an injected store; `StorageService` still mixes save format, cloud sync and auth |
| Transport | `CloudBackend` adapters, `serve.js` API | The LocalNode adapter matches the server; the Supabase adapter has weaker auth semantics |
| Infrastructure | `serve.js`, `dashboard/server.js`, `sw.js`, `scripts/` | Two servers, one dashboard entry point, one stamped version string |

Dependencies flow downward on paper. In practice `ParticleSystem`, `AnalyticsService` and
`InputManager` reach back up through `window` and global DOM queries.

## Target shape

The same layers already present, with the two monoliths cut along seams that are visible in their
own section comments today. `api-contract.js` is the one new idea: route names and response shapes
imported by both the server and the client adapter, so they cannot drift apart again.

```
js/
  app/            bootstrap only, no game logic (replaces main.js)
  core/           GameLoop, RunState, CameraController
  sim/            entities, WorldManager, ParticleSystem
  ui/             HudController, DebriefUI, MissionsUI, LeaderboardUI,
                  SettingsUI, ProfileUI  (one file per modal)
  domain/         StorageService, ShopManager, MissionManager
  net/            CloudBackend adapters + shared api-contract.js
  config/         Constants.js, strings.de.js

server/
  index.js        bootstrap + TLS
  static.js       MIME map, safe path resolution
  middleware/     cors, rateLimit, bodyParser
  stores/         players, sessions, analytics (atomic writes)
  routes/         player, telemetry, version, dashboard
  auth/           password, sessions, lockout
```

## Suggested order of work

**Phase 1 — correctness (small).** Fix or remove the `initHangar` calls (F1). Point analytics at the
real engine global (F5). Escape leaderboard names (F4). Add `ignoreSearch` to the service worker
fallback and precache `CloudBackend.js` (F2, F16). Delete the GET restore route (F9).

**Phase 2 — single sources (medium).** Done on this branch: one version string stamped from
`package.json` (F3), the dead shop, sliders and duplicate dashboard removed (F12, F14, F19), the
menu carousel driven by `Constants` and `ShopManager` (F13), atomic store writes (F6), one telemetry
route in both servers (F7), and ESLint plus a CI job (F18). Left over from this phase:
reload-before-write to close the concurrent-sync race (F6), the unused tutorial paths and quest
toast wiring, and wiring Playwright and a `serve.js` smoke test into CI.

**Phase 3 — boundaries (large).** Move to ES modules with explicit imports (F11). Split `UIManager`
per modal and extract `RunState` (F10, F15). Split `serve.js` into stores, routes and middleware
(F10). Share one API contract between the server and the adapters (F7). Extract strings and tuning
constants (F20, F21).

Phase 1 is independent of the rest and worth doing before any refactor, because two of those bugs
are invisible today and a refactor would silently inherit them.

## Worth keeping as-is

The folder taxonomy already matches the layer model, so the refactor is a matter of splitting files
rather than redesigning. The particle system is pre-allocated and allocation-free per frame. The
service worker strategy is deliberate and correct in intent: network-first for code,
stale-while-revalidate for media, API paths bypassed entirely, and the client version check gives a
real update path. Server-side PBKDF2 with per-account salts, session tokens instead of per-request
credentials, and server-side bounds checking on ingested save state are all better than this class
of project usually gets. Delta time is clamped in exactly one place, which is why the physics does
not tunnel.
