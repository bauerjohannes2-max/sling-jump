---
trigger: always_on
description: Zero emoji policy, selective visual testing, and token-efficient documentation
---

# Workflow Standards

## 1. Zero Emoji Policy
- Never use emojis anywhere. Minimalist SVG icons, crisp Canvas geometry, modern typography only.

## 2. Selective Visual Testing
- Target specific screens only: `node scripts/playwright_runner.js <screen>`. Full suite reserved for milestones.
- Fresh timestamps required (neutralize NTFS tunneling). Output `screenshots/LATEST_RUN.md` with SHA-256. 0 console errors.

## 3. Project Documentation
- `GAME_STATUS.md`: Definitive cumulative changelog. Dense and token-efficient.
- `GAME_SYSTEMS.md`: Live specification of formulas, mechanics, and entities.

## 4. Adaptive Planning
- Major features: `implementation_plan.md` checklist.
- Routine tweaks: Implement directly to conserve tokens.

## 5. Commercial Minimalism
- Simple, punchy, minimal (Alto's Adventure style).
- Tracked typography, high contrast, clean cards, no bureaucratic terms.

## 6. Token Optimization
- Target line ranges in `view_file`. Surgical edits via `replace_file_content`. Caveman brevity.

## 7. 60+ FPS Guardrails
- Debounce storage writes >= 1500ms during flight. No `{ desynchronized: true }` under DOM. No runtime `shadowBlur`. Cache HUD DOM updates.

## 8. Token Efficiency & Map First
RULE: TOKEN EFFICIENCY & MAP FIRST. Before reading, grepping, or analyzing any .js or .css files for a new task, you MUST read architecture.md to understand the system context. Never dump full JS files into context blindly. You are strictly responsible for keeping architecture.md updated whenever you create a new file, change a core class, or alter the game loop.
