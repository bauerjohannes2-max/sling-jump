---
trigger: always_on
description: Mandatory zero emoji policy, Playwright automated testing, and continuous documentation rules
---

# Workflow Standards: Zero Emojis, Playwright Testing & Continuous Documentation

## 1. Strict Zero Emoji Policy
* Never use emojis in any UI, button, modal, HUD, toast, code, or documentation.
* Use only minimalist SVG icons, sharp Canvas rendering, and modern typography.

## 2. Mandatory Playwright Automated Visual Testing & Freshness Guarantee
* Always execute the Playwright test suite (`npm test` or `node scripts/playwright_runner.js`) as the final verification step for any UI/canvas/visual change.
* **Strict Freshness Guarantee:** Under no circumstances rely on old or cached screenshots. Every test run must produce 100% fresh screenshots with current `CreationTime` and `LastWriteTime` timestamps (neutralizing Windows NTFS tunneling) and output `screenshots/LATEST_RUN.md` with SHA-256 hashes.
* Verify 0 console errors and inspect generated screenshots in `screenshots/` to confirm layout integrity, contrast, and alignment across desktop and mobile viewports.

## 3. Continuous Cumulative Project Documentation (`GAME_STATUS.md` & `GAME_SYSTEMS.md`)
* Maintain `GAME_STATUS.md` in the project root as the definitive, cumulative, append-only changelog and release history. Never delete past versions.
* Maintain `GAME_SYSTEMS.md` as the authoritative, up-to-date manual of all game systems, mechanics, physics equations, performance modes, and entities. Keep it fully synchronized with the latest version at all times.

## 4. Mandatory Structured Planning & Step-by-Step Execution
* Whenever the user submits any request or instructions:
  * Always formulate a structured plan with a detailed step-by-step checklist in `implementation_plan.md`.
  * Execute each item systematically.
  * Continuously verify and document progress.

## 5. Strict Commercial Minimalism & Industry Best-Practice UI (Weniger ist mehr)
* **Always follow the proven UX/UI standards of mobile bestsellers and top-grossing arcade games** (e.g. Subway Surfers, Crossy Road, Alto's Adventure, Brawl Stars):
  * **Keep it simple, punchy, and minimalistic:** Eliminate visual clutter, excessive subtitles, micro-metadata, redundant counters, and wall-of-text explanations.
  * **No bureaucratic terminology:** Never use overcomplicated or bureaucratic naming (e.g. use clean 'PROFIL' instead of 'Piloten-Lizenz').
  * **Generous whitespace & clear visual hierarchy:** Bold tracked typography, clean cards, high contrast, and direct action buttons.
