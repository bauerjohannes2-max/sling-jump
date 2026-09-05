# Antigravity Workflow Rules & Guidelines

These guidelines are automatically enforced for all agent tasks and pairs.

## 1. Strict Zero Emoji Policy (Absolute Regel: KEINE Emojis)
* **Under no circumstances use emojis anywhere** in UI, buttons, HUD, game canvas, modals, toasts, code comments, or documentation.
* Emojis look cheap, unprofessional, and like generic AI prototypes.
* Use exclusively:
  * Minimalist SVG vector icons
  * High-precision Canvas geometry
  * Clean, modern typography and typographic accents (e.g. geometric badges, uppercase tracked labels).

## 2. Selective & Fresh Playwright Automated Visual Testing (Token-Optimiert)
For any web application, UI, Canvas, or frontend project:
* **Selective Test Execution (Token-Schonung):**
  * Execute Playwright selectively: `node scripts/playwright_runner.js <screen>` (e.g. `node scripts/playwright_runner.js 07`).
  * **Only capture the specific screenshots affected by the current change.** Under no circumstances dump all 18 screenshots during routine tweaks.
  * The full 18-screen suite (`node scripts/playwright_runner.js --all`) is reserved strictly for major milestone releases or explicit user requests.
* **Strict Freshness & Timestamp Guarantee:**
  * Under no circumstances use old or cached screenshots for the tested screen. Every targeted screenshot must be freshly generated during the current test run.
  * Neutralize Windows NTFS File System Tunneling: Guarantee that `CreationTime` and `LastWriteTime` are explicitly stamped to the current execution second via `scripts/touch_timestamps.ps1`.
  * Every test run must generate `screenshots/VERIFICATION_REPORT.json` and `screenshots/LATEST_RUN.md` with execution timestamps and SHA-256 hashes.
* Assert 0 console errors and 0 uncaught exceptions across all test runs.
* Visually inspect each targeted screenshot using the file viewer to detect and fix any layout overlaps, contrast defects, or clipping before concluding the turn.

## 3. Mandatory Continuous Historical Documentation (`GAME_STATUS.md` & `GAME_SYSTEMS.md`)
* Always maintain both dedicated documentation markdown files in the workspace root:
  * `GAME_STATUS.md`: The definitive, cumulative, append-only history of all releases, changelogs, and Playwright verification logs. Never delete, truncate, or overwrite past versions.
  * `GAME_SYSTEMS.md`: The comprehensive game systems, physics formulas, node mechanics, performance modes, and design architecture manual. Always keep it 100% updated to the latest version on every iteration without exception.

## 4. Commercial Polish & Code Quality
* Ensure zero console errors, graceful asset fallbacks, and modular decoupled architectures.
* Keep responses concise and focused on high-level decisions while maintaining detailed records in the markdown files.

## 5. Adaptive Planning & Step-by-Step Execution (Token-Optimiert)
* **Major Architectural Overhauls & New Complex Systems:**
  * Formulate a structured plan with a detailed step-by-step to-do checklist in `implementation_plan.md` before execution.
* **Routine Tweaks, UI Fixes, Balance Adjustments & Minor Bugfixes:**
  * **Skip `implementation_plan.md` completely** to save tokens and context window capacity. Implement atomically and verify directly.

## 6. Strict Commercial Minimalism & Industry Best-Practice UI (Absolute Regel: Weniger ist mehr / Keep it Simple)
* **Always follow the proven UX/UI standards of mobile bestsellers and top-grossing arcade games** (e.g. Subway Surfers, Crossy Road, Alto's Adventure, Brawl Stars):
  * **Keep it simple, punchy, and minimalistic:** Eliminate visual clutter, excessive subtitles, micro-metadata, redundant counters, and wall-of-text explanations.
  * **No bureaucratic terminology:** Never use overcomplicated or bureaucratic naming (e.g. use clean 'PROFIL' instead of 'Piloten-Lizenz').
  * **Generous whitespace & clear visual hierarchy:** Bold tracked typography, clean cards, high contrast, and direct action buttons.

## 7. Automated Token & Context Window Optimization (Absolute Regel: Maximale Token-Effizienz)
* **Surgical File Slices:** Never read entire 500+ line files unconditionally. Always restrict `view_file` to relevant line ranges (`StartLine`, `EndLine`).
* **Atomic Edits Only:** Use `replace_file_content` with minimal contiguous diff blocks. Never rewrite entire files for small changes.
* **Research Isolation:** Delegate extensive log searches, file scans, or discovery to the `research` subagent to keep the main conversation transcript clean and token-lean.
* **Caveman Protocol by Default:** Strict telegraphic brevity. Zero greetings, zero conversational pleasantries, zero filler words. Lead with facts, state changes, diffs, and verification hashes.
* **Session Lifecycle:** When a major milestone is pushed to git, proactively advise the user to start a fresh chat session so subsequent tasks run with maximum token efficiency and zero historical bloat.
