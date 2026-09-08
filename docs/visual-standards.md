# Space Jump — Visual Standards

Typography, palette, and modal geometry. System structure lives in `architecture.md`.

## Fonts

- **Numbers:** `'Orbitron', monospace` (`--font-numbers`) with `tabular-nums` for scores, meters, currencies, combos.
- **UI copy:** `'Rajdhani', sans-serif` (`--font-ui`) for labels, buttons, modals, names, and onboarding.
- **Title ("SPACE JUMP"):** `.title-lockup` uses `'Oxanium', sans-serif` weight 900 with `skewX(-10deg)`.
  - `SPACE`: white, letter-spacing `0.26em`, extruded shadow `0px 4px 0px #0f172a`.
  - `JUMP`: `.casing-frame` rose-to-burgundy rim, inner plate `.casing-plate` `#e11d48`, white letters with `#881337` extrusion.
- Do not reintroduce generic fallbacks (`Inter`, `Montserrat`, `Sora`, `Segoe UI`, `Arial`).

## Palette and assets

- Title red `#e11d48` is `--accent-crimson`, `--danger`, and the crimson button tokens. Same hue on ship chevrons, mines, collision shards, death laser, and debrief reticle.
- Menu currency pill: bullion coin (Rajdhani `C`) and 8-point spark, no "CREDITS" / "SPARKS" labels.
- World coins in `EnergyOrb.js` match the menu SVG (beveled rim, specular ring, recessed well, no blur halo). Rasterize after `document.fonts.load('700 46px "Rajdhani"')` and `document.fonts.ready`. Center glyphs with bounding-box metrics, not `textBaseline = 'middle'`.

## Hub modals

Shared shell: `#0b0d13` fill, `1px solid rgba(255, 255, 255, 0.08)` border, `24px` radius. Cards use floating-dock fill `rgba(255, 255, 255, 0.035)` and `backdrop-filter: blur(16px)`. Desktop height `580px` / mobile `560px` with `flex: 1; min-height: 0` on the scroll area so filters and row counts do not resize the chrome.

- **Missions (`#quests-modal`):** Filters `ALLE` / `TÄGLICH` / `WÖCHENTLICH` sit under the title. No extra progress header.
- **Profile (`#profile-modal`):** Cards `.profile-hero-card`, `.profile-edit-card`, `.profile-sync-card`. Two free name changes (`MAX_FREE_CHANGES = 2`).
- **Tutorial (`#tutorial-modal`):** Three text steps, no video or canvas loops. Action `VERSTANDEN`.
- **Stats (`#stats-modal`):** Hero record card plus a 2-column grid of 10 `.stats-tile`s.
- **Leaderboard (`#leaderboard-modal`):** Hero standing card (`#player-rank-card`), columns `RANG` / `PILOT` / `REKORD`, podium highlight on top 3.
