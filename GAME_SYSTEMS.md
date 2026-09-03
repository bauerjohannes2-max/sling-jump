# SLING JUMP - VOLLSTÄNDIGES SYSTEM- & SPIEL-HANDBUCH (INTERNE REFERENZ)

Dokumentationsstand: Version 3.14.0  
Aktualisiert am: 03. September 2026  
Status: Produktion & QA-verifiziert  

---

## 1. SPIELKONZEPT & KERN-LOOP

* **Genre:** Physikalischer Endless Orbital Catapult Climber (Arcade / Skill-basiert).
* **Ziel:** Mit einem Raumschiff durch gezieltes Einhaken an Himmelsknoten immer höher in den Weltraum zu klettern und dem aufsteigenden roten Gravitations-Abgrund zu entkommen.
* **Währung:** Münzen (Goldene Partikel in Form von Vektor-Icons; Bezeichnung in Code: `cores` / Orbs).
* **Score-Philosophie:** Die erreichte Höhe in Metern (`m`) ist der alleinige Hauptwert (Hero Score). Keine künstlichen Multiplikationsformeln mehr.

---

## 2. STEUERUNG & PHYSIK-MECHANIKEN

### 2.1 Einhaken (Grapple Hook)
* **Aktion:** Bildschirm / Maustaste gedrückt halten (Touch / Pointerdown / Leertaste).
* **Funktionsweise:**
  * Das Schiff feuert ein Ionen-Seil zum nächsten Himmelsknoten in Reichweite (`HOOK_RANGE = 180px`).
  * Beim Kontakt wechselt das Schiff sofort in den kreisförmigen Orbit um den Knoten.
  * Lineare Geschwindigkeiten werden beim Einhaken sofort auf null gesetzt (`vx = 0, vy = 0`), sodass Sterne im Hintergrund sofort punktförmig bleiben.
* **Orbit-Dynamik:**
  * Radius: 55px bis 110px je nach Treffpunkt.
  * Rotationsrichtung: Automatisch tangential basierend auf dem Eintrittswinkel.
  * Slow-Motion: Bei jedem aktiven Einhaken wird die Zeit kurz subtil verlangsamt (`timeScale = 0.55`), um präzises Timing zu ermöglichen.

### 2.2 Loslassen & Katapult-Abschuss (Slingshot Release)
* **Aktion:** Loslassen des Bildschirms / Taste.
* **Funktionsweise:**
  * Das Seil wird gekappt. Das Schiff übernimmt die tangentiale Fliehkraft als lineare Geschwindigkeit (`vx`, `vy`).
  * Normaler Sprung: Gewährt einen Basis-Aufwärtsschub (`+80 vy`), sofern die Tangente nach oben zeigt.

---

## 3. COMBO-SYSTEM: 90-GRAD STEILSPRÜNGE (x1 BIS x10)

Das Combo-System belohnt hochpräzises Timing:
* **Steilsprung-Bedingung:**
  * Die vertikale Tangente beim Loslassen muss nahezu perfekt senkrecht nach oben zeigen (`tangentY >= 0.86`, 90°-Aufwärtsschwung).
* **Progressiver Extra-Boost:**
  * Jeder aufeinanderfolgende 90°-Steilsprung erhöht den Combo-Zähler um +1 bis maximal **x10**.
  * Formel für Zusatzschub: `launchBonus = 45 + comboLevel * 20` (z.B. +65 bei x1 bis zu +245 bei x10).
* **Visuelles & Akustisches Feedback:**
  * Aufsteigender Floating Text: `PERFEKT 90°!` (x1), `PERFEKT x2!`, bis `MAX COMBO x10!`.
  * Dynamische Farbfolge der Combo-Texte: Hellblau (`#38bdf8`), Indigo (`#818cf8`), Violett (`#a855f7`), Gold (`#fbbf24`), Orange (`#f97316`), Neon-Pink (`#ec4899`), Cyan (`#06b6d4`).
  * Hitstop & dezenter Screenshake erst ab Combo x4+ (unter x4: 0 Screenshake für butterweiches Gleiten).
* **Combo-Reset:**
  * Ein Sprung mit ungenauem Winkel (`tangentY < 0.86`) setzt den Combo-Zähler sofort auf null zurück.

---

## 4. KNOTEN-TYPEN & STUFENWEISE EINFÜHRUNG (DOODLE JUMP PACING)

Knoten werden gestreckt nach der bewährten Arcade-Progressionskurve eingeführt:

| Höhen-Zone | Höhenbereich | Neu eingeführter Knoten-Typ | Eigenschaften & Verhalten |
| :--- | :--- | :--- | :--- |
| **Zone 1: Start & Kalibrierung** | 0m – 500m | **STANDARD (Cyan)** | 100% stabile Anker. Solide Kreisgeometrie mit sanft pulsierendem Kern. Erlernen der Flugkurven. |
| **Zone 2: Katapult-Moment** | 500m – 1.500m | **SUPER-BOOST (Grün)** | Seltener grüner Knoten (~5%) mit **Aufwärtspfeil**. Wie das Trampolin in Doodle Jump: Verdoppelt Katapultschub (`1.85x`) und erzeugt Hyperspeed-Warpstreifen. |
| **Zone 3: Dynamischer Orbit** | 1.500m – 3.500m | **BEWEGLICH (Lila Pendel)** | Schwingt horizontal von links nach rechts (`moveRange = 70–120px`, ~16%). Wie die blauen Plattformen: Erfordert bewegliches Timing. |
| **Zone 4: Stratosphären-Timer** | 3.500m – 6.500m | **FRAGIL (Rote Zeituhr)** | Besitzt radiale Ziffernblatt-Markierungen (~12%). Nach Einhaken tickt die Uhr ab (2.5s). Bricht mit Knacken ab! |
| **Zone 5: Fallen & Täuschung** | 6.500m – 10.000m | **BRÜCHIG / DECOY (Orange Fälschung)** | **Rissiger Knoten (~7%):** Besitzt Bruchlinien. **Bricht beim Einhaken sofort in Scherben!** Gewährt null Halt und muss übersprungen werden. |
| **Zone 6: Meister-Kosmos** | 10.000m+ | **HARDCORE MIX** | Anspruchsvolle Dichte, engere Radien und schnellere Pendel für globale Bestenlisten. |

---

## 5. DESIGN-SYSTEM & FARBPALETTE

* **Strict Zero Emoji Policy:**
  * Unter keinen Umständen Emojis in UI, Buttons, HUD, Canvas, Toasts oder Dokumentation.
  * Verwendung ausschließlich von minimalistischen SVG-Vektoricons und Canvas-Vektoren.
* **Farben:**
  * Hintergrund Tiefschwarz/Marine: `#030712`, `#0a0f1d`, `#0f172a`
  * Primäre Akzentfarbe (Technologie/Flug): Cyan `#38bdf8` / `#00f0ff`
  * Währung & Rekorde: Gold `#fbbf24` / `#f59e0b`
  * Gefahren & Absturz: Rot `#ef4444` / `#f43f5e`
  * Turbo-Boost & Erfolg: Smaragdgrün `#10b981`
  * Typografie: `Montserrat`, `system-ui`, `sans-serif`

---

## 6. MENÜ-STRUKTUR & BUTTON-LAYOUT

### 6.1 Hauptmenü (`#menu-overlay`)
* **Obere Navigationsleiste:**
  * **Oben Links:** Button `#btn-menu-quests` (Ausschließlich SVG-Icon: Klemmbrett/Aufgaben, mit grünem Benachrichtigungspunkt `#menu-quests-badge` bei abholbereiten Aufgaben).
  * **Oben Rechts:**
    * Button `#btn-menu-leaderboard` (Ausschließlich SVG-Icon: Podium/Trophäe).
    * Button `#btn-menu-settings` (Ausschließlich SVG-Icon: Zahnrad).
* **Zentrum:**
  * Titel: `SLING JUMP` (46px, 900 Gewicht)
  * Untertitel: `SPRINGE VON STERN ZU STERN`
  * Versions-Badge: `v3.14.0`
  * Währungsanzeige: Goldenes SVG-Münzicon + Betrag (kein Text "COINS")
  * Vertikaler Button-Stapel:
    * `SPIEL STARTEN` (`#btn-menu-play`)
    * `TUTORIAL` (`#btn-menu-tutorial`)
    * `SKINS` (`#btn-menu-shop`)
    * `STATISTIKEN` (`#btn-menu-stats`)

### 6.2 Modals (Vollständig entkoppelt, ohne Reiter)
* **Aufgaben-Modal (`#quests-modal`):**
  * Tägliche Aufgaben (mit Countdown-Timer).
  * Wöchentliche Herausforderungen (mit 7-Tage-Timer).
  * Direkter Claim-Button (`EINSAMMELN (+X [Münz-SVG])`).
  * Schließen-Button `#btn-quests-close`.
* **Bestenlisten-Modal (`#leaderboard-modal`):**
  * Weltweite Top-Rangliste mit Zeitstempeln und Schiffen.
  * Persönliche Rang-Karte (`#player-rank-card`) mit Perzentil-Berechnung ("TOP X% DER WELT").
  * Schließen-Button `#btn-leaderboard-close`.
* **Statistiken-Modal (`#stats-modal`):**
  * 8 Kacheln: Geflogene Distanz, Runden, Durchschnittshöhe, Münzen, Slingshots, Knappe Rettungen, Eingelöste Quests, Beste Combo.
  * Schließen-Button `#btn-stats-close`.
* **Game-Over-Modal (`#gameover-modal`):**
  * Absturz-Titel in Rot.
  * **Hero Score:** Große Höhenanzeige (`482 m`, 58px, Cyan).
  * **Sub-Rekord:** `BESTLEISTUNG 620 m`.
  * **Münzen:** Goldenes SVG-Münzicon + Anzahl gesammelter Münzen (`+12`).
  * Skin-Freischaltungsbanner (`#gameover-upgrade-banner`) bei ausreichend Münzen mit Direktsprung zum Hangar.
  * Buttons: `NOCHMAL SPIELEN`, `SKINS`, `HAUPTMENÜ`.

---

## 7. TUTORIAL-SYSTEM (2-FOLIEN BUTTON-TUTORIAL)

Das Tutorial ist ein übersichtliches, modales Overlay (`#tutorial-modal`), das jederzeit über den Button "TUTORIAL" im Hauptmenü oder in den Einstellungen aufgerufen werden kann:
* **Folie 1: Grundsteuerung & Schwung:**
  * Vektor-Illustration: Zielkreis, Halteseil, Raumschiff und katapultartige Aufwärts-Flugbahn.
  * Erklärung:
    * **Gedrückt halten:** Berühre den Bildschirm (oder Leertaste / Klick), um dich an einen nahen Kreis einzuhaken und Schwung aufzubauen.
    * **Loslassen:** Lass im richtigen Moment los, um mit dem aufgebauten Schwung in Flugrichtung nach oben geschleudert zu werden!
  * Navigation: `WEITER` (zu Folie 2) und `SCHLIESSEN`.
* **Folie 2: Himmelskörper (Teaser ohne Spoiler):**
  * Vektor-Illustration: Geheimnisvolle Reihe von 5 Kreis-Silhouetten (Standard, Boost, Pendel, Timer, Bruch).
  * Teaser-Text:
    * Im Weltraum erwarten dich verschiedene Arten von Kreisen – je höher du fliegst, desto mehr neue Himmelskörper wirst du entdecken!
    * Jeder Typ verhält sich anders: Einige verleihen ungeahnten Schub, andere fordern dein Timing heraus oder bergen Überraschungen... Finde selbst heraus, was sie tun!
  * Navigation: `ZURÜCK` (zu Folie 1) und `SPIEL STARTEN` (startet sofort den Run).
* **Entkopplung vom Gameplay:**
  * Das reguläre Spiel wird nicht mit Popups oder HUD-Bannern unterbrochen, sondern läuft als purer, ungestörter Arcade-Run.

---

## 8. HANGAR / SKINS-KATALOG

### 8.1 Raumschiffe (`CONSTANTS.SHIPS`)
1. **PFEIL (Dart):** Start-Schiff (Kostenlos). Standard-Geometrie.
2. **FALKE (Falcon):** Schneller Abfangjäger (75 Münzen).
3. **PHÖNIX (Phoenix):** Zwillings-Flügler mit Hitzeschild (150 Münzen).
4. **TITAN (Titan):** Schwerer Panzerkreuzer (250 Münzen).
5. **AURORA (Aurora):** Experimenteller Hyperantrieb (400 Münzen).

### 8.2 Schweife (`CONSTANTS.TRAILS`)
1. **NEON CYAN:** Klassischer Ionenschweif (Kostenlos).
2. **SOLAR FLAMME:** Feuriger Plasma-Austritt (50 Münzen).
3. **KOSMISCHES LILA:** Dunkelmaterie-Spur (100 Münzen).
4. **GOLDENE SPUR:** Luxus-Partikelregen (200 Münzen).
5. **REGENBOGEN:** Spektrale Regenbogen-Emission (350 Münzen).

---

## 9. AUDIO-STATUS & SETTINGS

* **Audio-Status:** Standardmäßig auf **DEAKTIVIERT** gesetzt (wie vom Nutzer gewünscht).
* **Sound-Architektur:** Web Audio API mit prozeduraler Synthese (`AudioManager.js`), bereit zur Reaktivierung ohne externe Asset-Abhängigkeiten.
* **Optionen:**
  * Bildschirm-Wackeln: 100% / 50% / AUS.
  * Performance-Modus: AN / AUS (reduziert Partikeldichte bei schwächeren Geräten).
  * Spielstand zurücksetzen: Mit doppelter Sicherheitsabfrage (`#confirm-modal`).
