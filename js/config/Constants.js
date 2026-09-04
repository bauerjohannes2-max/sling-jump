/**
 * Sling Jump - Global Constants & Catalogs
 * Simple, intuitive arcade terminology - No Emojis
 */

const CONSTANTS = {
  VERSION: '4.1.0',
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

  // Globales Arcade Leaderboard: Top-Piloten weltweit (50 Contenders)
  GLOBAL_LEADERBOARD_TOP: [
    { rank: 1, name: 'VortexStriker', ship: 'TITAN', altitude: 4850, score: 48500, date: '04.09.2026' },
    { rank: 2, name: 'CyberPhantom', ship: 'SPECTRE', altitude: 4520, score: 45200, date: '04.09.2026' },
    { rank: 3, name: 'NovaPulse', ship: 'PHÖNIX', altitude: 4180, score: 41800, date: '04.09.2026' },
    { rank: 4, name: 'QuantumRider', ship: 'PFEIL', altitude: 3940, score: 39400, date: '03.09.2026' },
    { rank: 5, name: 'ApexHunter', ship: 'SPECTRE', altitude: 3720, score: 37200, date: '03.09.2026' },
    { rank: 6, name: 'SolarBlade', ship: 'PHÖNIX', altitude: 3510, score: 35100, date: '03.09.2026' },
    { rank: 7, name: 'ZeroEcho', ship: 'PFEIL', altitude: 3340, score: 33400, date: '03.09.2026' },
    { rank: 8, name: 'CosmicViper', ship: 'PFEIL', altitude: 3180, score: 31800, date: '02.09.2026' },
    { rank: 9, name: 'HyperDrifter', ship: 'TITAN', altitude: 3020, score: 30200, date: '02.09.2026' },
    { rank: 10, name: 'ShadowWolf', ship: 'SPECTRE', altitude: 2890, score: 28900, date: '02.09.2026' },
    { rank: 11, name: 'TurboHawk', ship: 'PHÖNIX', altitude: 2760, score: 27600, date: '02.09.2026' },
    { rank: 12, name: 'NeonFalcon', ship: 'PFEIL', altitude: 2630, score: 26300, date: '02.09.2026' },
    { rank: 13, name: 'PixelStriker', ship: 'TITAN', altitude: 2510, score: 25100, date: '02.09.2026' },
    { rank: 14, name: 'AstraRunner', ship: 'SPECTRE', altitude: 2400, score: 24000, date: '01.09.2026' },
    { rank: 15, name: 'ZenithPilot', ship: 'PHÖNIX', altitude: 2290, score: 22900, date: '01.09.2026' },
    { rank: 16, name: 'ChronoFox', ship: 'PFEIL', altitude: 2180, score: 21800, date: '01.09.2026' },
    { rank: 17, name: 'StellarGhost', ship: 'TITAN', altitude: 2070, score: 20700, date: '01.09.2026' },
    { rank: 18, name: 'VelocityAce', ship: 'SPECTRE', altitude: 1970, score: 19700, date: '01.09.2026' },
    { rank: 19, name: 'PulseMaster', ship: 'PHÖNIX', altitude: 1880, score: 18800, date: '01.09.2026' },
    { rank: 20, name: 'GravityKing', ship: 'PFEIL', altitude: 1790, score: 17900, date: '01.09.2026' },
    { rank: 21, name: 'OrbitNinja', ship: 'TITAN', altitude: 1710, score: 17100, date: '31.08.2026' },
    { rank: 22, name: 'EclipseRaven', ship: 'SPECTRE', altitude: 1630, score: 16300, date: '31.08.2026' },
    { rank: 23, name: 'BlitzKestrel', ship: 'PHÖNIX', altitude: 1550, score: 15500, date: '31.08.2026' },
    { rank: 24, name: 'DarkMatter', ship: 'PFEIL', altitude: 1480, score: 14800, date: '31.08.2026' },
    { rank: 25, name: 'AstralWanderer', ship: 'TITAN', altitude: 1410, score: 14100, date: '31.08.2026' },
    { rank: 26, name: 'FalconStrike', ship: 'SPECTRE', altitude: 1340, score: 13400, date: '30.08.2026' },
    { rank: 27, name: 'NebulaRacer', ship: 'PHÖNIX', altitude: 1280, score: 12800, date: '30.08.2026' },
    { rank: 28, name: 'SonicBoomer', ship: 'PFEIL', altitude: 1220, score: 12200, date: '30.08.2026' },
    { rank: 29, name: 'VoidWalker', ship: 'TITAN', altitude: 1160, score: 11600, date: '30.08.2026' },
    { rank: 30, name: 'TitanForge', ship: 'SPECTRE', altitude: 1110, score: 11100, date: '30.08.2026' },
    { rank: 31, name: 'IronClad', ship: 'PHÖNIX', altitude: 1060, score: 10600, date: '29.08.2026' },
    { rank: 32, name: 'StarlightGlider', ship: 'PFEIL', altitude: 1010, score: 10100, date: '29.08.2026' },
    { rank: 33, name: 'SilverLynx', ship: 'TITAN', altitude: 960, score: 9600, date: '29.08.2026' },
    { rank: 34, name: 'WarpSpeeder', ship: 'SPECTRE', altitude: 920, score: 9200, date: '29.08.2026' },
    { rank: 35, name: 'PyroClast', ship: 'PHÖNIX', altitude: 880, score: 8800, date: '29.08.2026' },
    { rank: 36, name: 'AeroDynamics', ship: 'PFEIL', altitude: 840, score: 8400, date: '28.08.2026' },
    { rank: 37, name: 'EchoRaptor', ship: 'TITAN', altitude: 800, score: 8000, date: '28.08.2026' },
    { rank: 38, name: 'FluxCapacitor', ship: 'SPECTRE', altitude: 760, score: 7600, date: '28.08.2026' },
    { rank: 39, name: 'CyberSpark', ship: 'PHÖNIX', altitude: 720, score: 7200, date: '28.08.2026' },
    { rank: 40, name: 'HorizonChaser', ship: 'PFEIL', altitude: 680, score: 6800, date: '28.08.2026' },
    { rank: 41, name: 'QuantumPulse', ship: 'TITAN', altitude: 640, score: 6400, date: '27.08.2026' },
    { rank: 42, name: 'SpectralShift', ship: 'SPECTRE', altitude: 600, score: 6000, date: '27.08.2026' },
    { rank: 43, name: 'DriftMatrix', ship: 'PHÖNIX', altitude: 560, score: 5600, date: '27.08.2026' },
    { rank: 44, name: 'TurboStrider', ship: 'PFEIL', altitude: 520, score: 5200, date: '27.08.2026' },
    { rank: 45, name: 'NovaJumper', ship: 'TITAN', altitude: 480, score: 4800, date: '26.08.2026' },
    { rank: 46, name: 'AstroScout', ship: 'SPECTRE', altitude: 440, score: 4400, date: '26.08.2026' },
    { rank: 47, name: 'VectorGlide', ship: 'PHÖNIX', altitude: 400, score: 4000, date: '26.08.2026' },
    { rank: 48, name: 'KineticRay', ship: 'PFEIL', altitude: 360, score: 3600, date: '25.08.2026' },
    { rank: 49, name: 'ZeroGravity', ship: 'TITAN', altitude: 310, score: 3100, date: '25.08.2026' },
    { rank: 50, name: 'CometTail', ship: 'PFEIL', altitude: 260, score: 2600, date: '24.08.2026' }
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
