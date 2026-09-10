/**
 * Space Jump - CloudBackend (Pluggable Storage Provider Interface)
 * Decouples game persistence from serve.js, enabling seamless migration to Supabase/Firebase
 * for static hosting on GitHub Pages with zero changes to core game systems.
 */

function isFileProtocol() {
  return typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
}

function isGitHubPagesHost() {
  return typeof window !== 'undefined' && window.location && /\.github\.io$/i.test(window.location.hostname);
}

function jwtRole(token) {
  if (!token || typeof token !== 'string') return '';
  const parts = token.split('.');
  if (parts.length < 2 || typeof atob !== 'function') return '';
  try {
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(padded));
    return (payload && payload.role) || '';
  } catch (e) {
    return '';
  }
}

async function readJsonApi(res) {
  if (!res) return null;
  const ctype = (res.headers.get('content-type') || '').toLowerCase();
  if (ctype && !ctype.includes('json')) return null;
  try {
    const data = await res.json();
    if (typeof data === 'string') {
      try { return JSON.parse(data); } catch (e) { return null; }
    }
    return data;
  } catch (e) {
    return null;
  }
}

function mapLeaderboardEntries(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    playerId: String((row && (row.playerId || row.player_id)) || '').trim(),
    name: String((row && row.name) || 'Pilot').trim() || 'Pilot',
    altitude: Math.floor(Number(row && row.altitude) || 0)
  })).filter((row) => row.playerId && row.altitude > 0);
}

class BaseCloudAdapter {
  getName() {
    return 'base';
  }

  async fetchLeaderboard() {
    return { ok: false, error: 'NOT_IMPLEMENTED' };
  }

  async submitScore(/* entry */) {
    return { ok: false, error: 'NOT_IMPLEMENTED' };
  }

  async sync(payload) {
    throw new Error('sync() must be implemented by adapter');
  }

  async restore(playerId, passwordHash) {
    throw new Error('restore() must be implemented by adapter');
  }

  async login(playerId, passwordHash) {
    throw new Error('login() must be implemented by adapter');
  }

  async removePassword(playerId, passwordHash, sessionToken, state) {
    throw new Error('removePassword() must be implemented by adapter');
  }
}

/**
 * LocalNodeAdapter: Default development adapter communicating with serve.js
 */
class LocalNodeAdapter extends BaseCloudAdapter {
  constructor(options = {}) {
    super();
    this.baseUrl = (options.baseUrl || '').replace(/\/+$/, '');
  }

  getName() {
    return 'local-node';
  }

  async fetchLeaderboard() {
    if (typeof fetch === 'undefined' || isFileProtocol() || isGitHubPagesHost()) {
      return { ok: false, error: isGitHubPagesHost() ? 'STATIC_HOST' : 'OFFLINE_OR_FILE_PROTOCOL' };
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/leaderboard`, { cache: 'no-store' });
      if (!res.ok) return { ok: false, error: `HTTP_${res.status}` };
      const data = await readJsonApi(res);
      if (!data || !data.ok || !Array.isArray(data.entries)) {
        return { ok: false, error: 'UNGUELTIGE ANTWORT' };
      }
      return { ok: true, entries: mapLeaderboardEntries(data.entries) };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async submitScore(entry) {
    if (typeof fetch === 'undefined' || isFileProtocol() || isGitHubPagesHost()) {
      return { ok: false, error: isGitHubPagesHost() ? 'STATIC_HOST' : 'OFFLINE_OR_FILE_PROTOCOL' };
    }
    if (!entry || !entry.playerId || !(entry.altitude > 0)) {
      return { ok: false, error: 'INVALID_SCORE' };
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: entry.playerId,
          name: entry.name || 'Pilot',
          altitude: entry.altitude
        })
      });
      if (!res.ok) {
        const err = await readJsonApi(res);
        return { ok: false, error: (err && err.error) || `HTTP_${res.status}` };
      }
      const data = await readJsonApi(res);
      if (!data || !data.ok) return { ok: false, error: 'UNGUELTIGE ANTWORT' };
      return { ok: true, altitude: data.altitude };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async sync(payload) {
    if (typeof fetch === 'undefined' || (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:')) {
      return { ok: false, error: 'OFFLINE_OR_FILE_PROTOCOL' };
    }
    const headers = { 'Content-Type': 'application/json' };
    if (payload.sessionToken) {
      headers['Authorization'] = `Bearer ${payload.sessionToken}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/player/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        return { ok: false, tokenExpired: true, error: 'UNAUTHORIZED_TOKEN_EXPIRED' };
      }
      if (res.status === 403) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error || 'FALSCHES PASSWORT', requiresPassword: true };
      }
      if (res.status === 409) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error || 'NAME SCHON VERGEBEN', nameTaken: true };
      }
      if (res.status === 429) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error || 'ZU VIELE VERSUCHE', locked: true };
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error || `HTTP_${res.status}` };
      }
      const data = await res.json().catch(() => ({}));
      return { ok: true, sessionToken: data.sessionToken, updatedAt: data.updatedAt };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async restore(playerId, passwordHash, username) {
    if (typeof fetch === 'undefined' || (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:')) {
      return { ok: false, error: 'OFFLINE_OR_FILE_PROTOCOL' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/player/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: playerId || null,
          username: username || null,
          passwordHash: passwordHash || null
        })
      });
      if (res.status === 403) {
        const err = await res.json().catch(() => ({}));
        const needsPw = !passwordHash;
        return {
          ok: false,
          error: needsPw ? 'PASSWORT ERFORDERLICH' : (err.error || 'FALSCHES PASSWORT'),
          requiresPassword: needsPw
        };
      }
      if (res.status === 429) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error || 'ZU VIELE VERSUCHE', locked: true };
      }
      if (!res.ok) {
        return { ok: false, error: `SPIELER NICHT GEFUNDEN` };
      }
      const data = await res.json().catch(() => ({}));
      if (data && data.ok && data.player) {
        return { ok: true, player: data.player, sessionToken: data.sessionToken };
      }
      return { ok: false, error: 'UNGUELTIGE ANTWORT' };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async login(playerId, passwordHash, username) {
    if (typeof fetch === 'undefined' || (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:')) {
      return { ok: false, error: 'OFFLINE_OR_FILE_PROTOCOL' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/player/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: playerId || null,
          username: username || null,
          passwordHash: passwordHash || null
        })
      });
      if (res.status === 403) {
        return { ok: false, error: 'FALSCHES PASSWORT' };
      }
      if (res.status === 429) {
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error || 'ZU VIELE VERSUCHE', locked: true };
      }
      if (!res.ok) {
        return { ok: false, error: 'SPIELER NICHT GEFUNDEN' };
      }
      const data = await res.json().catch(() => ({}));
      if (data && data.ok && data.sessionToken) {
        return { ok: true, sessionToken: data.sessionToken, playerId: data.playerId };
      }
      return { ok: false, error: 'LOGIN_FEHLGESCHLAGEN' };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }

  async removePassword(playerId, passwordHash, sessionToken, state) {
    if (typeof fetch === 'undefined' || (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:')) {
      return { ok: false, error: 'OFFLINE_OR_FILE_PROTOCOL' };
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }
      const res = await fetch(`${this.baseUrl}/api/player/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          playerId,
          passwordHash,
          sessionToken,
          removePassword: true,
          state
        })
      });
      return { ok: res.ok };
    } catch (e) {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }
}

/**
 * SupabaseAdapter: Serverless production adapter for GitHub Pages deployments.
 * Direct REST communication with Supabase PostgREST endpoints.
 */
class SupabaseAdapter extends BaseCloudAdapter {
  constructor(options = {}) {
    super();
    this.supabaseUrl = (options.supabaseUrl || '').replace(/\/+$/, '');
    this.supabaseAnonKey = options.supabaseAnonKey || options.apiKey || '';
    this.tableName = options.tableName || 'player_saves';
    this.leaderboardTable = options.leaderboardTable || 'leaderboard';
  }

  getName() {
    return 'supabase';
  }

  async fetchLeaderboard() {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return { ok: false, error: 'SUPABASE_NOT_CONFIGURED' };
    }
    try {
      const url = `${this.supabaseUrl}/rest/v1/${this.leaderboardTable}?select=player_id,name,altitude&altitude=gt.0&order=altitude.desc&limit=100`;
      const res = await fetch(url, { method: 'GET', headers: this.getHeaders(), cache: 'no-store' });
      if (!res.ok) return { ok: false, error: `SUPABASE_HTTP_${res.status}` };
      const rows = await readJsonApi(res);
      if (!Array.isArray(rows)) return { ok: false, error: 'UNGUELTIGE ANTWORT' };
      return { ok: true, entries: mapLeaderboardEntries(rows) };
    } catch (e) {
      return { ok: false, error: 'SUPABASE_LEADERBOARD_ERROR' };
    }
  }

  async submitScore(entry) {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return { ok: false, error: 'SUPABASE_NOT_CONFIGURED' };
    }
    if (!entry || !entry.playerId || !(entry.altitude > 0)) {
      return { ok: false, error: 'INVALID_SCORE' };
    }
    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/rpc/submit_leaderboard`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          p_player_id: entry.playerId,
          p_name: entry.name || 'Pilot',
          p_altitude: Math.floor(entry.altitude)
        })
      });
      if (!res.ok) return { ok: false, error: `SUPABASE_HTTP_${res.status}` };
      const data = await readJsonApi(res);
      if (data && data.ok === false) return { ok: false, error: data.error || 'SUBMIT_REJECTED' };
      return { ok: true, altitude: data && data.altitude };
    } catch (e) {
      return { ok: false, error: 'SUPABASE_SUBMIT_ERROR' };
    }
  }

  getHeaders(extraHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': this.supabaseAnonKey,
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      ...extraHeaders
    };
  }

  rpcMissing(res, data) {
    if (!res || res.ok) return false;
    const code = data && data.code;
    const msg = data ? JSON.stringify(data) : '';
    return res.status === 404 || code === 'PGRST202' || /could not find the function/i.test(msg);
  }

  mapRpcFailure(data, fallback) {
    if (data && data.ok === false) {
      return {
        ok: false,
        error: data.error || fallback,
        nameTaken: !!data.nameTaken,
        requiresPassword: !!data.requiresPassword,
        tokenExpired: !!data.tokenExpired
      };
    }
    return { ok: false, error: fallback };
  }

  async callSaveRpc(name, body) {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await readJsonApi(res);
    return { res, data };
  }

  fakeSessionToken() {
    return 'sb_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  async sync(payload) {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return { ok: false, error: 'SUPABASE_NOT_CONFIGURED' };
    }

    try {
      const username = payload.username || (payload.state && payload.state.playerProfile && (payload.state.playerProfile.accountName || payload.state.playerProfile.pilotName)) || null;
      const rpc = await this.callSaveRpc('sync_player_save', {
        p_player_id: payload.playerId,
        p_username: username,
        p_password_hash: payload.passwordHash || null,
        p_session_token: payload.sessionToken || null,
        p_state: payload.state || {},
        p_remove_password: !!payload.removePassword
      });

      if (rpc.res.ok && rpc.data && rpc.data.ok) {
        return {
          ok: true,
          sessionToken: rpc.data.sessionToken,
          updatedAt: rpc.data.updatedAt
        };
      }
      if (rpc.res.ok && rpc.data && rpc.data.ok === false) {
        return this.mapRpcFailure(rpc.data, 'SYNC_REJECTED');
      }
      if (!this.rpcMissing(rpc.res, rpc.data)) {
        return this.mapRpcFailure(rpc.data, `SUPABASE_HTTP_${rpc.res.status}`);
      }

      return this.syncViaTable(payload, username);
    } catch (e) {
      return { ok: false, error: 'SUPABASE_SYNC_ERROR' };
    }
  }

  async syncViaTable(payload, username) {
    const row = {
      player_id: payload.playerId,
      username: username || null,
      state: payload.state,
      updated_at: new Date().toISOString()
    };
    if (payload.passwordHash) {
      row.password_hash = payload.passwordHash;
    }
    if (payload.removePassword) {
      row.password_hash = null;
    }

    const res = await fetch(`${this.supabaseUrl}/rest/v1/${this.tableName}?on_conflict=player_id`, {
      method: 'POST',
      headers: this.getHeaders({
        'Prefer': 'resolution=merge-duplicates, return=representation'
      }),
      body: JSON.stringify(row)
    });

    if (!res.ok) {
      return { ok: false, error: `SUPABASE_HTTP_${res.status}` };
    }
    const rows = await res.json().catch(() => []);
    const updated = Array.isArray(rows) && rows[0] ? rows[0] : row;
    return { ok: true, sessionToken: this.fakeSessionToken(), updatedAt: updated.updated_at };
  }

  async restore(playerId, passwordHash, username) {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return { ok: false, error: 'SUPABASE_NOT_CONFIGURED' };
    }

    try {
      const rpc = await this.callSaveRpc('restore_player_save', {
        p_player_id: playerId || null,
        p_username: username || null,
        p_password_hash: passwordHash || null
      });

      if (rpc.res.ok && rpc.data && rpc.data.ok) {
        return {
          ok: true,
          player: rpc.data.player,
          sessionToken: rpc.data.sessionToken
        };
      }
      if (rpc.res.ok && rpc.data && rpc.data.ok === false) {
        return this.mapRpcFailure(rpc.data, 'RESTORE_REJECTED');
      }
      if (!this.rpcMissing(rpc.res, rpc.data)) {
        return this.mapRpcFailure(rpc.data, `SUPABASE_HTTP_${rpc.res.status}`);
      }

      return this.restoreViaTable(playerId, passwordHash, username);
    } catch (e) {
      return { ok: false, error: 'SUPABASE_RESTORE_ERROR' };
    }
  }

  async restoreViaTable(playerId, passwordHash, username) {
    const filter = username
      ? `username=eq.${encodeURIComponent(username)}`
      : `player_id=eq.${encodeURIComponent(playerId)}`;
    const url = `${this.supabaseUrl}/rest/v1/${this.tableName}?${filter}&select=*`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!res.ok) {
      return { ok: false, error: 'SPIELER NICHT GEFUNDEN' };
    }

    const rows = await res.json().catch(() => []);
    if (!Array.isArray(rows) || rows.length === 0) {
      return { ok: false, error: 'SPIELER NICHT GEFUNDEN' };
    }

    const record = rows[0];
    if (record.password_hash) {
      if (!passwordHash) {
        return { ok: false, requiresPassword: true, error: 'PASSWORT ERFORDERLICH' };
      }
      if (record.password_hash !== passwordHash) {
        return { ok: false, error: 'FALSCHES PASSWORT' };
      }
    }

    return {
      ok: true,
      player: {
        playerId: record.player_id,
        state: record.state,
        updatedAt: record.updated_at
      },
      sessionToken: this.fakeSessionToken()
    };
  }

  async login(playerId, passwordHash, username) {
    const res = await this.restore(playerId, passwordHash, username);
    if (res.ok && res.sessionToken) {
      return { ok: true, sessionToken: res.sessionToken, playerId: (res.player && res.player.playerId) || playerId };
    }
    return { ok: false, error: res.error || 'LOGIN_FEHLGESCHLAGEN', locked: res.locked };
  }

  async removePassword(playerId, passwordHash, sessionToken, state) {
    return this.sync({ playerId, passwordHash, sessionToken, removePassword: true, state });
  }
}

/**
 * CloudBackend: Factory and Registry Manager
 */
class CloudBackend {
  static _activeAdapter = null;
  static _adapters = {
    'local': LocalNodeAdapter,
    'supabase': SupabaseAdapter
  };

  static registerAdapter(name, adapterClass) {
    CloudBackend._adapters[name] = adapterClass;
  }

  static getAdapter() {
    if (!CloudBackend._activeAdapter) {
      let config = null;
      if (typeof window !== 'undefined') {
        config = window.SPACE_JUMP_CLOUD_CONFIG || window.SLING_JUMP_CLOUD_CONFIG || null;
        if (!config) {
          try {
            const raw = localStorage.getItem('space_jump_cloud_config') || localStorage.getItem('sling_jump_cloud_config');
            if (raw) config = JSON.parse(raw);
          } catch (e) {}
        }
      }
      const opts = (config && config.options) || {};
      const supabaseReady = config && config.type === 'supabase'
        && opts.supabaseUrl && opts.supabaseAnonKey
        && jwtRole(opts.supabaseAnonKey) !== 'service_role';
      if (supabaseReady) {
        CloudBackend._activeAdapter = new SupabaseAdapter(opts);
      } else {
        CloudBackend._activeAdapter = new LocalNodeAdapter();
      }
    }
    return CloudBackend._activeAdapter;
  }

  static setAdapter(adapter) {
    CloudBackend._activeAdapter = adapter;
  }

  static configure(type, options = {}) {
    const AdapterClass = CloudBackend._adapters[type];
    if (!AdapterClass) {
      throw new Error(`Unrecognized CloudBackend adapter type: ${type}`);
    }
    CloudBackend._activeAdapter = new AdapterClass(options);
    return CloudBackend._activeAdapter;
  }
}

// Export for Node and Browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BaseCloudAdapter,
    LocalNodeAdapter,
    SupabaseAdapter,
    CloudBackend
  };
}
