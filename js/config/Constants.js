/**
 * Sling Jump - Global Constants & Catalogs
 * Simple, intuitive arcade terminology - No Emojis
 */

const CONSTANTS = {
  VERSION: '3.27.0',
  STORAGE_KEY: 'sling_jump_save_v2',

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
    HITSTOP_DURATION_MS: 40,
    METERS_PER_PIXEL: 0.125
  },

  // Scoring & Currency
  SCORE: {
    PARTICLE_VALUE: 50,
    QUEST_REWARD: 150,
    NEAR_MISS_BONUS: 75,
    TUTORIAL_REWARD: 50
  },

  // 4 Farbwelten (Universe Themes)
  THEMES: [
    {
      id: 'deep_space',
      name: 'WELTRAUM',
      description: 'Klassisch dunkelblaues Weltall mit Cyan-Gitter.',
      cost: 0,
      background: '#080b10',
      gridColor: 'rgba(0, 240, 255, 0.035)',
      primary: '#00f0ff',
      secondary: '#38bdf8',
      accent: '#fbbf24',
      danger: '#ef4444',
      voidColor: '#ef4444',
      voidGlow: 'rgba(239, 68, 68, 0.7)',
      voidPlasma: '#1e051e',
      cardBg: 'rgba(15, 23, 42, 0.75)'
    },
    {
      id: 'cyberpunk',
      name: 'NEON-CITY',
      description: 'Leuchtende Cyberpunk-Farben in Pink & Blau.',
      cost: 400,
      background: '#0a0518',
      gridColor: 'rgba(255, 0, 128, 0.04)',
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
      gridColor: 'rgba(255, 140, 0, 0.04)',
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
      gridColor: 'rgba(255, 255, 255, 0.03)',
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
      name: 'PFEIL',
      tier: 'STANDARD',
      description: 'Wendiger Starter-Aufklärer mit doppelter Impulsdüse.',
      cost: 0,
      radius: 12,
      thrusterCount: 2,
      thrusterOffsets: [{ x: -4, y: 8 }, { x: 4, y: 8 }]
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
      id: 'daily_reach_350',
      title: 'HÖHEN-SPRINT',
      description: '600m in einem Flug',
      target: 600,
      type: 'altitude_single',
      reward: 150,
      category: 'daily'
    },
    {
      id: 'daily_collect_12',
      title: 'MÜNZ-SAMMLER',
      description: '16 Münzen sammeln',
      target: 16,
      type: 'cores_single',
      reward: 175,
      category: 'daily'
    },
    {
      id: 'daily_boost_3',
      title: 'SUPER-BOOST',
      description: '5 Katapulte nutzen',
      target: 5,
      type: 'boost_single',
      reward: 200,
      category: 'daily'
    },
    {
      id: 'daily_slingshots_20',
      title: 'FLUG-TRAINING',
      description: '45 Sprünge ausführen',
      target: 45,
      type: 'slingshot_cumulative',
      reward: 175,
      category: 'daily'
    },
    {
      id: 'daily_near_miss_3',
      title: 'KNAPPE RETTUNG',
      description: '5x vor Abgrund retten',
      target: 5,
      type: 'near_miss_cumulative',
      reward: 225,
      category: 'daily'
    }
  ],

  // Wöchentliche Herausforderungen (Weeklies - 7 Tage Reset: ~2-2.5h aktive Spielzeit nötig)
  WEEKLY_QUEST_POOL: [
    {
      id: 'weekly_altitude_150k',
      title: 'KOSMISCHER MARATHON',
      description: '150.000m Gesamtdistanz',
      target: 150000,
      type: 'altitude_cumulative',
      reward: 1500,
      category: 'weekly'
    },
    {
      id: 'weekly_cores_800',
      title: 'SCHATZKAMMER',
      description: '800 Münzen sammeln',
      target: 800,
      type: 'cores_cumulative',
      reward: 1400,
      category: 'weekly'
    },
    {
      id: 'weekly_slingshots_1500',
      title: 'ORBITAL-MEISTER',
      description: '1.500 Sprünge ausführen',
      target: 1500,
      type: 'slingshot_cumulative',
      reward: 1600,
      category: 'weekly'
    },
    {
      id: 'weekly_reach_8000_single',
      title: 'EXOSPHÄREN-VORSTOSS',
      description: '8.000m in einem Flug',
      target: 8000,
      type: 'altitude_single',
      reward: 2000,
      category: 'weekly'
    },
    {
      id: 'weekly_near_miss_60',
      title: 'REFLEX-AKROBAT',
      description: '60 knappe Rettungen',
      target: 60,
      type: 'near_miss_cumulative',
      reward: 1500,
      category: 'weekly'
    }
  ],

  // Globales Leaderboard: Online-Daten (aktuell leer/nur lokaler Spieler)
  GLOBAL_LEADERBOARD_TOP: [],

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
