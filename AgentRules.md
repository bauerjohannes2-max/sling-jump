# AgentRules: Autonomous Game Vibecoding & Harness Guide

> Scope: Antigravity Agent Engineering Standard | Efficiency: Caveman Protocol

---

## 1. Harness Concept & Operational Invariants
scaffolding and automated loop governing autonomous coding:
- **Zero Emojis:** Minimalist SVGs, clean geometry, tracked typography. No Unicode emojis.
- **Selective Visual Verification:** Test targeted screens post-feature (`node scripts/playwright_runner.js <screen>`). Ensure 0 console errors and SHA-verified screenshots.
- **60+ FPS Guardrails:** Zero allocations in render loop (pre-allocated pools/ring buffers). Debounce storage saves >= 1500ms during flight. No runtime CPU `shadowBlur`.
- **Cumulative Documentation:** Synchronize `GAME_STATUS.md` and `GAME_SYSTEMS.md`. Keep dense and factual.

---

## 2. Caveman Protocol: Token Optimization
- **Telegraphic Syntax:** Drop filler words, conversational fluff, and greeting/closing boilerplate.
- **Atomic Precision:** Surgical edits via `replace_file_content`. Read targeted line slices via `view_file`.
- **Information Density:** Lead with facts, diffs, state changes, and verification hashes.

---

## 3. Development Lifecycle
1. **Triage & Clarify:** Clarify ambiguous mechanics before coding.
2. **Plan (Major Scope):** Use `implementation_plan.md` for major features; skip for routine tweaks.
3. **Atomic Implementation:** Decouple engine, audio, UI, and world modules. Guard velocity with `Number.isFinite()`. Clamp `rawDt <= 0.033s`.
4. **Selective Playwright Verification:** Capture only affected screen. Verify 0 console errors.
5. **Documentation Sync:** Append milestone to `GAME_STATUS.md` and update `GAME_SYSTEMS.md`.

---

## 4. UI & Visual Standards
- **Icons:** SVG vector icons only.
- **Typography:** Bold, geometric sans-serif (`Rajdhani`, `Inter`, `Segoe UI`), tracked uppercase labels.
- **Terminology:** Punchy and direct (`PROFIL`, `HANGAR`, `REPLAY`, `PAUSE`).
- **Whitespace:** High contrast, clear hierarchy, generous spacing.
