# Sling Jump - Enterprise Analytics & Growth Command Center (v4.0.0)

Autonomous, decoupled standalone web application for game telemetry, marketing attribution, economy balancing, and technical performance diagnostics.

## Features

1. **Executive Overview (North Star KPIs)**:
   - Live concurrent active players with real-time heartbeat pulse.
   - All-time unique devices, sessions, runs, and altitude records.
   - Daily activity area chart (7-day timeline).
   - Live recent flight log.

2. **Marketing & Acquisition (Distribution Engine)**:
   - UTM attribution: source, medium, campaign breakdown.
   - Visual conversion funnel: Campaign Click -> Game Launch -> First Jump -> PWA Install -> D1 Retention.
   - Organic virality tracking: Score shares, challenge links, K-factor (>1.0).

3. **Gameplay Balancing & Telemetry**:
   - Zone-by-zone altitude drop-off heatmap (Zone 1 Kalibrierung to Zone 6+ Tiefraum).
   - Spaceship pick-rate, average altitude, and core harvest rate.
   - Fatal hazard taxonomy (Void falls, fragile clock timers, space mine explosions).

4. **Virtual Economy Health**:
   - Token faucets (flight pickups, quests) vs sinks (ship purchases, trails, revives).
   - Hangar unlock progression curve.

5. **System Diagnostics**:
   - Platform/OS distribution (iOS, Android, Windows, macOS).
   - Average FPS telemetry & Performance Mode adoption rate.
   - Client error tracking.

6. **Event Explorer & BI Tooling**:
   - Real-time filterable event stream.
   - 1-Click CSV export for spreadsheets.
   - 1-Click JSON raw data dump.
   - Built-in Benchmark Simulation Generator (500+ realistic sessions).

## Running the Standalone Dashboard

### Option 1: Standalone Dashboard Server (Port 3001)
```bash
npm run serve:dashboard
# or
node dashboard/server.js
```
Open `http://localhost:3001` in your browser.

### Option 2: Integrated Server (Port 3000)
```bash
npm start
```
Open `http://localhost:3000/dashboard` in your browser.

### Option 3: Offline File Access
Directly open `dashboard/index.html` or root `dashboard.html` in any browser.

## Security & Master PIN
The dashboard is protected by a developer authentication gate.
- Default PIN: `2026`
