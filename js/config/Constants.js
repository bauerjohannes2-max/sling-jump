/**
 * Space Jump - Global Constants & Catalogs
 * Simple, intuitive arcade terminology - No Emojis
 */

const CONSTANTS = {
  VERSION: '5.18.52',
  STORAGE_KEY: 'space_jump_save_v2',
  LEGACY_STORAGE_KEY: 'sling_jump_save_v2',

  // Physics & Mechanics
  PHYSICS: {
    GRAVITY: 510,
    HOOK_RANGE: 160,
    MIN_ORBIT_SPEED: 720,
    MAX_ORBIT_SPEED: 1250,
    FIRST_ORBIT_SPIN: 0.52,
    TUTORIAL_ORBIT_SPIN: 1.0,
    SLOWMO_FACTOR: 0.40,
    MOMENT_SLOWMO_FACTOR: 0.28,
    // 90° “Loslassen” window — used in tutorial and live play.
    // ~14° before vertical through ~22° after; at 0.018 time scale that is ~3.6s real time.
    TUTORIAL_RELEASE_SLOWMO: 0.018,
    TUTORIAL_RELEASE_ENTER: 0.97,
    TUTORIAL_RELEASE_EXIT: 0.93,
    TUTORIAL_HOOK_SLOWMO: 0.30,
    TUTORIAL_CYCLES: 5,
    TUTORIAL_CLIMB_GAP: 55,
    TUTORIAL_FREEZE_VY: -40,
    TUTORIAL_FREEZE_SETTLE: 0.42,
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

  // Music slider is 0–1; bus gain is the ceiling at 100%.
  // Console mixes sit near -23 LUFS; these tracks are mastered hot, so 70% of full scale (~-3 dB) was too loud.
  AUDIO: {
    MUSIC_BUS_GAIN: 0.28, // ~-11 dB at slider 100%
    MUSIC_VOLUME_DEFAULT: 0.55
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

  // Canonical hangar lineup (unlock order). Hulls are pure monocoque polygons.
  SHIPS: [
    {
      id: 'pfeil',
      name: 'DART',
      tier: 'Starter',
      role: 'Starter',
      description: 'Delta-Starter mit einer zentralen Düse.',
      cost: 0,
      radius: 12,
      thrusterCount: 1,
      thrusterOffsets: [{ x: 0, y: 7 }],
      hull: [
        { points: '0,-22 13.5,11 4,7 -4,7 -13.5,11', fill: '#0c1626', stroke: '#ffffff', strokeWidth: 1.6 }
      ],
      nozzles: [
        { x: 0, y: 7, width: 1.8, bell: 2.6, flameHeight: 11.5 }
      ]
    },
    {
      id: 'habicht',
      name: 'HAWK',
      tier: 'Recon',
      role: 'Recon',
      description: 'Waverider-Aufklärer mit Zwillingsdüsen.',
      cost: 600,
      radius: 12,
      thrusterCount: 2,
      thrusterOffsets: [{ x: -5.5, y: 12.2 }, { x: 5.5, y: 12.2 }],
      hull: [
        { points: '0,-27 3.5,-14 6,-5 18,8 15,13.5 6,11 3,14 0,12 -3,14 -6,11 -15,13.5 -18,8 -6,-5 -3.5,-14', fill: '#0a1220', stroke: '#ffffff', strokeWidth: 1.6 }
      ],
      nozzles: [
        { x: -5.5, y: 12.2, width: 1.1, bell: 1.7, flameHeight: 11 },
        { x: 5.5, y: 12.2, width: 1.1, bell: 1.7, flameHeight: 11 }
      ]
    },
    {
      id: 'lanze',
      name: 'LANCE',
      tier: 'Interceptor',
      role: 'Interceptor',
      description: 'Speerrumpf mit Mega-Düse und Heckfinnen.',
      cost: 1800,
      radius: 12,
      thrusterCount: 1,
      thrusterOffsets: [{ x: 0, y: 14 }],
      hull: [
        { points: '-2.6,2 -13.5,12 -12.5,14.5 -2.6,11', fill: '#080f1c', stroke: '#ffffff', strokeWidth: 1.2 },
        { points: '2.6,2 13.5,12 12.5,14.5 2.6,11', fill: '#080f1c', stroke: '#ffffff', strokeWidth: 1.2 },
        { points: '0,-27 2.6,-9 2.6,14 -2.6,14 -2.6,-9', fill: '#0c1626', stroke: '#ffffff', strokeWidth: 1.6 }
      ],
      nozzles: [
        { x: 0, y: 14, width: 2.0, bell: 3.2, flameHeight: 14 }
      ]
    },
    {
      id: 'jaeger',
      name: 'HUNTER',
      tier: 'Air Superiority',
      role: 'Air Superiority',
      description: 'Luftüberlegenheitsjäger mit getrennten Düsen.',
      cost: 4500,
      radius: 12,
      thrusterCount: 2,
      thrusterOffsets: [{ x: -2.1, y: 12 }, { x: 2.1, y: 12 }],
      hull: [
        { points: '-3,-2 -18,5 -17,10 -3,8', fill: '#080f1c', stroke: '#ffffff', strokeWidth: 1.4 },
        { points: '3,-2 18,5 17,10 3,8', fill: '#080f1c', stroke: '#ffffff', strokeWidth: 1.4 },
        { points: '-3.5,8 -10,13.5 -9,15.5 -3.5,12.5', fill: '#060c18', stroke: '#ffffff', strokeWidth: 1 },
        { points: '3.5,8 10,13.5 9,15.5 3.5,12.5', fill: '#060c18', stroke: '#ffffff', strokeWidth: 1 },
        { points: '0,-23 3.6,-9 3.8,12 -3.8,12 -3.6,-9', fill: '#0f1b2f', stroke: '#ffffff', strokeWidth: 1.6 }
      ],
      nozzles: [
        { x: -2.1, y: 12, width: 1.0, bell: 1.45, flameHeight: 9.5 },
        { x: 2.1, y: 12, width: 1.0, bell: 1.45, flameHeight: 9.5 }
      ]
    },
    {
      id: 'falke',
      name: 'FALCON',
      tier: 'Apex Fighter',
      role: 'Apex Fighter',
      description: 'Apex-Jäger mit Vorwärtspfeilung und Heckbuchten.',
      cost: 8000,
      radius: 12,
      thrusterCount: 2,
      thrusterOffsets: [{ x: -6.8, y: 5.2 }, { x: 6.8, y: 5.2 }],
      hull: [
        { points: '0,-19 6,-11 24,-1 23,6 9,4 4,11 0,8 -4,11 -9,4 -23,6 -24,-1 -6,-11', fill: '#0a1220', stroke: '#ffffff', strokeWidth: 1.6 }
      ],
      nozzles: [
        { x: -6.8, y: 5.2, width: 1.2, bell: 1.9, flameHeight: 10.5 },
        { x: 6.8, y: 5.2, width: 1.2, bell: 1.9, flameHeight: 10.5 }
      ]
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

