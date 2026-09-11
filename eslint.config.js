/**
 * Space Jump - ESLint configuration
 *
 * The game ships as classic <script> files, so browser code is linted as scripts with the
 * project's cross-file classes declared as globals. Node tooling under scripts/
 * is linted with CommonJS globals instead.
 */

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  location: 'readonly',
  fetch: 'readonly',
  console: 'readonly',
  performance: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  Image: 'readonly',
  Audio: 'readonly',
  AudioContext: 'readonly',
  webkitAudioContext: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  crypto: 'readonly',
  TextEncoder: 'readonly',
  AbortController: 'readonly',
  ClipboardItem: 'readonly',
  Path2D: 'readonly',
  File: 'readonly',
  caches: 'readonly',
  self: 'readonly',
  atob: 'readonly',
  btoa: 'readonly',
  alert: 'readonly',
  confirm: 'readonly',
  prompt: 'readonly',
  matchMedia: 'readonly',
  screen: 'readonly',
  history: 'readonly',
  // Optional CommonJS tail some services carry for Node-side reuse.
  module: 'writable',
  require: 'readonly',
  CustomEvent: 'readonly',
  Event: 'readonly',
  Blob: 'readonly',
  getComputedStyle: 'readonly',
  structuredClone: 'readonly'
};

// Classes and singletons that the game loads from separate <script> tags.
const projectGlobals = {
  CONSTANTS: 'readonly',
  StorageService: 'readonly',
  CloudBackend: 'readonly',
  AudioManager: 'readonly',
  ParticleSystem: 'readonly',
  InputManager: 'readonly',
  StateManager: 'readonly',
  WorldManager: 'readonly',
  MissionManager: 'readonly',
  ShopManager: 'readonly',
  UIManager: 'readonly',
  GameEngine: 'readonly',
  Spaceship: 'readonly',
  OrbitNode: 'readonly',
  EnergyOrb: 'readonly',
  ShipArt: 'readonly',
  LocalNodeAdapter: 'readonly',
  SupabaseAdapter: 'readonly'
};

const sharedRules = {
  // Class declarations in this codebase are the module boundary, so an "unused" PascalCase
  // top-level binding is expected; a lowercase one is a genuine leftover.
  'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^[A-Z]' }],
  'no-undef': 'error',
  'no-redeclare': ['error', { builtinGlobals: false }],
  'no-dupe-keys': 'error',
  'no-dupe-class-members': 'error',
  'no-unreachable': 'error',
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-constant-condition': ['error', { checkLoops: false }],
  'no-fallthrough': 'error',
  'no-var': 'error',
  'prefer-const': ['error', { destructuring: 'all' }],
  eqeqeq: ['error', 'smart']
};

module.exports = [
  {
    ignores: ['node_modules/**', 'screenshots/**', 'data/**', 'certs/**']
  },
  {
    files: ['js/**/*.js', 'sw.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...browserGlobals, ...projectGlobals }
    },
    rules: sharedRules
  },
  {
    files: ['scripts/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Playwright/Puppeteer scripts inline browser callbacks via page.evaluate().
        ...browserGlobals,
        ...projectGlobals,
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly'
      }
    },
    rules: sharedRules
  }
];
