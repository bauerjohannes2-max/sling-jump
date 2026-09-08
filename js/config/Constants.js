/**
 * Space Jump - Global Constants & Catalogs
 * Simple, intuitive arcade terminology - No Emojis
 */

const CONSTANTS = {
  VERSION: '5.18.1',
  STORAGE_KEY: 'space_jump_save_v2',
  LEGACY_STORAGE_KEY: 'sling_jump_save_v2',

  // Physics & Mechanics
  PHYSICS: {
    GRAVITY: 510,
    HOOK_RANGE: 160,
    MIN_ORBIT_SPEED: 720,
    MAX_ORBIT_SPEED: 1250,
    SLOWMO_FACTOR: 0.40,
    BOOST_MULTIPLIER: 2.8,
    FRAGILE_DURATION: 0.90,
    DEATH_BUFFER_PX: 4,
    METERS_PER_PIXEL: 0.125,
    // Razor-sharp 90-degree launch threshold (tangentY >= 0.995 is within ~5.7 deg of pure vertical)
    PERFECT_LAUNCH_THRESHOLD: 0.995,
    // Moderate, balanced progressive combo speed multipliers (smooth +3% per step up to +30% at max)
    COMBO_SPEED_FACTORS: [1.0, 1.03, 1.06, 1.09, 1.12, 1.15, 1.18, 1.21, 1.24, 1.27, 1.30],
    // Instantaneous catapult impulse bonuses (px/s)
    COMBO_LAUNCH_BONUSES: [0, 25, 45, 65, 85, 105, 125, 145, 165, 185, 200]
  },

  // Scoring & Currency
  SCORE: {
    PARTICLE_VALUE: 50
  },

  // 4 Farbwelten (Universe Themes)
  THEMES: [
    {
      id: 'deep_space',
      name: 'WELTRAUM',
      description: 'Klassisch dunkelblaues Weltall mit purem Kosmos.',
      cost: 0,
      background: '#080b10',
      primary: '#00f0ff',
      secondary: '#38bdf8',
      accent: '#fbbf24',
      danger: '#e11d48',
      voidColor: '#e11d48',
      voidGlow: 'rgba(225, 29, 72, 0.7)',
      voidPlasma: '#1e051e',
      cardBg: 'rgba(15, 23, 42, 0.75)'
    },
    {
      id: 'cyberpunk',
      name: 'NEON-CITY',
      description: 'Leuchtende Cyberpunk-Farben in Pink & Blau.',
      cost: 400,
      background: '#0a0518',
      primary: '#ff007f',
      secondary: '#00f0ff',
      accent: '#ffe600',
      danger: '#ff1744',
      voidColor: '#ff007f',
      voidGlow: 'rgba(255, 0, 128, 0.75)',
      voidPlasma: '#250022',
      cardBg: 'rgba(24, 10, 40, 0.8)'
    },
    {
      id: 'solar_flare',
      name: 'SONNENFEUER',
      description: 'Warme Orange- und Goldtöne mit Sonnen-Glow.',
      cost: 750,
      background: '#140804',
      primary: '#ff8800',
      secondary: '#fbbf24',
      accent: '#38bdf8',
      danger: '#dc2626',
      voidColor: '#ff4500',
      voidGlow: 'rgba(255, 69, 0, 0.75)',
      voidPlasma: '#2a0a00',
      cardBg: 'rgba(35, 15, 8, 0.8)'
    },
    {
      id: 'monolith_dark',
      name: 'NACHT',
      description: 'Schlichtes, tiefschwarzes Minimal-Design.',
      cost: 1200,
      background: '#040406',
      primary: '#f8fafc',
      secondary: '#94a3b8',
      accent: '#38bdf8',
      danger: '#f43f5e',
      voidColor: '#e2e8f0',
      voidGlow: 'rgba(248, 250, 252, 0.65)',
      voidPlasma: '#111115',
      cardBg: 'rgba(15, 15, 20, 0.85)'
    }
  ],

  // 1 Aktives Standard-Raumschiff
  SHIPS: [
    {
      id: 'dart',
      name: 'DELTA PFEIL',
      tier: 'SERIE 01',
      description: 'Präzisions-Abfangjäger mit Crimson-Chevron und Einzeldüse.',
      cost: 0,
      radius: 12,
      thrusterCount: 1,
      thrusterOffsets: [{ x: 0, y: 8 }]
    },
    {
      id: 'phoenix',
      name: 'PHÖNIX',
      tier: 'SERIE 02',
      description: 'Zweiflügeliger Raumgleiter mit doppelter Impulsdüse.',
      cost: 500,
      radius: 12,
      thrusterCount: 2,
      thrusterOffsets: [{ x: -5, y: 8 }, { x: 5, y: 8 }]
    }
  ],

  // 1 Aktiver Standard-Schweif
  TRAILS: [
    {
      id: 'neon_cyan',
      name: 'CYAN-LASER',
      tier: 'STANDARD',
      description: 'Reiner blauer Partikel-Schweif.',
      cost: 0,
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.4)',
      type: 'solid'
    }
  ],

  // Tägliche Aufgaben (Dailies - 24h Reset)
  DAILY_QUEST_POOL: [
    {
      id: 'daily_reach_3000',
      title: 'HÖHEN-SPRINT',
      description: '3.000m in einem Flug',
      target: 3000,
      type: 'altitude_single',
      reward: 200,
      category: 'daily'
    },
    {
      id: 'daily_collect_25',
      title: 'MÜNZ-SAMMLER',
      description: '25 Münzen sammeln',
      target: 25,
      type: 'cores_cumulative',
      reward: 175,
      category: 'daily'
    },
    {
      id: 'daily_boost_5',
      title: 'SUPER-BOOST',
      description: '5 Katapulte nutzen',
      target: 5,
      type: 'boost_cumulative',
      reward: 200,
      category: 'daily'
    }
  ],

  // Wöchentliche Herausforderungen (Weeklies - 7 Tage Reset)
  WEEKLY_QUEST_POOL: [
    {
      id: 'weekly_altitude_30k',
      title: 'DISTANZ-MARATHON',
      description: '30.000m insgesamt',
      target: 30000,
      type: 'altitude_cumulative',
      reward: 1500,
      category: 'weekly'
    },
    {
      id: 'weekly_cores_80',
      title: 'SCHATZKAMMER',
      description: '80 Münzen sammeln',
      target: 80,
      type: 'cores_cumulative',
      reward: 1200,
      category: 'weekly'
    },
    {
      id: 'weekly_combo_5',
      title: 'COMBO-MEISTER',
      description: '5er-Combo schaffen',
      target: 5,
      type: 'combo_single',
      reward: 1400,
      category: 'weekly'
    }
  ],

  // Allgemeine Aufgaben-Pool (Fallback)
  QUEST_POOL: [
    {
      id: 'reach_altitude_400',
      title: 'HOCH HINAUS',
      description: 'Erreiche 500 Meter Höhe in einem Flug.',
      target: 500,
      type: 'altitude_single',
      reward: 150
    },
    {
      id: 'collect_cores_15',
      title: 'GOLD-SAMMLER',
      description: 'Sammle 15 Gold-Münzen in einem Flug.',
      target: 15,
      type: 'cores_single',
      reward: 150
    },
    {
      id: 'super_boost_3',
      title: 'TURBO-SPRÜNGE',
      description: 'Nutze 4 grüne Turbo-Punkte in einem Flug.',
      target: 4,
      type: 'boost_single',
      reward: 175
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONSTANTS;
}

