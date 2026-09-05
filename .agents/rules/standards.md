---
trigger: always_on
description: Mandatory zero emoji policy, Playwright automated testing, and continuous documentation rules
---

# Workflow Standards: Zero Emojis, Playwright Testing & Continuous Documentation

## 1. Strict Zero Emoji Policy
* Never use emojis in any UI, button, modal, HUD, toast, code, or documentation.
* Use only minimalist SVG icons, sharp Canvas rendering, and modern typography.

## 2. Selective & Fresh Playwright Automated Visual Testing (Token-Optimiert)
* **Selective Test Execution:** Execute Playwright selectively (`node scripts/playwright_runner.js <screen>`). Capture ONLY the screenshots affected by the current edit. Never dump all 18 screenshots on routine changes.
* Full regression suite (`--all`) is reserved exclusively for major release candidates.
* **Strict Freshness Guarantee:** Under no circumstances rely on old or cached screenshots for the tested screen. Every targeted screenshot must be freshly generated during the current test run with current `CreationTime` and `LastWriteTime` timestamps (neutralizing Windows NTFS tunneling) and output `screenshots/LATEST_RUN.md` with SHA-256 hashes.
* Verify 0 console errors and inspect generated screenshots in `screenshots/` to confirm layout integrity, contrast, and alignment.

## 3. Continuous Cumulative Project Documentation (`GAME_STATUS.md` & `GAME_SYSTEMS.md`)
* Maintain `GAME_STATUS.md` in the project root as the definitive, cumulative, append-only changelog and release history. Never delete past versions.
* Maintain `GAME_SYSTEMS.md` as the authoritative, up-to-date manual of all game systems, mechanics, physics equations, performance modes, and entities. Keep it fully synchronized with the latest version at all times.

## 4. Adaptive Planning & Step-by-Step Execution (Token-Optimiert)
* **Major Overhauls & New Systems:** Formulate structured `implementation_plan.md` with step-by-step checklist.
* **Routine Tweaks, Fixes & Micro-Edits:** Skip `implementation_plan.md` completely. Implement directly and atomically to conserve tokens.

## 5. Strict Commercial Minimalism & Industry Best-Practice UI (Weniger ist mehr)
* **Always follow the proven UX/UI standards of mobile bestsellers and top-grossing arcade games** (e.g. Subway Surfers, Crossy Road, Alto's Adventure, Brawl Stars):
  * **Keep it simple, punchy, and minimalistic:** Eliminate visual clutter, excessive subtitles, micro-metadata, redundant counters, and wall-of-text explanations.
  * **No bureaucratic terminology:** Never use overcomplicated or bureaucratic naming (e.g. use clean 'PROFIL' instead of 'Piloten-Lizenz').
  * **Generous whitespace & clear visual hierarchy:** Bold tracked typography, clean cards, high contrast, and direct action buttons.

## 6. Automated Token & Context Optimization (Maximale Token-Effizienz)
* Read files using targeted line slices (`StartLine`, `EndLine`), never full-file dumps.
* Use `replace_file_content` with minimal surgical diff blocks.
* Delegate broad searches and log discovery to `research` subagents.
* Use telegraphic Caveman communication (zero fluff, zero filler).

