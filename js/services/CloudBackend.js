/**
 * Space Jump - CloudBackend (Pluggable Storage Provider Interface)
 * Decouples game persistence from serve.js, enabling seamless migration to Supabase/Firebase
 * for static hosting on GitHub Pages with zero changes to core game systems.
 */

class BaseCloudAdapter {
  getName() {
    return 'base';
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
  }

  getName() {
    return 'supabase';
  }

  getHeaders(extraHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'apikey': this.supabaseAnonKey,
      'Authorization': `Bearer ${this.supabaseAnonKey}`,
      ...extraHeaders
    };
  }

  async sync(payload) {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return { ok: false, error: 'SUPABASE_NOT_CONFIGURED' };
    }

    try {
      const row = {
        player_id: payload.playerId,
        username: payload.username || (payload.state && payload.state.playerProfile && (payload.state.playerProfile.accountName || payload.state.playerProfile.pilotName)) || null,
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
      const fakeToken = 'sb_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      return { ok: true, sessionToken: fakeToken, updatedAt: updated.updated_at };
    } catch (e) {
      return { ok: false, error: 'SUPABASE_SYNC_ERROR' };
    }
  }

  async restore(playerId, passwordHash, username) {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      return { ok: false, error: 'SUPABASE_NOT_CONFIGURED' };
    }

    try {
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

      const sessionToken = 'sb_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      return {
        ok: true,
        player: {
          playerId: record.player_id,
          state: record.state,
          updatedAt: record.updated_at
        },
        sessionToken
      };
    } catch (e) {
      return { ok: false, error: 'SUPABASE_RESTORE_ERROR' };
    }
  }

  async login(playerId, passwordHash, username) {
    const res = await this.restore(playerId, passwordHash, username);
    if (res.ok && res.sessionToken) {
      return { ok: true, sessionToken: res.sessionToken, playerId: (res.player && res.player.playerId) || playerId };
    }
    return { ok: false, error: res.error || 'LOGIN_FEHLGESCHLAGEN', locked: res.locked };
  }

  async removePassword(playerId, passwordHash, sessionToken, state) {
    return this.sync({ playerId, removePassword: true, state });
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
      // Auto-detect environment configuration if present
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
      if (config && config.type && CloudBackend._adapters[config.type]) {
        const AdapterClass = CloudBackend._adapters[config.type];
        CloudBackend._activeAdapter = new AdapterClass(config.options || {});
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
