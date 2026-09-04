# AgentRules: The Master Autonomous Game Vibecoding & Harness Guide

> **Scope:** Global Antigravity Agent Engineering Standard  
> **Target:** Autonomous Game Development, Vibecoding, Engine Hardening, and Production Polish  
> **Compatibility:** Antigravity 2.0+, Google AI Agents, Playwright Visual Suites  

---

## 1. Concept: What is an Agent Harness & Why It Matters

### Is this a Harness?
**Yes.** In modern AI engineering, an **Agent Harness** is the external scaffolding, constraint boundary, and automated feedback loop that governs an autonomous LLM agent.

```
+-----------------------------------------------------------------------------------+
|                               AGENT HARNESS                                      |
|                                                                                   |
|  +---------------------+   +---------------------+   +-------------------------+  |
|  |  Context & Rules    |   |  Step Execution     |   |  Automated Verification |  |
|  |  (GEMINI.md /       |-->|  (Plan -> Brainstorm|-->|  (Playwright Tests,     |  |
|  |   standards.md)     |   |   -> Atomic Code)   |   |   Screenshots, 0 Errors)|  |
|  +---------------------+   +---------------------+   +-------------------------+  |
|             ^                                                     |               |
|             +----------------- Feedback & Audit <-----------------+               |
+-----------------------------------------------------------------------------------+
```

### Why Vibecoding Needs a Harness
* **Without Harness:** Models suffer context drift, hallucinate APIs, inject cheap emojis, introduce unvetted breaking changes, degrade mobile performance with memory leaks, and corrupt existing features.
* **With Harness:** Deterministic constraints enforce zero emojis, atomic edits, 60/120 FPS runtime stability, cumulative history, and visual proof before claiming completion.

---

## 2. Best Practice: Effective Agent Operations

To extract maximum quality, reliability, and token efficiency from coding agents:

1. **Clarification Before Action:** When intent is ambiguous, ask direct questions rather than guessing architecture.
2. **Brainstorm & Plan on Significant Scope:** Complex features demand structured planning (`implementation_plan.md`) before modifying code.
3. **Targeted Verification (Milestones, Not Micro-edits):** Automated Playwright visual testing takes significant time. Run it after major features, engine overhauls, and release candidates—not after trivial 2-line tweaks.
4. **Strict Minimalist Aesthetics:** Emulate top-grossing arcade games (*Subway Surfers*, *Alto's Adventure*). Bold tracked typography, clean geometry, SVG icons. Zero emojis.
5. **Zero GC / 60+ FPS Guardrails:** Avoid object allocations inside render/physics loops. Use pre-allocated ring buffers and debounced persistence.
6. **Cumulative Documentation:** Preserve immutable project history in `GAME_STATUS.md` and keep `GAME_SYSTEMS.md` synchronized in real time.
7. **Multi-Agent Hygiene:** Respect file boundaries. Never clobber or lock files while other agents are concurrently active.

---

## 3. The 6-Phase Vibecoding Game Development Lifecycle

```
[ Phase 1: Triage & Clarification ]
              |
              v
[ Phase 2: Brainstorm & Plan (Major Updates) ]
              |
              v
[ Phase 3: Atomic Implementation & Engine Hardening ]
              |
              v
[ Phase 4: Selective Playwright Visual Verification ]
              |
              v
[ Phase 5: Cumulative Documentation & Status Sync ]
              |
              v
[ Phase 6: Multi-Agent Concurrency Safety ]
```

### Phase 1: Triage & Clarification (Ask Before Coding)
* **Trigger:** Underspecified prompts, ambiguous mechanics, conflicting constraints, or high-risk design forks.
* **Agent Rule:** Stop and ask targeted clarifying questions. Do not make arbitrary assumptions about core game loops, economics, or control schemes.
* **Format:** Present concise options with a clear recommended default.

### Phase 2: Brainstorming & Structured Planning (Major Changes)
* **Trigger:** New gameplay systems, economy overhauls, rendering refactors, or UI redesigns.
* **Agent Rule:**
  1. Brainstorm edge cases (mobile screens, state migration, performance impact, offline cache).
  2. Create a step-by-step checklist in `implementation_plan.md`.
  3. Ensure decoupled architecture before writing any code.

### Phase 3: Atomic Implementation & Engine Hardening
* **Decoupled Architecture:** Keep Engine, World, Entities, Audio, UI, and Storage strictly separated.
* **Game Loop Protection:**
  * Clamp delta time (`rawDt <= 0.033s`) to prevent tunneling on frame drops or tab switching.
  * Guard velocity vectors with `Number.isFinite()` against `NaN` or `Infinity`.
  * Pre-allocate particle pools and trail histories using ring buffers (zero heap allocations per frame).
  * Debounce `localStorage` writes (e.g. 1500ms delay during active gameplay; synchronous write only on game over or explicit reward claims).
* **Migration Safety:** Never reset user progression, unlocked ships, high scores, or currencies during schema upgrades. Always implement backward-compatible defaults.

### Phase 4: Selective Playwright Visual Verification
* **When to Run `npm test` (`scripts/playwright_runner.js`):**
  * **RUN:** After completing a major game feature, UI redesign, physics overhaul, or release milestone.
  * **DO NOT RUN:** During micro-tweaks (color hex adjustment, single string correction, documentation updates).
* **Verification Invariants:**
  * Purge stale artifacts before execution.
  * Neutralize Windows NTFS file-tunneling (guarantee current execution second timestamps).
  * 0 console errors and 0 uncaught exceptions across all test runs.
  * Generate `screenshots/VERIFICATION_REPORT.json` and `screenshots/LATEST_RUN.md` with SHA-256 hashes.
  * Inspect screenshots visually via file viewer to eliminate clipping, text overflow, or contrast defects.

### Phase 5: Cumulative Project Documentation
* Maintain two living documents:
  1. `GAME_STATUS.md`: Definitive, append-only chronological log of all releases, bug fixes, and verification test outputs. Never delete past versions.
  2. `GAME_SYSTEMS.md`: Live specification of all game formulas, entity behaviors, spawn matrices, and performance modes. Keep 100% synchronized with current code.

### Phase 6: Multi-Agent Concurrency Safety
* **Read-Only Awareness:** When multiple agents are operating within the same repository, never modify files assigned to or actively being modified by another agent.
* **Isolated File Ownership:** Limit edits strictly to designated target files to avoid merge conflicts and race conditions.

---

## 4. UI & Visual Standards: Commercial Minimalism

Top arcade games succeed through immediacy, high contrast, and visual punch. Follow these rules without exception:

| Category | Strict Rule | Correct Approach | Forbidden Pattern |
| :--- | :--- | :--- | :--- |
| **Iconography** | Strict Zero Emoji Policy | Clean, minimalist SVG vector icons; sharp Canvas geometry | Unicode emojis (Rocket, Star, Skull, Explosion, etc.) |
| **Typography** | Modern & Tracked | Bold, geometric sans-serif fonts (`Inter`, `Rajdhani`, `Segoe UI`), tracked uppercase labels (`BESTLEISTUNG`, `NEUER REKORD`) | Generic serif or playful decorative fonts |
| **Terminology** | Punchy & Direct | `PROFIL`, `HANGAR`, `REPLAY`, `PAUSE` | Bureaucratic jargon (`Piloten-Lizenz-Ausweis`) |
| **Feedback** | Minimalist Text | `PERFEKT`, `COMBO x2`, `COMBO x3` | Verbose status banners (`PERFEKT 90° (+10% TEMPO)`) |
| **Layout** | Generous Whitespace | Focused hero scores, clear hierarchy, high contrast badges | Cluttered screens with multiple competing focal points |

---

## 5. Vibecoding Prompt Playbook (How to Prompt Agents)

### Template 1: Major Feature Request
```markdown
[FEATURE GOAL]: Add a Quantum Revive Trampoline mechanic.
[CONSTRAINTS]:
- Must maintain 60 FPS on mobile.
- Zero emojis. Use minimalist SVG and canvas effects.
- Ask questions if physics parameters are ambiguous.
- Brainstorm edge cases and write a structured step-by-step plan before editing code.
- Run Playwright test suite after implementation to capture fresh screenshots and verify 0 console errors.
```

### Template 2: UI Overhaul / Polish
```markdown
[UI POLISH GOAL]: Redesign the Game Over dialog to match commercial arcade quality (Alto's Adventure style).
[CONSTRAINTS]:
- Strict Zero Emoji Policy (SVG vector icons only).
- Clear visual hierarchy with Hero Altitude Score as dominant element.
- Test across desktop and mobile viewport resolutions.
- Run Playwright verification suite once layout is complete.
```

### Template 3: Engine Optimization / Bug Fix
```markdown
[ENGINE FIX]: Eliminate frame hitching during ascent.
[CONSTRAINTS]:
- Audit ParticleSystem and Spaceship trail for heap allocations.
- Implement pre-allocated ring buffers.
- Debounce storage saves.
- Do not run Playwright for internal math tweaks until full engine pass is complete.
```

---

## 6. How to Make this Document Globally Available in Antigravity

To ensure every agent in every workspace accesses these guidelines:

1. **Option A: Global Antigravity Config (`~/.gemini/config/`)**
   * Place this file at `~/.gemini/config/AgentRules.md` or append to `~/.gemini/config/GEMINI.md`.
   * Antigravity automatically traverses and injects rules from `~/.gemini/config/` into every active agent session on your machine.

2. **Option B: Workspace Standard (`.agents/rules/`)**
   * Place inside `.agents/rules/AgentRules.md` within any repository.
   * Enables automatic team sharing and version control tracking.

3. **Option C: Direct Agent Instruction / Prompt Injection**
   * Reference: `"Follow the guidelines in AgentRules.md for all game planning, testing, and UI decisions."`
