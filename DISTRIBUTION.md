# Sling Jump - Vertriebs-, Live-Hosting- & Monetarisierungs-Dokumentation

> **Status:** Release Candidate (RC21 - v3.21.0)  
> **Offizieller 24/7 Live-Link:** [`https://bauerjohannes2-max.github.io/sling-jump/`](https://bauerjohannes2-max.github.io/sling-jump/)  
> **Repository:** [`https://github.com/bauerjohannes2-max/sling-jump`](https://github.com/bauerjohannes2-max/sling-jump)  
> **Hosting-Typ:** Microsoft/GitHub Global Edge CDN (100% kostenfrei, SSL/HTTPS, 99.99% Uptime)  
> **Letzte Aktualisierung:** 03.09.2026

---

## 1. Offizieller Live-Link für Freunde & Familie (24/7 Online)

### **Der permanente Link:**
```
https://bauerjohannes2-max.github.io/sling-jump/
```

### **Warum funktioniert dieser Link immer (im Gegensatz zu früheren Tunneln)?**
* **Früheres Problem (Cloudflare Quick Tunnel / localtunnel):**
  * Frühere Links wie `*.trycloudflare.com` waren flüchtige Entwickler-Tunnel.
  * Sie liefen nur auf deinem lokalen Rechner. Sobald der Laptop zugeklappt wurde, in den Energiesparmodus ging oder die Befehlszeile beendet wurde, war der Link sofort tot.
  * Bei jedem Neustart vergab Cloudflare eine komplett andere Zufalls-Adresse.
* **Die neue, permanente Lösung (GitHub Pages Edge CDN):**
  * Das gesamte Spiel ist nun in einem dedizierten GitHub-Repository (`bauerjohannes2-max/sling-jump`) gehostet.
  * **Unabhängig vom Laptop:** Dein Rechner muss **nicht** laufen. Das Spiel wird 24/7 weltweit über Microsofts Hochleistungs-CDN ausgeliefert.
  * **Konstante Adresse:** Die URL ändert sich **nie**. Freunde und Familie können sie dauerhaft als Lesezeichen speichern oder zum Homescreen hinzufügen.
  * **Automatisches PWA-Caching:** Der integrierte Service Worker (`sw.js`) lädt alle Spieldateien im Hintergrund, sodass das Spiel selbst im Flugmodus oder bei Funklöchern flüssig weitergespielt werden kann.

### **Installation als Web-App (Homescreen) auf Smartphones:**
* **iPhone (iOS / Safari):**
  1. Link öffnen: `https://bauerjohannes2-max.github.io/sling-jump/`
  2. Unten auf den **Teilen-Button** (Viereck mit Pfeil nach oben) tippen.
  3. **"Zum Home-Bildschirm"** auswählen.
  4. Das Spiel öffnet sich fortan im Vollbildmodus ohne Browser-Leisten wie eine echte App aus dem App Store!
* **Android (Chrome):**
  1. Link öffnen.
  2. Oben rechts auf das Drei-Punkte-Menü tippen und **"App installieren"** oder **"Zum Startbildschirm hinzufügen"** wählen.

### **Automatische Updates für Freunde & Familie:**
* Bei jeder Code-Änderung reicht ein einfacher Git-Push:
  ```bash
  git add .
  git commit -m "Neues Update"
  git push origin main
  ```
* Innerhalb von ca. 30 bis 60 Sekunden baut GitHub Pages das Spiel automatisch neu und liefert die Version weltweit an alle Geräte aus.

---

## 1. Gameplay-Fundament & Flow-Architektur

Der **Forward-Reach Solver** ist das zentrale Architektur-Upgrade, das aus einem frustrierenden Zufallsgenerator ein echtes Flow-Erlebnis macht:
* **Fangreichweite von 285 px** bei minimalen Abstaenden von **140 px** (ueber 200% Puffer).
* Verpasste Spruenge fuehlen sich fuer den Spieler stets wie eigenes Timing-Versagen und nie wie ein unfairer Spawner-Fehler an.
* Sanfte 4-Zonen-Schwierigkeitsskalierung (0-300m, 300-800m, 800-1500m, 1500m+) garantiert sofortigen Spielspass bei hoher Langzeitmotivation.
* **Geometrische Sternen-Formationen:** Sterne spawnen in flugfaehigen parabolischen Boegen und Turbo-Linien ausschliesslich im freien Flugkorridor (mindestens 68px Sicherheitsabstand zu allen Knoten).

---

## 2. Die 3 Release-Bausteine zur Veroeffentlichung

Bevor das Spiel auf Portalen oder Plattformen live geht, fehlen nur noch drei funktionale Release-Bausteine:

### 1. Viral Loop: Highscore-Card Snapshot
* **Funktion:** Ein 1-Klick-Button im Game-Over-Screen (`Score teilen`), der ein kompaktes PNG direkt auf einem Offscreen-Canvas rendert (Erreichte Hoehe, Schiffs-Silhouette, Rang, gesammelte Sterne) und in die Zwischenablage kopiert oder als Bild-Download anbietet.
* **Ziel:** Organische virale Verbreitung auf Discord, X/Twitter, Reddit und WhatsApp.

### 2. Web-Monetarisierung (CrazyGames / Poki SDK)
* **Rewarded Ad ("Schild-Wiederbelebung"):** 1x pro Flug die Option, sich nach einem Absturz per kurzem 15-Sekunden-Video an derselben Stelle mit unverwundbarem Schild wiederzubeleben (*"Hyper-Shield Revive"*).
* **Mid-Roll Ad:** Ein kurzer Werbeclip alle 3-5 Game-Over-Screens (nur, wenn die Runde laenger als 30 Sekunden gedauert hat, um Frust zu vermeiden).

### 3. Standalone-Desktop-Packaging (Tauri)
* **Funktion:** Einbinden von Tauri, um das Web-Projekt mit einem einzigen Terminal-Befehl (`cargo tauri build`) in eine native, winzige Windows-`.exe` (unter 10 MB) fuer itch.io oder Steam zu kompilieren.
* **Vorteil:** Keine riesige Electron-Laufzeitumgebung, 60+ FPS native Performance und sofort einsatzbereit.

---

## 3. Veroeffentlichungs-Matrix

| Plattform | Vorlaufzeit | Erloesmodell | Naechster Schritt |
| :--- | :--- | :--- | :--- |
| **CrazyGames / Poki** | 1-3 Tage | Ad-Revenue-Share (Passiv) | Plattform-SDK im `main.js` initialisieren & Spiel als `.zip` hochladen. |
| **itch.io (Web & Download)** | 30 Minuten | Pay-what-you-want / Spenden | HTML5-Zip im Dashboard hochladen, Titelbild hochladen, live schalten. |
| **Steam** | 2-4 Wochen | Einmalkauf (z. B. 1,99 EUR - 2,99 EUR) | Tauri-Wrapper aufsetzen, Steamworks-Partneraccount anlegen. |

---

## 4. Technische Checkliste fuer den Launch

- [x] Reine Vektor-Grafik ohne Emoji-Abhaengigkeiten (Zero Emojis, 100% DPI-unabhaengig)
- [x] Studio-Audio (10 Audio-Assets, 44.1 kHz 16-Bit PCM mit WebAudio-Fallback)
- [x] Lokale Bestenliste & persistente Speicherstaende (`localStorage`)
- [x] Vollwertiges Shop- & Hangar-System mit Echtzeit-Vorschau und Theme-Morphing
- [x] 100% Mathematische Loesbarkeit (Forward-Reach Solver)
- [x] Kollisionsfreie Sternen-Formationen (Parabolische Flugboegen)
- [ ] Highscore-Card Snapshot Canvas (`Score teilen`-Export)
- [ ] SDK-Adapter fuer Werbe-Einbindung (Poki/CrazyGames)
- [ ] Tauri Desktop-Build-Konfiguration (`src-tauri/`)
