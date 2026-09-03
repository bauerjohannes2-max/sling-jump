# SLING JUMP - VOLLSTÄNDIGES SYSTEM- & SPIEL-HANDBUCH (INTERNE REFERENZ)

Dokumentationsstand: Version 3.29.0  
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

## 3. COMBO-SYSTEM & DYNAMISCHE GESCHWINDIGKEITS-SKALIERUNG

* **Steilsprung-Bedingung (90°-Präzisionswinkel):**
  * Der Abschusswinkel muss vertikal nach oben gerichtet sein (`tangentY >= 0.980`, innerhalb von ca. 11,4° Toleranzfenster zur idealen Senkrechten).
* **Direkte ökonomische Belohnung:**
  * Jeder erfolgreiche 90°-Katapultwurf schüttet unmittelbar **Bonus-Gold** auf das Spielerkonto aus:
  * Formel: `Bonus-Gold = Combo-Level` (z.B. +1 Münze bei Stufe 1 bis +10 Münzen bei Stufe 10).
  * Sofortige Score-Gutschrift: `Bonus-Punkte = 100 * Combo-Level`.
* **Balancierte Geschwindigkeits-Skalierung (Progressive Hyperspeed-Matrix):**
  * Je länger eine Kette perfekter 90°-Sprünge aufrechterhalten wird, desto höher steigt die Fluggeschwindigkeit des Schiffs:

| Combo-Stufe | HUD-Kennzeichnung | Tempo-Multiplikator | Min Orbit-Speed | Max Orbit-Speed | Vertikaler Zusatz-Impuls | Aerodynamischer Auftrieb (Drag-Reduktion) | Sofort-Belohnung |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **0** | Basisflug | **1.00x** | 720 px/s | 1.250 px/s | +0 px/s | 100% Gravitation | 0 |
| **1** | PERFEKT 90° (+10% TEMPO) | **1.10x** | 792 px/s | 1.375 px/s | +120 px/s | 96.5% Gravitation | +1 Gold / +100 Pkt |
| **2** | COMBO x2 (+18% TEMPO) | **1.18x** | 850 px/s | 1.475 px/s | +160 px/s | 93.0% Gravitation | +2 Gold / +200 Pkt |
| **3** | COMBO x3 (+26% TEMPO) | **1.26x** | 907 px/s | 1.575 px/s | +200 px/s | 89.5% Gravitation | +3 Gold / +300 Pkt |
| **4** | COMBO x4 (+34% TEMPO) | **1.34x** | 965 px/s | 1.675 px/s | +240 px/s | 86.0% Gravitation | +4 Gold / +400 Pkt |
| **5** | HYPER x5 (+42% TEMPO) | **1.42x** | 1.022 px/s | 1.775 px/s | +280 px/s | 82.5% Gravitation | +5 Gold / +500 Pkt |
| **6** | HYPER x6 (+48% TEMPO) | **1.48x** | 1.065 px/s | 1.850 px/s | +320 px/s | 79.0% Gravitation | +6 Gold / +600 Pkt |
| **7** | HYPER x7 (+54% TEMPO) | **1.54x** | 1.108 px/s | 1.925 px/s | +360 px/s | 75.5% Gravitation | +7 Gold / +700 Pkt |
| **8** | HYPER x8 (+60% TEMPO) | **1.60x** | 1.152 px/s | 2.000 px/s | +400 px/s | 72.0% Gravitation | +8 Gold / +800 Pkt |
| **9** | HYPER x9 (+65% TEMPO) | **1.65x** | 1.188 px/s | 2.062 px/s | +440 px/s | 70.0% Gravitation | +9 Gold / +900 Pkt |
| **10** | MAX COMBO x10 (+70% TEMPO) | **1.70x** | 1.224 px/s | 2.125 px/s | +480 px/s | 70.0% Gravitation (Cap) | +10 Gold / +1.000 Pkt |

* **Balance-Garantie:**
  * Durch den automatischen Slow-Mo-Faktor (`SLOWMO_FACTOR = 0.40`) beim Einhaken bleibt der Orbit selbst bei 1.70x Maximal-Tempo jederzeit zu 100% kontrollierbar und reaktiv.
  * Bei verfehltem 90°-Winkel wird die Combo auf 0 zurückgesetzt und das Tempo geht sanft in die Basisgeschwindigkeit über (kein ruckartiges Bremsen).
* **Akustische Chimes:**
  * Dual-Oszillator mit chromatisch aufsteigendem Oberton (+2 Halbtöne pro Stufe von C5 bis C7).
* **Visuelle High-Speed Effekte:**
  * Schockwellenring am Katapult-Knoten (`spawnShockwave`).
  * Hypersonische Warpgeschwindigkeits-Streifen (`spawnSpeedStreaks`) bei Combo ab Stufe 2.

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

## 5. PERFORMANCE-MODUS & HARDWARE-ARCHITEKTUR

Für schwächere Smartphones, Laptops und zur Akkuschonung implementiert:
* **Partikel-Halbierung:** Ringpuffer auf 300 Partikel limitiert (50% CPU-Einsparung).
* **GPU `shadowBlur` Hardware-Bypass:** `context.shadowBlur = 0` eliminiert teure Gauß-Rasterungsdurchläufe auf mobilen GPUs.
* **Echtzeit-Schaltung:** Sofortige Wirkung ohne Neuladen via Einstellungen (`#btn-setting-perf`).

---

## 6. WIEDERBELEBUNGS-SYSTEM (QUANTUM REVIVE) & HYPER-KRISTALLE

* **Verlustfreies Wiederaufsetzen auf Absturzhöhe:**
  * Beim Absturz sichert die Engine einen genauen Checkpoint (`reviveCheckpoint`) mit der exakten erreichten Höhe (`maxAltitudeMeters`), Kamera-Position (`cameraY`) und dem nächsten sicheren Himmelsknoten.
  * Nach Klick auf `WIEDERBELEBEN` im Game-Over-Screen startet der Spieler exakt auf seiner erreichten Höhe im Orbit neu.
* **4,0 Sekunden Quanten-Schutzschild:**
  * Schützt vor sofortigen Kollisionen nach der Wiederbelebung.
* **Kosten:** 1 Hyper-Kristall (später erweiterbar um Video-Ads).

---

## 7. MENÜ-STRUKTUR, MODALS & MINIMALISTISCHES DESIGN-SYSTEM

* **Globale Design-Regel: Kommerzieller Minimalismus ("Weniger ist mehr"):**
  * Keine überladenen Texte, keine bürokratischen Bezeichnungen, kein visueller Ballast.
* **Schlankes Profil-Modal (`#profile-modal`):**
  * Schlicht als **"PROFIL"** betitelt (keine umständlichen "Piloten-Lizenzen").
  * Glowing Vektor-Avatar, direktes Namensfeld mit `SPEICHERN`, zwei markante Kern-Kacheln: **REKORD** und **FLÜGE**.
* **Minimalistisches Aufgaben-Modal (`#quests-modal`):**
  * Kompakte Aufgabenkarten ohne redundante Beschreibungstexte.
  * Fortschrittszahlen (`12.450 / 150.000 m`) direkt in den Progressbar integriert.
  * Klare, reduzierte Header: `TÄGLICH` und `WÖCHENTLICH` mit Restzeit-Badge.
* **Eigenständige Dashboard-Begleit-App (`dashboard.html`):**
  * Entwickelt als vollwertige PWA (`manifest-dashboard.json`) mit mobilem Standalone-Modus.
  * Bietet die vollständige Telemetrie-Übersicht (Live-Spieler, Unique Devices, Runden heute, Rekorde, Runden-Historie).
  * Prominenter, neonblau leuchtender Button **"SPIELEN"** führt jederzeit direkt ins Spiel.
  * Wird aus den Spieleinstellungen im separaten Fenster geöffnet (`target="_blank"`).
* **AAA App-Icon & Branding:**
  * Nach Mobile-Bestseller-Standards (Subway Surfers, Alto, Smash Hit) konzipiert:
  * Fokussierter Hero-Fokus: Diagonales Neon-Raumschiff mit glühendem Ionenantrieb und goldenem Lichtschweif um einen galaktischen Gravitationsknoten.
  * Multi-Plattform-Export: `assets/icon-512.png`, `assets/icon-192.png`, `assets/favicon.png` und `assets/icon.svg`.
* **Strict Zero Emoji Policy:**
  * Ausschließlich minimalistische SVG-Vektoricons und Canvas-Geometrie.

---

## 8. INTERAKTIVES TUTORIAL-SYSTEM

* **Folie 1: Steuerung & Katapultflug (Physik-Akkurat):**
  * Dynamische Canvas-Simulation (`#tut-sling-canvas`) mit responsivem `aspect-ratio: 360 / 160`.
  * **Physikalische Katapult-Präzision:** Das Raumschiff schwingt im Uhrzeigersinn/Gegen-Uhrzeigersinn durch den Orbit und löst sich exakt im 90°-Winkel (Osten: `nodeX + orbitRadius, nodeY`), wo die Flugbahntangente exakt nach Norden (senkrecht nach oben) zeigt.
  * Die Katapultbeschleunigung schießt das Schiff geradlinig nach Norden in den Kosmos.
  * Vollständig tetherless ohne Haltestrahl-Leine; veranschaulicht das reine Gravitationsfeld.
* **Folie 2: Himmelskörper (Vollständige Echtzeit-Vorschau):**
  * Rendert alle 6 echten Spiel-Entitäten über deren originale `OrbitNode.draw()`-Pipeline nebeneinander auf `#tut-circles-canvas` (`aspect-ratio: 360 / 100`):
    * `STANDARD` (Cyan), `BOOST` (Grün), `BEWEGLICH` (Violett), `ZEITUHR` (Gold), `KÖDER` (Orange), `BOMBE` (Crimson-Rot).
  * Durch responsive CSS-`aspect-ratio`-Bindung bleiben alle Kreise auf jedem Bildschirm absolut kreisrund und verzerrungsfrei.

---

## 9. PERMANENTE 24/7 BEREITSTELLUNG & HOSTING

* **Permanenter Live-Link (24/7 weltweit):** [https://bauerjohannes2-max.github.io/sling-jump/](https://bauerjohannes2-max.github.io/sling-jump/)
* **Hosting:** GitHub Pages Edge CDN mit weltweitem Caching und HTTPS.
* **Offline-Unterstützung:** Service Worker (`sw.js`) cacht alle Kern-Assets für Offline-Spielbarkeit.
