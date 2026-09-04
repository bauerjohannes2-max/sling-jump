/**
 * Sling Jump - Telemetry & Analytics Service
 * Anonymous, zero-dependency, privacy-friendly event tracking.
 * Safe fallback on offline/missing backend (0 console errors).
 */
class AnalyticsService {
  constructor() {
    this.version = (typeof CONSTANTS !== 'undefined' && CONSTANTS.VERSION) ? `v${CONSTANTS.VERSION}` : 'v3.17.0';
    this.deviceId = this.getOrCreateDeviceId();
    this.sessionId = this.getOrCreateSessionId();
    this.heartbeatTimer = null;
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => { this.isOnline = true; });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  getOrCreateDeviceId() {
    try {
      let id = localStorage.getItem('sling_device_id');
      if (!id) {
        id = 'dev_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('sling_device_id', id);
      }
      return id;
    } catch (e) {
      return 'dev_ephemeral_' + Math.random().toString(36).substring(2, 8);
    }
  }

  getOrCreateSessionId() {
    try {
      let sid = sessionStorage.getItem('sling_session_id');
      if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        sessionStorage.setItem('sling_session_id', sid);
      }
      return sid;
    } catch (e) {
      return 'sess_ephemeral_' + Math.random().toString(36).substring(2, 8);
    }
  }

  init() {
    this.trackSessionStart();
    this.startHeartbeat();
  }

  trackSessionStart() {
    this.sendEvent('session_start', {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
      timestamp: Date.now()
    });
  }

  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    // Send heartbeat ping every 25 seconds while tab is active
    this.heartbeatTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.sendEvent('heartbeat', {
          timestamp: Date.now()
        });
      }
    }, 25000);
  }

  trackRunStart(mode = 'normal') {
    this.sendEvent('run_start', {
      mode,
      timestamp: Date.now()
    });
  }

  trackRunEnd(data = {}) {
    const payload = {
      altitude: Math.round(data.finalAltitudeMeters || 0),
      coins: data.cores || 0,
      nearMisses: data.nearMisses || 0,
      isNewRecord: !!data.isNewRecord,
      shipId: data.shipId || 'arrow',
      durationSeconds: Math.round(data.durationSeconds || 0),
      timestamp: Date.now()
    };
    this.sendEvent('run_completed', payload);
    this.recordLocalHistory(payload);
  }

  trackSkinEquip(type, id) {
    this.sendEvent('skin_equip', {
      type,
      id,
      timestamp: Date.now()
    });
  }

  sendEvent(eventName, eventData = {}) {
    let userId = 'usr_anonymous';
    let gamerTag = 'Player';
    try {
      if (window.game && window.game.storage) {
        const profile = window.game.storage.getPlayerProfile();
        if (profile) {
          userId = profile.playerId || userId;
          gamerTag = profile.pilotName || gamerTag;
        }
      } else {
        const raw = localStorage.getItem('sling_jump_save_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.playerProfile) {
            userId = parsed.playerProfile.playerId || userId;
            gamerTag = parsed.playerProfile.pilotName || gamerTag;
          }
        }
      }
    } catch (e) {}

    const payload = {
      event: eventName,
      version: this.version,
      deviceId: this.deviceId,
      sessionId: this.sessionId,
      userId: userId,
      gamerTag: gamerTag,
      data: eventData,
      clientTime: new Date().toISOString()
    };

    // If fetch is available and not in pure file:// scheme with no server
    if (window.location.protocol.startsWith('http')) {
      try {
        fetch('/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {
          // Graceful silent fallback
        });
      } catch (e) {
        // Silent ignore
      }
    }
  }

  recordLocalHistory(runData) {
    try {
      const stored = localStorage.getItem('sling_local_runs');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(runData);
      if (list.length > 50) list.length = 50;
      localStorage.setItem('sling_local_runs', JSON.stringify(list));
    } catch (e) {}
  }

  getLocalHistory() {
    try {
      const stored = localStorage.getItem('sling_local_runs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
}

// Global Singleton Instance
window.AnalyticsService = new AnalyticsService();
