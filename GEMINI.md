# Antigravity Workflow Rules & Guidelines

Guidelines enforced for all agent tasks.

## 1. Strict Zero Emoji Policy
- No emojis anywhere: UI, buttons, HUD, canvas, modals, toasts, comments, docs.
- Use exclusively minimalist SVG vector icons, sharp Canvas geometry, clean tracked typography.

## 2. Selective & Fresh Playwright Automated Visual Testing
- **Selective Execution:** Run targeted screen only: `node scripts/playwright_runner.js <screen>` (e.g. `01`, `04`). Never capture all screenshots during routine edits. Full suite reserved for major release milestones.
- **Freshness & Integrity:** Neutralize Windows NTFS tunneling (`scripts/touch_timestamps.ps1`). Every run generates `screenshots/VERIFICATION_REPORT.json` and `screenshots/LATEST_RUN.md` with SHA-256 hashes.
- Require 0 console errors and 0 uncaught exceptions. Visually inspect fresh screenshots with file viewer.

## 3. Mandatory Historical Documentation (`GAME_STATUS.md` & `GAME_SYSTEMS.md`)
- `GAME_STATUS.md`: Definitive cumulative changelog. Keep entries dense, factual, token-efficient.
- `GAME_SYSTEMS.md`: Live specification of formulas, physics, nodes, tiers, entities. Keep 100% synchronized with codebase.

## 4. Adaptive Planning & Step-by-Step Execution
- **Major Architecture & New Systems:** Formulate `implementation_plan.md` with checklist before coding.
- **Routine Tweaks & Fixes:** Skip `implementation_plan.md` to save tokens. Implement atomically, verify directly.

## 5. Commercial Minimalism & Mobile Best Practice
- Follow top arcade standards (Subway Surfers, Alto's Adventure).
- Keep simple, punchy, minimal. Eliminate clutter, redundant metadata, bureaucratic naming (`PROFIL`, not `Piloten-Lizenz-Ausweis`).
- Bold tracked typography, high contrast, generous whitespace.

## 6. Token & Context Optimization (Caveman Protocol)
- Target line ranges in `view_file` (`StartLine`, `EndLine`). Never dump full 500+ line files.
- Atomic edits via `replace_file_content` with minimal contiguous diffs.
- Telegraphic communication: zero filler, zero pleasantries, high information density.

## 7. Zero-Lag & 60+ FPS Engine Invariants
- **Debounced Persistence:** Debounce `localStorage.setItem` >= 1500ms during active gameplay (`saveDeferred`). Synchronous writes restricted to Game Over, revive, or shop purchases.
- **Canvas Flags:** Never use `{ desynchronized: true }` under HTML/DOM overlays.
- **Zero Runtime CPU `shadowBlur`:** Avoid `shadowBlur` in render loops. Use offscreen canvases or vector layers.
- **Snappy Input:** On slingshot release from slow-mo, snap `timeScale = 1.0` immediately.
- **DOM Caching:** Cache HUD elements; mutate `textContent` only when values change.
- **Canvas 2D Optical Glyph Centering:** Never rely on `ctx.textBaseline = 'middle'` to center uppercase letters or standalone glyphs in Canvas 2D; `middle` baseline factors unused descenders and shifts glyph ink upward. Always compute true geometric center via bounding metrics:
  `drawX = cx + (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2`
  `drawY = cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2`
  Always hook offscreen sprite rasterization into `document.fonts.load(...)` and `document.fonts.ready` to re-rasterize immediately upon webfont readiness.
- **1:1 Vector Asset Parity (Canvas vs. SVG/DOM):** When porting UI/SVG assets (e.g. coins, currencies, icons) into Canvas 2D world collectibles, preserve the exact vector gradients, strokes, and contrast wells. Do not inject artificial radial blur halos or glows that bleed over crisp rim borders unless explicitly requested.

## 8. Token Efficiency & Map First
RULE: TOKEN EFFICIENCY & MAP FIRST. Before reading, grepping, or analyzing any .js or .css files for a new task, you MUST read architecture.md to understand the system context. Never dump full JS files into context blindly. You are strictly responsible for keeping architecture.md updated whenever you create a new file, change a core class, or alter the game loop.
