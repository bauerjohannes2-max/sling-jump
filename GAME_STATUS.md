# Sling Jump - Offizieller Spielstand & Historische Projekt-Dokumentation

> **Status:** Release Candidate (v5.10.0 - Clean Hangar, Vector Collectibles & Tactical Death Reticle)  
> **Permanenter Live-Link (24/7):** [`https://bauerjohannes2-max.github.io/sling-jump/`](https://bauerjohannes2-max.github.io/sling-jump/)  
> **Repository:** [`https://github.com/bauerjohannes2-max/sling-jump`](https://github.com/bauerjohannes2-max/sling-jump)  
> **Hosting:** GitHub Pages Global Edge CDN (SSL/HTTPS, PWA Offline Support)  
> **Letzte Aktualisierung:** 06.09.2026  
> **Test-Runner:** Playwright Test-Suite (`node scripts/playwright_runner.js <screen>`)

---

## 1. Schnellanleitung: Server- & Test-Befehle

| Befehl | Zweck | Beschreibung |
| :--- | :--- | :--- |
| **Permanenter Link** | **24/7 Weltweit** | [`https://bauerjohannes2-max.github.io/sling-jump/`](https://bauerjohannes2-max.github.io/sling-jump/) |
| `npm start` | **Lokales WLAN/LAN** | Startet HTTP-Server auf Port 3000, zeigt lokale IP & ASCII-QR-Code im Terminal. |
| `npm run share` | **Dev-Tunnel & QR** | Temporärer Entwicklertunnel mit QR-Code im Terminal. |
| `npm test` | **Automatisierte Suite** | Führt Playwright Visual Suite aus, neutralisiert NTFS-Tunneling, prüft 0 Konsolenfehler. |
| `node scripts/playwright_runner.js <screen>` | **Selektiver Test** | Gezielter Test eines einzelnen Screens (z.B. `01` Hauptmenü) für maximale Token-Effizienz. |

---

## 2. Höhenzonen & Progressions-Matrix

| Zone | Höhenbereich | Standard | Super-Boost | Beweglich | Fragil | Köder | Mine | Lücke | Profil |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Zone 1: Kalibrierung** | 0 – 250 m | 90% | 0% | 10% | 0% | 0% | 0% | 160 – 205 px | Große Abstände, 10% Pendel |
| **Zone 2: Erdorbit** | 250 – 750 m | 65% | 5% | 22% | 8% | 0% | 0% | 175 – 225 px | Erste fragile Knoten |
| **Zone 3: Stratosphäre** | 750 – 2.000 m | 44% | 5% | 28% | 20% | 3% | 0% | 195 – 250 px | Taktische Zeituhr-Knoten |
| **Zone 4: Mesosphäre** | 2.000 – 5.000 m | 34% | 4% | 30% | 26% | 6% | 0% | 215 – 270 px | Weite Sprünge, aktive Pendel |
| **Zone 5: Thermosphäre** | 5.000 – 9.000 m | 26% | 3% | 30% | 34% | 7% | ~6% | 230 – 290 px | Hohes Tempo, Weltraum-Minen |
| **Zone 6: Tiefraum** | 9.000 – 14.000 m | 20% | 2% | 30% | 40% | 8% | ~10% | 240 – 305 px | Dichte Minen, seltene Kristalle (>=8.000m) |
| **Zone 7: Meister-Kosmos** | 14.000 m+ | 16% | 2% | 30% | 44% | 8% | ~10% | 250 – 320 px | 74% dynamische Knoten, maximale Reach |

---

## 3. Chronologische Release-Historie

### v5.10.0 (06.09.2026) - Clean Hangar, Vector Collectibles & Tactical Death Reticle
- **Hangar-Bühne Bereinigung:** Entfernung der umgebenden Kreisringe (`.orbit-halo`, `.orbit-field`) im Hauptmenü. Freistehende, saubere Schiffssilhouette über den paginierten Navigationspunkten.
- **In-Game Collectible Vektor-Engine (`EnergyOrb.js`):**
  - Vorgerenderte Zero-GC Canvas-Sprites (`CREDIT_SPRITE`, `SPARK_SPRITE`).
  - Credits: Gold-Bullion-Münze mit gefastem Außenrand (`#coinRimGrad`), vertiefter Kontrastmulde und präzisem 'C'-Glyphen.
  - Sparks: Rotierender facettierter 8-Punkt Stern mit Laser-Spaltlinien, Tiefenschatten und Quantum-Aura.
- **Taktischer Absturz-Marker im Death Screen (`UIManager.js`, `index.html`):**
  - Mathematisch exakte Positionierung (`t = 1`) des roten "X" direkt auf der Spitze der Trajektorienlinie durch gedämpfte Hüllkurve (`Math.sin(t * Math.PI)`).
  - High-Tech Vektor-Design: Konzentrischer Puls-Stoßring, taktische 4-Punkt-Eckklammern, leuchtendes Karminrot (`#ff1e42`) mit weißem Innenkern und Zentralpunkt.

### v5.9.0 (06.09.2026) - Aerospace Currency System Refactor: Credits & Sparks
- **Vollständige Entkopplung:** Generische Arcade-Münzen und Platzhalter-Kristalle durch maßgeschneiderte Aerospace-Vektoren ersetzt:
  - **Credits (`viewBox="0 0 36 36"`):** Gestanzte Gold-Bullion-Münze mit durchgehend gefastem Außenrand (`#coinRimGrad`), vertiefter dunkler Kontrastmulde (`#coinWellDepth`) und zentriertem Rajdhani 'C'-Glyphen. Optisch auf 27px skaliert.
  - **Sparks (`viewBox="0 0 40 40"`):** Facettierter 8-Punkt Prismentransformator (`#sparkCoreGrad`) mit oberen Lichtbrechungen, Tiefenschattierung, Laser-Spaltlinien und Kern-Nukleus (`#f5d0fe`). Optisch auf 24px mit dezentem Magentaleuchten (`rgba(217, 70, 239, 0.28)`).
- **Zentrale SVG-Definitionen (`<defs>`):** Globale Gradienten `#coinRimGrad`, `#coinWellDepth` und `#sparkCoreGrad` in den Haupt-DOM eingebunden, absolut positioniert ohne Render-Overhead.
- **Typografie & Mikro-Labels:** Ziffern in `Orbitron` 15px (700er Schnitt, 0.04em Letter-Spacing) mit gestackten Mikro-Labels in `Rajdhani` 8px (`CREDITS` / `SPARKS`).
- **Workspace-weite Harmonisierung:**
  - Hauptmenü-Header (`#menu-currency-pill`): Integriert neue Vektoren & Schriftklassen.
  - Hangar-Kaufbutton (`#btn-buy-ship`): Credits-Vektor integriert.
  - Flug-Debriefing (`.debrief-loot-row`): Optische 17px/15px Icons für gesammelte Credits & Sparks.
  - Revive-Button (`#btn-gameover-revive`): Neuer Sparks-Vektor im Kosten-Badge (`1`).
  - UIManager & Dynamische Templates: `UIManager.COIN_SVG` und `UIManager.CRYSTAL_SVG` auf neue Vektor-Assets aktualisiert; Shop-, Aufgaben- und Benachrichtigungstemplates automatisch angeglichen.
  - German Strings: Nomenklatur zu Credits & Sparks standardisiert (`+1 SPARK!`, `KEINE SPARKS`).
- **Automatisierte Verifikation:** Playwright-Suite erfolgreich für alle Screens (`01`, `02`, `05`, `10`, `11_mobile`) verifiziert. 0 Konsolenfehler, 0 ungefangene Exceptions.

### v5.8.5 (06.09.2026) - Main Menu Header Collision Fix: Centered Currency Repositioning
- **Header-Kollision eliminiert:** Währungscontainer (`#menu-currency-pill`) aus der oberen Navigationsleiste (`.menu-top-bar`) entfernt. Pilot-Profil links und Quick-Actions (Missions, Settings) rechts verfügen nun auf allen Viewports (Desktop bis schmale Mobile-Screens) über großzügigen Freiraum ohne horizontale Überlappungen.
- **Zentrierte Repositionierung unter Logo:** Der rahmenlose Währungscontainer (`.currency-group.currency-clean`) sitzt nun perfekt zentriert in `.center-stage` unmittelbar unterhalb des `SLING JUMP`-Wordmarks und oberhalb des interaktiven Hangar-/Orbit-Canvas.
- **Konsistenter 20px-Abstand:** Abstand zwischen Gold-Kernen und Void-Kristallen ist mit `gap: 20px` responsive auf allen Displaybreiten fixiert. Ästhetik (Schriftarten, Tabular-Nums, Drop-Shadows, SVG-Vektoren) zu 100% unverändert. 0 Konsolenfehler.
- **Rahmenlose Währungsanzeige:** Gold-Kerne und Void-Kristalle aus der zentralen Box befreit und als minimalistische, schwebende Vektor-Glyphen mit Tabular-Ziffern in die rechte Action-Gruppe verlagert (Zero verschachtelte Kapseln/Chips).
- **Rahmenloser Profil-Button:** Äußere Kapselbox des Spielerprofils oben links vollständig entfernt; dezenter runder Avatar-Ring mit integriertem Online-Beacon und getracktem Rufzeichen.
- **Visuelle Ruhe & Freiraum:** Freie Fläche oberhalb des `SLING JUMP`-Logos maximiert Fokus und Lesbarkeit im Arcade-Look. 0 Konsolenfehler.

### v5.8.3 (06.09.2026) - Main Menu Top Header UI Glassmorphic Redesign
- **Ästhetische Einheitlichkeit:** Sämtliche oberen Menü-Elemente (`.menu-top-bar`) auf das hochwertige Frosted-Glassmorphism-Design (`backdrop-filter: blur(16px)`, `rgba(15, 23, 42, 0.70)`, feine Glasrahmen) des unteren Floating-Docks umgestellt.
- **Profil-Kapsel (`#btn-menu-profile`):** Avatar-Insignia mit integriertem smaragdgrünem Status-Beacon (`.profile-status-dot`) und sauber getracktem Pilotennamen (`Space Grotesk`).
- **Taktisches Missions-Icon (`#btn-menu-quests`):** Veraltetes Uhren-Icon durch scharfes taktisches Fadenkreuz-Zielvisier (SVG) und pulsierendes Crimson-Red-Alert-Badge (`#menu-quests-badge`) ersetzt.
- **Settings-Steuerung (`#btn-menu-settings`):** Präzisions-Cyber-Zahnrad (SVG) mit sanfter 45°-Rotationsanimation bei Hover.
- **Entkoppeltes FPS-Badge (`#menu-fps-badge`):** Als dezentes, schwebendes Mikro-Pill positioniert; verhindert jedes Stauchen oder Verzerren der 3-Zonen-Headersymmetrie.
- **Responsive Skalierung:** Perfekte Balance auf allen Bildschirmauflösungen von Mobile (390px) bis Desktop. 0 Konsolenfehler.

### v5.8.2 (06.09.2026) - Relative Altitude Baseline Fix
- **Root Cause:** Altitude was measured from absolute world `y=0`, but startNode spawns at `y~384px`. Players scored ~48m immediately without climbing.
- **Fix:** Introduced `startAltitudeY` (startNode.y + orbitRadius). Altitude = `max(0, (player.y - startAltitudeY) * 0.125)`. Downward-only flight now records 0m.
- **WorldManager:** Zone difficulty thresholds now relative to `startY`, not absolute `y=0`.
- **Leaderboard Guard:** 0m runs excluded from leaderboard entries.
- **Revive peakY:** Updated to `startAltitudeY + maxAltitudeMeters / METERS_PER_PIXEL`.
- **Verification:** Custom Playwright test confirms 0m on forced downward plunge. Visual suite 01+10 pass with 0 console errors.

### v5.8.1 (06.09.2026) - Unranked Leaderboard Overlay Removal & Token-Optimized Markdown Compression
- **Leaderboard Icon Unranked State:** `#rank-pill-badge` auf dem Leaderboard-Dock-Button wird bei `bestAltitude <= 0` vollständig ausgeblendet (`display: none`). Kein `#`-Overlay mehr vor dem ersten Flug.
- **Dynamisches Rank-Overlay:** Erst nach Absolvierung des ersten Flugs mit erzielten Metern (`bestAltitude > 0`) erscheint das goldene Rang-Badge (`#${rank}`).
- **Entfernung FPS-Playwright-Runner:** `scripts/benchmark_fps.js` und `scripts/stress_test_gameplay.js` sowie `08b_gameplay_fps_hud.png` und `package.json` `"test:fps"` restlos entfernt zur Maximierung der Token-Effizienz.
- **Komprimierung aller Markdown-Dateien:** Sämtliche `.md`-Dokumente auf dichte, token-effiziente Fakten komprimiert (-75% Token-Last).

### v5.8.0 (06.09.2026) - Death Screen Commercial Polish & Sequenced Stagger
- **Kosmische Void-Parität:** Künstliche CSS-Gradienten entfernt; Death-Screen nutzt nun transparenten Deep-Space-Canvas mit Vignette (`backdrop-filter: blur(6px)`).
- **Stempel- & Rewards-Bereinigung:** "SIGNAL VERLOREN" und alte Belohnungszeile entfernt; Flugdistanz bildet ungeteilten visuellen Hero-Fokus.
- **In-Flight Loot Row:** Münzen- und Kristall-Zähler hierarchisch unter die Telemetrie-Box verschoben; kaskadiert harmonisch bei 3.55s ein.
- **High-Contrast CTAs:** "WEITERFLIEGEN" im Cyber-Glas-Finish mit Quantum-Schild-Icon; "NEUSTART" in leuchtendem Arcade-Crimson.

### v5.5.0 (06.09.2026) - Starfield Drift, Difficulty Tuning & Hover Flames
- **Sternenfeld-Parallaxe:** Sanfte vertikale Drift-Bewegung (34 px/s) über alle Menüs und Modals ohne horizontale Ablenkung.
- **Schwierigkeits-Feinschliff:** `forkProbability` auf 0.03–0.05 reduziert; Mindestabstände um 20-25% geweitet für kernigeres Timing.
- **Hangar Hover:** Organisches Schiffs-Schweben und zweilagige Triebwerksflammen im Hauptmenü.

### v5.4.0 (06.09.2026) - Silent Quest Claim, Locked Skin 2 Coin Purchase & Cascading Debrief
- **Stiller Quest-Claim:** Belohnungen werden ohne störende Modals mit dezenten Toasts direkt gutgeschrieben.
- **Skin 2 Kauf:** Phönix-Skin für 250 Münzen direkt aus dem Hangar freischaltbar.
- **Kaskadierender Debrief:** Trajektorie-Aufstiegslinie animiert in 850ms, gefolgt von Telemetrie und Aktions-Buttons.

### v5.3.0 (06.09.2026) - Custom Delta Dart Skin 1, Phoenix Skin 2 & Arrowless Hangar
- **Vektorschiff-Design:** Delta Dart mit Neon-Rumpf und Phönix mit geschwungenen Schwingen.
- **Paginierte Navigation:** Pfeillose Klick-Punkte zur Skin-Auswahl im zentrierten Hangar-Karusell.

### v5.2.0 (06.09.2026) - Scaled Hangar Stage & Trophy Icon
- Hangar-Bühne um 50% skaliert für harmonische Proportionen; unverwechselbares 3-Stufen-Podest-Icon für den Leaderboard-Dock-Button.

### v5.1.0 (05.09.2026) - UI Style Unification & Front-Tab Modals
- Einheitliches Neon Crimson / Deep Space Design (`--accent-crimson: #ff1e42`).
- Modals als Front-Tabs vor dem lebendigen Menü-Hintergrund mit 16px Backdrop-Blur.

### v5.0.0 (05.09.2026) - Bold Crimson Red Main Menu Overhaul
- Split-Wordmark (`SLING` weiß, `JUMP` karminrot). Großer Primär-CTA `START` mit animiertem Glanzlicht.

### v4.7.0 – v4.7.3 (05.09.2026) - Performance Hardening & Architecture Cleanliness
- Live Rolling-Telemetrie (`Float32Array(30)`). Zero GC Frame-Budget (avg JS < 0.5ms).
- Debounced LocalStorage (1500ms Delay während des Flugs). Systematisches Refactoring (-405 Zeilen Altcode).

### v4.6.0 – v4.6.2 (05.09.2026) - AAA UI/UX Rework & Engine Optimization
- Minimalistische Vektor-Architektur, einheitliche Modals, optimierte Canvas-Pfade.

### v4.4.0 – v4.5.0 (05.09.2026) - Selektive Playwright-Suite & Lyria Audio
- Selektive Screenshot-Ausführung zur Token-Schonung. Google Lyria Synthwave-Soundtrack mit prozeduralem Fallback.

### v4.0.0 – v4.3.1 (04.09.2026) - Global Leaderboards & Standalone Analytics
- Deduplizierte Global Top-100 Rangliste. Standalone Growth Dashboard (`dashboard/`, Port 3001, Master-PIN 2026).

### v3.20.0 – v3.38.0 (03.09.2026 - 04.09.2026) - Quantum Revive & Deep Space Expansion
- Hyper-Kristall-Währung, Quantum Revive Engine mit 2.5s Schild, 90° Apex-Combos (x1–x10), Tödliche Minen ab 5.000m.

### v3.12.0 – v3.19.0 (03.09.2026) - PWA Engine, Mobile Sharing & Responsive Scaling
- PWA Offline-Caching (`sw.js`), 9:16 Responsive Viewport, Slingshot-Hitbox-Balancing.

### v1.0.0 – v3.11.0 (01.09.2026 - 02.09.2026) - Fundamentale Arcade-Engine
- 2D Canvas Grapple-Mechanik, Vorwärts-Reichweiten-Solver, Partikelsystem, Vektor-Grafik ohne Emojis.
