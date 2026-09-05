# SLING JUMP - VOLLSTÄNDIGES SYSTEM- & SPIEL-HANDBUCH (INTERNE REFERENZ)

Dokumentationsstand: Version 4.7.0  
Aktualisiert am: 05. September 2026  
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
  2. **Hyper-Kristalle (`CRYSTAL`):** Extrem seltene violett-pinke Währung (ultra-seltene 0.25% Spawn-Chance ab 8.000m Tiefe mit 6.000px Mindestabstand). Dient zur sofortigen **Quanten-Wiederbelebung** nach einem Absturz.

---

## 2. STEUERUNG & PHYSIK-MECHANIKEN

### 2.1 Einhaken (Grapple Hook) & Schwereloser Orbit
* **Aktion:** Bildschirm / Maustaste gedrückt halten (Touch / Pointerdown / Leertaste).
* **Tetherless Grappling (Freier Orbit):**
  * Auf Nutzerwunsch wurde der visuelle Haltestrahl zwischen Raumschiff und Knoten komplett entfernt.
  * Das Schiff geht beim Einhaken in einen freien, ungestörten kreisförmigen Orbit um den Zielknoten über.
  * Lineare Geschwindigkeiten werden beim Einhaken sofort auf null gesetzt (`vx = 0, vy = 0`), sodass Sterne im Hintergrund punktförmig bleiben.
* **Fadenkreuz & Zielerfassung:**
  * Das nächste erreichbare Objekt innerhalb der Reichweite (`HOOK_RANGE = 160px`) wird mit einem zirkulären Lock-On-Fadenkreuz markiert.
  * **Ausschluss:** Tödliche Weltraum-Minen (`HAZARD`) werden niemals anvisiert.

### 2.2 Loslassen & Katapult-Abschuss (Slingshot Release)
* **Aktion:** Loslassen des Bildschirms / Taste.
* **Funktionsweise:**
  * Das Schiff löst sich tangential aus dem Orbit und übernimmt die Fliehkraft als lineare Fluggeschwindigkeit (`vx`, `vy`).
  * Normaler Sprung: Gewährt einen Basis-Aufwärtsschub (`+80 vy`), sofern die Flugbahn nach oben gerichtet ist.

---

## 3. COMBO-SYSTEM & DYNAMISCHE GESCHWINDIGKEITS-SKALIERUNG

* **Steilsprung-Bedingung (Verschärfter 90°-Präzisionswinkel):**
  * Der Abschusswinkel muss extrem präzise vertikal nach oben gerichtet sein (`tangentY >= 0.995`, Winkeltoleranz ca. ±5,7° zur idealen Senkrechten).
* **Direkte ökonomische Belohnung:**
  * Jeder erfolgreiche 90°-Katapultwurf schüttet unmittelbar **Bonus-Gold** auf das Spielerkonto aus:
  * Formel: `Bonus-Gold = Combo-Level` (z.B. +1 Münze bei Stufe 1 bis +10 Münzen bei Stufe 10).
  * Sofortige Score-Gutschrift: `Bonus-Punkte = 100 * Combo-Level`.
* **Ausbalancierte Geschwindigkeits-Skalierung (Kontrollierte Tempokurve):**
  * Moderater, kontrollierter Tempobonus von +3% pro Stufe bis maximal **+30% Tempo**:

| Combo-Stufe | HUD-Kennzeichnung | Tempo-Multiplikator | Min Orbit-Speed | Max Orbit-Speed | Vertikaler Zusatz-Impuls | Gravitationswiderstand | Sofort-Belohnung |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **0** | Basisflug | **1.00x** | 720 px/s | 1.250 px/s | +0 px/s | 100% Natürliche Gravitation | 0 |
| **1** | PERFEKT 90° (+3% TEMPO) | **1.03x** | 741 px/s | 1.287 px/s | +25 px/s | 100% Natürliche Gravitation | +1 Gold / +100 Pkt |
| **2** | COMBO x2 (+6% TEMPO) | **1.06x** | 763 px/s | 1.325 px/s | +45 px/s | 100% Natürliche Gravitation | +2 Gold / +200 Pkt |
| **3** | COMBO x3 (+9% TEMPO) | **1.09x** | 784 px/s | 1.362 px/s | +65 px/s | 100% Natürliche Gravitation | +3 Gold / +300 Pkt |
| **4** | COMBO x4 (+12% TEMPO) | **1.12x** | 806 px/s | 1.400 px/s | +85 px/s | 100% Natürliche Gravitation | +4 Gold / +400 Pkt |
| **5** | HYPER x5 (+15% TEMPO) | **1.15x** | 828 px/s | 1.437 px/s | +105 px/s | 100% Natürliche Gravitation | +5 Gold / +500 Pkt |
| **6** | HYPER x6 (+18% TEMPO) | **1.18x** | 849 px/s | 1.475 px/s | +125 px/s | 100% Natürliche Gravitation | +6 Gold / +600 Pkt |
| **7** | HYPER x7 (+21% TEMPO) | **1.21x** | 871 px/s | 1.512 px/s | +145 px/s | 100% Natürliche Gravitation | +7 Gold / +700 Pkt |
| **8** | HYPER x8 (+24% TEMPO) | **1.24x** | 892 px/s | 1.550 px/s | +165 px/s | 100% Natürliche Gravitation | +8 Gold / +800 Pkt |
| **9** | HYPER x9 (+27% TEMPO) | **1.27x** | 914 px/s | 1.587 px/s | +185 px/s | 100% Natürliche Gravitation | +9 Gold / +900 Pkt |
| **10** | MAX COMBO x10 (+30% TEMPO) | **1.30x** | 936 px/s | 1.625 px/s | +200 px/s | 100% Natürliche Gravitation | +10 Gold / +1.000 Pkt |

* **100% Natürliche Gravitation:**
  * Kein künstliches Aushebeln der Erdanziehung. Die Gravitation greift im Steigflug immer mit vollen 100% (`GRAVITY * dt`), sodass das Steig- und Fallverhalten physikalisch exakt vorhersehbar bleibt.
* **Akustische Chimes:**
  * Dual-Oszillator mit chromatisch aufsteigendem Oberton (+2 Halbtöne pro Stufe von C5 bis C7).
* **Visuelle High-Speed Effekte & Feedback:**
  * Schockwellenring am Katapult-Knoten (`spawnShockwave`).
  * Hypersonische Warpgeschwindigkeits-Streifen (`spawnSpeedStreaks`) bei Combo ab Stufe 2.
  * **Minimalistisches Text-Feedback:** Der redundante Banner-Text am oberen Bildschirmrand (`#hud-combo-badge`) wurde entfernt. Combo- und Perfekt-Meldungen (`PERFEKT`, `COMBO x2`, etc.) erscheinen ausschließlich als dezenter Schwebetext direkt am Katapult-Punkt des Raumschiffs.

---

## 4. KNOTEN-TYPEN & 7-STUFIGE PROGRESSIONS-MATRIX

Die prozedurale Generierung (`WorldManager.js`) skaliert die Schwierigkeit dynamisch entlang von 7 Zonen:

| Zone | Höhenbereich | Standard (%) | Super-Boost (%) | Beweglich (%) | Zeituhr / Fragil (%) | Köder / Fissur (%) | Weltraum-Mine / Bombe (Lethal) | Min/Max Lücke | Mechanische Charakteristik |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Zone 1: Kalibrierung** | 0 m – 500 m | 100% | 0% | 0% | 0% | 0% | 0% | 140 – 180 px | 100% stabile Basisknoten zum sicheren Einstieg. |
| **Zone 2: Stratosphäre** | 500 m – 1.500 m | 95% | 5% | 0% | 0% | 0% | 0% | 150 – 195 px | Erste seltene grüne Katapulte mit 8-Knoten Cooldown. |
| **Zone 3: Mesosphäre** | 1.500 m – 3.500 m | 76% | 4% | 20% | 0% | 0% | 0% | 165 – 215 px | Violette Pendelknoten erfordern horizontales Vorhalten; Boost gedrosselt auf 4%. |
| **Zone 4: Thermosphäre** | 3.500 m – 6.500 m | 59% | 3% | 24% | 14% | 0% | 0% | 180 – 235 px | Goldene Zeituhr-Knoten mit Countdown; Boost selten (3%). |
| **Zone 5: Exosphäre** | 6.500 m – 10.000 m | 40% | 2% | 26% | 26% | 6% | 0% | 190 – 245 px | Mehr Zeituhr-Knoten (26%) fordern zügigen Rhythmus; Boost extrem dosiert (2%). |
| **Zone 6: Tiefraum-Gefahren** | 10.000 m – 15.000 m | 31% | **1.0%** | 28% | 34% | 6% | **~7% Korridor** | 195 – 250 px | **Dominante Zeituhr-Knoten (34%), 87.5% weniger Boosts (1.0%) & 8-Knoten Cooldown.** |
| **Zone 7: Meister-Kosmos** | 15.000 m+ | 23.2% | **0.8%** | 28% | 42% | 6% | **~10% Korridor** | 200 – 260 px | 70% dynamische Knoten (42% Zeituhr + 28% Pendel); Boosts auf 0.8% minimiert (90% Drop). |

### Detailbeschreibung aller 6 Entitäten
1. **STANDARD (Cyan `#00f0ff`):** Solider, dauerhafter Orbit-Anker.
2. **SUPER-BOOST (Grün `#10b981`):** Erhöht den Katapult-Schub auf das 1,85-fache, erzeugt Warp-Streifen und verleiht temporäre Immunität gegen Weltraum-Minen. **Cooldown-Sperre:** Nach jedem Super-Boost müssen mindestens 8 reguläre Knoten generiert werden (`nodesSinceLastBoost >= 8`), bevor erneut ein Boost spawnen kann. Ab 10.000m auf 1.0% bzw. 0.8% gedrosselt.
3. **BEWEGLICH (Violett `#c084fc`):** Schwingt horizontal im Pendelmodus (`moveRange` bis 100px).
4. **ZEITUHR / FRAGIL (Gold `#eab308`):** Besitzt 12 radiale Uhren-Ticks. Nach dem Einhaken tickt die Uhr ab (~0,8s). Bricht bei Ablauf mit Scherbenregen ab!
5. **KÖDER / FISSUR (Orange `#f97316`):** Brittle Trap mit Fissur-Linien. Bricht beim Einhaken sofort entzwei; bietet keinen Halt.
6. **BOMBE / WELTRAUM-MINE (`HAZARD` / Crimson `#ef4444`):**
   * Spawnt ab 10.000m Höhe als tödliches Hindernis im Flugkorridor (moderat skaliert: 7% bis 10%).
   * Design: 8 rotierende messerscharfe Stacheln, dunkler Kern mit 3-Flügel-Warnsymbol, gestrichelte rote Gefahrenzone.
   * Nicht einhakbar (vom Fadenkreuz ausgeschlossen).
   * Bei regulärer Berührung: Sofortige gewaltige Detonation und Game Over ("MINE DETONIERT!").
   * **Super-Boost Schild-Durchbruch:** Schlägt das Schiff während eines aktiven Super-Boosts (`isSuperBoosting`) auf eine Mine ein, zerschellt die Mine schadlos in einer smaragdgrünen Schockwelle ("MINE ZERSTÖRT!"). Der Pilot fliegt ungebremst weiter!

---

## 2b. ORBIT- & KATAPULT-DYNAMIK
* **Gravitations-Bindung:**
  * Das Raumschiff bindet sich rein visuell über eine transparente Gravitationskraft an Himmelsknoten. Es gibt keine sichtbare Hakenleine mehr, was ein aufgeräumtes, elegantes Gesamtbild erzeugt.
* **Präziser Katapultwinkel (90° Steilsprung):**
  * Ein perfekter senkrechter Katapultsprung (`PERFEKTER 90° SPRUNG!`) wird nur ausgelöst, wenn die Tangente der Flugbahn exakt nach oben zeigt (`tangentY >= 0.985`, Winkeltoleranz unter ±10°).
  * Belohnung: Sofortiger Vertikalschub (`launchSpeed *= 1.35`) und schwebender Bonustext.
* **Combo-System & Floating Texts:**
  * Aneinandergereihte Katapultflüge ohne Bodenkontakt bauen einen Multiplikator auf (Combo x2, x3, etc.).
  * Schwebende Texte sind hierarchisch getrennt, sodass Combo-Badges und 90°-Texte sich niemals überlagern.

---

## 3. PROGRESSIVE WELTEN-GENERIERUNG & KREIS-TYPEN

Die Welt skaliert entlang von 7 Zonen (0m bis 15.000m+). Im späteren Spielverlauf machen dynamische Knoten 62% des Feldes aus:

1. **STANDARD (Cyan):** Statischer Knoten, unbegrenzt stabil.
2. **SUPER-BOOST (Grün):** Mit rotierenden Aufwärtspfeilen; verleiht beim Lösen massiven Zusatzturbo.
3. **BEWEGLICH (Violett):** Pendelt horizontal hin und her; erfordert präzises Vorhalten beim Einhaken.
4. **ZEITUHR / FRAGIL (Gold):** Tickernder Countdown-Ring; zerbricht nach 1,8 Sekunden Orbitdauer.
5. **KÖDER-FALLE (Orange):** Instabile Fissuren-Textur; zerbricht unmittelbar beim Einhakversuch.
6. **WELTRAUM-MINE (Crimson-Rot, ab 10.000m):** Tödliches Hindernis mit 8 rotierenden Stacheln. Nicht einhakbar; sofortige Detonation und Spielende bei Berührung!

---

## 4. HERAUSFORDERUNGS-SYSTEM (DAILIES & WEEKLIES)

Das Questsystem (`MissionManager.js`) trennt streng zwischen schnellen täglichen Aufgaben und anspruchsvollen Wochen-Zielen:

* **Tägliche Aufgaben (24h Reset):** Konzipiert für 5–10 Minuten tägliche Spielzeit (z.B. 600m Einzelflug, 16 Münzen, 5 Katapulte).
* **Wöchentliche Herausforderungen (7-Tage Reset):** Mathematisch austariert auf **ca. 2,0 bis 2,5 Stunden aktive Spielzeit** über die Woche verteilt:

| Wöchentliche Herausforderung | Zielwert | Typischer Durchschnitt | Benötigte Runs | Errechnete Spielzeit | Rationale |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Kosmischer Marathon** | **150.000 m** | ~2.000 m / Run | ~75 Runs | **~131 Min. (~2,2 Std.)** | ~11 Runs täglich über 7 Tage. |
| **Orbital-Meister** | **1.500 Sprünge** | ~22 Sprünge / Run | ~68 Runs | **~120 Min. (~2,0 Std.)** | ~10 Runs täglich über 7 Tage. |
| **Schatzkammer** | **800 Münzen** | ~10 Münzen / Run | ~80 Runs | **~140 Min. (~2,3 Std.)** | ~11 Runs täglich über 7 Tage. |
| **Exosphären-Vorstoss** | **8.000 m** (Einzelflug) | Elite-Skill | 30–50 Versuche | **~60–90 Min. (~1,2 Std.)** | Meisterung aller Zonen 1 bis 5. |
| **Reflex-Akrobat** | **60 Knappe Rettungen** | ~0,8 Rettungen / Run | ~75 Runs | **~131 Min. (~2,2 Std.)** | Intensives Risikospiel vor dem Abgrund. |

---

## 5. SYSTEM-PERFORMANZ & INHÄRENTE HARDWARE-EFFIZIENZ (ZERO-STUTTER 60 FPS ARCHITEKTUR)

* **Standardmäßig hochperformant ohne manuelle Schalter:**
  * Das Spiel läuft standardmäßig volloptimiert mit einer Zielbildrate von 60/120 FPS auf allen Desktop- und Mobilplattformen.
* **1. Hitstop-Elimination (Beseitigung künstlicher Frame-Freezes):**
  * Frühere Versionen nutzten `hitstopTimer > 0` im `GameEngine.update()`, um bei jedem Münzensammeln, Slingshot-Start, Boost und Höhenrekord die Physik für 35–100ms anzuhalten. Dies erzeugte wahrnehmbares Ruckeln und Eingabeverzögerungen.
  * In v4.6.2 ist Hitstop für sämtliche Routine-Ereignisse restlos entfernt.
  * Einziger verbleibender Hitstop ist der Game-Over-Crash, gedeckelt auf maximal 16ms (1 Frame) für einen knackigen Aufprall ohne wahrnehmbare Stockung.
* **2. Debounced Storage I/O (`StorageService.js`):**
  * `addCores()` und `addHyperCrystals()` nutzen `this.saveDeferred(1500)` statt synchroner `localStorage.setItem()` Schreibzugriffe im laufenden Frame.
  * Synchrones Speichern (`this.save()`) erfolgt ausschließlich bei echten Zustandsgrenzen: Game Over, Wiederbelebung, Quest-Belohnungsanspruch oder Skin-Kauf im Hangar.
* **3. GPU-Compositor Entlastung (`css/style.css`):**
  * Beseitigung aller `backdrop-filter: blur(14px)` und `blur(10px)` Anweisungen von permanent über dem 60 FPS Canvas eingeblendeten HUD-Elementen (`.score-container`, `#btn-hud-pause`, `.hud-tutorial-tip`).
  * Ersatz durch opake Glasfarben (`rgba(15, 23, 42, 0.88)`), wodurch teure GPU Texture-Readbacks und Gaussian-Blur Passes pro Frame entfallen.
* **4. Gebatchte Canvas-Renderläufe (`WorldManager.js`):**
  * **Dual-Pass Starfield:** 200–500 Sterne werden ebenenweise in zwei Durchläufen per gebatchtem `fillRect()` gezeichnet (`context.fill()`), statt hunderter einzelner `beginPath()`, `arc()` und `globalAlpha` State-Wechsel.
  * **Gebatchte Warp-Streifen:** Alle Hyperspace-Partikel werden in einem einzigen zusammengesetzten Pfad gezeichnet.
  * **Entfernung von `shadowBlur: 18`:** An der unteren Todesgrenze (`drawBottomDeathBoundary`) durch mehrstufige kontraststarke Linienzüge ersetzt.
* **5. Quantisierter Partikel- & Glow-Cache (`ParticleSystem.js`, `Node.js`, `EnergyOrb.js`):**
  * `ParticleSystem.getGlow()` quantisiert HSL-Farbstrings, um unbegrenzte Off-Screen Canvas-Allokationen zu verhindern.
  * `OrbitNode.getCachedGlow()` und `OrbitNode.getCachedCore()` nutzen statische Lookup-Caches.
  * Die 12 Zeituhr-Ticks auf fragilen Knoten werden in einen einzigen Pfadstroke gebatcht.
  * `EnergyOrb` ersetzt trigonometrische 8-Eck Berechnungen durch native `context.arc()` Aufrufe.
* **6. Zero-Allocation Hot Loops & Ringpuffer:**
  * Vorallozierter 400-Partikel Ringpuffer verhindert GC-Spikes während des Flugs.
  * Reverse-Array Iteration und In-Place Array Compaction (`WorldManager.js`, `GameEngine.js`) statt rechenintensiver `.filter()` oder Garbage Collector Belastungen.

---

## 6. WIEDERBELEBUNGS-SYSTEM (QUANTUM REVIVE) & HYPER-KRISTALLE

* **Garantierter Peak-Altitude Checkpoint & Sichtbarkeits-Garantie:**
  * **Verankerung am wahren Höhen-Peak (`triggerGameOver`):** Nach einem Void-Absturz orientiert sich die Engine nicht am Absturzort, sondern mathematisch strikt an der erreichten Höchstmarke: $\text{peakY} = \max(380, \text{maxAltitudeMeters} / 0.125)$. Der Pilot verliert somit niemals seinen Höhengewinn.
  * **Weitsichtige Kamera-Positionierung (`revivePlayer`):** Beim Wiederbeleben wird `this.cameraY = targetAnchor.y - this.height * 0.58` gesetzt. Dadurch befindet sich der Anker im oberen Mittelfeld bei 42% der Bildschirmhöhe (`screenY = 430px`). Es verbleibt ein 58%-Sicherheitskorridor nach unten – die rote Void ist meilenweit entfernt.
  * **Sicherheits-Perimeter & Desintegration:** Sämtliche Minen (`HAZARD`) und Trümmer im Umkreis von 320px um den Respawn-Anker werden restlos desintegriert.
  * **Direktes, unfehlbares Einhaken:** Das Raumschiff wird sofort und verlässlich im Orbit arretiert (`isHooked = true`, `hookedNode = targetAnchor`, `orbitRadius = 65`, `orbitSpeed = 420 px/s`, `vx = 0`, `vy = 0`, Aufwärtsorbit).
  * **Garantierte 3-Stufen Aufstiegsleiter:** Über dem Respawn-Anker werden automatisch drei verlässliche `STANDARD`-Knoten (+155px, +310px, +465px) generiert, um einen fairen, barrierefreien Aufstieg sicherzustellen.
* **Quanten-Sicherheitsnetz (Automatisches Trampolin):**
  * Gerät der Pilot während der 4-Sekunden-Schutzphase in die Nähe der unteren Todesgrenze (`player.y <= cameraY + 60`), löst ein automatischer Quanten-Rückstoß aus: $\text{vy} = \max(540, |\text{vy}| + 220)$ samt Schockwelle, violettem Funkenregen und Textanzeige "QUANTEN-RÜCKSTOSS!". Ein Void-Tod ist während des Schildes physikalisch unmöglich.
* **Absprung-Sicherheit (`Spaceship.releaseHook`):**
  * Während des 4,0s-Quantenschilds erzwingt jeder Katapultsprung eine garantierte Mindest-Aufwärtsgeschwindigkeit von `vy >= 320 px/s`. Ein versehentliches Schießen nach unten in den Abgrund wird zuverlässig unterbunden.
* **Kosten:** 1 Hyper-Kristall (1x pro Run nutzbar).

---

## 7. MENÜ-STRUKTUR, MODALS & MINIMALISTISCHES DESIGN-SYSTEM

* **Globale Design-Regel: Kommerzieller Minimalismus ("Weniger ist mehr"):**
  * Keine überladenen Texte, keine bürokratischen Bezeichnungen, kein visueller Ballast.
* **Fokussiertes Login- & Profil-Modal (`#profile-modal`):**
  * Rein auf Spieleridentität und Login fokussiert: Avatar, Namenseingabefeld, `SPEICHERN` und `SCHLIESSEN`.
  * Sämtliche redundanten Highscore- und Flugzähler wurden entfernt (diese verbleiben in der Bestenliste und den Statistiken).
* **Minimalistisches Game-Over-Modal (`#gameover-modal`):**
  * **Matte, unaufdringliche Obsidian-Ästhetik:** Störende neonblaue Leuchteffekte, Sci-Fi-Eckwinkel und dicke Kapsel-Hintergründe wurden vollständig entfernt.
  * **Bereinigte Typografie:** Redundante Labels wie "FLUG-BERICHT" und "ERREICHTE HÖHE" getilgt.
  * **Kristallklare Höhen-Ziffer:** Das erreichte Ergebnis wird mit 68px in gestochen scharfem Reinweiß (`#ffffff`) ohne weichgezeichneten Scheinwerfer-Glow dargestellt, ergänzt um die dezente Einheit `m` in gedämpftem Slate.
  * **Highscore statt Bestleistung:** Neutrale, ungerahmte Darstellung als `HIGHSCORE: X m` in edlen Grautönen.
  * **Transparente Belohnungen:** Münzen und Hyper-Kristalle stehen nahtlos und ungerahmt mit ihren Vektor-Icons im Raum.
  * **Kompakter Wiederbeleben-Subtext:** Zeigt einzig die essenzielle Information `1x pro Flug` ohne Floskeln.
* **Aufgaben-Modal mit Touch- & Maus-Scrolling (`#quests-modal`):**
  * Container `.quests-scroll-area` mit voller Touch-Unterstützung (`touch-action: pan-y`, `-webkit-overflow-scrolling: touch`) und zirkulären Cyan-Scrollbars.
  * Ermöglicht unterbrechungsfreies Scrollen bis zu den wöchentlichen Herausforderungen.
* **Eigenständige Dashboard-Begleit-App (`dashboard.html`):**
  * Vollwertige PWA (`manifest-dashboard.json`) mit mobiler Standalone-Unterstützung.
  * Bietet die vollständige Telemetrie-Übersicht (Live-Spieler, Unique Devices, Runden heute, Rekorde, Runden-Historie).
  * Prominenter, neonblau leuchtender Button **"SPIELEN"** führt jederzeit direkt ins Spiel.
  * Eigenständige URL für Homescreen-Installation ohne redundante Menü-Buttons im Spiel.
  * **Live-Link:** [https://bauerjohannes2-max.github.io/sling-jump/dashboard.html](https://bauerjohannes2-max.github.io/sling-jump/dashboard.html)
* **Bereinigtes Einstellungs-Menü & Statischer Update-Checker:**
  * Überflüssige Buttons ("ANLEITUNG & STEUERUNG", "SPIELER-DASHBOARD") entfernt.
  * Statische `version.json` mit automatischem Cache-Purge und Sofort-Reload bei Version-Diskrepanz.
* **AAA App-Icon, Favicon & Cache-Architektur:**
  * Root `favicon.ico` für native Browseranfragen direkt im Rootverzeichnis hinterlegt.
  * Versionierte Link-Parameter (`?v=3.33.0`) durchbrechen Browser-Cache-Tunneling.
  * Multi-Plattform-Icons: `assets/icon-512.png`, `assets/icon-192.png`, `assets/favicon.png` und `assets/icon.svg`.
  * **Network-First für Kern-Code:** `sw.js` liefert HTML, JS und CSS online stets netzwerk-aktuell aus.
* **Cyberpunk Game-Over Screen Redesign:**
  * Cyberpunk-Rahmen (`.gameover-cyber-frame`) mit 4 filigranen Eck-Brackets (`.cyber-bracket`) in Neon-Cyan.
  * Hero Altitude Score mit 60px Ziffern (`#38bdf8`) und deutscher Zahlenformatierung (`toLocaleString('de-DE')`).
  * Rekord-Kapsel mit Pokal-Icon und animiertem goldenem Badge.
  * Smaragdgrüner Primärbutton (`.btn-replay-emerald`) mit SVG-Replay-Icon für schnellen Neustart.
* **Engine Hardening & Zero-Allocation Render-Loops:**
  * Fester 24-Punkte-Ringpuffer für Motion-Trails eliminiert Objekt-Allokationen im 60/120 FPS Frame-Loop.
  * O(1) zyklische Cursor-Zeiger für Partikel- und Text-Pools.
  * Throttled/Deferred Storage-Speicherung via `saveDeferred()` verhindert E/A-Ruckler während des Steigflugs.
  * `rawDt`-Begrenzung auf 0.033s (30 FPS Minimalrate) verhindert Durchtunneln von Knoten bei Tab-Aufwachphasen.
* **Strict Zero Emoji Policy:**
  * Ausschließlich minimalistische SVG-Vektoricons und scharfe Canvas-Geometrie.

---

## 8. MINIMALISTISCHES TUTORIAL-SYSTEM (1-FOLIEN GUIDE)

* **Elegante 1-Folien-Architektur:**
  * Die überladene zweite Folie wurde restlos gestrichen.
  * Die Steuerung wird dem Spieler kompakt, ruhig und visuell selbsterklärend präsentiert.
* **Ruhige, verlangsamte Canvas-Animation:**
  * Auf 5,8 Sekunden gestreckter Animationszyklus (`#tut-sling-canvas` mit responsivem `aspect-ratio: 360 / 160`).
  * Schiff fliegt an, kreist in aller Ruhe um den Anker und katapultiert sich in Blickrichtung nach oben.
* **Klare, minimalistische Farbgebung & Sprache:**
  * Keine aggressiven Orangetöne mehr; reinweißes und cyanfarbenes Design.
  * Einfache, intuitive Formulierung ohne technische Winkelangaben:
    * *GEDRÜCKT HALTEN:* Halte den Bildschirm gedrückt, um dich am Kreis einzuhaken und Schwung aufzubauen.
    * *LOSLASSEN:* Im gewünschten Moment loslassen, um in Blickrichtung nach vorne katapultiert zu werden.
* **Direktstart:**
  * Großer Primärbutton **SPIELEN** startet ohne Umwege die Runde.

---

## 9. PERMANENTE 24/7 BEREITSTELLUNG & HOSTING

* **Permanenter Live-Link Spiel (24/7 weltweit):** [https://bauerjohannes2-max.github.io/sling-jump/](https://bauerjohannes2-max.github.io/sling-jump/)
* **Permanenter Live-Link Dashboard (24/7 weltweit):** [https://bauerjohannes2-max.github.io/sling-jump/dashboard.html](https://bauerjohannes2-max.github.io/sling-jump/dashboard.html)
* **Hosting:** GitHub Pages Edge CDN mit weltweitem Caching und HTTPS.
* **Offline-Unterstützung:** Service Worker (`sw.js`, Cache `sling-jump-v3.34.0`) cacht alle Kern-Assets für Offline-Spielbarkeit.

---

## 10. SPIELER-IDENTITÄT, PROFIL-SYSTEM & TELEMETRIE-ANALYTICS

### 10.1 Automatische & Bequeme Gamer-Profile (`StorageService.js`)
* **Keine bürokratische Pilot-Terminologie:** Veraltete Pilot- und Gast-Begriffe ("Gast-Pilot", "Pilot-1") wurden vollständig durch coole, moderne Gaming-Tags ersetzt.
* **Algorithmische Namens-Generierung (`generateRandomGamerTag`):**
  * Kombiniert 20 futuristische Präfixe (`Neon`, `Shadow`, `Cyber`, `Nova`, `Vortex`, `Apex`, `Turbo`, `Ghost`, `Pixel`, `Quantum`, `Blaze`, `Frost`, `Cosmic`, etc.) mit 16 markanten Substantiven (`Viper`, `Runner`, `Blade`, `Wolf`, `Hawk`, `Falcon`, `Fox`, `Knight`, `Striker`, `Drifter`, etc.) und einer 2-stelligen Zahl (`10` bis `99`).
  * Beispiele: `NeonViper42`, `ShadowWolf58`, `CyberBlade17`, `NovaStrike99`.
* **Persistente Spieler-ID (`generateUniqueUserId`):**
  * Eindeutiger Identifikator im Format `usr_[timestamp36][random36]` (z. B. `usr_mtmx77qn2tz252`).
  * Bleibt dauerhaft im lokalen Speicher verankert und überlebt Versions-Updates.
* **Nahtlose Migration & Sofortige Registrierung:**
  * Jeder Spieler ist ab dem allerersten Start automatisch registriert (`registered: true`).
  * Bestehende Speicherstände mit Alt-Namen werden beim ersten Laden automatisch auf moderne Gamer-Tags und eindeutige IDs migriert.

### 10.2 Visuelles Feedback für den Login-Status (`index.html`, `style.css`)
* **Header-Profil-Pille (`#btn-menu-profile`):**
  * **Pulsierender Online-Indikator:** Grüner Leuchtpunkt (`.profile-status-dot`, `#10b981`) mit weicher 2.2s Atmungs-Animation (`@keyframes profile-pulse-dot`) signalisiert eindeutig die aktive Session.
  * **Aktiver Name im Header:** Gamer-Tag wird direkt auf dem Navigations-Button im Hauptmenü angezeigt (`.profile-nav-name`).
  * **Responsive Truncation:** Passt sich auf mobilen Bildschirmen automatisch an, ohne das Layout zu sprengen.

### 10.3 Profil-Modal & Strikte 1x Namensänderung (`#profile-modal`, `UIManager.js`, `StorageService.js`)
* **Hero Gamer Tag & ID-Badge:** Großformatige Orbitron-Darstellung und dezente Monospace-Badge (`ID: usr_...`).
* **Entfernung überflüssiger Elemente:**
  * Das redundante "• AKTIV"-Badge wurde restlos entfernt.
  * Der Zufallswürfel-Button (`#btn-profile-random`) wurde entfernt, um das Profil-UI auf das Wesentliche zu reduzieren.
* **1x Namensänderungs-Schutz:**
  * Spieler starten mit einem automatisch generierten Gaming-Tag und können ihren Namen genau einmal anpassen (`nameChanges: 0`).
  * Sobald der Name 1x gespeichert wurde (`nameChanges >= 1`), wird das Textfeld gesperrt (`disabled`), der Speichern-Button ausgeblendet und der Status-Hinweis `NAME FESTGELEGT (1x GEÄNDERT)` eingeblendet.
* **Strikte Zero-Emoji-Garantie:** Nur scharfe SVG-Vektoricons und moderne Typografie.

### 10.4 Telemetrie & Monetarisierungs-Analytics (`AnalyticsService.js`)
* **Automatischer Identitäts-Payload:**
  * Jedes Tracking-Ereignis (`sendEvent`) extrahiert automatisch `userId` und `gamerTag` aus dem Profil.
  * Schema:
  ```json
  {
    "event": "run_completed",
    "version": "v3.35.0",
    "deviceId": "dev_4k9x...",
    "sessionId": "sess_8m2b...",
    "userId": "usr_mtmx77qn2tz252",
    "gamerTag": "NeonViper88",
    "data": { "altitude": 490, "coins": 0, "durationSeconds": 14 },
    "clientTime": "2026-09-04T12:18:49.000Z"
  }
  ```
* **Relevanz für Monetarisierung & Live-Ops:**
  * Präzise Bestimmung von Daily Active Users (DAU) und Monthly Active Users (MAU).
  * Exakte Kohorten- und Retention-Messung pro Spieler ohne Datenschutz-Verstöße.
  * Grundlage für zielgerichtetes Balancing und zukünftige Monetarisierungs-Optimierungen.

### 10.5 Globales Leaderboard mit strikter Highscore-Deduplizierung (`UIManager.js`, `Constants.js`, `StorageService.js`)
* **Reines globales Leaderboard (Global Top 100):**
  * Das Leaderboard konzentriert sich zu 100% auf die weltweite Rangliste ohne ablenkende Reiter oder lokale Tabs.
  * **Genau ein Eintrag pro Spieler (Highscore-Prinzip):** Jeder Spieler erscheint mit maximal einem einzigen Eintrag in der Bestenliste – exakt seiner persönlichen Bestleistung. Mehrfache Flüge desselben Spielers werden automatisch aggregiert, sodass ausschließlich der höchste Rekord gewertet wird.
  * **Minimalistische, kopfzeilenfreie Rangliste:** Keine störenden Spaltenüberschriften (`RANG`, `PILOT`, `METER` entfernt). Die visuelle Anordnung ist durch Kartendesign und Typografie selbsterklärend.
  * **GLOBAL (TOP 100):**
    * Präsentiert die weltweite Rangliste aller einzigartigen Piloten mit bis zu 100 Einträgen.
    * Der eigene Rekord (`highScore`) wird mit dem Spieler-Namen und `(DU)`-Badge dynamisch in die weltweite Liste einsortiert.
    * Sticky Player-Banner berechnet den globalen Rang (z.B. `#1`) und die persönliche Bestleistung.

### 10.6 Authentisches Steuerungs-Tutorial (`index.html`, `UIManager.js`)
* **Minimalistischer Header:** Redundante Subtitel entfernt; die Modal-Kopfzeile trägt einzig den klaren Titel `STEUERUNG`.
* **Einheitliche Typografie:** Alle Erklärungstexte unter dem Canvas sind farblich konsistent im klaren Slate-Weiß (`#e2e8f0`) formatiert.
* **Authentische Live-Gameplay-Simulation (60 FPS Canvas):**
  * Echter leuchtender Haltestrahl (cyanfarbener Laser-Tether `#00f0ff`) verbindet Schiff und Knoten während des Orbits.
  * Vertikales Kamera-Tracking: Beim 90°-Katapultstart scrollt die Welt flüssig nach unten, während das Schiff nach oben beschleunigt.
  * Schwebende Münzen (`+1 COIN`) mit Sammeleffekt und Funkenpartikeln im Flugkorridor.
  * Dynamisches In-Game Mini-HUD mit Live-Höhenanzeige (`ALT: 28M -> 114M`) und `PERFEKT`-Feedback-Badge.

### 10.7 Deaktivierte Fullscreen-API & Reines 100dvh Viewport-Locking (`main.js`, `style.css`)
* **Vollständige Eliminierung von Android-Sicherheitstoasts:**
  * Durch die dauerhafte Deaktivierung des JavaScript-Aufrufs `requestFullscreen()` in Browser-Tabs wird der native Chromium-Sicherheitshinweis (`"<domain> – zum Beenden des Vollbildmodus: von oben ziehen"`) restlos unterbunden.
  * **100dvh Viewport-Lock & Scroll-Stabilisierung:** `body, html` und `#game-container` nutzen `100dvh` und `overscroll-behavior: none`. Eine passive `stabilizeViewport()`-Routine hält die Scroll-Position bei `load`, `orientationchange` und `resize` nahtlos auf `(0, 0)`.
  * **Echtes Vollbild ohne Toasts via PWA-Installation:** Bei Installation auf den Startbildschirm ("Zum Startbildschirm hinzufügen" / PWA) öffnet Android Chrome das Spiel als Standalone-WebAPK automatisch im nativen Vollbildmodus – vollständig ohne Browserleisten und ohne jegliche Sicherheitstoasts.

### 10.8 Globaler Top-Right 'X' Modal Close Standard (`index.html`, `style.css`)
* **Beseitigung aller unteren Schließen-Buttons:** Alle redundanten "SCHLIESSEN"-Buttons am unteren Rand von Modals wurden vollständig durch minimalistische Vektor-Icons (`.modal-close-x`) in der oberen rechten Ecke ersetzt.

### 10.9 Minimalistische währungsfreie UI-Badges (Zero-Background Currency)
* **Reine Vektor-Symbole & Typografie:**
  * Entfernung aller klobigen Pillen-Hintergründe (`background: none`, `border: none`, `padding: 0`).
  * Nur das scharfe Vektor-Icon und die leuchtende Zahl sind sichtbar.

### 10.10 Kristall-Icon im Wiederbeleben-Button & Kuratierte Top-5 Statistiken
* **Game Over Revive-Button:**
  * Das Textwort `"KRISTALL"` wurde komplett durch das minimalistische SVG-Vektor-Icon (`1 <svg class="crystal-icon">`) ersetzt.
  * Kein Überschreiben des Button-Texts mit `"0 KRISTALLE (WERBUNG BALD)"` – der Button bleibt stets bei `"WIEDERBELEBEN"` mit klarem Inaktiv-Zustand und informativer Status-Subline.
* **Kuratierte Top-5 Statistiken:**
  * Überfrachtete 10-Karten-Statistik auf 5 Kern-Metriken reduziert: Persönlicher Rekord (Hero-Karte), Geflogene Distanz, Gespielte Runden, Beste Combo, Gesammelte Coins.

### 10.11 Frühere Schwierigkeits-Progression & Tiefraum-Gefahren
* **Frühe Pendelknoten:** Bereits ab 250m Höhe (Zone 2) treten bewegliche Pendelknoten (15%) auf.
* **Frühe Zeituhr-Knoten:** Bereits ab 750m Höhe (Zone 3) erscheinen Countdown-Knoten (14%).
* **Frühe Weltraum-Minen:** Tödliche Minen spawnen bereits ab 5.000m (vorher erst ab 10.000m).
* **Ultra-seltene Kristalle:** Hyper-Kristalle spawnen erst ab 8.000m Höhe mit stark reduzierter Chance (0.25% statt 1.0%) und 6.000px Mindestabstand.

---

## 11. Standalone Game & Growth Analytics Suite (`dashboard/`)

### 11.1 Entkoppelte Multi-App-Architektur
* **Vollständige Trennung von Spiel und Analyse:**
  * Das Dashboard ist eine vollständig autark lauffähige Single-Page-Application in `dashboard/`, die über eine eigene PWA-Konfiguration (`dashboard/manifest.json`), ein modulares SaaS-Design (`dashboard/css/dashboard.css`) und entkoppelte Kontrollskripte verfügt.
  * **Zero-Coupling Multi-Agent Hygiene:** Keine Code-Abhängigkeit zur Spiel-Physik, Engine-Loops oder den UI-Managern des Hauptspiels. Das Spiel sendet lediglich passive JSON-Telemetrie via HTTP POST (`/api/telemetry`).
  * **Dedizierter Backend-Server (`dashboard/server.js`):** Unabhängiger Node.js Server auf Port 3001 (`npm run serve:dashboard`) mit REST-Routen (`/api/analytics/summary`, `/api/analytics/events`, etc.).

### 11.2 Sechs Analytische Dimensionen
1. **Übersicht (Executive Dashboard):**
   * Live-Puls (aktive Sitzungen in den letzten 45s).
   * Aggregierte Kennzahlen: Unique Geräte, Tagesrunden, Allzeit-Rekordhöhe, kumulierte Münzen.
   * 7-Tage-Aktivitätsverlauf über responsive SVG-Flächengraphen.
2. **Marketing & Vertrieb (Acquisition & Virality):**
   * **UTM-Attribution:** Erfassung und Aggregation von Kampagnen (`utm_source`: TikTok, Reddit, Discord, Twitter, QR-Flyer, Poki, Itch.io).
   * **Multi-Step Conversion Funnel:** `Impression / Web-Aufruf` &rarr; `Spielstart` &rarr; `1. Slingshot-Sprung` &rarr; `PWA-Installation` &rarr; `D1-Retention`.
   * **Virality K-Faktor:** Tracking von Score-Shares (WhatsApp, Link-Kopien) zur Bestimmung organischen Wachstums.
3. **Gameplay-Balancing & Churn-Heatmap:**
   * **Höhenzonen-Dropoff-Analyse:** Exakte Häufigkeitsverteilung von Piloten-Abstürzen über alle 7 Höhenzonen (0–500m Kalibrierung bis 15.000m+ Meister-Kosmos).
   * **Schiff-Performance-Matrix:** Pick-Rate, mittlere Überlebenshöhe und Münz-Ausbeute pro Raumschiff.
   * **Todesursachen-Taxonomie:** Missglücktes Einrasten (Void-Fall), Zeituhr-Timeout (Fragile Node), Raumminen-Kollision, Pendelhindernis.
4. **Virtuelle Ökonomie & Upgrades:**
   * **Faucet vs. Sink Gleichgewicht:** Vergleich von erwirtschafteten Münzen (Sterne, Quests) zu ausgegebenen Münzen (Hangar-Käufe, Wiederbelebungen).
   * **Freischaltungs-Progressionskurve:** Prozentualer Schiffs-Besitz über die Gesamt-Spielerbasis.
5. **System-Gesundheit & Hardware-Diagnostik:**
   * Plattform- und Betriebssystem-Breakdown (iOS, Android, Windows, macOS).
   * Mittlere Bildrate (FPS) über alle Hardware-Klassen.
   * Adoptionsrate des Leistungs-Modus (Performance-Mode) zur Batterieschonung.
   * Fehlerprotokollierung für clientseitige JavaScript-Fehler (0 kritische Fehler garantiert).
6. **Live Event-Explorer & BI-Datenexport:**
   * Filterbarer Echtzeit-Eventstream aller Ereignisse (`session_start`, `run_completed`, `share_score`, `pwa_install`).
   * 1-Klick-Export als CSV für Tabellenkalkulationen (Excel, Google Sheets, Python).
   * Vollständiger JSON-Datensatz-Dump und Clipboard-Kopierer.

### 11.3 Synthetischer Benchmark-Generator & SVG-Visualisierungen
* **520+ Benchmark-Sitzungen (`mock-data.js`):**
  * Statistisch kalibrierter Datensatz erlaubt sofortige visuelle Inspektion aller Trichter und Heatmaps auch ohne Server-Verbindung oder im Offline-Modus.
  * Umschaltbar über die Schaltfläche `[ WECHSELN ]` in der Kopfleiste.
* **Reine SVG-Visualisierungs-Engine (`charts.js`):**
  * Null externe Abhängigkeiten (Zero-Dependency), keine schweren Drittanbieter-Bibliotheken, gestochen scharfe Vektoren, barrierefreie Skalierbarkeit.

---

## 12. AUDIO-ENGINE & PROZEDURALES SOUNDSYSTEM (GOOGLE LYRIA INTEGRATION)

### 12.1 Zweistufige Audio-Architektur (`AudioManager.js`)
* **Stufe 1 – Hochauflösende Asset-Puffer (`assets/audio/`):**
  * Asynchrones Preloading via `fetch` & `decodeAudioData`.
  * Dynamisches 1.5s Exponential-Crossfading zwischen Musiktiteln (`bgm_menu`, `bgm_gameplay`, `bgm_gameover`).
  * **Bullet-Time Dynamic Low-Pass Ducking:** Biquad-Tiefpassfilter senkt die Grenzfrequenz bei Zeitlupe auf 650 Hz ab und öffnet sie beim Katapultstart blitzartig auf 20.000 Hz.
  * **Core Combo Pitch Ramp:** Aufeinanderfolgende Energiekerne innerhalb von 1.4s steigern die Tonhöhe um `+1 Halbton` pro Kern (bis zu 8x Multiplikator).
* **Stufe 2 – Prozeduraler Web Audio Synthesizer (Zero-Asset Failsafe):**
  * Fällt bei fehlenden Dateien, langsamen Verbindungen oder Offline-Nutzung nahtlos auf reine Oszillatoren zurück (`playProceduralAmbient` / `playProceduralSfx`).
  * Mehrstimmige warme analoge Akkorde (Grundton, Quinte, Oktave) mit subtilem LFO-Filter-Sweep für cineastischen Synthwave-Klang ohne Ladezeiten.

### 12.2 Google Lyria 3.5 & MusicFX Integrations-Pipeline
* Vollständiges Prompt-Handbuch in [`AUDIO_GUIDE.md`](file:///c:/Users/hannes.bauer/Documents/antigravity/blissful-euclid/AUDIO_GUIDE.md).
* Menü-Theme: 95 BPM Ambient Synthwave (A-Moll).
* Gameplay-Theme: 128 BPM Energetischer Driving Synthwave mit druckvollem Basslauf (D-Moll).
* Game-Over: 80 BPM Tragischer cineastischer Ausklang mit tiefem Raum-Hall.
* 7 Soundeffekte für Grapple-Lock, Slingshot-Boost, Kern-Pickup, Sternen-Shatter, Near-Miss, Crash und UI-Click.

### 12.3 Benutzeroberfläche & Autoplay-Schutz
* Interaktiver `[ AN ]` / `[ AUS ]` Umschalter im Einstellungs-Menü (`#btn-audio-toggle`).
* Benutzergesten-Freischaltung: Sanftes Entsperren des `AudioContext` bei erstem Klick/Touch (`pointerdown`, `keydown`).

---

## 13. AUTOMATISIERTER REAL-TIME GAMEPLAY FPS BENCHMARK (`npm run test:fps`)

### 13.1 Benchmark-Architektur (`scripts/benchmark_fps.js`)
* **Warmup-Phase (1.5 Sekunden):** Stabilisierung von State-Transitions, Audio-Context und Initialisierung vor Messbeginn.
* **Autopilot-Flug (8.0 Sekunden):** Deterministische Simulation aktiver Gameplay-Schleifen (Slingshots, Partikel-Spawns, Münzkollisionen).
* **Telemetrie-Invariante:** Stoppt Messung vor Screenshot-I/O, um Messwerte nicht durch Festplattenzugriffe zu verfälschen.
* **Metriken & Grenzwerte:**
  * Durchschnittliche Bildrate: `>= 55.0 FPS` (Soll: 60/120 FPS).
  * JavaScript-Frame-Budget: `<= 5.0 ms` Durchschnitt (bei 16.6ms Maximalbudget).
  * Hitches `> 50 ms`: `0` (Zero Toleranz).
  * Konsolenfehler: `0`.
