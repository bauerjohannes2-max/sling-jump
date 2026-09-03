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
* Capture full-resolution screenshots of all relevant screens, dialogs, and states into the `screenshots/` directory.
* Assert 0 console errors and 0 uncaught exceptions across all test runs.
* Visually inspect each screenshot using the file viewer to detect and fix any layout overlaps, contrast defects, or clipping before concluding the turn.

## 3. Mandatory Continuous Historical Documentation (`GAME_STATUS.md` / `DOCUMENTATION.md`)
* Always maintain a dedicated, comprehensive documentation markdown file in the workspace root (`GAME_STATUS.md` for games or `DOCUMENTATION.md` for applications).
* **Historical Changelog Policy (Append-Only):**
  * **Never delete, truncate, or overwrite past versions or historical entries.**
  * The file must serve as a complete, cumulative history of all changes across the lifecycle of the project.
  * At the conclusion of every feature addition, refactoring, or bugfix, **always append/prepend the recent changes as a new versioned entry** while fully preserving all previous versions, module descriptions, physics/mechanics, and Playwright test logs.

## 4. Commercial Polish & Code Quality
* Ensure zero console errors, graceful asset fallbacks, and modular decoupled architectures.
* Keep responses concise and focused on high-level decisions while maintaining detailed records in the markdown files.
