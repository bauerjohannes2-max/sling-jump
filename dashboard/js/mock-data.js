/**
 * Sling Jump Analytics - Synthetic Benchmark & Production Seed Generator
 * Generates realistic, statistically calibrated game telemetry for marketing,
 * game design balancing, distribution funnel tracking, and BI simulations.
 */
(function(window) {
  'use strict';

  const CHANNELS = [
    { source: 'tiktok', medium: 'organic_video', campaign: 'viral_challenge', weight: 32 },
    { source: 'reddit', medium: 'social_post', campaign: 'indiedev_launch', weight: 18 },
    { source: 'discord', medium: 'community_link', campaign: 'speedrun_contest', weight: 14 },
    { source: 'twitter', medium: 'organic_post', campaign: 'v3_update', weight: 11 },
    { source: 'qr_flyer', medium: 'physical_qr', campaign: 'campus_poster', weight: 9 },
    { source: 'poki', medium: 'arcade_portal', campaign: 'feature_banner', weight: 8 },
    { source: 'itch_io', medium: 'game_jam', campaign: 'web_showcase', weight: 5 },
    { source: 'direct', medium: 'none', campaign: 'word_of_mouth', weight: 3 }
  ];

  const SHIPS = [
    { id: 'arrow', name: 'ARROW (PFEIL)', basePickRate: 40, avgAlt: 1420, coresPerRun: 18 },
    { id: 'falcon', name: 'FALCON (FALKE)', basePickRate: 22, avgAlt: 2850, coresPerRun: 36 },
    { id: 'stealth', name: 'STEALTH (TARN-FLIEGER)', basePickRate: 15, avgAlt: 3910, coresPerRun: 52 },
    { id: 'ufo', name: 'UFO (UNBEKANNT)', basePickRate: 11, avgAlt: 4620, coresPerRun: 68 },
    { id: 'biplane', name: 'BIPLANE (DOPPEL-FLÜGEL)', basePickRate: 8, avgAlt: 5890, coresPerRun: 84 },
    { id: 'titan', name: 'TITAN (SCHWERKREUZER)', basePickRate: 4, avgAlt: 7450, coresPerRun: 110 }
  ];

  const HAZARDS = [
    { type: 'void_fall', label: 'Absturz ins Nichts (Verfehltes Einrasten)', percent: 46 },
    { type: 'fragile_timeout', label: 'Zeituhr-Explosion (Zu langes Verweilen)', percent: 27 },
    { type: 'space_mine', label: 'Raumminen-Kollision (Tiefraum-Zone)', percent: 16 },
    { type: 'moving_collision', label: 'Pendelknoten-Kollision', percent: 11 }
  ];

  const PLATFORMS = [
    { os: 'iOS (Safari)', display: 'Mobile Browser', share: 44, avgFps: 59.8 },
    { os: 'Android (Chrome)', display: 'Mobile Browser', share: 36, avgFps: 58.4 },
    { os: 'Windows (Chrome/Edge)', display: 'Desktop', share: 12, avgFps: 119.2 },
    { os: 'iOS (PWA Standalone)', display: 'Standalone PWA', share: 5, avgFps: 60.0 },
    { os: 'Android (PWA Standalone)', display: 'Standalone PWA', share: 3, avgFps: 59.5 }
  ];

  function pickWeighted(items, weightProp = 'weight') {
    const total = items.reduce((acc, item) => acc + (item[weightProp] || item.share || 1), 0);
    let rand = Math.random() * total;
    for (const item of items) {
      const w = item[weightProp] || item.share || 1;
      if (rand < w) return item;
      rand -= w;
    }
    return items[0];
  }

  function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateBenchmarkDataset(sessionCount = 520) {
    const now = Date.now();
    const oneDay = 86400000;
    const events = [];
    const runs = [];
    const deviceMap = new Map();
    let totalAltitude = 0;
    let totalCoins = 0;
    let maxAltitude = 0;

    for (let i = 0; i < sessionCount; i++) {
      const daysAgo = Math.pow(Math.random(), 1.8) * 14; // Skew towards recent days
      const sessionTime = new Date(now - daysAgo * oneDay + randomRange(0, 3600000)).toISOString();
      const channel = pickWeighted(CHANNELS);
      const platform = pickWeighted(PLATFORMS);
      const deviceId = 'dev_' + Math.random().toString(36).substring(2, 9);
      const sessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
      const gamerTag = 'Pilot-' + randomRange(100, 999);

      if (!deviceMap.has(deviceId)) {
        deviceMap.set(deviceId, {
          firstSeen: sessionTime,
          channel: channel.source,
          platform: platform.os,
          runsCount: 0,
          totalScore: 0
        });
      }
      const dev = deviceMap.get(deviceId);

      // Event 1: session_start with UTM metadata
      events.push({
        id: 'evt_' + Math.random().toString(36).substring(2, 10),
        type: 'session_start',
        timestamp: sessionTime,
        deviceId,
        sessionId,
        gamerTag,
        utm: {
          source: channel.source,
          medium: channel.medium,
          campaign: channel.campaign
        },
        platform: {
          os: platform.os,
          display: platform.display,
          fps: platform.avgFps + (Math.random() * 2 - 1)
        }
      });

      // Simulation of runs per session
      const runCountInSession = Math.random() < 0.2 ? 1 : Math.random() < 0.6 ? randomRange(2, 4) : randomRange(5, 9);
      for (let r = 0; r < runCountInSession; r++) {
        const runTime = new Date(new Date(sessionTime).getTime() + (r * 110000) + randomRange(10000, 45000)).toISOString();
        const ship = pickWeighted(SHIPS, 'basePickRate');
        
        // Realistic log-normal altitude distribution with zone-based fatality spikes
        let altFactor = Math.random();
        let altitude = 0;
        if (altFactor < 0.35) {
          altitude = randomRange(45, 480); // Zone 1 Calibrierung churn
        } else if (altFactor < 0.65) {
          altitude = randomRange(520, 1480); // Zone 2 Stratosphere
        } else if (altFactor < 0.85) {
          altitude = randomRange(1520, 3450); // Zone 3 Mesosphere
        } else if (altFactor < 0.94) {
          altitude = randomRange(3550, 6400); // Zone 4 Thermosphere
        } else if (altFactor < 0.985) {
          altitude = randomRange(6550, 9950); // Zone 5 Exosphere
        } else {
          altitude = randomRange(10200, 18450); // Zone 6 & 7 Deep Space
        }

        const duration = Math.max(12, Math.round(altitude / randomRange(38, 55)));
        const coins = Math.round((altitude / 42) + randomRange(2, 18));
        const nearMisses = Math.floor(altitude / randomRange(180, 340));
        const hazard = pickWeighted(HAZARDS, 'percent');
        const usedRevive = altitude > 800 && Math.random() < 0.38;

        if (altitude > maxAltitude) maxAltitude = altitude;
        totalAltitude += altitude;
        totalCoins += coins;
        dev.runsCount++;
        dev.totalScore = Math.max(dev.totalScore, altitude);

        const runRecord = {
          id: 'run_' + Math.random().toString(36).substring(2, 10),
          timestamp: runTime,
          deviceId,
          sessionId,
          gamerTag,
          shipId: ship.id,
          shipName: ship.name,
          altitude,
          coins,
          duration,
          nearMisses,
          hazard: hazard.type,
          hazardLabel: hazard.label,
          reviveUsed: usedRevive,
          source: channel.source,
          platform: platform.os
        };

        runs.push(runRecord);

        // Run Event
        events.push({
          id: 'evt_' + Math.random().toString(36).substring(2, 10),
          type: 'run_completed',
          timestamp: runTime,
          deviceId,
          sessionId,
          gamerTag,
          data: runRecord
        });

        // Occasional Social Share Event
        if (altitude > 1200 && Math.random() < 0.22) {
          events.push({
            id: 'evt_' + Math.random().toString(36).substring(2, 10),
            type: 'share_score',
            timestamp: new Date(new Date(runTime).getTime() + 12000).toISOString(),
            deviceId,
            sessionId,
            gamerTag,
            data: { altitude, channel: Math.random() < 0.5 ? 'whatsapp' : 'clipboard' }
          });
        }
      }
    }

    // Sort chronologically (descending for logs, ascending for timeline)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    runs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        mode: 'BENCHMARK_SIMULATION',
        totalSessions: sessionCount,
        uniqueDevicesCount: deviceMap.size,
        totalRunsCount: runs.length
      },
      summary: {
        onlineNow: randomRange(4, 18),
        totalVisits: sessionCount,
        uniqueDevices: deviceMap.size,
        totalRuns: runs.length,
        todayRuns: runs.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length,
        recordAltitude: maxAltitude,
        averageAltitude: Math.round(totalAltitude / (runs.length || 1)),
        totalCoinsCollected: totalCoins,
        avgDurationSeconds: Math.round(runs.reduce((acc, r) => acc + r.duration, 0) / (runs.length || 1)),
        reviveConversionRate: 38.4,
        pwaInstallConversionRate: 8.2,
        viralKFactor: 1.14
      },
      runs,
      events,
      channels: CHANNELS,
      ships: SHIPS,
      hazards: HAZARDS,
      platforms: PLATFORMS
    };
  }

  window.SJMockAnalytics = {
    generateBenchmarkDataset,
    CHANNELS,
    SHIPS,
    HAZARDS,
    PLATFORMS
  };

})(window);
