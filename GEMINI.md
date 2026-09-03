# Antigravity Workflow Rules & Guidelines

These guidelines are automatically enforced for all agent tasks and pairs.

## 1. Strict Zero Emoji Policy (Absolute Regel: KEINE Emojis)
* **Under no circumstances use emojis anywhere** in UI, buttons, HUD, game canvas, modals, toasts, code comments, or documentation.
* Emojis look cheap, unprofessional, and like generic AI prototypes.
* Use exclusively:
  * Minimalist SVG vector icons
  * High-precision Canvas geometry
  * Clean, modern typography and typographic accents (e.g. geometric badges, uppercase tracked labels).

## 2. Mandatory Playwright Automated Visual Testing & Screenshot Verification
For any web application, UI, Canvas, or frontend project:
* **Always execute the Playwright test suite (`npm test` or `node scripts/playwright_runner.js`)** as the mandatory final verification step.
* **Strict Freshness & Timestamp Guarantee:**
  * Under no circumstances use old or cached screenshots. Every screenshot must be freshly generated during the current test run.
  * Neutralize Windows NTFS File System Tunneling: Guarantee that `CreationTime` and `LastWriteTime` are explicitly stamped to the current execution second.
  * Every test run must generate `screenshots/VERIFICATION_REPORT.json` and `screenshots/LATEST_RUN.md` with execution timestamps and SHA-256 hashes.
* Capture full-resolution screenshots of all relevant screens, dialogs, and states into the `screenshots/` directory.
* Assert 0 console errors and 0 uncaught exceptions across all test runs.
* Visually inspect each screenshot using the file viewer to detect and fix any layout overlaps, contrast defects, or clipping before concluding the turn.

## 3. Mandatory Continuous Historical Documentation (`GAME_STATUS.md` & `GAME_SYSTEMS.md`)
* Always maintain both dedicated documentation markdown files in the workspace root:
  * `GAME_STATUS.md`: The definitive, cumulative, append-only history of all releases, changelogs, and Playwright verification logs. Never delete, truncate, or overwrite past versions.
  * `GAME_SYSTEMS.md`: The comprehensive game systems, physics formulas, node mechanics, performance modes, and design architecture manual. Always keep it 100% updated to the latest version on every iteration without exception.

## 4. Commercial Polish & Code Quality
* Ensure zero console errors, graceful asset fallbacks, and modular decoupled architectures.
* Keep responses concise and focused on high-level decisions while maintaining detailed records in the markdown files.

## 5. Mandatory Structured Planning & Step-by-Step Execution (Absolute Regel)
* **Whenever the user provides any instructions, tasks, or feature requests:**
  * Always create a comprehensive, structured plan with a detailed step-by-step to-do checklist in `implementation_plan.md` before or during execution.
  * Execute each item systematically and methodically.
  * Verify each deliverable with fresh visual tests and document the complete lifecycle in `GAME_STATUS.md`.

## 6. Strict Commercial Minimalism & Industry Best-Practice UI (Absolute Regel: Weniger ist mehr / Keep it Simple)
* **Always follow the proven UX/UI standards of mobile bestsellers and top-grossing arcade games** (e.g. Subway Surfers, Crossy Road, Alto's Adventure, Brawl Stars):
  * **Keep it simple, punchy, and minimalistic:** Eliminate visual clutter, excessive subtitles, micro-metadata, redundant counters, and wall-of-text explanations.
  * **No bureaucratic terminology:** Never use overcomplicated or bureaucratic naming (e.g. use clean 'PROFIL' instead of 'Piloten-Lizenz').
  * **Generous whitespace & clear visual hierarchy:** Bold tracked typography, clean cards, high contrast, and direct action buttons.
