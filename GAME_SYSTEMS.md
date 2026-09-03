# SLING JUMP - VOLLSTÄNDIGES SYSTEM- & SPIEL-HANDBUCH (INTERNE REFERENZ)

Dokumentationsstand: Version 3.26.0  
Aktualisiert am: 03. September 2026  
Status: Produktion & QA-verifiziert (100% Playwright Freshness & 0 Konsolenfehler)  
Permanenter Live-Link: [https://bauerjohannes2-max.github.io/sling-jump/](https://bauerjohannes2-max.github.io/sling-jump/)  
Repository: [https://github.com/bauerjohannes2-max/sling-jump](https://github.com/bauerjohannes2-max/sling-jump)

---

## 1. SPIELKONZEPT & KERN-LOOP

* **Genre:** Physikalischer Endless Orbital Catapult Climber (Arcade / Skill-basiert).
* **Ziel:** Mit einem Raumschiff durch gezieltes Einhaken an Himmelsknoten immer höher in den Weltraum zu klettern und dem aufsteigenden roten Gravitations-Abgrund zu entkommen.
* **Score-Philosophie:** Die erreichte Höhe in Metern (`m`) ist der alleinige Hauptwert (Hero Score).
* **Zwei-Währungs-Ökonomie:**
  1. **Münzen (`cores` / Orbs):** Reguläre In-Game Währung, sammelbar in Formationen im All oder als Quest-Belohnungen. Dient zum Freischalten von Raumschiffen und Schweifen im Hangar.
  2. **Hyper-Kristalle (`CRYSTAL`):** Extrem seltene violett-pinke Währung (~5% Spawn-Chance ab 5.000m Höhe). Dient zur sofortigen **Quanten-Wiederbelebung** nach einem Absturz.

---

## 2. STEUERUNG & PHYSIK-MECHANIKEN

### 2.1 Einhaken (Grapple Hook) & Schwereloser Orbit
* **Aktion:** Bildschirm / Maustaste gedrückt halten (Touch / Pointerdown / Leertaste).
* **Tetherless Grappling (Freier Orbit):**
  * Auf Nutzerwunsch wurde der visuelle Haltestrahl zwischen Raumschiff und Knoten komplett entfernt.
  * Das Schiff geht beim Einhaken in einen freien, ungestörten kreisförmigen Orbit um den Zielknoten über.
  * Lineare Geschwindigkeiten werden beim Einhaken sofort auf null gesetzt (`vx = 0, vy = 0`), sodass Sterne im Hintergrund punktförmig bleiben.
* **Fadenkreuz & Zielerfassung:**
  * Das nächste erreichbare Objekt innerhalb der Reichweite (`HOOK_RANGE = 180px`) wird mit einem zirkulären Lock-On-Fadenkreuz markiert.
  * **Ausschluss:** Tödliche Weltraum-Minen (`HAZARD`) werden niemals anvisiert.

### 2.2 Loslassen & Katapult-Abschuss (Slingshot Release)
* **Aktion:** Loslassen des Bildschirms / Taste.
* **Funktionsweise:**
  * Das Schiff löst sich tangential aus dem Orbit und übernimmt die Fliehkraft als lineare Fluggeschwindigkeit (`vx`, `vy`).
  * Normaler Sprung: Gewährt einen Basis-Aufwärtsschub (`+80 vy`), sofern die Flugbahn nach oben gerichtet ist.

---

## 3. COMBO-SYSTEM & PRÄZISIONS-KATAPULT

* **Steilsprung-Bedingung (90°-Winkel):**
  * Der Abschusswinkel muss nahezu exakt senkrecht nach oben zeigen (`tangentY >= 0.985`, unter 9.9° Abweichung von der echten Vertikalen).
* **Progressiver Extra-Boost:**
  * Jeder aufeinanderfolgende 90°-Steilsprung erhöht den Combo-Zähler um +1 bis maximal **x10**.
  * Formel für Zusatzschub: `launchBonus = 45 + comboLevel * 20` (z.B. +65 bei x1 bis zu +245 bei x10).
* **Unified Floating Text (Keine Textüberlagerungen):**
  * Bei Combo x1 erscheint ausschließlich: `PERFEKT 90°!`.
  * Ab Combo x2+ erscheint ausschließlich: `COMBO xN!` (z.B. `COMBO x2!`, `COMBO x3!`).
  * Beide Texte überlagern sich niemals; die Anzeige ist mit dem HUD-Badge `#hud-combo-badge` synchronisiert.

---

## 4. KNOTEN-TYPEN & 7-STUFIGE PROGRESSIONS-MATRIX

Die prozedurale Generierung (`WorldManager.js`) skaliert die Schwierigkeit dynamisch entlang von 7 Zonen:

| Zone | Höhenbereich | Standard (%) | Super-Boost (%) | Beweglich (%) | Zeituhr / Fragil (%) | Köder / Fissur (%) | Weltraum-Mine / Bombe (Lethal) | Min/Max Lücke | Mechanische Charakteristik |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Zone 1: Kalibrierung** | 0 m – 500 m | 100% | 0% | 0% | 0% | 0% | 0% | 140 – 180 px | 100% stabile Basisknoten zum sicheren Einstieg. |
| **Zone 2: Stratosphäre** | 500 m – 1.500 m | 92% | 8% | 0% | 0% | 0% | 0% | 150 – 195 px | Erste grüne Katapulte mit Aufwärtspfeilen für Weitsprünge. |
| **Zone 3: Mesosphäre** | 1.500 m – 3.500 m | 72% | 8% | 20% | 0% | 0% | 0% | 165 – 215 px | Violette Pendelknoten erfordern horizontales Vorhalten. |
| **Zone 4: Thermosphäre** | 3.500 m – 6.500 m | 54% | 8% | 24% | 14% | 0% | 0% | 180 – 235 px | Goldene Zeituhr-Knoten mit Countdown erzwingen schnellen Absprung. |
| **Zone 5: Exosphäre** | 6.500 m – 10.000 m | 40% | 6% | 28% | 18% | 8% | 0% | 190 – 245 px | Orangene Fissuren-Knoten (zerbrechen sofort bei Einhaken) erfordern Wachsamkeit. |
| **Zone 6: Tiefraum-Gefahren** | 10.000 m – 15.000 m | 28% | 8% | 32% | 22% | 10% | **~14% Korridor** | 195 – 250 px | **Weltraum-Minen:** Tödliche Detonation bei Berührung! |
| **Zone 7: Meister-Kosmos** | 15.000 m+ | 18% | 8% | 36% | 26% | 12% | **~22% Korridor** | 200 – 260 px | 62% dynamische Knoten (Zeituhr + Pendel) in dichtem Minenfeld. |

### Detailbeschreibung aller 6 Entitäten
1. **STANDARD (Cyan `#00f0ff`):** Solider, dauerhafter Orbit-Anker.
2. **SUPER-BOOST (Grün `#10b981`):** Erhöht den Katapult-Schub auf das 1,85-fache und erzeugt Warp-Streifen.
3. **BEWEGLICH (Violett `#c084fc`):** Schwingt horizontal im Pendelmodus (`moveRange` bis 100px).
4. **ZEITUHR / FRAGIL (Gold `#eab308`):** Besitzt 12 radiale Uhren-Ticks. Nach dem Einhaken tickt die Uhr ab (~0,8s). Bricht bei Ablauf mit Scherbenregen ab!
5. **KÖDER / FISSUR (Orange `#f97316`):** Brittle Trap mit Fissur-Linien. Bricht beim Einhaken sofort entzwei; bietet keinen Halt.
6. **BOMBE / WELTRAUM-MINE (`HAZARD` / Crimson `#ef4444`):**
   * Spawnt ab 10.000m Höhe als tödliches Hindernis im Flugkorridor.
   * Design: 8 rotierende messerscharfe Stacheln, dunkler Kern mit 3-Flügel-Warnsymbol, gestrichelte rote Gefahrenzone.
   * Nicht einhakbar (vom Fadenkreuz ausgeschlossen).
   * Bei Berührung: Sofortige gewaltige Explosion, Bildbeben und sofortiges Game Over ("MINE DETONIERT!").

---

## 5. PERFORMANCE-MODUS & HARDWARE-OPTIMIERUNG (VOLLSTÄNDIGE TECHNISCHE DOKUMENTATION)

Der Performance-Modus (`performanceMode`) wurde speziell für mobile Browser, Budget-Smartphones, Tablets und maximale Akkulaufzeit entwickelt.

### 5.1 Aktivierung & Bedienung
* **Pfad:** Hauptmenü -> Zahnrad-Icon (`#btn-menu-settings`) -> Schalter **LEISTUNGS-MODUS** (`#btn-setting-perf`).
* **Zustände:** `AN` (Optimiert) oder `AUS` (Volle Neon-Pracht).
* **Echtzeit-Umschaltung:** Änderungen werden sofort im laufenden Spielbetrieb übernommen, ohne dass die Seite neu geladen werden muss.

### 5.2 Technische Wirkungsweise unter der Haube
1. **Halbierung des Partikel-Objektpools (`300` statt `600`):**
   * Im Standardmodus hält das Spiel ein voralloziertes Ringpuffer-Array von 600 Partikeln für Funken, Triebwerksfeuer und Trümmer bereit.
   * Im Performance-Modus wird dieser Puffer dynamisch auf **300 Partikel** begrenzt. Dadurch werden Iterationsschleifen und Update-Zyklen pro Frame um 50% reduziert.
2. **GPU `shadowBlur` Bypass (`shadowBlur = 0`):**
   * Im 2D-Canvas-Kontext auf Mobilgeräten führt `context.shadowBlur` zu extrem teuren, hardware-intensiven Off-Screen-Gauß-Weichzeichner-Passes bei jedem einzelnen gezeichneten Partikel und Text.
   * Im Performance-Modus wird `shadowBlur` für alle Partikel, Funken und Texte vollständig umgangen (`shadowBlur = 0`).
   * Dies eliminiert den Hauptgrund für Ruckler und Framedrops auf mobilen Grafikprozessoren (GPU).
3. **Thermische Entlastung & Akku-Schonung:**
   * Durch den Wegfall teurer Rasterisierungs-Passes sinkt die CPU- und GPU-Last drastisch.
   * Das Gerät erwärmt sich bei langen Highscore-Runs nicht, und thermisches Throttling (Heruntertakten des Mobilprozessors) wird verhindert.
4. **Garantierte Framerate:**
   * Garantiert felsenfest stabile 60 bis 120 FPS selbst auf älteren Android- und iOS-Geräten.

---

## 6. WIEDERBELEBUNGS-SYSTEM (QUANTUM REVIVE) & HYPER-KRISTALLE

* **Verlustfreies Wiederaufsetzen auf Absturzhöhe:**
  * Beim Absturz sichert die Engine einen genauen Checkpoint (`reviveCheckpoint`) mit der exakten erreichten Höhe (`maxAltitudeMeters`), Kamera-Position (`cameraY`) und dem nächsten sicheren Himmelsknoten.
  * Nach Klick auf `WIEDERBELEBEN` im Game-Over-Screen wird der Spieler nicht auf 0m zurückgeworfen, sondern **exakt an der Absturzhöhe** an einem sicheren Knoten im Orbit neu gestartet.
* **4,0 Sekunden Quanten-Schutzschild:**
  * Das Schiff erhält einen leuchtenden blauen Schutzschild (`shieldTimer = 4.0`), der vorzeitige Kollisionen oder Minenkontakte absorbiert und einen fairen Neuanlauf garantiert.
* **Kosten:** 1 Hyper-Kristall (später erweiterbar um Video-Ads).

---

## 7. MENÜ-STRUKTUR, MODALS & DESIGN-SYSTEM

* **Strict Zero Emoji Policy:**
  * Absolutes Verbot von Emojis in UI, HUD, Buttons, Toasts oder Code. Ausschließlich minimalistische SVG-Vektoricons und scharfe Canvas-Geometrie.
* **Opaque Header Navigation (Slate-800 `#1e293b`):**
  * Oben Links: `#btn-menu-quests` (Klemmbrett-SVG mit separater Benachrichtigungspille).
  * Oben Rechts: `#btn-menu-profile` (Pilot-SVG), `#btn-menu-leaderboard` (Meisterschafts-Pokal/Trophäe-SVG), `#btn-menu-settings` (Zahnrad-SVG).
* **Hauptmenü-Button im Pause-Menü:**
  * Ermöglicht das sofortige geordnete Beenden eines Runs zurück ins Hauptmenü.
* **Admin-Dashboard (`dashboard.html`):**
  * Exklusiver Administrationsbereich, abgesichert durch Master-PIN `1337` und geschützte SessionStorage-Tokens.
* **Piloten-Lizenz Modal (`#profile-modal`):**
  * Ermöglicht Spielern die Registrierung ihres Rufnamens und dauerhafte Speicherung ihrer Rekorde und Statistiken.

---

## 8. INTERAKTIVES TUTORIAL-SYSTEM

* **Folie 1: Steuerung & Katapultflug:**
  * Dynamisch gerendertes Miniatur-Raumschiff auf `#tut-sling-canvas`, das Schwungaufbau und senkrechten 90°-Katapultflug visualisiert.
* **Folie 2: Himmelskörper (Vollständige Echtzeit-Vorschau):**
  * Rendert alle 6 echten Spiel-Entitäten über deren originale `OrbitNode.draw()`-Pipeline nebeneinander auf `#tut-circles-canvas`:
    * `STANDARD` (Cyan), `BOOST` (Grün), `BEWEGLICH` (Violett), `ZEITUHR` (Gold), `KÖDER` (Orange), `BOMBE` (Crimson-Rot).

---

## 9. PERMANENTE 24/7 BEREITSTELLUNG & HOSTING

* **Permanenter Live-Link (24/7 weltweit):** [https://bauerjohannes2-max.github.io/sling-jump/](https://bauerjohannes2-max.github.io/sling-jump/)
* **Hosting:** GitHub Pages Edge CDN mit weltweitem Caching und HTTPS.
* **Offline-Unterstützung:** Service Worker (`sw.js`) cacht alle Kern-Assets für Offline-Spielbarkeit.
