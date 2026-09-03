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

## 3. Continuous Cumulative Project Documentation
* Maintain `GAME_STATUS.md` in the project root as the definitive, cumulative source of truth.
* **Append-Only / History Preservation:** Never remove, overwrite, or delete past versions. Always add new versioned sections for recent changes while keeping all historic logs and architectural descriptions intact.
