# SLING JUMP - VOLLSTÄNDIGES SYSTEM- & SPIEL-HANDBUCH (INTERNE REFERENZ)

Dokumentationsstand: Version 3.31.1  
Aktualisiert am: 04. September 2026  
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

## 5. SYSTEM-PERFORMANZ & INHÄRENTE HARDWARE-EFFIZIENZ

* **Standardmäßig hochperformant ohne manuelle Schalter:**
  * Der manuelle Schalter "Performance-Modus" wurde aus den Einstellungen entfernt, um dem Spieler unnötige Entscheidungen abzunehmen.
  * Das Spiel läuft standardmäßig hochoptimiert:
  * **Optimierter Ringpuffer:** Maximal 400 Partikel im Pool verhindern Memory-Spikes und Objektallokationen während des Flugs.
  * **Hardware-effiziente GPU-Rasterung:** Reduzierter `shadowBlur`-Overhead auf Partikeln garantiert stabile 60/120 FPS auch auf mobilen Mittelklasse-Smartphones und spart Akku.

---

## 6. WIEDERBELEBUNGS-SYSTEM (QUANTUM REVIVE) & HYPER-KRISTALLE

* **Zentrierte Kamera-Positionierung & Sichtbarkeits-Garantie:**
  * **Checkpoint-Ermittlung (`triggerGameOver`):** Beim Absturz sucht die Engine im aktiven Sichtfeld gezielt nach intakten Standard-Knoten im mittleren 25%–75% Bereich (`midScreenY = this.cameraY + this.height * 0.50`).
  * **Kamera-Neuausrichtung (`revivePlayer`):** Beim Wiederbeleben wird `this.cameraY = targetAnchor.y - this.height * 0.50` gesetzt. Dadurch befindet sich der Anker mathematisch garantiert exakt bei 50% der Bildschirmhöhe (`screenY = this.height * 0.50`), meilenweit entfernt von der unteren Todeslinie (`DEATH_BUFFER_PX = 4px`).
  * **Direktes, unfehlbares Einhaken:** Die Wiederbelebung hängt nicht von dynamischen Fangradien oder `tryHook`-Prüfungen ab. Das Raumschiff wird sofort und verlässlich im Orbit arretiert (`isHooked = true`, `hookedNode = targetAnchor`, `orbitRadius = 65`, `orbitSpeed = 520 px/s`, `vx = 0`, `vy = 0`).
  * **Physik-Freeze während der Absturzsequenz:** Sobald `isDying = true` gesetzt wird, sind Positionsupdates des Schiffs und der Kamera während des 700ms Hitstop-Schadensablaufs eingefroren. Dies verhindert, dass das zerstörte Schiff hunderte Pixel tief in den unsichtbaren Abgrund stürzt.
  * **Garantierter Folge-Pfad:** Die Engine prüft, ob oberhalb des Respawn-Knotens im Bereich `[targetAnchor.y + 110, targetAnchor.y + 240]` ein sicherer Sprungknoten existiert. Ist dies nicht der Fall, wird automatisch ein solider `STANDARD`-Knoten erzeugt, um dem Piloten eine faire, klare Sprungbahn zu gewährleisten.
  * **Schweif- & Gefahren-Reset:** Frühere Absturz-Schweife werden gelöscht (`trailHistory = []`) und Gefahren-Ränder zurückgesetzt (`setDangerVisual(0)`).
* **4,0 Sekunden Quanten-Schutzschild:**
  * Schützt vor sofortigen Kollisionen nach der Wiederbelebung. Dargestellt durch rotierende, hexagonale Vektor-Energiefacetten in pulsierendem Magenta (`#d946ef`).
* **Kosten:** 1 Hyper-Kristall (1x pro Run nutzbar).

---

## 7. MENÜ-STRUKTUR, MODALS & MINIMALISTISCHES DESIGN-SYSTEM

* **Globale Design-Regel: Kommerzieller Minimalismus ("Weniger ist mehr"):**
  * Keine überladenen Texte, keine bürokratischen Bezeichnungen, kein visueller Ballast.
* **Fokussiertes Login- & Profil-Modal (`#profile-modal`):**
  * Rein auf Spieleridentität und Login fokussiert: Avatar, Namenseingabefeld, `SPEICHERN` und `SCHLIESSEN`.
  * Sämtliche redundanten Highscore- und Flugzähler wurden entfernt (diese verbleiben in der Bestenliste und den Statistiken).
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
  * Versionierte Link-Parameter (`?v=3.31.0`) durchbrechen Browser-Cache-Tunneling.
  * Multi-Plattform-Icons: `assets/icon-512.png`, `assets/icon-192.png`, `assets/favicon.png` und `assets/icon.svg`.
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
* **Offline-Unterstützung:** Service Worker (`sw.js`, Cache `sling-jump-v3.30.0`) cacht alle Kern-Assets für Offline-Spielbarkeit.
