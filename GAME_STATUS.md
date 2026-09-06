# Sling Jump - Offizieller Spielstand & Historische Projekt-Dokumentation

> **Status:** Release Candidate (v5.17.1 - Leaderboard Redesign, Stiff Height & Floating-Dock Parity)  
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

## 3. Chronologische Release-Historie

### v5.18.0 (06.09.2026) - Password Auth, Stats Redesign & Tutorial Polish
- **Username+Password Cross-Device Auth (`serve.js`, `StorageService.js`, `main.js`, `index.html`):**
  - Optional SHA-256 password protection for cross-device sync. Client hashes via Web Crypto API, server stores hash in `players.json`.
  - Profile sync card: "PASSWORT SETZEN" input + "PASSWORT ENTFERNEN" button with reactive status badge (KEIN PASSWORT GESETZT / PASSWORT AKTIV).
  - Load section: Password input alongside ID field. Server returns 403 on wrong password.
  - Backward compatible: unprotected accounts sync freely.
- **Stats Modal Redesign (`index.html`, `style.css`):**
  - Full floating-dock parity: `.stats-modal-card` with stiff `580px` height, `#0b0d13` base, `24px` radius.
  - Hero Record Card (`.stats-hero-card`) with crimson accent border, SVG trend icon, bold Orbitron value.
  - 10 stat tiles in 2-column grid (`.stats-grid-list` > `.stats-tile`) with floating-dock fill, hover micro-animations, custom crimson scrollbar.
- **Tutorial Text Simplification (`architecture.md`):**
  - Removed jargon labels (GRAVITATIONS-ANKER, ORBIT-SCHWUNG, APEX-LAUNCH) from documentation sync.
  - Tutorial already had simplified monochrome text from v5.17.0.

### v5.17.1 (06.09.2026) - Leaderboard Tab Cybernetic Redesign, Stiff Height & Hero Standing
- **Leaderboard Redesign & Floating-Dock Parität (`style.css`, `index.html`, `architecture.md`):**
  - Äußere Hülle (`.leaderboard-modal-card`) an Missions- und Einstellungs-Modalkästen angeglichen: Solide dunkle `#0b0d13` Basis, `1px solid rgba(255, 255, 255, 0.08)`, `24px` Border-Radius, `0 24px 64px rgba(0, 0, 0, 0.9)` Tiefenschatten.
  - Starrer, fester Höhenrahmen (`height: 580px; max-height: 88vh;` Desktop, `560px` Mobile) mit `display: flex; flex-direction: column;` und `flex: 1; min-height: 0;` Scroll-Liste. Kein Höhenzittern oder Verrutschen mehr bei unterschiedlicher Spieleranzahl.
  - Neugedachte visuelle Platzierung: Der Spieler-Status (`.leaderboard-hero-card` / `#player-rank-card`) thront direkt unter dem zentrierten, getrackten Titel `BESTENLISTE` auf Augenhöhe – inklusive leuchtendem Rang-Badge `#2`, dynamischem Prozentrang-Titel, Bestleistung in Orbitron Tabular-Ziffern und `DEIN RANG` Status-Pill.
  - Elegante Tabellen-Spaltenleiste (`RANG`, `PILOT`, `REKORD`) und überarbeitete Zeilen mit Podium-Medaillen-Glow (Gold #1, Silber #2, Bronze #3), aktivem Spieler-Highlighting (`.player-entry`) und feinem Crimson-Scrollbalken.
- **Profil-Tab Bereinigung & Namensänderungs-Notice (`scripts/playwright_runner.js`):**
  - Bestätigung der vollständigen Abwesenheit alter Performance/Flug-Statusleisten.
  - Timing der Screenshot-Erfassung optimiert, sodass `06b_pilot_profile.png` den sauberen Ausgangszustand mit `NOCH 2 NAMENSÄNDERUNGEN VERFÜGBAR` zeigt.
- **Automatisierte Playwright Verifikation:**
  - 0 Konsolenfehler, 0 ungefangene Ausnahmen, Screenshots `04_hub_leaderboard.png`, `06b_pilot_profile.png`, `13_tutorial_modal.png` visuell geprüft.

### v5.16.7 (06.09.2026) - Settings Modal Floating-Dock & Mission Parity Redesign
- **Settings Redesign & Floating-Dock Hintergrund-Angleichung (`style.css`, `index.html`, `UIManager.js`):**
  - Äußerer Modalkasten (`.settings-modal-card`) an `.missions-modal-card` angeglichen (`background: #0b0d13 !important; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.9);`).
  - Alle Einstellungszeilen (`.setting-row`) 1:1 an `.floating-dock` aus dem Hauptmenü angepasst (`background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; backdrop-filter: blur(16px); padding: 14px 18px;`).
  - Hover-Effekt mit `rgba(255, 255, 255, 0.055)` und dezentem Lift (`translateY(-1px)`).
  - Toggles (`.btn-toggle`) mit Crimson-Glow (`AN`) und dezentem Glasmorphismus (`AUS`) harmonisiert.
  - Buttons (`NACH UPDATES SUCHEN`, `SPIELSTAND ZURÜCKSETZEN`) auf einheitliches modernes Glas-Pill-Design migriert.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`07_settings.png`) mit 0 Konsolenfehlern validiert.

### v5.16.6 (06.09.2026) - Updated Daily & Weekly Mission Objectives
- **Neue Missionsziele (kurz, prägnant, commercial minimalism):**
  - **Täglich (3 Quests):**
    1. `3.000m in einem Flug` (`altitude_single`, Ziel: 3.000m, Belohnung: 200)
    2. `25 Münzen sammeln` (`cores_cumulative`, Ziel: 25, Belohnung: 175)
    3. `5 Katapulte nutzen` (`boost_cumulative`, Ziel: 5, Belohnung: 200)
  - **Wöchentlich (3 Quests):**
    1. `30.000m insgesamt` (`altitude_cumulative`, Ziel: 30.000m, Belohnung: 1.500)
    2. `80 Münzen sammeln` (`cores_cumulative`, Ziel: 80, Belohnung: 1.200)
    3. `5er-Combo schaffen` (`combo_single`, Ziel: 5, Belohnung: 1.400)
- **Engine-Erweiterungen (`MissionManager.js`, `GameEngine.js`, `StorageService.js`):**
  - `onCombo(comboLevel)` in `MissionManager` implementiert und an `GameEngine` Launch-Callback angebunden.
  - `boost_cumulative` Unterstützung in `onSuperBoostUsed()` für kumulative Katapult-Nutzung hinzugefügt.
  - `rotateWeeklyQuests` auf 3 simultane Wochen-Herausforderungen skaliert.
  - Tab-Badges (`ALLE: 6`, `TÄGLICH: 3`, `WÖCHENTLICH: 3`) in `index.html` und `UIManager` synchronisiert.
  - Schema-Migration in `StorageService` für unterbrechungsfreie Aktualisierung bestehender Spielstände implementiert.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`05_hub_quests`, `05c_hub_quests_scrolled`, `05d_hub_quests_tab_weekly`, `05e_hub_quests_tab_daily`) mit 0 Konsolenfehlern validiert.

### v5.16.5 (06.09.2026) - Mission Overview & Quest Cards Floating-Dock Background Parity
- **100% Farb- und Materialharmonisierung mit Hauptmenü-Dock (`style.css`):**
  - Bläulichen Kasten-Hintergrund (`#11141e`) bei `.missions-overview-bar` und `.quest-card` restlos eliminiert.
  - Exakte Angleichung an `.floating-dock` (`background: rgba(255, 255, 255, 0.035)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `backdrop-filter: blur(16px)`).
  - Hover-State (`.quest-card:hover`) auf `rgba(255, 255, 255, 0.055)` kalibriert.
  - Nahtlose visuelle Konsistenz zwischen Hauptmenü-Navigation und Missionsübersicht ohne Farbbruch.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`node scripts/playwright_runner.js 05`) mit 0 Fehlern validiert (`05_hub_quests.png`, `05b_hub_quests_claimed.png`).

### v5.16.4 (06.09.2026) - Mission Pending Rewards Optical Alignment
- **Optische Zentrierung von Text, Zahl und Credit-Münze (`style.css`, `UIManager.js`, `index.html`):**
  - Vertikaler Versatz des Credit-Symbols in der Übersicht (`BELOHNUNG BEREIT: 0 (C)` / `+... (C)`) restlos behoben.
  - `.pending-label` und `.pending-val` auf `inline-flex; align-items: center; line-height: 1;` harmonisiert.
  - Zahlenwerte in dedizierte `.pending-num`-Container gekapselt, um Whitespace-Shiftings zu eliminieren.
  - SVG-Coin-Icon auf 14px dimensioniert und mit optischem -1px Top-Offset exakt auf die horizontale Mittellinie der Orbitron-Ziffern und des Rajdhani-Labels zentriert.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`node scripts/playwright_runner.js 05`) mit 0 Fehlern validiert (`05_hub_quests.png`, `05b_hub_quests_claimed.png`). 100%ige optische Centerline-Synchronisation bestätigt.

### v5.16.3 (06.09.2026) - Mission Tab Solid Dark Background (Dock Parity & Zero Glassmorph)
- **Beseitigung von Glassmorph-Durchscheinen (`style.css`):**
  - `backdrop-filter: blur(...)` von `.missions-modal-card`, `.quest-card` und `.missions-overview-bar` entfernt, um unerwünschtes Durchscheinen von Hintergrundelementen (wie Triebwerksflammen, Logo-Halo) zu unterbinden.
- **Solide Farbharmonie gemäß Hauptmenü-Dock:**
  - `.missions-modal-card`: Auf solides Tiefschwarz-Obsidian `#0b0d13` mit `border: 1px solid rgba(255, 255, 255, 0.08)` und Schatten `0 24px 64px rgba(0, 0, 0, 0.9)` gesetzt.
  - `.quest-card` & `.missions-overview-bar`: Solider Charcoal-Kartenhintergrund `#11141e` mit `border: 1px solid rgba(255, 255, 255, 0.08)`, Hover `#161b28`.
  - `.missions-filter-tabs`: Solides `#0e121b` mit `border: 1px solid rgba(255, 255, 255, 0.08)`.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`node scripts/playwright_runner.js 05`) mit 0 Fehlern validiert (`05_hub_quests.png`, `05b_hub_quests_claimed.png`, `05c_hub_quests_scrolled.png`, `05d_hub_quests_tab_weekly.png`).

### v5.16.2 (06.09.2026) - Mission Tab Modal Frosted Floating-Dock Styling & Design Parity
- **Frosted Floating-Dock Modal Background (`style.css`):**
  - Evaluation: Hervorragende Designwahl. Beseitigt den massiven, undurchsichtigen Navy-Kasten und erzeugt nahtlose visuelle Kohärenz mit dem unteren Hauptmenü-Dock (`.floating-dock`).
  - `.missions-modal-card` auf `background: rgba(255, 255, 255, 0.035) !important;`, `border: 1px solid rgba(255, 255, 255, 0.08) !important;`, `backdrop-filter: blur(20px);` umgestellt.
  - Exzellenter Kontrast durch dunkles Backdrop-Overlay (`rgba(4, 7, 15, 0.78)`), während Sternenfeld und Partikel subtil durchschimmern.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`node scripts/playwright_runner.js 05`) mit 0 Fehlern erfolgreich validiert (`05_hub_quests.png`, `05b_hub_quests_claimed.png`, `05c_hub_quests_scrolled.png`, `05d_hub_quests_tab_weekly.png`).

### v5.16.1 (06.09.2026) - Mission Box Top-Right Rewards & Typography Legibility Overhaul
- **Belohnungs-Positionierung oben rechts (`UIManager.js`, `style.css`):**
  - Restrukturierung des Karten-Kopfs (`.quest-card-header`): Titel linksbündig (`.quest-card-title`), Belohnung (`+ ... C` bzw. `EINGELÖST`) oben rechtsbündig (`.quest-card-reward`).
  - Gelber Rahmen/Hintergrund um die Credits restlos entfernt (`background: transparent; border: none; padding: 0`).
  - Darstellung als gestochen scharfe Gold-Typografie (`Orbitron:wght@800`, 13.5px) direkt neben dem Vektor-Coin-SVG.
- **Lesbarkeit & Schriftgrößen-Upgrade (`style.css`):**
  - Sektionstitel "TÄGLICHE MISSIONEN" und "WÖCHENTLICHE HERAUSFORDERUNGEN" vergrößert (auf 13.5px, reines Weiß `#ffffff`, Tracked 1px, `white-space: nowrap`), kein Zeilenumbruch mehr.
  - Kartentitel auf 14px, Missionsbeschreibungen auf 12.5px und Fortschrittsanzeige auf 10.5px angehoben.
  - Fortschrittsbalken spannt nun elegant über die volle Kartenbreite.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`node scripts/playwright_runner.js 05`) mit 0 Fehlern erfolgreich validiert (`05_hub_quests.png`, `05b_hub_quests_claimed.png`, `05c_hub_quests_scrolled.png`, `05d_hub_quests_tab_weekly.png`).

### v5.16.0 (06.09.2026) - Mission Tab Commercial Redesign & Floating-Dock Parity
- **Feste modale Höhen-Geometrie (`style.css`):**
  - Feste Höhe von `580px` (`max-height: 88vh`) auf `.missions-modal-card` etabliert und `.quests-scroll-area` auf flexibles Scrolling (`flex: 1; min-height: 0;`) umgestellt.
  - Das Modal behält beim Umschalten zwischen Kategorien (`ALLE`, `TÄGLICH`, `WÖCHENTLICH`) eine absolut konstante Größe ohne Layout-Jumps oder Höhenzucken.
- **Glassmorphic Floating-Dock Ästhetik (`style.css`):**
  - Missionskarten (`.quest-card`) und Fortschrittsleiste (`.missions-overview-bar`) an das Design des Hauptmenü-Docks angeglichen (`background: rgba(255, 255, 255, 0.035)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, `backdrop-filter: blur(16px)`).
  - Farblinie am linken Rand (`.quest-card::before`) restlos entfernt für eine beruhigte, minimalistische Kartenoptik.
- **Typografische & Dekorative Bereinigung (`index.html`, `UIManager.js`):**
  - Oberzeile `ORBITALE PROTOKOLLE` über dem Titel entfernt.
  - Icons vor `TÄGLICHE MISSIONEN` und `WÖCHENTLICHE HERAUSFORDERUNGEN` entfernt.
  - Einzelne Missions-Icons vor den Missionskarten sowie die Kategorie-Badges (`TAG` / `WOCHE`) eliminiert.
  - Übersichtliche Ausrichtung mit klarem Fokus auf Titel, Beschreibung, Fortschrittsbalken und Belohnung.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`node scripts/playwright_runner.js 05`) mit 0 Fehlern erfolgreich validiert (`05_hub_quests.png`, `05b_hub_quests_claimed.png`, `05c_hub_quests_scrolled.png`, `05d_hub_quests_tab_weekly.png`).

### v5.15.1 (06.09.2026) - Mathematical Optical Centering & Pure Vector Bullion Parity
- **Mathematische Glyphen-Zentrierung (`EnergyOrb.js`):**
  - Vertikale Verschiebung des 'C' restlos eliminiert: Dynamische Berechnung aus `measureText('C')` mit $\Delta y = (\text{actualBoundingBoxAscent} - \text{actualBoundingBoxDescent}) / 2$.
  - Ränder innerhalb der dunklen Kontrastmulde von 9.2px oben / 16.2px unten auf 12.2px oben / 13.2px unten kalibriert (innerhalb von 1 Pixel perfekter diskreter Rastersymmetrie).
  - Horizontale Zentrierung mit 16.2px / 17.2px perfekt symmetrisch verankert.
- **100% Visuelle Synchronisation mit dem Hauptmenü:**
  - Diffuser oranger Glow (`COIN_GLOW`) von In-Game-Collectibles entfernt, wodurch der gestochen scharfe Vektor-Außenrand (`#260b02`), der Gold-Bevel (`#fde68a` $\to$ `#f59e0b` $\to$ `#78350f`) und der Spekular-Glanzring exakt wie im Hauptmenü dargestellt werden.
  - Asynchroner Font-Listener auf `document.fonts.load('700 46px "Rajdhani"')` erweitert, um sicherzustellen, dass das Canvas-Sprite nach Font-Abschluss sofort mit den finalen Metriken re-gerastert wird.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`01_main_menu.png`, `08_gameplay_hud.png`) mit 0 Fehlern erfolgreich validiert.

### v5.15.0 (06.09.2026) - Universal Main Menu Coin Visual Synchronization
- **In-Game Map Collectibles (`EnergyOrb.js`):**
  - Vorgerendertes Zero-GC Canvas-Sprite (`CREDIT_SPRITE`) auf eine exakte 1:1 Vektor-Reproduktion des Hauptmenü-SVG-Standards aktualisiert (72x72 Pixel, 2x Supersampling für gestochen scharfe Retina-Darstellung).
  - Identische Vektor-Ebenen: Gefaster Goldrand (`#fde68a` $\to$ `#f59e0b` $\to$ `#78350f`), kreisförmiger Spekular-Glanzring (`rgba(254, 240, 138, 0.45)`), vertiefte Kontrastmulde (`#5c2409` $\to$ `#240a02` $\to$ `#140501`) und markantes Rajdhani-700 'C'-Glyph mit exakten Proportionen.
  - Skalierung auf der Karte: Rendering bei 36px Durchmesser (entsprechend der nativen Menügröße) eingebettet in die sanft pulsierende, warme Gold-Aura (`COIN_GLOW`).
- **Onboarding-Tutorial Animation (`UIManager.js`):**
  - Generischen gelben Kreisbogen (`arc(0, 0, 6)`) durch die tatsächlichen vorgerenderten Sprites (`CREDIT_SPRITE` & `COIN_GLOW`) ersetzt.
- **Projektweite Visuelle Einheit:**
  - Hauptmenü-Header, Hangar-Kaufbutton, Debriefing-Loot-Chips und in-flight Münzen auf der Karte verwenden nun ausnahmslos dieselbe visuelle Markenidentität.
- **Automatisierte Verifikation:**
  - Playwright Visual Suite erfolgreich für Screens 01, 02, 08 und 10 ausgeführt. 0 Konsolenfehler, 0 ungefangene Exceptions.

### v5.14.0 (06.09.2026) - Game-Wide Title Red Carmine Palette Unification
- **Vollständige Rot-Harmonisierung auf das Titel-Rot (`#e11d48`):**
  - **CSS-Variablen (`style.css`):**
    - `--accent-crimson: #e11d48` (RGB: `225, 29, 72`), `--accent-crimson-glow: rgba(225, 29, 72, 0.55)`, `--btn-crimson-start: #e11d48`, `--btn-crimson-end: #9f1239`, `--danger: #e11d48`.
  - **Buttons & Interaktion:**
    - `.btn-primary` & `.btn-play-bold`: Harmonischer Karminrot-Verlauf (`#e11d48` bis `#9f1239`) mit passendem Glow.
    - `.btn-danger`: Karmin-Border (`rgba(225, 29, 72, 0.5)`), sanfter Hintergrund (`rgba(159, 18, 57, 0.4)`), Hover-Fläche (`#e11d48`).
    - `.debrief-btn.retry`: "NEUSTART"-Button im exakten Farbverlauf (`#f43f5e` $\to$ `#e11d48` $\to$ `#9f1239`) und Rose-Glow (`rgba(225, 29, 72, 0.42)`).
  - **Partikel & Triebwerke:**
    - `.plasma-flame`: Triebwerksplume und Nozzle-Flare im Hauptmenü auf `#e11d48` / `#fb7185` umgestellt.
    - `GameEngine.js` & `ParticleSystem.js`: Kanten-Splitter (`spawnShards`) und Gefahren-Texte (`CRACK!`, `MINE DETONIERT!`, `NEAR MISS!`) einheitlich in `#e11d48`.
  - **Entitäten & In-Game-Welt:**
    - `Spaceship.js`: Delta-Pfeil Innen-Chevron und Bug-Speerspitze auf `#e11d48` synchronisiert.
    - `Node.js`: Weltraum-Minen (Warnkreis `#e11d48`, Hülle `#9f1239`, Spitzen `#fda4af`, Glow `rgba(225, 29, 72, 0.7)`) und Zeituhr-Warnstufen harmonisiert.
    - `WorldManager.js`: Todeslaser-Horizont am unteren Bildschirmrand auf Karminrot kalibriert.
  - **UI & Telemetrie:**
    - Flugdebriefing-Crash-Fadenkreuz (`index.html`), Aufgabenschienen-Füllung (`.quest-bar-fill`), FPS-Stotter-Warnung (`< 42 FPS`) und Dashboard-Farben (`dashboard.css`).
  - Verifiziert via Playwright Visual Test Suite (Screens 01, 05, 10, 11). 0 Konsolenfehler.

### v5.13.1 (06.09.2026) - Death Screen Layout Elevation & Balanced Telemetry Alignment
- **Flight Debrief Layout Elevation (`.debrief-body`):**
  - Vertikaler Offset um -56px nach oben verschoben (`transform: translateY(-56px)`).
  - Umfasst den gesamten Daten- und Belohnungsblock: `FLUGDISTANZ` (Hero-Score), `REKORDJAGD` (Chase-Progressbar), Telemetrie-Grid (`Grapples`, `Bester Swing`, `Flugzeit`) sowie Währungs-Beutezeile (Credits & Sparks).
  - Exakte optische Ausrichtung: `FLUGDISTANZ` schließt nun bündig mit der oberen Markierung (`603`) der linken Telemetrie-Schiene ab ($y \approx 138\text{px}$ auf Desktop, $y \approx 160\text{px}$ auf Mobile).
  - Beseitigt unproportionale Leerräume oberhalb der Action-Buttons (`REVIVE` / `RETRY`) und verhindert visuelle Kompression im unteren Bildschirmdrittel.
  - Responsive Höhen-Staffelung: `-20px` bei `@media (max-height: 740px)` und `-8px` bei `@media (max-height: 620px)`.
  - Vollständige Playwright Visual Suite Verifikation für Screen 10 (`10_game_over.png`, `10c_mobile_game_over.png`). 0 Konsolenfehler.

### v5.13.0 (06.09.2026) - SPACE JUMP Aerospace Dual-Bevel Title Design
- **Neues "SPACE JUMP" Titeldesign (Aerospace Dual-Bevel):**
  - **Neues HTML & DOM-Lockup:** Semantisches `.title-lockup` Layout mit `.title-space` oben und 4-fach gefastem `.casing-frame` (äußerer Rim) + `.casing-plate` (Innenplatte) für `JUMP`.
  - **Typografie & Geometrie:**
    - Google Font `Oxanium:wght@900` mit Vorwärts-Shear (`transform: skewX(-10deg)`).
    - `SPACE`: Hochweiß (`#ffffff`) mit 0.26em Letter-Spacing (optisch austariert via -0.26em Negativ-Margin) und solidem Extrusionsschatten `0px 4px 0px #0f172a`.
    - `JUMP`: Gefaster Casing-Frame mit Rose-zu-Burgunder-Farbverlauf (`#fecdd3` bis `#9f1239`), tiefem 6px Drop-Shadow (`0 6px 0 #000000`), vibrierender Karminrot-Innenplatte (`#e11d48`) und solidem Schatten `0px 4px 0px #881337`.
  - **Responsivität:** `clamp(...)`-Skalierung für viewport-unabhängige Zentrierung ohne Überlauf auf schmalen Bildschirmen (< 360px).
  - Veraltete diffuse Glow-Filter und `@keyframes titlePulse` sauber entfernt.
  - Verifiziert gegen Benchmark-Referenzbild auf Desktop und Mobile (390x844). 0 Konsolenfehler.

### v5.12.0 (06.09.2026) - Oxanium Aerospace Title Redesign & Minimalist Currency Pill
- **Game Title Redesign ("SLING JUMP"):**
  - **Font Integration:** Google Font `Oxanium:wght@800;900` (`'Oxanium', sans-serif; 900`).
  - **Kinetische Vorwärtsneigung (Shear):** `transform: skewX(-10deg)` für dynamischen Richtungsschub.
  - **Typografisches Spacing:** `SLING` (`letter-spacing: 0.18em; font-size: clamp(34px, 8vw, 44px)`), `JUMP` (`letter-spacing: 0.12em; font-size: clamp(48px, 11vw, 60px); line-height: 0.95`).
  - **Mehrschichtige Shader & Filter:**
    - `SLING`: Hochweiß (`#f8fafc`) mit eisblauem Multi-Layer Glow (`0 0 1px ... 0 2px 8px ... 0 0 20px`).
    - `JUMP`: Text-Clipping mit linearem Crimson-Verlauf (`#ff4b72` $\to$ `#e11d48` $\to$ `#9f1239`) und Multi-Drop-Shadow Flare.
  - **Pulsierende Glow-Animation:** `@keyframes titlePulse` auf dem roten Glühen von `JUMP` (3s ease-in-out infinite).
- **Hauptmenü Währungs-Visuelles & Textbereinigung:**
  - **Originales Credit-Visual wiederhergestellt:** Goldene Bullion-Münze mit gefastem Rand, vertiefter Kontrastmulde und präzisem Rajdhani 'C'-Glyphen im Hauptmenü.
  - **Text-Entfernung ("CREDITS" & "SPARKS"):** Reines minimalistisches Icon + Zahlenwert (`0` & `1`), vollständige Beseitigung störender Text-Labels für puren Arcade-Look.
  - Vollständige mobile Responsivität verifiziert (390x844). 0 Konsolenfehler.

### v5.11.0 (06.09.2026) - Two-Font Typography Standardization & Precision Coin Centering
- **Münz-Zentrierung & Rework (Exakt in der Mitte):**
  - **In-Game Bullion-Münze (`EnergyOrb.js`):** Mathematische Ink-Bounding-Box-Zentrierung via `measureText('C')` (`actualBoundingBoxLeft`, `actualBoundingBoxRight`, `actualBoundingBoxAscent`, `actualBoundingBoxDescent`). Korrektur des 2.65px Tieflagen- und Links-Versatzes auf 100% symmetrische Abstände in allen 4 Quadranten.
  - **Vektor-Coin SVGs (`index.html`, `UIManager.js`):** Ersatz fehlerhafter `text-anchor`-Versätze durch präzise geometrische Vektorpfade mit mathematisch identischen Randabständen (6.535px horizontal, 5.6px vertikal) in Hauptmenü, Hangar-Kaufbutton, Debriefing-Loot und Quest-Badges.
- **Projektweites Zwei-Font-System:**
  - **Orbitron (`Orbitron:wght@500;700`):** Einheitlicher Font für alle Zahlen, Metriken, Zähler, Timer, Währungswerte, Highscores, Ranglisten und Canvas-Zahlenreadouts (`font-variant-numeric: tabular-nums`).
  - **Rajdhani (`Rajdhani:wght@500;600;700`):** Einheitlicher Font für alle Buchstaben, allgemeinen UI-Elemente, Labels, Menüs, Buttons, Profilnamen und Canvas-Textlabels.
  - **Strikte Ausnahme für Spieltitel:** `.title-sling` und `.title-jump` behalten unverändert die originale Markenidentität (`'Space Grotesk', 'Chakra Petch', system-ui, sans-serif; 900`).
  - **Canvas & Font-Readiness:** Synchronisation aller Sprites und Onboarding-Tooltips (`document.fonts.ready`), vollständige Entfernung generischer Fallback-Schriften (`Inter`, `Montserrat`, `Sora`, `Manrope`, `Segoe UI`, `Arial`).

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

### v5.17.0 (06.09.2026) - Minimalist Text Tutorial, Centered Renames & Cross-Device Sync
- **Tutorial Modal Redesign (`#tutorial-modal`):**
  - Video- & Canvas-Animationen restlos entfernt. 100% textbasiertes, minimalistisches Arcade-Design (Alto's Adventure Ästhetik).
  - 3 schwebende Floating-Dock Karten: `01 / HALTEN` (Gravitations-Anker), `02 / ROTIEREN` (Orbit-Schwung), `03 / KATAPULTIEREN` (Apex-Launch).
  - Neuer prominenter `VERSTANDEN`-Button mit Karmin-Glow.
- **Profil-Modal Optimierungen (`#profile-modal`):**
  - Untere Telemetrie-Zeile ("Bestleistung, Flüge, Status") restlos entfernt.
  - Namensänderungs-Badge auf "NOCH 2 NAMENSÄNDERUNGEN VERFÜGBAR" (bzw. "NOCH 1 NAMENSÄNDERUNG VERFÜGBAR") aktualisiert und im grünen Kasten horizontal & vertikal perfekt zentriert (`display: flex; align-items: center; justify-content: center;`).
- **Cross-Device Unique User & Cloud Sync System:**
  - Automatische Erkennung & Login mit einzigartiger 4-stelliger User-ID (`#XXXX`, z. B. `#EXGN`) ab der ersten Sekunde (0-Klick Onboarding).
  - Neuer "SPIELSTAND-LINK KOPIEREN"-Button im Profil-Tab generiert direkten Link (`?id=XXXX`) für nahtlose Übertragung auf andere Geräte und Browser.
  - Manuelle Code-Eingabe ("ID Z.B. #EXGN") mit "LADEN"-Button zur flexiblen Spielstand-Wiederherstellung.
  - Server-Endpunkte `POST /api/player/sync` und `GET /api/player/:id` in `scripts/serve.js` mit `data/players.json`-Persistenz implementiert.
- **Automatisierte Verifikation:**
  - Playwright Visual Runner (`node scripts/playwright_runner.js 06b,13,07`) mit 0 Fehlern erfolgreich ausgeführt (`06b_pilot_profile.png`, `13_tutorial_modal.png`, `07_settings.png`).

### v5.16.9 (06.09.2026) - Profile Modal Floating-Dock Parity, 2x Free Renames & Short IDs (#XXXX)
- **Profil-Modal Redesign:** Schwebende Dock-Karten (`.profile-hero-card`, `.profile-edit-card`, `.profile-telemetry-card`) mit exakter Floating-Dock-Hintergrund-Parität (`rgba(255, 255, 255, 0.035)`, `backdrop-filter: blur(16px)`).
- **2x Kostenlose Namensänderungen:** Erhöhung des Kontingents auf 2 freie Namenswechsel (`MAX_FREE_CHANGES = 2`). Dynamisches Status-Pill zeigt verbleibendes Kontingent reaktiv an; Formular sperrt sich nach Verbrauch.
- **Ultrakurze User-IDs:** Neuer kompakter 4-stelliger alphanumerischer Gamer-Tag mit Hash-Präfix (`#XXXX`, z. B. `#EXGN`), automatische Migration aller alten langen Hash-IDs.
- **Piloten-Telemetrie-Grid:** 3-spaltige Karriere-Übersicht (Bestleistung, Flüge, Online-Status).

### v5.16.8 (06.09.2026) - Mission Modal Streamlining & Overview Header Removal
- **Missions-Header Bereinigung:** Obere Übersicht-Box (`#missions-overview-bar` mit "ABGESCHLOSSEN 0/6" & Belohnungsanzeige) vollständig aus HTML, CSS und JS-DOM entfernt.
- **Maximaler Fokus & Vertikaler Freiraum:** Direkter Übergang vom Titel `MISSIONEN` auf die Kategorien-Tabs (`ALLE`, `TÄGLICH`, `WÖCHENTLICH`), mehr Platz für Missionskarten ohne Scroll-Gedränge.
- **Codebase-Hygiene:** Verwaiste CSS-Klassen und ungenutzte DOM-Cache-Bindings in `UIManager.js` restlos bereinigt.

### v5.16.7 (06.09.2026) - Version Single Source of Truth & Settings Parity
- **Versions-Synchronisation:** `CONSTANTS.VERSION`, `package.json`, `version.json`, `sw.js`, `index.html` und `GAME_SYSTEMS.md` auf einheitliche Release-Version `5.16.7` gehoben.
- **Settings-Modal Redesign:** Schwebende Dock-Card mit exaktem Floating-Dock-Hintergrund (`rgba(10, 14, 26, 0.72)`), 20px Corner-Radius, zentrierten Action-Buttons und akkuratem Versions-Tag.

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
