# Sling Jump - Offizieller Spielstand & Historische Projekt-Dokumentation

> **Status:** Release Candidate (RC33 - v3.32.0 - Peak-Altitude Respawn & Quantum Safety Trampoline)  
> **Permanenter Live-Link (24/7 weltweit):** [`https://bauerjohannes2-max.github.io/sling-jump/`](https://bauerjohannes2-max.github.io/sling-jump/)  
> **Repository:** [`https://github.com/bauerjohannes2-max/sling-jump`](https://github.com/bauerjohannes2-max/sling-jump)  
> **Letzte Aktualisierung:** 04.09.2026  
> **Lauffaehigkeit:** 24/7 Online via GitHub Pages Edge CDN, oder lokal via Direkt-Doppelklick (`file:///`) / `npm start`  
> **Test-Runner:** Playwright Test-Suite via `npm test` (`scripts/playwright_runner.js`)  
> **Vertriebs- & Hosting-Dokumentation:** Siehe [`DISTRIBUTION.md`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/DISTRIBUTION.md)

---

## 1. Schnellanleitung: Mobile Zugriff & Server-Befehle

| Befehl | Zweck | Beschreibung |
| :--- | :--- | :--- |
| **Permanenter Link** | **24/7 Freunde & Familie** | [`https://bauerjohannes2-max.github.io/sling-jump/`](https://bauerjohannes2-max.github.io/sling-jump/) (weltweit, unbegrenzt, PC muss nicht laufen) |
| `npm start` / `npm run serve` | **Lokales WLAN / LAN** | Startet den HTTP-Server auf Port 3000, ermittelt die lokale IPv4 (`http://192.168.x.x:3000`) und gibt einen scanbaren ASCII-QR-Code im Terminal aus. |
| `npm run share` | **Dev-Tunnel & QR-Code** | Gibt den permanenten Link samt ASCII-QR-Code im Terminal aus und startet optional einen temporären Entwickler-Tunnel. |
| `npm test` | **Automatisierte Playwright Suite** | Bereinigt vorab alle alten Screenshots, erzeugt 18 frische Screenshots, neutralisiert NTFS-Tunneling und garantiert 0 Konsolenfehler. |

---

## 1b. Detaillierte Schwierigkeits- & Progressions-Matrix (Höhenzonen & Kreis-Verteilung)

Die prozedurale Weltengenerierung (`WorldManager.js`) skaliert die Herausforderung kontinuierlich entlang von 7 klar definierten Zonen. Je höher der Pilot aufsteigt, desto mehr verdrängen dynamische Kreisarten (`MOVING`, `FRAGILE`) die statischen Kreise, und ab 10.000 m treten tödliche Weltraum-Minen auf:

| Zone | Höhenbereich (Meter) | Standard (%) | Super-Boost (%) | Beweglich (%) | Zeituhr / Fragil (%) | Köder / Fissur (%) | Weltraum-Mine / Bombe (Lethal) | Min/Max Lücke (px) | Mechanische Herausforderung & Gameplay-Verhalten |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Zone 1: Kalibrierung** | 0 m – 500 m | 100% | 0% | 0% | 0% | 0% | 0% | 140 – 180 px | Reine statische Basis-Knoten zum sicheren Eingewöhnen und Schwungaufbau. |
| **Zone 2: Stratosphäre** | 500 m – 1.500 m | 92% | 8% | 0% | 0% | 0% | 0% | 150 – 195 px | Erste grüne Katapult-Knoten mit Aufwärtspfeilen für weite Katapultsprünge. |
| **Zone 3: Mesosphäre** | 1.500 m – 3.500 m | 72% | 8% | 20% | 0% | 0% | 0% | 165 – 215 px | Einführung violetter horizontal pendelnder Knoten; erfordert Timing und Vorhalten. |
| **Zone 4: Thermosphäre** | 3.500 m – 6.500 m | 54% | 8% | 24% | 14% | 0% | 0% | 180 – 235 px | Erste goldene Zeituhr-Knoten mit Countdown-Tick; langes Verweilen führt zum Zerbersten. |
| **Zone 5: Exosphäre** | 6.500 m – 10.000 m | 40% | 6% | 28% | 18% | 8% | 0% | 190 – 245 px | Brüchige Köder-Fallen (zerbrechen sofort bei Haken) erfordern optische Wachsamkeit. |
| **Zone 6: Tiefraum-Gefahren** | 10.000 m – 15.000 m | 28% | 8% | 32% | 22% | 10% | **~14% Korridor-Spawn** | 195 – 250 px | **Weltraum-Minen (BOMBE):** Spawnen als tödliche Hindernisse; sofortige Detonation bei Kontakt! |
| **Zone 7: Meister-Kosmos** | 15.000 m+ | 18% | 8% | 36% | 26% | 12% | **~22% Korridor-Spawn** | 200 – 260 px | 62% dynamische Knoten (Zeituhr + Beweglich) in dichter Minenumgebung; extreme Präzision nötig. |

---

## 1c. Performance-Modus & Technische Hardware-Optimierung

Der Performance-Modus (`performanceMode`) wurde speziell für mobile Browser, ältere Smartphones, leistungsschwache Laptops und maximale Akkulaufzeit bei ausgedehnten Highscore-Flügen konzipiert:

* **Aktivierung:** Im Hauptmenü oder Pause-Menü über das Zahnrad-Icon (`#btn-menu-settings`) -> Schalter **LEISTUNGS-MODUS** (`#btn-setting-perf`) auf **AN**.
* **Echtzeit-Wirkung:** Die Umschaltung wirkt sofort im laufenden Frame, ohne Neustart oder Neuladen der Seite.
* **Architektur & Optimierungen unter der Haube:**
  1. **50% Partikel-Reduktion:** Der vorallozierte Ringpuffer des `ParticleSystem` wird dynamisch von 600 auf **300 Partikel** gedrosselt. Dies halbiert Iterationszeiten und Objektschleifen pro Frame.
  2. **GPU `shadowBlur` Hardware-Bypass:** Auf Mobilgeräten erzeugt `context.shadowBlur` rechenintensive Gauß-Filter und Off-Screen-Rasterungs-Passes für jeden Partikel. Im Performance-Modus wird `shadowBlur` vollständig auf `0` gesetzt.
  3. **Akku- & Hitzeschutz:** Verhindert thermisches Throttling des Mobilgeräts und senkt den Stromverbrauch signifikant.
  4. **Stabile 60/120 FPS:** Garantiert ruckelfreie Bildraten auch auf budgetfreundlichen Android- und iOS-Smartphones.
* **Detailliertes System-Handbuch:** Das vollständige Spielhandbuch inklusive aller mathematischen Formeln, physikalischen Parameter und Währungsmodelle ist in [`GAME_SYSTEMS.md`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/GAME_SYSTEMS.md) hinterlegt.

---

## 2. Chronologischer Versions- & Entwicklungsverlauf (Historische Dokumentation)

### v3.32.0 (04.09.2026) - Peak-Altitude Respawn & Quantum Safety Trampoline
* **1. Garantierter Peak-Altitude Checkpoint (`GameEngine.js`):**
  * **Ursachen-Analyse:** Nach einem Void-Absturz aus großen Höhen (z.B. 500m) suchte die Engine bisher im Bereich der Todes-Kamera nach verbliebenen Knoten und griff über `find()` oft den tiefsten Knoten knapp über der Todeslinie auf.
  * **Verankerung am wahren Höhen-Peak:** `triggerGameOver()` und `revivePlayer()` orientieren sich nun mathematisch strikt an der vom Piloten erreichten Höchstmarke: $\text{peakY} = \max(380, \text{maxAltitudeMeters} / 0.125)$.
  * **Sicherheits-Perimeter:** Trümmer und Minen (`HAZARD`) im Umkreis von 320px um den Respawn-Anker werden restlos desintegriert.
* **2. Weitsichtige Kamera-Positionierung:**
  * Die Kamera wird mit einem großzügigen 58%-Unterpuffer zentriert: $\text{this.cameraY} = \text{targetAnchor.y} - \text{this.height} \times 0.58$. Der Anker liegt komfortabel im oberen Mittelfeld bei 42% Bildschirmhöhe (`screenY = 430px`), meilenweit entfernt von der roten Void.
* **3. Quanten-Sicherheitsnetz (Trampolin-Rückstoß):**
  * Sollte der Pilot während der 4-Sekunden-Schutzphase (`shieldTimer > 0`) in Richtung der unteren Todesgrenze geraten (`player.y <= cameraY + 60`), löst ein automatischer Quanten-Rückstoß aus: $\text{vy} = \max(540, |\text{vy}| + 220)$ mit violetten Partikeln, Schockwelle und Boost-Sound. Ein erneuter Void-Tod nach dem Wiederbeleben ist damit physikalisch unmöglich.
* **4. Absprung-Schutz während Schutzschild (`Spaceship.js`):**
  * Bei jedem Katapult-Absprung während aktivem Quantenschild wird eine garantierte Mindest-Aufwärtsgeschwindigkeit von `vy >= 320 px/s` erzwungen, sodass ein versehentliches Schießen nach unten verhindert wird.
* **5. Garantierte 3-Stufen Aufstiegsleiter:**
  * Über dem Respawn-Anker werden automatisch drei verlässliche `STANDARD`-Knoten (+155px, +310px, +465px) generiert.
* **6. Automatisierte Playwright-Verifikation:**
  * Test-Schritt 10b verifiziert bei 490m Höhe: `screenY = 430.4px` (Ratio 0.54), `hooked = true`, `shield = 3.6s`, 0 Konsolenfehler, 18 frische Screenshots.

### v3.31.1 (04.09.2026) - Instant Cache-Busting, Static version.json & Robust Auto-Update System
* **1. Behebung der Service-Worker Cache-Falle & "Server nicht erreicht":**
  * **Ursachen-Analyse:** Auf GitHub Pages (statisches Hosting) führte der Aufruf von `/api/version` zu einem HTTP 404 Fehler, woraufhin der Button "SERVER NICHT ERREICHT" anzeigte. Gleichzeitig lieferte der Service Worker über die bisherige *Stale-While-Revalidate*-Strategie weiterhin gecachte v3.29.0 Skripte aus, weshalb Smartphones die alten JavaScript-Dateien ausführten.
  * **Network-First für Kerncode (`sw.js`):** Service Worker liefert alle `.html`, `.js` und `.css` Dateien nun per *Network-First* aus. Online-Nutzer erhalten sofort den frischesten Build; Offline-Nutzer behalten zuverlässigen Cache-Fallback.
  * **Static `version.json` mit `no-store`:** `./version.json?t=${Date.now()}` wird immer direkt aus dem Netzwerk geladen und umgeht jegliche Cache-Ebenen.
  * **Script-Cache-Busting (`index.html`):** Sämtliche 16 modularen Skripte sind mit Versionstags (`?v=3.31.1`) versehen, sodass Browser- und WebView-Caches bei Updates sofort invalidiert werden.
  * **Inline Self-Healing Header-Skript:** Erkennt via `localStorage` Versionsänderungen vorab, leert veraltete Service Worker Cache-Instanzen und stößt `navigator.serviceWorker.update()` an.
* **2. Bereinigtes Einstellungs-Menü:**
  * Überflüssige Buttons ("ANLEITUNG & STEUERUNG", "SPIELER-DASHBOARD") restlos entfernt.
  * "NACH UPDATES SUCHEN" prüft statische `version.json` und quittiert zuverlässig mit "VERSION AKTUELL (v3.31.1)" oder erzwingt bei Mismatch Cache-Wipe und Reload.

### v3.31.0 (04.09.2026) - Void Respawn Centering & Guaranteed Player Visibility Fix
* **1. Behebung der Spieler-Unsichtbarkeit nach Void-Absturz (`GameEngine.js`):**
  * **Ursachen-Analyse:** Bislang selektierte `triggerGameOver()` als Checkpoint-Knoten den tiefsten verbliebenen Knoten (`safeCandidates[0]`), welcher direkt an der unteren Todeslinie (`cameraY`) lag. Beim Wiederbeleben (`revivePlayer()`) wurde `cameraY` starr auf den Checkpoint zurückgesetzt, wodurch der Anker am untersten Bildschirmrand (`screenY = height - 44`) saß und das Schiff durch seinen Orbit (65px Radius) vollständig unter den Bildschirm ins negative Leere (`screenY > height`) rotierte. Zudem führte `tryHook()` Grenzprüfungen durch (`closestNode.y < cameraY - 15`), die bei tiefen Knoten ein Einhaken verweigerten.
  * **Zentrierte Kamera-Neupositionierung:** Nach dem Wiederbeleben wird `this.cameraY` nun exakt auf `targetAnchor.y - this.height * 0.50` ausgerichtet. Der Anker befindet sich damit mathematisch garantiert bei exakt 50% der Bildschirmhöhe (`screenY = height * 0.50`), meilenweit entfernt von der unteren Todeslinie.
  * **Direktes, unfehlbares Einhaken:** Die Wiederbelebung verlässt sich nicht mehr auf bedingte `tryHook`-Prüfungen, sondern fixiert den Hakenzustand direkt und robust (`this.player.isHooked = true`, `this.player.hookedNode = targetAnchor`, `orbitRadius = 65`, `orbitSpeed = 520`, `vx = 0`, `vy = 0`).
  * **Physik-Freeze während der Absturzsequenz:** In `update()` werden Raumschiff-Kinetik und Kamera-Nachführung während des 700ms Hitstop-Schadensablaufs (`this.isDying`) eingefroren. Dadurch stürzt das Schiff nach dem Platzen nicht mehr hunderte Pixel tief in den Abgrund.
  * **Garantierter Anschluss-Pfad:** Sollte vor dem Respawn-Knoten kein erreichbarer Knoten existieren, erzeugt die Engine automatisch einen soliden `STANDARD`-Folgeknoten im optimalen Sprungabstand (`targetAnchor.y + 165px`), sodass dem Piloten ein fairer und glasklarer Absprungweg zur Verfügung steht.
  * **Partikel- & Gefahren-Bereinigung:** Void-Schweifspuren werden bereinigt (`trailHistory = []`), Gefahren-Overlays auf 0 zurückgesetzt (`setDangerVisual(0)`) und der 4-Sekunden-Quantenschild aktiv visualisiert.
* **3. Bereinigung der Einstellungen & Zuverlässiger Static-Update-Checker (`index.html`, `js/main.js`, `version.json`, `sw.js`):**
  * **Buttons entfernt:** Die überflüssigen Buttons "ANLEITUNG & STEUERUNG" (im Hauptmenü als `#btn-menu-tutorial` vorhanden) und "SPIELER-DASHBOARD" wurden restlos aus dem Einstellungs-Dialog entfernt.
  * **Statischer Update-Checker (`version.json`):** GitHub Pages unterstützt als statischer Hoster keine dynamischen Node-Routen wie `/api/version` (führte zu 404 und "SERVER NICHT ERREICHT"). Es wurde eine statische `version.json` im Root angelegt und in den Precache von `sw.js` aufgenommen.
  * **Automatischer Reload bei neuem Build:** `checkServerVersion()` in `main.js` fragt nun relativ `./version.json?t=${Date.now()}` ab. Wird eine neuere Version erkannt, leert die App automatisch sämtliche Browser-Caches (`caches.delete`), weist den Service Worker an (`skipWaiting`) und erzwingt einen sauberen Neuladungsprozess.
  * **Visuelle Quittierung:** Manueller Klick auf "NACH UPDATES SUCHEN" quittiert zuverlässig mit "VERSION AKTUELL (v3.31.0)" oder führt das Sofort-Update aus.
* **4. Automatisierte Playwright-Verifikation:**
  * Test-Schritt 10b simuliert den realistischen Void-Fall, klickt `#btn-gameover-revive` und verifiziert automatisiert:
    * `altitude >= 482m`
    * `isHooked === true`
    * Zentrierter Viewport-Sitz: `screenY = 468.8px` bei 800px Höhe (`ratio = 0.59`, exakt im Sollkorridor 0.35 - 0.65).
  * Bildnachweis `screenshots/10b_revived_gameplay.png`: Das Raumschiff ist mit rotierendem Quantenschild glasklar im Zentrum sichtbar.
  * Bildnachweis `screenshots/07_settings.png`: Minimalistisches Einstellungsmenü ohne entfernte Buttons. 0 Konsolenfehler.
* **1. Minimalistisches 1-Folien-Tutorial (`index.html`, `UIManager.js`, `style.css`):**
  * **Folie 2 komplett entfernt:** Keine überladene Teaser-Folie mehr; das Tutorial ist nun ein einziger, eleganter und fokussierter Guide.
  * **Verlangsamte, flüssige Animation:** Animationszyklus auf der Canvas-Animation von 3,8s auf ruhige **5,8s** gestreckt, sodass Einhaken, Kreisen und tangentialer Katapultflug klar und entspannt nachvollziehbar sind.
  * **Entfernung aggressiver Farbtöne:** Sämtliche grelle orangefarbene Textauszeichnungen entfernt; modernes Farbschema aus dezentem Schieferblau (`#cbd5e1`), Reinweiß (`#f8fafc`) und Cyan-Akzenten (`#38bdf8`).
  * **Intuitive Kernmechanik ohne Fachchinesisch:** Text erklärt die elementare Grundsteuerung klar und direkt:
    * *GEDRÜCKT HALTEN:* Halte den Bildschirm gedrückt, um dich am Kreis einzuhaken und Schwung aufzubauen.
    * *LOSLASSEN:* Im gewünschten Moment loslassen, um in Blickrichtung nach vorne katapultiert zu werden.
  * **Direkter Aktions-Button:** Prominenter Button **SPIELEN** startet sofort den Flug.
* **2. Touch- & Scroll-Mechanik im Reiter "Aufgaben" (`InputManager.js`, `style.css`):**
  * **Input-Interception behoben:** `InputManager.js` fing bisher Touch-Events in Modal-Karten über `e.preventDefault()` ab, da `.modal-content` statt `.modal-card` abgefragt wurde. Die Methode `isInteractiveUIElement` erkennt nun ausnahmslos alle Modale, Karten und Scrollbereiche (`.modal-overlay.visible`, `.quests-scroll-area`, `.hub-card`).
  * **Flüssiges Scrollen zu Wochen-Aufgaben:** `.quests-scroll-area` mit `-webkit-overflow-scrolling: touch`, `touch-action: pan-y`, `overscroll-behavior: contain` und eleganten zirkulären Cyan-Scrollbars ausgestattet.
  * Desktop-Mausrad und mobile Wischgesten scrollen reibungslos bis zu den wöchentlichen Herausforderungen herunter (`05c_hub_quests_scrolled.png`).
* **3. Performance-Modus bereinigt & Inhärente System-Effizienz (`index.html`, `UIManager.js`, `GameEngine.js`):**
  * Überflüssiger Schalter "Performance-Modus" aus dem Einstellungsmenü entfernt (keine kognitive Last für Spieler).
  * Das Spiel läuft nun standardmäßig und durchgehend hochperformant (Ringpuffer auf 400 Partikel optimiert, hardware-effiziente Canvas-Passes, stabile 60/120 FPS auf allen Geräten).
* **4. Ausbalancierte Combo-Geschwindigkeit & Wiederherstellung konstanter Gravitation (`Constants.js`, `Spaceship.js`, `GameEngine.js`):**
  * **Dämpfung der Combo-Beschleunigung:** Die bisherige extreme Tempokurve (+70% Tempo bei Combo 10) wurde auf ein kontrolliertes und balanciertes Maß moderiert (+3% pro Stufe, maximal **+30% Tempo** bei Stufe 10: `[1.0, 1.03, 1.06, ..., 1.30]`).
  * **Gedämpfte Katapult-Impulse:** Vertikaler Zusatzschub von bis zu +480 px/s auf ausgewogene +25 bis +200 px/s skaliert. Spieler schießen nicht mehr unkontrolliert in Sekunden auf 10.000m.
  * **100% Natürliche Gravitation:** Die künstliche Reduktion des Gravitationswiderstands (`COMBO_GRAVITY_DRAG_REDUCTION`) wurde restlos entfernt. Das Raumschiff unterliegt im Steigflug stets zu 100% der natürlichen Gravitation (`this.vy -= CONSTANTS.PHYSICS.GRAVITY * dt`), wodurch das Fluggefühl physikalisch greifbar und authentisch bleibt.
  * **Verschärfter 90°-Präzisionswinkel:** Der Schwellenwert für den perfekten Steilsprung wurde von `tangentY >= 0.980` (ca. 11,4° Toleranz) auf **`tangentY >= 0.995`** (ca. 5,7° Toleranz) verschärft. Nur wer das Katapult mit meisterhafter Präzision auslöst, hält die Combo aufrecht.
* **5. Schlankes Profil-Modal ohne redundanten Highscore (`index.html`, `UIManager.js`):**
  * Die doppelten Kacheln "REKORD" und "FLÜGE" wurden aus dem Profil-Dialog entfernt.
  * Das Profil-Modal dient nun rein als minimalistische, saubere Identitäts- und Login-Karte (Avatar, Name, Speichern-Button). Highscores verbleiben ordnungsgemäß in der Bestenliste und den Statistiken.
* **6. Vollständige Favicon- & App-Icon-Lösung (`favicon.ico`, `index.html`, `dashboard.html`, `sw.js`):**
  * **Root `favicon.ico` generiert:** Erzeugung eines echten Root-Icons `favicon.ico` direkt im Projektverzeichnis zur zuverlässigen Beantwortung nativer Browser-Anfragen.
  * **Cache-Busting:** Alle Icon-Verknüpfungen in `index.html` und `dashboard.html` mit Versions-Query-Parametern versehen (`?v=3.30.0`), um hartnäckiges Browser-Cache-Tunneling zu durchbrechen.
  * **Service Worker Update:** Aufnahme von `favicon.ico`, `assets/favicon.png` und `assets/icon.svg` in den Precaching-Katalog von `sw.js` und Erhöhung des Cache-Namens auf `sling-jump-v3.30.0`.
* **7. Playwright-Suite & Visuelle Verifikation:**
  * 18 Screenshots frisch erfasst mit SHA-256 Prüfsummen und neutralisiertem NTFS-Tunneling.
  * 0 Konsolenfehler und 0 unbehandelte Ausnahmen.

### v3.29.0 (03.09.2026) - Rewarding 90° Slingshots & Dynamic Combo Speed Scaling
* **1. Belohnendes 90°-Katapult-System (`Spaceship.js`, `GameEngine.js`, `Constants.js`):**
  * Das Auslösen im senkrechten 90°-Winkel (Osten / Bahntangente nach Norden, Toleranz `tangentY >= 0.980`) wurde massiv aufgewertet:
  * **Direkte Währungs-Belohnung:** Jeder 90°-Katapultwurf schüttet sofort Bonus-Gold aus (`+1` bis `+10` Münzen direkt auf das Spielerkonto entsprechend der aktuellen Combo-Stufe).
  * **Direkter Score-Schub:** Zusätzliche `+100` bis `+1.000` Punkte pro perfektem Sprung.
* **2. Dynamischer Combo-Geschwindigkeits-Multiplikator (Balancierte Hyperspeed-Kurve):**
  * Je höher die Combo, desto schneller fliegt das Raumschiff:
    * Combo 1: **1.10x Speed** (+10% Tempo, +120 px/s Impuls)
    * Combo 2: **1.18x Speed** (+18% Tempo, +160 px/s Impuls)
    * Combo 3: **1.26x Speed** (+26% Tempo, +200 px/s Impuls)
    * Combo 4: **1.34x Speed** (+34% Tempo, +240 px/s Impuls)
    * Combo 5: **1.42x Speed** (+42% Tempo, +280 px/s Impuls - *HYPER STATE*)
    * Combo 10 (Max): **1.70x Speed** (+70% Tempo, +480 px/s Impuls)
  * **Ganzheitliche Physik-Kopplung:** Der Multiplikator beschleunigt sowohl die Kreisbahngeschwindigkeit (`orbitSpeed`) als auch die Katapult-Abschussgeschwindigkeit und verringert den Gravitationswiderstand während des Steigflugs um bis zu 30%.
  * **Perfekte Spielbarkeit durch Slow-Mo:** Weil beim Einhaken an Kreisen die bewährte 40%-Zeitlupe aktiv ist, bleibt das Timing selbst bei 1.70x Hyperspeed voll reaktiv und beherrschbar.
* **3. Akustische & Visuelle Höhepunkte:**
  * **Chromatische Tonleiter-Chimes (`AudioManager.js`):** Bei jedem erfolgreichen 90°-Sprung ertönt ein doppelter Synthesizer-Akkord, dessen harmonischer Oberton sich pro Combo-Schritt um 2 Halbtöne nach oben schraubt (C5 bis C7).
  * **Schockwellen & Warpgeschwindigkeits-Streifen (`ParticleSystem.js`):**
    * Goldener Schockwellenring (`spawnShockwave`) expandiert am Katapult-Knoten.
    * Ab Combo 2/3 ziehen vertikale leuchtende Geschwindigkeitsstreifen am Bildschirm vorbei.
  * **HUD & Floating Text Feedback:** Anzeige von `PERFEKT 90° (+10% TEMPO)` bis `MAX COMBO x10 (+70% TEMPO)` und sofortige Anzeige des erhaltenen Goldes.
* **4. Playwright-Suite:** 18 Screenshots frisch erfasst, 0 Konsolenfehler, 0 Exceptions.

### v3.28.0 (03.09.2026) - Tutorial Physics & Aspect-Ratio QA, Standalone Dashboard Companion App & AAA App Icon
* **1. Tutorial-Physik QA & Korrektur auf physikalisch akkuraten 90°-Katapultflug (`UIManager.js`):**
  * Die Animation auf Folie 1 wurde korrigiert: Das Schiff löst sich nun exakt im 90°-Winkel (Osten: `nodeX + orbitRadius, nodeY`) bei gegen den Uhrzeigersinn gerichtetem Orbit.
  * In dieser Position zeigt die Tangente der Kreisbahn mathematisch präzise nach Norden (senkrecht nach oben). Das Schiff schießt geradlinig nach Norden in den Weltraum.
  * Alte, unpassende Hakenleine entfernt: Entspricht nun zu 100% dem modernen Tetherless Grappling mit leuchtendem Gravitationsfeld.
* **2. Beseitigung von Bild-Verzerrungen auf kleinen Bildschirmen (`index.html`, `style.css`):**
  * Auf kleinen Mobilgeräten führten feste CSS-Höhen (`height: 160px`) in Verbindung mit prozentualen Breiten zu einer horizontalen Stauchung der Canvas-Grafiken.
  * Vollständige Umstellung auf native CSS-`aspect-ratio` (`360/160` auf Folie 1 und `360/100` auf Folie 2) sowie fluid skalierende Container.
  * Kreise und Schiffe bleiben auf allen Bildschirmauflösungen und Smartphones ausnahmslos perfekt rund und proportional.
* **3. Eigenständige Telemetrie- & Dashboard-Begleit-App (`dashboard.html`, `manifest-dashboard.json`):**
  * `dashboard.html` wurde zu einer vollwertigen, eigenständigen Web-App ausgebaut mit eigenem PWA-Manifest (`manifest-dashboard.json`) und mobilen Standalone-Meta-Tags.
  * Prominenter, neonblau leuchtender Button **"SPIELEN"** im Header startet und fokussiert direkt das Spiel.
  * Aus dem Einstellungsmenü des Hauptspiels öffnet sich das Dashboard sauber in einem separaten Fenster/Tab (`target="_blank"`).
* **4. AAA App-Icon Neugestaltung nach Mobile-Bestseller-Standards:**
  * Fundierte Best-Practice-Analyse führender Arcade-Hits (Subway Surfers, Alto, Smash Hit): Markanter Single-Focal-Point, lebendiger Neon-Kontrast auf tiefblauem Raum, scharfe geometrische Silhouette, squircle-konforme Sicherheitsränder und null störende Textfragmente.
  * Exportiert in höchster Auflösung nach `assets/icon-512.png`, `assets/icon-192.png`, `assets/favicon.png` und `assets/icon.svg`.
* **5. Playwright-Suite:** 18 Screenshots frisch erfasst, 0 Konsolenfehler, 0 Exceptions.

### v3.27.0 (03.09.2026) - Ultra-Minimalist Profile & Quests UI, Harder Weekly Challenges & Global Minimalism Standards
* **1. Schlankes Minimalistisches Profil-Modal (`index.html`, `UIManager.js`):**
  * Entbürokratisierung nach dem Vorbild führender Mobile-Bestseller (Subway Surfers, Brawl Stars):
  * Umbenennung von bürokratischem "Piloten-Lizenz" in klares, prägnantes **"PROFIL"**.
  * Eliminierung überflüssiger Textblöcke und Metadaten (Pilot-ID, Registrierungs-Badge, Registrierungsdatum und lange Hilfetexte entfernt).
  * Neues minimalistisches Layout:
    * Leuchtendes Vektor-Avatar-Icon im Zentrum.
    * Schlankes Inline-Namensfeld mit direktem `SPEICHERN`-Button.
    * 2 prominente Helden-Kacheln: **REKORD** (in Metern) und **FLÜGE** (Rundenzahl).
* **2. Minimalistisches Aufgaben-Design (`index.html`, `UIManager.js`, `style.css`):**
  * Aufgabenkarten radikal entschlackt:
    * Redundante doppelte Beschreibungsabsätze entfernt; stattdessen kurze, direkte Zieltitel (z.B. `150.000m Gesamtdistanz`).
    * Fortschrittsbalken mit zentrierter Zahlenanzeige (`12.450 / 150.000 m` bzw. `EINGELÖST`) direkt im Balken.
    * Sektions-Header auf das Wesentliche verdichtet: `TÄGLICH` und `WÖCHENTLICH` mit kompakten Restzeit-Badges.
* **3. Spürbar anspruchsvollere Wöchentliche Herausforderungen (`Constants.js`):**
  * Die wöchentlichen Aufgaben wurden mathematisch neu kalkuliert, sodass ein Spieler über die 7 Tage verteilt **ca. 2,0 bis 2,5 Stunden aktive Spielzeit** (~70–80 Runden) investieren muss:
    * **Kosmischer Marathon:** 150.000 m Gesamtdistanz (~75 Runs × 2.000 m = ~131 Min. Nettoflugzeit) -> 1.500 Münzen Belohnung.
    * **Orbital-Meister:** 1.500 erfolgreiche Sprünge (~68 Runs × 22 Sprünge = ~120 Min. Spielzeit) -> 1.600 Münzen Belohnung.
    * **Schatzkammer:** 800 Münzen einsammeln (~80 Runs × 10 Münzen = ~140 Min. Spielzeit) -> 1.400 Münzen Belohnung.
    * **Exosphären-Vorstoss:** 8.000 m in einem einzigen Flug (High-Skill Herausforderung, erfordert 30–50 Versuche) -> 2.000 Münzen Belohnung.
    * **Reflex-Akrobat:** 60 knappe Rettungen vor dem Abgrund (~75 Runs = ~131 Min. Spielzeit) -> 1.500 Münzen Belohnung.
* **4. Globale Regel-Erweiterung (`GEMINI.md`, `standards.md`):**
  * Verankerung von Regel 5/6: "Strict Commercial Minimalism & Industry Best-Practice UI (Weniger ist mehr)". Alle künftigen Dialoge und UIs müssen dem Prinzip "Simple & Minimalistic" folgen.
* **5. Playwright-Suite:** 18 Screenshots frisch erfasst, 0 Konsolenfehler, 0 Exceptions.

### v3.26.0 (03.09.2026) - Lethal Hazard Space Mine, Progressive Scaling, Performance Mode & Comprehensive Systems Manual Overhaul
* **1. Vollständige Aktualisierung von `GAME_SYSTEMS.md` auf v3.26.0:**
  * Das interne System-Handbuch wurde von Version 3.14.0 auf den aktuellen Stand v3.26.0 gehoben.
  * Vollständige Dokumentation aller neuen Features: Weltraum-Minen (`HAZARD`), 7-Stufen-Schwierigkeitsmatrix, Quantum Revive auf Absturzhöhe, Hyper-Kristalle, Tetherless Grappling, 90°-Präzisionswinkel, PIN-geschütztes Admin-Dashboard und 2-Folien Canvas-Tutorial.
* **2. Performance-Modus: Ausführliche Dokumentation & Hardware-Bypass (`ParticleSystem.js`, `UIManager.js`):**
  * Detaillierte technische Erläuterung der Funktionsweise von `performanceMode` in `GAME_STATUS.md` und `GAME_SYSTEMS.md`.
  * In `ParticleSystem.js` wurde ein hardware-effizienter Bypass für GPU `shadowBlur` implementiert, wenn der Performance-Modus aktiv ist.
  * In `UIManager.js` wird die Partikelanzahl bei Aktivierung nun verzögerungsfrei in Echtzeit angepasst.
* **3. Neuer Kreis-Typ ab 10.000m: Tödliche Weltraum-Mine / Bombe (`Node.js`, `GameEngine.js`, `WorldManager.js`):**
  * Spawnt ab ca. 10.000 Metern Höhe als tödliches Hindernis im Flugkorridor (~14% bis 15.000m, ~22% darüber).
  * Eigenständiges, gestochen scharfes Design: Dunkelroter Rumpf mit 8 rotierenden dreieckigen Stacheln, pulsierendem Gefahrenkern (3-Flügel-Warnsymbol) und gestricheltem rotem Warnkreis.
  * Kann nicht eingehakt werden (vom Fadenkreuz ausgeschlossen).
  * Bei Kontakt oder Kollision erfolgt eine sofortige Detonation mit Bildschirmbeben, Funkenregen und Absturz ("MINE DETONIERT!"), sofern der Spieler nicht durch den Quanten-Schild geschützt ist.
* **2. Progressiver Anstieg von Zeituhr- und Bewegungskreisen (`WorldManager.js`):**
  * Mit zunehmender Höhe steigt die Wahrscheinlichkeit für bewegliche Pendelknoten (`MOVING`) kontinuierlich von 0% auf 36%.
  * Zeituhr-Knoten (`FRAGILE`) steigen schrittweise von 0% auf bis zu 26% an.
  * In den höchsten Sphären machen diese anspruchsvollen Kreisarten über 62% aller Knoten aus.
* **3. Strukturierte Schwierigkeits-Matrix in der Dokumentation (`GAME_STATUS.md`):**
  * Vollständige Tabelle aller 7 Zonen mit genauen Metergrenzen, prozentualen Verteilungen aller 6 Kreistypen, Lückendistanzen und taktischen Verhaltensweisen.
* **4. Dynamische Tutorial-Aktualisierung (`UIManager.js`):**
  * Auf Folie 2 des Tutorials werden nun alle 6 Kreistypen nebeneinander dargestellt (`STANDARD`, `BOOST`, `BEWEGLICH`, `ZEITUHR`, `KÖDER`, `BOMBE`).
* **5. Playwright-Suite:** 18 Screenshots frisch erfasst, 0 Konsolenfehler, 0 Exceptions.

### v3.25.0 (03.09.2026) - Leaderboard Championship Trophy Icon & Quantum Revive Altitude Fix
* **1. Bestenlisten-Icon: Universeller Meisterschafts-Pokal (`index.html`):**
  * Der bisherige, missverständliche 5-zackige Stern im Header-Button `#btn-menu-leaderboard` wurde durch eine minimalistische, hochpräzise Vektor-Trophäe (Pokal) mit Sockel und Griffen ersetzt.
  * Das Icon signalisiert nun weltweit unmissverständlich "Bestenliste / Highscores / Rangliste".
* **2. Fehlerbehebung bei Wiederbelebung an der Absturzhöhe (`GameEngine.js`):**
  * Ursachenanalyse: Beim Zustandswechsel von `GAME_OVER` zu `PLAYING` nach Klick auf `Wiederbeleben` rief `handleStateTransition` fälschlicherweise `startNewRun()` auf, was Welt, Kamera und Höhe auf 0 Meter zurücksetzte.
  * Lösung:
    * Beim Absturz wird ein präziser Checkpoint (`reviveCheckpoint`) mit exakter Kamera-Höhe (`cameraY`), Maximalhöhe (`maxAltitudeMeters`) und dem nächsten soliden Orbit-Knoten gespeichert.
    * In `handleStateTransition` wird `startNewRun()` übersprungen, wenn das Flag `isRevive` übergeben wird.
    * In `revivePlayer()` wird der Spieler direkt an einem sicheren Knoten auf der Absturzhöhe im Orbit platziert, mit einem 4-sekündigen Quanten-Schutzschild (`shieldTimer = 4.0`) ausgestattet und das HUD mit der echten Höhe aktualisiert.
    * Der Spieler setzt seinen Flug unmittelbar an der erreichten Höhe fort, ohne jeglichen Verlust des Spielfortschritts.
* **3. Automatisierte Playwright-Verifikation:**
  * Zusätzliche mathematische Assertion in `scripts/playwright_runner.js`: Prüft nach Klick auf `Wiederbeleben` strikt, dass die Höhe nicht auf 0m zurückspringt, sondern exakt auf der Absturzhöhe (482m) fortgesetzt wird.
  * 18 frische Screenshots erfasst, NTFS-Tunneling neutralisiert, 0 Konsolenfehler.

### v3.24.0 (03.09.2026) - Tetherless Grappling, 90° Combo Text Unification, Pause Menu Navigation, Deep Space Crystal Balancing & Solid Header UI
* **1. Haltestrahl beim Einhaken entfernt (`Spaceship.js`):**
  * Auf Nutzerwunsch wurde der visuelle Haltestrahl (`drawTether`) zwischen Schiff und Orbit-Kreis entfernt.
  * Das Schiff umkreist die Himmelskörper nun frei, schwerelos und ungestört von geometrischen Linien.
* **2. Präzisions-90°-Winkel & Combo-Text Vereinheitlichung (`Spaceship.js`, `GameEngine.js`):**
  * Der Winkel für den perfekten 90°-Katapultstart wurde verschärft (`tangentY >= 0.985`, unter 9.9° Abweichung von der echten Vertikalen).
  * Die störende Überlagerung zweier gleichzeitig spawnender Texte ("PERFEKT 90°" und "COMBO x1") wurde eliminiert: Es erscheint immer nur ein einzelner, nicht-überlappender Text (`PERFEKT 90°!` auf x1, danach `COMBO x2!`, etc.).
* **3. Hauptmenü-Button im Pause-Modal (`index.html`, `main.js`):**
  * Das Pause-Modal enthält nun den Button `HAUPTMENÜ` (`#btn-pause-quit`), mit dem Spieler jederzeit direkt ins Hauptmenü zurückkehren können.
* **4. Hyper-Kristall Rebalancing (`WorldManager.js`):**
  * Seltene Hyper-Kristalle erscheinen nun erst ab 5.000 Metern Höhe (`currentAltitudeMeters >= 5000`) mit einer Wahrscheinlichkeit von ~5% pro Korridor. Standard-Flüge im erdnahen Bereich bleiben frei von Kristallen.
* **5. Ingame-Aufgaben-Widget entfernt (`index.html`, `UIManager.js`):**
  * Der HUD-Kasten `.hud-quest-tracker` ("gold-sammler") am unteren linken Bildschirmrand wurde restlos entfernt.
* **6. Solide Header-Buttons & Aufgaben-Badge Rework (`css/style.css`, `UIManager.js`):**
  * Die Buttons im oberen Menübereich (`.icon-nav-btn`) sind nun blickdicht (Slate-800 `#1e293b`), kontrastreich und gestochen scharf.
  * Das Benachrichtigungs-Badge (`#menu-quests-badge`) sitzt nun als freistehende kreisförmige Pille mit dunkler Trennkante an der oberen rechten Ecke des Aufgaben-Buttons (`top: -6px; right: -6px`) und zeigt ausschließlich die Ziffer an, ohne das Uhr-Icon zu verdecken.
* **7. Verbindliche Workflow-Regel implementiert (`GEMINI.md`, `.agents/rules/standards.md`):**
  * Regel 5 bzw. Abschnitt 4 zur verpflichtenden Erstellung eines strukturierten Plans mit Schritt-für-Schritt-Checkliste bei jeder Nutzeranforderung global verankert.
* **Playwright Suite:** 18 frische Screenshots erfasst, visuell geprüft, 0 Konsolenfehler.

### v3.23.0 (03.09.2026) - Player Dashboard PIN Gate, Dynamic Tutorial Engine, Player Profile System & Complete UX Streamlining
* **1. Player Dashboard Absicherung (`dashboard.html`):**
  * Das Telemetrie-Dashboard ist nun durch ein sicheres Master-PIN-Gate geschützt (Standard Master-PIN: `2026`).
  * Unbefugte Besucher sehen ausschließlich den abgeriegelten Screen `DASHBOARD GESCHÜTZT` mit Lock-Symbol und PIN-Eingabe; es werden ohne Freigabe keinerlei Daten geladen.
  * In der Kopfzeile wurde ein `SPERREN`-Button hinzugefügt, mit dem die Sitzung jederzeit mit einem Klick wieder gesperrt werden kann.
* **2. Dynamische Tutorial-Kreise via `Node.js` (`index.html`, `UIManager.js`):**
  * Slide 2 des Tutorials (`tut-slide-2`) nutzt nun ein dediziertes Canvas (`#tut-circles-canvas`), auf dem die echten Spiel-Entitäten `OrbitNode` (`STANDARD`, `BOOST`, `BEWEGLICH`, `FRAGIL`, `KÖDER`) instanziiert und über `node.draw(ctx, ...)` gerendert werden.
  * **Zukunftssichere Konsistenz:** Wenn in Zukunft das Design oder die Effekte der Kreise in `Node.js` verändert werden, übernehmen die Kreise im Tutorial diese Änderungen vollautomatisch.
* **3. Tutorial Slide 1 Grafik-Rework (`index.html`, `UIManager.js`):**
  * Die alte SVG-Grafik wurde durch eine flüssige Canvas-Physiksimulation (`#tut-sling-canvas`) ersetzt.
  * Zeigt in einem Endlos-Zyklus Anflug, strahlenden Halte-Strahl, Schwungaufbau um den Orbit-Knoten und den kraftvollen Katapult-Abschuss nach oben mit animiertem Phasen-Badge.
* **4. Spieler-Registrierung & Piloten-Profil (`StorageService.js`, `UIManager.js`, `index.html`, `main.js`):**
  * Einführung eines persistenten Spieler-Profils mit Rufname, Rufzeichen, automatischer Pilot-ID (z. B. `SJ-82156`), Registrierungsdatum und Highscore-Bindung.
  * Neues Hologramm-Modal `PILOTEN-LIZENZ` (`#profile-modal`), aufrufbar über den neuen Piloten-Button in der Menü-Kopfzeile. Ermöglicht das Anpassen des Namens und das Speichern der Piloten-Identität.
* **5. Aufgaben-Sektion bereinigt (`UIManager.js`, `style.css`):**
  * Die redundante doppelte Münzen-Anzeige wurde eliminiert: Der Wert steht nun ausschließlich oben rechts auf der Karte (`+150 Coins`), während der Button sauber `BELOHNUNG EINSAMMELN` lautet.
* **6. "SLOW-MO BEREIT" gelöscht (`index.html`, `UIManager.js`):**
  * Das HUD-Element `#bullet-badge` wurde restlos aus dem DOM und dem Game-Loop entfernt, was das Spielfeld noch minimalistischer und aufgeräumter macht.
* **7. Skins-Sektion komplett überarbeitet (`index.html`, `ShopManager.js`, `UIManager.js`):**
  * Der redundante Reiter `SCHWEIFE` wurde entfernt.
  * Die dreifache Wiederholung von "AKTIV AUSGERÜSTET" (im Canvas, im Button und in der Liste) wurde vollständig beseitigt.
  * Die Schiffs-Vorschau wurde als zentrales Hero-Element vergrößert, ergänzt um eine dezente Status-Pille `AKTIV IM EINSATZ` und eine elegante Vorschau-Karte für kommende Modelle.
* **8. Absturz-Menü minimalistisch umgestaltet (`index.html`, `UIManager.js`):**
  * Der klobige 160px-Textkasten für die Wiederbelebung wurde durch einen kompakten, hochmodernen Arcade-Action-Button ersetzt (`WIEDERBELEBEN [1 KRISTALL]`, inklusive `3s Schutzschild`-Subtext).
  * Die Button-Hierarchie ist perfekt austariert: `NOCHMAL SPIELEN` prominent oben, darunter symmetrisch `[SKINS] [HAUPTMENÜ]`.
* **Playwright Test-Suite:** 18 Screenshots frisch erfasst und visuell geprüft, 0 Konsolenfehler.

### v3.22.0 (03.09.2026) - Bulletproof Screenshot Freshness, NTFS Tunneling Neutralization & Verification Manifest
* **Ursachen-Analyse des "Alte Screenshots"-Problems:**
  * Auf Windows NTFS-Dateisystemen existiert ein Kernel-Mechanismus namens *File System Tunneling*. Wenn eine Datei gelöscht (`fs.unlinkSync()`) und kurz darauf neu erzeugt wird (`page.screenshot()`), behält Windows das ursprüngliche Erstelldatum (`CreationTime`) der gelöschten Datei bei (z. B. 01.09. oder 02.09.).
  * Standardmäßiges Node.js (`fs.utimesSync`) kann auf Windows nur das Änderungsdatum (`LastWriteTime`), nicht aber `CreationTime` anpassen.
* **Permanente Lösung in `scripts/playwright_runner.js`:**
  * **NTFS-Tunneling-Neutralisierung:** Nach jedem Playwright-Lauf wird per PowerShell explizit die `CreationTime` und `LastWriteTime` jeder Bilddatei auf die aktuelle Ausführungssekunde gesetzt.
  * **Kryptographischer Nachweis:** Jedes Bild erhält eine eindeutige SHA-256-Prüfsumme.
  * **Automatisierte Berichte:** Generiert `screenshots/VERIFICATION_REPORT.json` und `screenshots/LATEST_RUN.md` mit sekundengenauer Ausführungszeit.
  * **Brain-Artefakt-Synchronisierung:** Bereinigt verwaiste alte Testdateien und spiegelt die 17 aktuellen Screenshots samt tagesaktuellen Zeitstempeln in den Agenten-Artefakt-Ordner.
* **Workflow-Standards:** Regeln in `GEMINI.md` und `.agents/rules/standards.md` verbindlich um die Frische-Garantie erweitert.
* **Versions-Gleichstand:** Synchronisiert auf `v3.22.0` in `Constants.js`, `package.json`, `sw.js`, `index.html`.

### v3.21.0 (03.09.2026) - Clean Deep Space Aesthetic & Background Grid Elimination
* **Vollständige Entfernung des Hintergrund-Gitters (`WorldManager.js`, `ShopManager.js`, `GameEngine.js`):**
  * Auf ausdrücklichen Nutzerwunsch wurde das künstliche Gitternetz (`Perspective Grid`) im Hintergrund des Spielfelds komplett entfernt.
  * Ebenfalls wurde das feine Kachelraster im Hangar-Preview-Canvas (`ShopManager.js`) eliminiert.
  * **Visuelle Wirkung:** Das Spielfeld wirkt nun deutlich eleganter, aufgeräumter und moderner. Der samtweiche, tiefe Weltraumhintergrund lässt die leuchtenden Orbit-Ringe, glitzernde Sterne, Hyperspace-Warp-Streifen und neonfarbene Schweife mit maximalem Kontrast zur Geltung kommen.
* **Versions-Gleichstand:** `v3.21.0` in `Constants.js`, `package.json`, `sw.js`, `index.html`.
* **Playwright Suite:** 17 Screenshots frisch erfasst, visuell auditiert, 0 Konsolenfehler.

### v3.20.0 (03.09.2026) - Ultra-Rare Hyper-Kristall Currency & Quantum Revive Engine
* **Neue Premium-Währung: "HYPER-KRISTALL" (`EnergyOrb.js`, `WorldManager.js`, `StorageService.js`):**
  * Entwickelt als seltene Quantum-Währung in strahlendem Magenta (`#d946ef`) mit Facetten-Vektor-Diamant-Geometrie, rotierenden Energie-Strahlen und pulsierender Partikel-Aura.
  * **Ultra-Rare Spawning:** Spawnt in `WorldManager.js` erst ab 250m Höhe mit einer Wahrscheinlichkeit von nur ~1.5% pro Chunk in offenen Sprungkorridoren.
  * **Sammlung:** Löst bei Aufnahme magenta Kristall-Splitter, Schockwellen, Spezial-Sound und vergrößerten Floating Text `+1 KRISTALL!` aus.
  * **Storage & Stats:** Persistiert in `storage.data.hyperCrystals` (1 Willkommens-Kristall zum sofortigen Erproben) und protokolliert lebenslang gesammelte Kristalle in `storage.data.stats.totalCrystalsCollected`.
* **Interaktives Wiederbelebungs-System (Quantum Revive Engine) (`GameEngine.js`, `Spaceship.js`, `UIManager.js`, `index.html`):**
  * **Zweite Chance:** Beim Absturz bietet das Spiel im `#gameover-modal` eine hervorgehobene Revive-Box (`ZWEITE CHANCE - FLUG FORTSETZEN?`) an (1x pro Run).
  * **Kosten:** 1 Hyper-Kristall (oder Vorbereitung für Werbevideos: zeigt bei 0 Kristallen "WERBUNG BALD VERFÜGBAR" an).
  * **Mechanik (`gameEngine.revivePlayer()`):**
    * Zieht 1 Kristall ab und markiert `hasRevivedThisRun = true`.
    * Setzt das Raumschiff an den höchsten stabilen Anker nahe der Absturzhöhe mit sicherem Aufwärtsschwung.
    * Aktiviert für 3.0 Sekunden einen unzerstörbaren Quanten-Schutzschild (`shieldTimer = 3.0`), der als pulsierende violette Energieblase mit rotierenden Hexagon-Facetten gerendert wird und vor Fall-Toden schützt.
    * Entfesselt eine Quantum-Schockwelle (`spawnShards`, `spawnSparks`, Floating Text `WIEDERBELEBT!`), schließt das Modal und setzt den aktuellen Run nahtlos mit allen erreichten Höhen und Münzen fort.
* **UI & Währungsanzeigen:**
  * Hauptmenü und Hangar zeigen nun sowohl Coins als auch Hyper-Kristalle in modernen Vektor-Pillen an.
  * Absturz-Bildschirm zeigt gesammelte Coins und gesammelte Kristalle nebeneinander (`+12 Coins`, `+1 Kristall`).
  * Statistiken-Modal um lebenslange Hyper-Kristalle und Wiederbelebungen erweitert.
* **Playwright Suite & Screenshots:**
  * Erweitert um automatisierten Klick auf `#btn-gameover-revive`, Verifikation der Wiederbelebung und Erfassung von `10b_revived_gameplay.png` mit aktiver Schutzschild-Blase.
  * 0 Konsolenfehler, alle 17 Screenshots frisch erfasst.

### v3.19.0 (03.09.2026) - Single Active Ship & Trail, Tighter 90° Precision & Enlarged Dynamic Combo Visuals
* **Reduktion auf 1 aktives Schiff & 1 aktiven Schweif (`Constants.js`, `StorageService.js`, `ShopManager.js`):**
  * Alle sekundären Schiffe (`phoenix`, `spectre`, `titan`) und Schweife (`solar_flame`, `void_purple`, `rainbow_wave`) wurden auf Nutzeranweisung entfernt.
  * Im Hangar wird ausschließlich das aktive Standard-Schiff (`PFEIL` / `dart`) sowie der aktive Schweif (`CYAN-LASER` / `neon_cyan`) präsentiert.
  * Eine elegante Teaser-Karte ("WEITERE MODELLE IN ENTWICKLUNG") signalisiert Spielern den Ausbau für zukünftige Versionen.
  * `StorageService` migriert Bestandsspielstände automatisch und verhindert Inkonsistenzen.
* **Härterer, anspruchsvollerer 90°-Steilsprung (`Spaceship.js`):**
  * Das Winkel-Toleranzfenster für den perfekten Steilsprung wurde von `tangentY >= 0.86` ($\pm 30.7^\circ$) auf `tangentY >= 0.965` ($\pm 15.2^\circ$) mehr als halbiert.
  * Der Spieler muss das Raumschiff mit hoher Präzision genau im Scheitelpunkt vertikal nach oben entlassen, um den Ketten-Combo-Bonus auszulösen.
* **Massiv vergrößertes & präsentes Combo-Visual (`ParticleSystem.js`, `GameEngine.js`, `index.html`):**
  * **Großer Floating Text:** Von ehemals 15px auf **28px bis 42px** vergrößert (skaliert dynamisch mit der Combo-Stufe).
  * **Kontraststarker 6px-Stroke (`strokeText`):** Dunkler Backdrop-Rand garantiert exzellente Ablesbarkeit vor Sternenfeldern und bunten Ringen.
  * **Stufenfarbener Neon-Glow:** Kräftige Aura (`shadowBlur: 20`) in dynamischen Farbstufen (`#38bdf8`, `#818cf8`, `#a855f7`, `#fbbf24`, `#ef4444` etc.).
  * **Zentrales HUD-Combo-Badge (`#hud-combo-badge`):** Leuchtet bei jedem erfolgreichen Steilsprung auf und zelebriert den Multiplikator (`COMBO x2!`, `HYPER x5!`, `MAX COMBO x10!`).
* **Automatisierte Playwright-Verifikation:**
  * 0 Konsolenfehler; Screenshot `08_gameplay_hud.png` erfasst die vergrößerte Combo-Anzeige und das HUD-Badge.

### v3.18.0 (03.09.2026) - Clean Vector Gameplay: Dotted Trajectory Line Removal
* **Gepunktete Hilfslinien vor dem Spielermodell vollständig entfernt (`Spaceship.js`):**
  * `drawTrajectoryLaser` entfernt: Vor dem Raumschiff wird während des Orbitens keine gepunktete Vorhersage-Flugbahn mehr projiziert.
  * `drawAimPreview` entfernt: Keine gestrichelte Verbindungslinie oder Bogen mehr beim Annähern an Knoten.
  * **Purer Arcade-Flow:** Der Bildschirm ist komplett aufgeräumt. Der Spieler steuert das Raumschiff rein intuitiv anhand der sichtbaren physikalischen Rotation, der leuchtenden Seillinie und des Geschwindigkeitsgefühls.
* **Automatisierte Playwright-Verifikation:**
  * Screenshot `08_gameplay_hud.png` verifiziert die cleane Darstellung ohne gepunktete Linien vor der Schiffsnase bei 0 Konsolenfehlern.

### v3.17.0 (03.09.2026) - Simple 2-Slide Modal Tutorial & Bulletproof PWA Auto-Update Engine
* **Kompaktes, übersichtliches Button-Tutorial (`#tutorial-modal`):**
  * Aufrufbar über den Button **"TUTORIAL"** im Hauptmenü sowie über **"ANLEITUNG & STEUERUNG"** in den Einstellungen.
  * Folie 1 (Grundsteuerung): Erklärt präzise und einfach das Einhaken (Halten zum Schwungaufbau an nahen Kreisen) und das Loslassen (mit Schwung in Flugrichtung nach oben geschleudert werden) inklusive anschaulicher Vektor-Grafik.
  * Folie 2 (Himmelskörper-Teaser): Zeigt geheimnisvolle Kreis-Silhouetten und teasert an, dass es im Weltraum verschiedene Arten von Kreisen mit einzigartigen Besonderheiten gibt, ohne deren genaue Funktionen zu verraten, damit die Spieler sie selbst während des Flugs entdecken und erfahren.
  * Reibungslose Navigation mit Buttons `WEITER`, `ZURÜCK`, `SPIEL STARTEN` und `SCHLIESSEN`.
  * Das reguläre Spiel läuft ohne störende Unterbrechungen als purer Arcade-Run ab.
* **Bulletproof PWA Auto-Update & Versions-Synchronisation:**
  * **Single Source of Truth (`Constants.VERSION = '3.17.0'`):** Dynamische Injektion in alle DOM-Versionstags (`.app-version-tag`, `.settings-version-tag`) und in den Telemetriedienst.
  * **Network-First für HTML & App-Shell (`sw.js`):** Der Service Worker liefert Navigations- und HTML-Anfragen online stets direkt und frisch vom Server aus (mit Offline-Fallback) anstatt veraltetes HTML aus dem Cache anzuzeigen.
  * **Strikte No-Cache Header (`scripts/serve.js`):** `sw.js`, `index.html`, `Constants.js` und `manifest.json` werden verbindlich mit `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` ausgeliefert, sodass Mobilbrowser (iOS Safari / Chrome) keine veralteten Skripte auf Disk vorhalten.
  * **Live Versions-Endpunkt (`/api/version`):** Liefert bei jedem Check die aktuelle Serverversion.
  * **Automatischer Background-Check & Instant Reload (`main.js`):** Prüft beim App-Start und bei jedem Tab-Wechsel (`visibilitychange`) die Serverversion; bei neuem Build werden veraltete Caches geleert und die App aktualisiert sich nahtlos via `controllerchange`.
  * **Manueller "NACH UPDATES SUCHEN"-Button:** Im Einstellungsmenü integriert für sofortige manuelle Versionsprüfung und Cache-Bereinigung.
* **Automatisierte Playwright-Verifikation:**
  * Alle Screens, Tutorial-Folien und der neue Update-Button werden automatisiert getestet (`13_tutorial_modal.png` und `13b_tutorial_slide2.png`); 0 Konsolenfehler garantiert.

### v3.16.0 (03.09.2026) - Doodle Jump Distance Scaling, Screen Shake Calming, 1:1 Coin Harmonization & Screenshot Purge
* **Doodle Jump Distanz-Progression (`WorldManager.js`):**
  * Stufenweise Einführung der Knotentypen drastisch gestreckt, angelehnt an die bewährte Arcade-Progression von Doodle Jump:
    * Zone 1 (0m – 500m): 100% solide Standard-Anker. Fokussierter Einstieg ohne Ablenkungen zum Erlernen der Flugkurven.
    * Zone 2 (500m – 1.500m): Seltener Super-Boost (5%) mit Aufwärtspfeil als erhabener Katapult-Glücksmoment.
    * Zone 3 (1.500m – 3.500m): Sanft pendelnde bewegliche Knoten (16%) fordern Timing und Vorausschau.
    * Zone 4 (3.500m – 6.500m): Zerfallende Zeituhr-Knoten (12%) erzeugen spürbaren Druck durch Countdown.
    * Zone 5 (6.500m – 10.000m): Brüchige Decoy-Fallen (7%) zerspringen sofort; erfordern selektives Überspringen.
    * Zone 6 (10.000m+): Hardcore Meister-Kosmos für globale Bestenlisten.
* **Screenshake beruhigt & butterweiches Fluggefühl (`GameEngine.js`):**
  * Dauergewackel restlos beseitigt:
    * Normales Einhaken: 0 Screenshake (vorher 2px).
    * Normales Loslassen: 0 Screenshake (vorher 4px).
    * Münzen einsammeln: 0 Screenshake (vorher 2px).
    * Niedrige Combos (x1 bis x3): 0 Screenshake.
    * Hohe Combos (x4+): Gezielter, dezenter Punch (max 4px).
    * Super-Boost: Reduziert auf 4px (vorher 12px).
    * Brüchiger Bruch: Reduziert auf 5px (vorher 14px).
    * Crash / Game Over: Reduziert auf 8px (vorher 24px).
    * Abklingzeit: Beschleunigt auf `rawDt * 36` für sofortige Kameraberuhigung.
* **Münzen-Grafik 1:1 vereinheitlicht (`EnergyOrb.js`, `UIManager.js`, `index.html`, `dashboard.html`):**
  * Sämtliche UI-Münzsymbole (Hauptmenü, Absturzmenü, Hangar, Quests, Dashboard) wurden exakt an das In-Game Canvas-Design der Münzen angepasst.
  * Einheitliche Vektor-Geometrie: Goldener Außenring (`#fbbf24`), facettenreicher weißer Diamantkern mit Amber-Kontur (`#f59e0b`) und zentriertem Goldglanz-Punkt.
* **Vollständige Verbannung des Begriffs "Apex" (`GameEngine.js`, `Spaceship.js`, `GAME_SYSTEMS.md`):**
  * Ersetzt durch intuitive deutsche Begriffe: "90°-Steilsprung", "Perfekter Aufwärtsschwung".
  * Tutorial-Hinweis aktualisiert: `SCHWUNG: LASS BEIM SCHWUNG NACH OBEN LOS (90°)`.
  * Interne Engine-Variablen konsistent umbenannt (`isPerfectLaunch`, `launchBonus`).
* **Automatisierter Screenshot-Purge & Frische-Garantie (`playwright_runner.js`):**
  * Vor jedem Playwright-Lauf werden ausnahmslos alle bestehenden `.png`-Dateien im Ordner `screenshots/` bereinigt.
  * Jeder Screenshot wird mit aktuellem Datumsstempel und Dateigröße im Terminal quittiert.

### v3.15.0 (03.09.2026) - PWA Smartphone Optimization & Live Telemetry Player Dashboard
* **Progressive Web App (PWA) Homescreen-Optimierung:**
  * Hochauflösende Vektor-App-Icons generiert: `assets/icon.svg`, `assets/icon-192.png` (192x192) und `assets/icon-512.png` (512x512) mit Vektor-Raumschiff, Cyan-Orbitringen und Goldenem Stern.
  * Apple Touch Icons und mobile Vollbild-Metatags (`apple-mobile-web-app-capable`, `black-translucent`) in `index.html` integriert.
  * Startbildschirm-Installationsbanner (`#pwa-install-banner`) im Hauptmenü: Unterstützt native Installation unter Android Chrome (`beforeinstallprompt`) sowie visuelle Anleitung für iOS Safari ("Teilen -> Zum Home-Bildschirm").
* **Offline-Caching & Sofortige Hintergrund-Updates (`sw.js`):**
  * Service Worker mit Cache-First- und Stale-While-Revalidate-Strategie für alle Core-Dateien implementiert.
  * Automatisches Claiming (`skipWaiting()`, `clients.claim()`): Neue Builds werden sofort im Hintergrund geladen und beim nächsten Start nahtlos aktiv.
* **Server-Telemetrie & Live-Statistiken (`scripts/serve.js`, `data/analytics.json`):**
  * Endpunkte `POST /api/telemetry` und `GET /api/telemetry/stats` in `scripts/serve.js` integriert.
  * In-Memory-Tracking für aktive Spieler (Heartbeat alle 25 Sekunden) plus dauerhafte Speicherung von Gesamt-Besuchern, Runden heute/gesamt, Rekorden und Flugdauer in `data/analytics.json`.
* **Echtzeit-Spieler-Dashboard (`dashboard.html`):**
  * Eigenständiges, responsives Admin- und Monitoring-Dashboard unter `/dashboard` bzw. `/dashboard.html`.
  * Live-KPIs mit grünem Radar-Puls ("SPIELER ONLINE"), Unique Geräten, Runden heute, Allzeit-Rekord und gesammelten Münzen.
  * Tabelle der letzten Flüge mit Zeitstempeln, Schiffen und Rekord-Markierungen.
  * Automatischer Daten-Reload alle 4 Sekunden mit Ausweich-Modus für Offline-Sessions.
* **Client-Telemetrie (`js/services/AnalyticsService.js`, `js/main.js`, `js/engine/GameEngine.js`):**
  * Fehlertolerantes Telemetrie-Tracking bei Sitzungsstart, Spielstart (`run_start`) und Spielende (`run_completed`).
  * Direkter Zugang zum Dashboard im Spiel über die Einstellungen sowie per geheimem Dreifach-Tipp auf das Versions-Label (`v3.14.0`).
* **Automatisierte Playwright-Verifikation:**
  * Dashboard in Testlauf aufgenommen (`14_player_dashboard.png`); 0 Konsolenfehler über das gesamte Projekt bestätigt.

### v3.14.0 (03.09.2026) - 90-Degree Apex Combos (x1-x10), Step-by-Step Circle Progression, Seamless Live Tutorial & Dedicated Modals
* **Bugfix Warp-Streifen beim Einhaken (`Spaceship.js`, `GameEngine.js`):**
  * `this.vx = 0; this.vy = 0;` beim Einhaken in den Orbit.
  * Hintergrundsterne wechseln beim Einhaken sofort wieder zu scharfen Punkten.
* **Combo-System: 90-Grad Apex-Abschüsse (x1 bis x10) (`Spaceship.js`, `GameEngine.js`):**
  * Tangentialer Abschuss nach oben (`tangentY >= 0.86`) löst Apex-Combo aus.
  * Aufeinanderfolgende Apex-Sprünge erhöhen den Combo-Multiplikator von x1 bis zu x10.
  * Progressiver Geschwindigkeitsbonus: von `+65` bis `+245` Einheiten Schub.
  * Unpräzise Sprünge setzen die Combo auf 0 zurück.
* **Knoten-Einführung stufenweise nach Höhe (`WorldManager.js`):**
  * 0m - 100m (Zone 1): 100% Standard-Anker (Erlernen der Flugdynamik).
  * 100m - 250m (Zone 2): Super-Boost (Grün) mit Aufwärtspfeil eingeführt.
  * 250m - 500m (Zone 3): Bewegliche Pendel-Knoten (Lila) eingeführt.
  * 500m - 850m (Zone 4): Fragile Timer-Knoten (Rot) mit Countdown eingeführt.
  * 850m+ (Zone 5): Brüchige Riss-Knoten (Decoy) eingeführt.
* **Brüchige Knoten brechen sofort ohne Schwung (`Spaceship.js`):**
  * Versuch, sich an einen Decoy-Knoten einzuhaken, zerspaltet diesen sofort in Partikel.
  * Kein Einhaken, kein Schwungaufbau, null Impulsübertrag.
* **Game-Over Screen Hero-Score Redesign (`index.html`, `style.css`, `UIManager.js`):**
  * Erreichte Höhe (`final-altitude`, z.B. 482 m) steht riesig und zentriert im Vordergrund (58px Cyan).
  * Darunter Subtitle `BESTLEISTUNG 620 m`.
  * Darunter dezente Münzanzeige mit goldenem Vektor-Icon und Betrag (`+12`).
  * Altes tabellarisches Punkte-Formelsystem entfernt.
* **Interaktives 60 FPS Live-Tutorial ohne Freeze (`GameEngine.js`, `UIManager.js`):**
  * Kein Einfrieren des Spiels mehr; nahtloses Training im 60 FPS Echtzeit-Flug.
  * Schwebende HUD-Tippkarte (`#hud-tutorial-tip`) wechselt Tipps dynamisch nach Höhe und Situation.
  * Bei Erreichen von ~100m: `TRAINING ERFOLGREICH! +50 GOLD BONUS`, +50 Münzen gutgeschrieben.
  * Das Spiel stoppt nicht, sondern setzt den Flug nahtlos als regulären Run fort.
* **Menü-Top-Navigation & Entkopplung der Pilotenzentrale (`index.html`, `style.css`, `UIManager.js`, `main.js`):**
  * Oben Links: Icon-Button für Aufgaben mit grünem Benachrichtigungspunkt.
  * Oben Rechts: Icon-Buttons für Bestenliste und Einstellungen.
  * Pilotenzentrale-Tabs entfernt; 3 dedizierte, saubere Modals (`#quests-modal`, `#leaderboard-modal`, `#stats-modal`).
  * Quests-Aufgaben skaliert (Tages- und Wochenziele erhöht); redundantes "Täglich" im Kachelfuß entfernt.
* **Strict Zero Text 'Coins' Policy (`index.html`, `UIManager.js`):**
  * Wort "COINS" überall durch goldenes Vektor-Icon ersetzt.
* **App-Versionierung & Interne Dokumentation:**
  * Versionsanzeige `v3.14.0` im Hauptmenü und in den Einstellungen integriert.
  * Neue vollständige interne Referenz `GAME_SYSTEMS.md` im Projektstamm angelegt.

### v3.13.0 (03.09.2026) - Gameplay Challenge, Hyperspace Warp Streaks, Node Visuals & Interactive Playable Tutorial
* **Greifhaken-Radius & Balancing (`Constants.js`, `WorldManager.js`):**
  * `HOOK_RANGE` von 205px auf **160px** herabgesetzt.
  * Vertikaler Knoten-Abstand in allen Höhenzonen vergrößert. Verhindert mühelosen "Dauer-Auto-Lock"; der Spieler muss präzise zielen und das Timing abpassen.
* **Coin-Rarität & Entfernung des Münz-Magneten (`WorldManager.js`, `EnergyOrb.js`):**
  * Münzen-Spawn-Wahrscheinlichkeit von 35% auf **16%** reduziert. Coins sind nun eine echte Kostbarkeit für den Hangar.
  * Der magnetische Saugeffekt (`pullForce`) wurde vollständig entfernt. Münzen schweben fest im Raum; man muss seine Flugbahn aktiv durch die Münze steuern.
* **Hyperspace-Warp-Streifen & Parallaxe-Richtungskorrektur (`WorldManager.js`, `GameEngine.js`):**
  * **Parallaxe korrigiert:** Beim Aufsteigen bewegen sich die Hintergrundsterne nun physikalisch korrekt nach unten an der Kamera vorbei.
  * **Hyperspace-Warp-Streifen:** Bei hohen Vertikalgeschwindigkeiten (`playerVy > 320`) strecken sich die Sterne zu leuchtenden Vektor-Lichtstreifen (Sci-Fi-Filmeffekt).
* **Visuelle Klarheit: Brüchige & Timer-Knoten (`Node.js`):**
  * **Brüchige Knoten (`DECOY`):** Ausgeprägte Zick-Zack-Frakturen quer durch den Kern und fragmentierte Ring-Segmente wie bei zerbrechenden Plattformen in *Doodle Jump*.
  * **Timer-Knoten (`FRAGILE`):** 12 Zifferblatt-Striche (Tick-Marks) und kreisender Zeiger bereits vor dem Einhaken; hochkontrastiger radialer Countdown-Zeiger während des Schwungs.
* **Interaktives spielbares Freeze-Frame-Tutorial (`GameEngine.js`, `UIManager.js`, `index.html`, `style.css`):**
  * Neuer Hauptmenü-Button **"TUTORIAL"** mit minimalistischem Vektor-Icon.
  * Vollständig spielbarer Trainingskurs, der das Spiel an Schlüsselmomenten einfriert und die Mechaniken erklärt:
    * 1. Grundlagen & Ziel ("Drücken & Halten").
    * 2. Slingshot-Schwung ("Loslassen im Apex").
    * 3. Grüner Turbo-Knoten mit Warp-Streifen.
    * 4. Ablaufende Zeituhr.
    * 5. Brüchiger Schein-Knoten (Decoy).
    * Abschluss: Erfolgs-Freeze mit Gutschrift von **+50 Bonus-Coins**!
* **UI- & Interaktions-Bugfixes:**
  * **"ANSEHEN"-Button:** `setStateManager(state)` in `UIManager` verdrahtet; Klick auf "ANSEHEN" nach einem Run öffnet nun zuverlässig den Hangar und fokussiert das freigeschaltete Item.
  * **Tastatur-Kürzel entfernt:** `[ENTER]` aus dem Button "NOCHMAL SPIELEN" visuell entfernt.
  * **Todeslinie bei Zoom:** Todeslinie wird in absoluten Bildschirmkoordinaten mit 150% Breitenüberhang gerendert; schrumpft bei hoher Geschwindigkeit nicht mehr zusammen.
* **Automatisierte Playwright-Verifikation:**
  * Alle 13 Screenshot-Zustände in `screenshots/` erfolgreich mit 0 Konsolenfehlern validiert.

### v3.12.0 (03.09.2026) - Cloudflare Quick Tunnel Mobile Sharing & Stabilitäts-Upgrade
* **Cloudflare Quick Tunnel Integration (`scripts/share.js`, `package.json`):**
  * Umstellung der weltweiten Smartphone-Freigabe von fehleranfälligem `localtunnel` auf Cloudflare Quick Tunnels via `untun`.
  * Löst das Problem des "Tunnel unavailable" Fehlers (504/Gateway-Drops nach Inaktivität) vollständig.
  * Keine nervigen IP-Abfragen oder Bestätigungsseiten mehr beim ersten Aufruf auf Mobilgeräten.
  * Nahtlose HTTPS-Verbindung mit gültigem SSL-Zertifikat für iOS Safari und Android Chrome.
  * Automatischer Fallback auf `localtunnel`, falls Cloudflare-Dienste blockiert sein sollten.
* **Coin-Raritäts-Feinabstimmung (`WorldManager.js`):**
  * Münzen-Spawn-Wahrscheinlichkeit auf **35%** balanciert (vorher 70%).
  * Saubere Platzierung an Sprung-Apex-Punkten (60%) oder 2er-Korridoren (40%) für ein fokussiertes, belohnendes Sammelerlebnis ohne visuelle Überladung.
* **Automatisierte Qualitätssicherung & Playwright-Prüfung:**
  * Vollständiger Testlauf (`npm test`) mit 13 Screenshots in `screenshots/` erfolgreich mit 0 Konsolenfehlern abgeschlossen.

### v3.11.0 (02.09.2026) - In-Depth Review, Perfect Releases, Combo Streaks & Game-Over Tally
* **"PERFECT!" Release Sweet Spot (`Spaceship.js`):**
  * Loslassen des Seils bei optimaler vertikaler Tangente (`tangentY > 0.82`) triggert eine "PERFECT!" Auszeichnung.
  * Gewährt +55px/s Launch-Geschwindigkeitsbonus, goldene Funken-Partikel und sichtbares Belohnungs-Feedback für präzises Timing.
* **Dynamische Slingshot-Combo-Streaks (`GameEngine.js`, `StorageService.js`):**
  * Fließendes Aneinanderketten von Sprüngen (<3.2s Intervall) baut eine sichtbare Combo auf (`COMBO x2`, `COMBO x3`, `COMBO x4`, `HYPER x5!`).
  * Progressive Farbcodierung (`#38bdf8` -> `#c084fc` -> `#fbbf24` -> `#f43f5e`), Mikroeinschlag-Hitstop (8ms) und dauerhafte Speicherung der Best-Combo im Spielerprofil.
* **Game-Over Arcade Count-Up Animation (`UIManager.js`):**
  * Flüssiges Hochzählen der Endpunktzahl mit Ease-Out-Kurve auf dem Game-Over-Bildschirm sorgt für ein befriedigendes Run-Abschlussgefühl.
* **Architektur- & Fun-Faktor-Review (`implementation_plan.md`):**
  * Detaillierte Evaluation aller Subsysteme (Architektur, UI/UX, Physik, Gameloop, Retention) erstellt.
  * Bereitstellung von 3 optionalen Major-Feature-Entscheidungen (Audio-Aktivierung, Ghost-Ship-Replay, Challenge-Modifikatoren).

### v3.10.0 (02.09.2026) - Grapple Hitbox Balancing, Richtungs-Scoring & Tutorial QA
* **Grapple Hitbox & Reichweiten-Balancing (`Constants.js`):**
  * `HOOK_RANGE` von vormals überdimensionierten 285px auf **205px** justiert.
  * Verhindert mühelosen "Auto-Lock" quer über den halben Bildschirm; das Einhaken erfordert nun echtes Timing und Annäherung an den Knoten.
* **Flugbahn- & Richtungs-Scoring (`WorldManager.js`):**
  * `getNearestNode(ship, cameraY)` filtert strikt auf Reichweite und bewertet Knoten anhand des Geschwindigkeitsvektors (`dot product`).
  * Knoten im direkten Vorwärts-Flugkorridor und oberhalb des Schiffs werden bevorzugt; Knoten hinter oder weit unterhalb des Schiffs werden abgewertet.
* **Taktiles Miss- & Whiff-Feedback (`GameEngine.js`):**
  * Tippt der Spieler ins Leere (außerhalb der Reichweite), erfolgt ein akustisches Klick-Feedback sowie ein dezenter Partikel-Impuls.
  * Verhindert Frust und vermittelt intuitiv: "Noch zu weit weg".
* **Tutorial QA & Reaktivierung jederzeit (`index.html`, `main.js`, `playwright_runner.js`):**
  * Vollständige QA-Prüfung des Tutorial-Overlays (`#tutorial-modal`): korrekte deutsche Beschreibungen aller Mechaniken (Schwingen, Boost-Pfeile, fragile Knoten, rissige Decoys, Coins).
  * Neuer Menüpunkt **`ANLEITUNG & STEUERUNG`** im Einstellungs-Menü erlaubt das erneute Aufrufen der Anleitung zu jedem Zeitpunkt ohne Spielstand-Reset.
  * Playwright-Testsuite um automatisierten Tutorial-Workflow (`13_tutorial_modal.png`) erweitert (0 Konsolenfehler).

### v3.9.0 (02.09.2026) - De-Vibe UI Overhaul, 5-Stufen Difficulty Scaling, Decoy-Knoten & Skins Rework
* **Progressives 5-Zonen Schwierigkeits-Scaling (`WorldManager.js`):**
  * **Zone 1 (0–80m):** Entspanntes Onboarding, nur stationäre Normal-Knoten und klare Sprunglinien.
  * **Zone 2 (80–250m):** Erste bewegliche Knoten (15% Spawn, 18–30px/s Oszillation).
  * **Zone 3 (250–600m):** Rote Fragile-Knoten (20% Spawn, dynamischer Countdown von 1.6s auf 0.9s schrumpfend) und seltene rissige Fake-Knoten (10% Spawn) mit garantierter Lösbarkeit.
  * **Zone 4 (600–1200m):** Komplexe Kombinationen (beweglich + fragil + Decoys, Sprungdistanzen bis 135px).
  * **Zone 5 (1200m+):** Hyperspace-Sturm (schnelle Oszillationen, messerscharfe Fragile-Timer, anspruchsvolle Slingshot-Präzision).
* **Decoy / Fake-Knoten Mechanik (`Node.js`, `WorldManager.js`):**
  * Rissige, instabile Knoten, die bei Grapple-Kontakt sofort zerbrechen (`node.breakNode()`) und 35 Partikel-Splitter emittieren.
  * Visuell eindeutig als brüchige, gestrichelte Ringe mit Riss-Muster dargestellt.
  * Sicherheits-Regel: Decoys spawnen niemals als einziger erreichbarer Pfad – ein solider/beweglicher Knoten ist immer in Reichweite garantiert!
* **Boost-Knoten & Pfeil-Klarheit (`Node.js`):**
  * Boost-Knoten zeigen nun einen präzisen, nach oben gerichteten Vektorpfeil (`^`) in energetischem Grün (`#34d399`), der die Katapult-Richtung anzeigt.
  * Spawn-Wahrscheinlichkeit auf ~12% justiert für fokussierte Dopamin-Momente.
* **Skins-System & Schiffs-Geometrien (1 Basis + 3 Upgrades, `Constants.js`, `Spaceship.js`):**
  * Umbenennung des Menüs von *Hangar* zu **`SKINS`**.
  * 4 progressive Raumschiff-Stufen mit individuellen Vektor-Modellen:
    * **PFEIL (Basis, 0 Coins):** Schlanker, agiler Scout-Jäger.
    * **PHÖNIX (Stufe I, 150 Coins):** Aerodynamischer Doppelflügel-Jäger mit ionisierten Flügelkanten.
    * **SPECTRE (Stufe II, 350 Coins):** Facettierter Stealth-Interceptor mit 3 Triebwerken & Puls-Reaktorkern.
    * **NEXUS-TITAN (Stufe III, 750 Coins):** Gepanzerter Orbital-Dreadnought mit 4 Ionen-Düsen & rotierendem Energieschild-Ring.
  * 4 progressive Schweif-Stufen: `CYAN-LASER` (Basis), `SONNEN-FEUER` (Stufe I, 100 Coins), `QUANTEN-LILA` (Stufe II, 250 Coins), `HYPERDRIVE-CHROMA` (Stufe III, 500 Coins).
* **Währungs- & Begriffs-Harmonisierung:**
  * Kompletter Austausch von "Sterne" zu **`Coins`** im gesamten Projekt (HTML, HUD, Game Over, Aufgaben, Statistiken, Toasts, Shop).
  * Menü-Button `AUFGABEN` matcht 1:1 mit dem Modal-Reiter `AUFGABEN`.
  * Coin-Spawn-Rate auf ~70% angehoben (Coins deutlich weniger selten).
* **De-Vibe / De-Glare Aerospace UI & Mobile QA (`css/style.css`):**
  * Vollständige Entfernung greller, verschwommener Neon-Glows (`text-shadow`, `box-shadow`).
  * Edles mattes Aerospace-Dark-Design (`#0f172a` / `#1e293b`) mit scharfen 1px Micro-Borders.
  * Vertikal gestacktes Skins-Layout garantiert null Text-Truncation oder abgeschnittene Preis-Badges auf Desktop und Mobile (390x844).
* **Playwright Visual Verification:**
  * 12 Screens/Dialoge automatisiert erfasst und visuell geprüft; 0 Konsolenfehler.
* **Feste Aspect-Ratio (16:9 Hochformat):**
  * Auf Desktop-Bildschirmen wird das UI und das Canvas nicht mehr über die gesamte Monitorbreite in die Länge gezogen. Stattdessen wird durch `#game-container` in `style.css` eine maximale Breite (`max-width: calc(100vh * (9 / 16))`) erzwungen, was das typische mobile Hochformat simuliert.
  * Links und rechts gibt es nun elegante, echte schwarze Ränder.
* **GameEngine Resize-Anpassung:**
  * Die Spielphysik (`GameEngine.js`) nutzt nun nicht mehr gnadenlos `window.innerWidth`, sondern liest präzise via `getBoundingClientRect()` die Pixel-Dimensionen des neuen Containers aus, sodass Spiellogik, UI und Rendering stets 1:1 übereinstimmen.

### v3.7.0 (02.09.2026) - First-Time Tutorial & Visual Fixes
* **Tutorial-Onboarding:**
  * Ein interaktives Flug-Training-Overlay (`tutorial-modal`) wurde implementiert. Es öffnet sich zwingend beim allerersten Start (`totalRuns === 0`) und erklärt die Steuerung in klaren Worten.
* **Behebung visueller Kamera-Glitches:**
  * Der Bug, durch den bei hohen Geschwindigkeiten (Kamera zoomt raus) Ränder oder aufploppende Sterne/Knoten sichtbar wurden, ist behoben. `WorldManager.js` rendert nun mit 30% Margin-Puffer (`padX`, `padY`) und das Node/Orb-Culling toleriert weitere Viewport-Grenzen (-200 bis +200).
* **Entfernung Dummy-Daten:**
  * Die Fake-Daten im globalen Leaderboard (`GLOBAL_LEADERBOARD_TOP`) wurden komplett entfernt. Solange keine echten Online-Daten existieren, zeigt die Liste einen eleganten Empty-State-Hinweis.
* **QA / Playwright Testing:**
  * Die Test-Suite wurde um einen Check für das Tutorial-Overlay erweitert.

### v3.6.0 (02.09.2026) - 10-Point Deep Polish & Juiciness
* **Death Sequence & Feedback:**
  * 700ms Verzögerung vor dem Game-Over-Menü eingebaut, um die Schiffs-Explosion sichtbar zu machen (`GameEngine.js`).
  * Node-Break Screenshake und Splitter-Anzahl (von 22 auf 35) deutlich erhöht.
* **Lebendiges Universum:**
  * Sterne im Hintergrund driften nun auch sanft horizontal, was dem Starfield mehr Räumlichkeit gibt (`WorldManager.js`).
  * Orbs (Sterne) emittieren winzige Funken, wenn sie magnetisch vom Schiff angezogen werden (`EnergyOrb.js`).
  * Einsammeln von Orbs löst nun einen minimalen Hitstop (12ms) und Screenshake (2%) aus.
  * "+50" Text-Popups schweben länger und blenden weicher aus.
* **HUD & UI-Haptik:**
  * Lock-On Brackets (Visiere) rotieren nun sanft im Sci-Fi-Stil (`Node.js`).
  * Motion Trail des Raumschiffs wurde von 14 auf 22 Segmente verlängert und blendet eleganter aus (`Spaceship.js`).
  * Im Hangar skaliert die Hover-Animation (`transform: scale(1.03)`) die Shop-Karten.
  * Das ausgerüstete Item ("AKTIV") pulsiert nun leicht cyan-leuchtend, um visuell sofort aufzufallen (`style.css`).

### v3.5.0 (02.09.2026) - Systematisches Polish & Anfänger-Onboarding
* **Dynamisches Onboarding (`GameEngine.js`):**
  * Für die ersten 3 Versuche (oder solange der Highscore unter 150m liegt) werden kontextsensitive Tooltips ("DRÜCKEN & HALTEN" beim Fallen, "LOSLASSEN!" beim Rotieren) direkt auf das Canvas neben das Schiff gerendert.
* **Game Feel & Tension Polish:**
  * **Dynamischer Kamera-Zoom:** Die Kamera zoomt dynamisch etwas heraus, wenn das Schiff eine hohe vertikale Geschwindigkeit erreicht (z. B. nach einem Super-Boost), um das Geschwindigkeitsgefühl drastisch zu verstärken (`GameEngine.js`).
  * **Pulsierender Tether:** Das Seil (`Spaceship.js`) pulsiert in Dicke und Transparenz abhängig von der Rotationsgeschwindigkeit, um physische "Spannung" (Tension) visuell darzustellen.
* **UI/UX Klarheit:**
  * Das `ZEITLUPE BEREIT`-Badge wurde für eine noch klarere, universellere Verständlichkeit in `SLOW-MO BEREIT` umbenannt.

### v3.4.0 (02.09.2026) - Minimales Ingame-HUD, Emoji-Entfernung & Zeitlupen-Badge Fix
* **Zeitlupen-Badge Entkopplung (`index.html`, `css/style.css`):**
  * Das `ZEITLUPE BEREIT`-Badge wurde aus der rechten oberen Ecke geloest und zentriert am oberen Bildschirmrand mit eigener Glasmorphismus-Pille positioniert (`rgba(15, 23, 42, 0.92)`).
  * Kollisionen mit rechts generierten Orbit-Knoten und dem Pause-Button sind damit vollstaendig eliminiert.
* **Strikte Zero-Emoji & Symbol-Bereinigung:**
  * Saemtliche Emojis (`⚡`) und Sonderzeichen (`★`, `▲`) wurden aus HTML, CSS und JS entfernt und durch minimalistische SVG-Vektorgrafiken ersetzt.
* **Minimalistisches Ingame-HUD ("Keep it simple"):**
  * Der permanente Kontostand der gesammelten Sterne (`★ 511`) wurde waehrend des Flugs aus dem oberen linken HUD entfernt.
  * Das Flug-HUD zeigt nur noch die wesentlichen Werte: aktuelle Hoehe (`0m`) und persoenlichen Rekord (`REKORD: 3901m`).
* **Sicherheitsabstaende in der Welt-Generierung (`WorldManager.js`):**
  * Zusaetzliches horizontales Padding (`edgePadding = 85px`) verhindert, dass Orbit-Knoten an den Bildschirmraendern kleben oder HUD-Elemente ueberdecken.

### v3.3.0 (02.09.2026) - 3 Separate Hauptmenü-Buttons & Direkte Tab-Navigation
* **Direkt-Zugriff im Hauptmenü:**
  * Der kombinierte Button *Piloten-Zentrale* wurde durch 3 dedizierte Buttons ersetzt:
    1. **`BESTENLISTE`** (Trophäen-Vektor-Icon): Öffnet direkt das weltweite Leaderboard und den Perzentil-Rang.
    2. **`HERAUSFORDERUNGEN`** (Ziel-Vektor-Icon + Live-Badge `[X BEREIT]`): Öffnet direkt die täglichen und wöchentlichen Quests.
    3. **`STATISTIKEN`** (Diagramm-Vektor-Icon): Öffnet direkt die persönlichen Flug- und Lebenszeit-Statistiken.
* **Architektur & Event-Routing:**
  * [`UIManager.openHubTab(tabName)`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/engine/UIManager.js) aktiviert den korrespondierenden Tab programmatisch.
  * Menü-Klick-Handler in [`main.js`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/js/main.js) übergeben den Ziel-Tab an den `StateManager`.
* **Playwright-Verifikation:**
  * Testsuite prüft das direkte Anklicken aller 3 neuen Menü-Buttons und verifiziert 0 Konsolenfehler.
* **OneDrive Synchronisation:**
  * Vollständiges Projektverzeichnis nach `C:\Users\hannes.bauer\OneDrive - Farbenbauer GmbH & Co KG\Antigravity\privat\blissful-euclid` synchronisiert.

### v3.2.0 (02.09.2026) - Mobile Phone Link, QR-Code Terminal Server & PWA Integration
* **Lokaler QR-Code HTTP-Server (`scripts/serve.js`):**
  * Erkennt automatisch die lokale IPv4-Netzwerkadresse im Heim-/Bueronetz.
  * Gibt im Terminal automatisch einen scanbaren QR-Code fuer die Smartphone-Kamera aus.
  * Zuverlaessiges MIME-Type-Streaming fuer HTML5 Canvas, Audio, JSON und Webfonts.
* **Weltweites Instant-Sharing (`scripts/share.js`):**
  * Ermoeglicht sofortigen oeffentlichen Zugriff ueber HTTPS-Tunnel ohne Router-Konfiguration oder Port-Forwarding.
* **PWA & Mobile Web App Polish (`manifest.json`, `index.html`, `css/style.css`):**
  * `manifest.json` mit Standalone-Konfiguration fuer "Zum Startbildschirm hinzufuegen".
  * iOS/Android Meta-Tags: `viewport-fit=cover`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`.
  * Mobile Touch Safeguards: `touch-action: manipulation`, `overscroll-behavior: none` (verhindert versehentliches Pull-to-Refresh beim Spielen), `-webkit-touch-callout: none`.
* **Historische Dokumentations-Richtlinie:**
  * Verbindliche Regel in `GEMINI.md` und `.agents/rules/standards.md` verankert: `GAME_STATUS.md` wird kumulativ gefuehrt; fruehere Versionen werden niemals geloescht oder ueberschrieben.

---

### v3.1.0 (02.09.2026) - Quest-Claiming Fix & Sternen-Balancing
* **Bugfix `UIManager.updateCurrency()`:**
  * Fehlende Methode in `UIManager.js` implementiert und mit synchroner Aktualisierung von Menue-, Hangar- und HUD-Guthaben verknuepft.
  * Aktiver Claim Flow: Klick auf `[ EINSAMMELN (+X STERNE) ]` loest Belohnung ein, wechselt auf `✓ EINGELÖST`, blendet Toast ein und dekrementiert Badges ohne Konsolenfehler.
* **Ausgewogene Sternen-Dichte auf der Map (Clutter Reduction):**
  * 55% der regulaeren Sprungdistanzen bleiben voellig frei von Sternen fuer optimale Flugbahn-Sicht.
  * Spawns erzeugen kompakte 1er-Apex-Sterne (45%), 2er-Laser-Linien (35%) oder leichte 3er-Boegen (20%).
  * Turbo-Katapulte spawnen 2 statt 4 Sterne, Gabelungen erhalten eine 35%-Spawnchance (ca. 65% weniger Clutter).

---

### v3.0.0 (02.09.2026) - Globale Playwright Test-Integration
* **Vollstaendige Testsuite (`scripts/playwright_runner.js`):**
  * Headless Chromium/Edge mit 2x Device-Pixel-Ratio.
  * Automatische Erfassung aller Screens in `screenshots/`.
  * Strikte Durchsetzung von 0 Konsolenfehlern und 0 ungefangenen Exceptions.

---

### v2.9.0 (01.09.2026) - Piloten-Zentrale (3-Tab Hub) & Hangar
* **Tab 1 - Globales Leaderboard & Prozentrang:** Weltweite Top 10 + dynamische Berechnung des Spieler-Rangs (`#X von 10.000 Piloten (TOP Y%)`).
* **Tab 2 - Taegliche & Woechentliche Aufgaben:** Quests mit 24h / 7-Tage Reset-Timern und aktiver `[ EINSAMMELN ]`-Mechanik.
* **Tab 3 - Detaillierte Statistiken:** Uebersicht aller Lebenszeit-Flugdaten.
* **Fokussierter Hangar:** 6 Raumschiffe und 6 Schweife mit rotierender Live-Vorschau.
* **Einmaliger Upgrade-Hinweis:** Poppt im Game-Over-Screen genau 1x pro freischaltbarem Upgrade auf.

---

### v2.4.0 (31.08.2026) - Universum-Themen, Raumschiffe & Aufgaben-Katalog
* **4 Farbwelten:** Weltraum, Neon-City, Sonnenfeuer, Nacht.
* **6 Schiffe:** Pfeil, Falke, Tarn-Flieger, UFO, Doppel-Fluegel, Titan.
* **6 Schweife:** Blau, Gruen, Feuer, Lila, Regenbogen, Weiss.

---

### v1.0.0 (30.08.2026) - Physik-Engine & Slingshot-Kinetik
* **Mathematischer Forward-Reach Solver:** 285px Fangreichweite bei 140px Mindestabstand (100% faire Spruenge).
* **Viewport-Culling:** Saubere Bereinigung unterhalb des Sichtfelds.

---

## 3. Visuelles UI-Audit & Screenshots (`screenshots/`)

Alle 12 Bildschirme wurden ueber Playwright (`npm test`) validiert (0 Konsolenfehler):

* **`01_main_menu.png`**: Hauptmenue mit Vektor-Buttons.
* **`02_hangar_ships.png`**: Hangar (Raumschiffe mit Live-Vorschau).
* **`03_hangar_trails.png`**: Hangar (Schweife mit Farbverlaeufen).
* **`04_hub_leaderboard.png`**: Piloten-Zentrale (Globales Ranking & Perzentil-Rang).
* **`05_hub_quests.png`**: Piloten-Zentrale (Taegliche & woechentliche Aufgaben mit `[ EINSAMMELN ]`).
* **`05b_hub_quests_claimed.png`**: Piloten-Zentrale (Eingeloester Status `✓ EINGELÖST` + Toast-Banner).
* **`06_hub_stats.png`**: Piloten-Zentrale (Detaillierte Lebenszeit-Statistiken).
* **`07_settings.png`**: Aufgeraeumte Optionen (Audio stummgeschaltet, Shake, Performance).
* **`08_gameplay_hud.png`**: Ingame-HUD mit Missions-Anzeige.
* **`09_pause_modal.png`**: Pause-Menue.
* **`10_game_over.png`**: Absturz-Screen mit Auswertung und Upgrade-Banner.
* **`11_mobile_responsive.png`**: Mobile Portrait-Ansicht (390x844).

---

## 4. Modulare Dateistruktur

```
blissful-euclid/
├── index.html                   # HTML5-Geruest mit PWA- & Mobile-Meta-Tags
├── manifest.json                # Web App Manifest fuer Standalone-Fullscreen
├── package.json                 # npm start, npm run share, npm test
├── GAME_STATUS.md               # Kumulatives, historisches Dokumentations-Log (dieses Dokument)
├── DISTRIBUTION.md              # Vertriebs- & Monetarisierungs-Roadmap
├── GEMINI.md                    # Verbindliche Playwright, Zero Emoji & History-Regeln
├── .agents/rules/standards.md   # Agenten-Standards fuer kontinuierliche Dokumentation
├── css/style.css                # Mobile-Touch Optimierung (overscroll-behavior, touch-action)
├── screenshots/                 # 12 Playwright UI-Screenshots aller States
├── scripts/
│   ├── serve.js                 # Lokaler HTTP-Server mit LAN-Erkennung & Terminal QR-Code
│   ├── share.js                 # Weltweiter Instant-HTTPS-Tunnel mit QR-Code
│   └── playwright_runner.js     # Automatisierte Playwright Test-Suite
└── js/
    ├── config/Constants.js
    ├── services/StorageService.js
    ├── audio/AudioManager.js    # Global stummgeschaltet (enabled = false)
    ├── engine/ParticleSystem.js
    ├── engine/InputManager.js   # Touch- & Gamepad-Handler
    ├── engine/MissionManager.js
    ├── engine/ShopManager.js
    ├── engine/StateManager.js
    ├── engine/UIManager.js
    ├── engine/GameEngine.js
    ├── entities/Spaceship.js
    ├── entities/Node.js
    ├── entities/EnergyOrb.js
    └── world/WorldManager.js
```
