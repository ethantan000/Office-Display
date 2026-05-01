// ============================================================
//  OFFICE DISPLAY — THEME DEFINITIONS
//  Shared by both the viewer (app.js) and admin (admin.js).
//
//  Each theme sets CSS custom properties on :root.
//  Background blobs are positioned via CSS; their colors come
//  from --blob-1 / --blob-2 / --blob-3 variables.
// ============================================================

window.OFFICE_THEMES = {
  midnight: {
    label: 'Midnight',
    description: 'Deep navy with violet accents',
    // [bg-dark, bg-light, accent, blob] — used for the swatch preview
    swatch: ['#090c1a', '#1a1040', '#7aa2f7', '#bb9af7'],
    vars: {
      '--bg-start':      '#090c1a',
      '--bg-end':        '#130e3a',
      '--blob-1':        'rgba(122,162,247, 0.30)',
      '--blob-2':        'rgba(187,154,247, 0.22)',
      '--blob-3':        'rgba(56, 42, 130, 0.38)',
      '--glass-bg':      'rgba(9, 12, 26,  0.52)',
      '--glass-border':  'rgba(122,162,247, 0.13)',
      '--glass-shadow':  'rgba(0,  0,  20,  0.40)',
      '--accent':        '#7aa2f7',
      '--accent2':       '#9ece6a',
      '--red':           '#f7768e',
      '--yellow':        '#e0af68',
      '--text':          '#c0caf5',
      '--text-muted':    '#6272a4',
      '--ticker-accent': '#7aa2f7',
    },
  },

  aurora: {
    label: 'Aurora',
    description: 'Dark teal with arctic cyan',
    swatch: ['#050f12', '#081e22', '#2ac3de', '#73daca'],
    vars: {
      '--bg-start':      '#050f12',
      '--bg-end':        '#081d22',
      '--blob-1':        'rgba(42, 195, 222, 0.26)',
      '--blob-2':        'rgba(115,218,202, 0.20)',
      '--blob-3':        'rgba(0,  80,  90,  0.42)',
      '--glass-bg':      'rgba(5,  15,  18,  0.52)',
      '--glass-border':  'rgba(42, 195, 222, 0.14)',
      '--glass-shadow':  'rgba(0,  8,   14,  0.40)',
      '--accent':        '#2ac3de',
      '--accent2':       '#73daca',
      '--red':           '#ff5370',
      '--yellow':        '#ffcb6b',
      '--text':          '#cdd9e5',
      '--text-muted':    '#4a8a96',
      '--ticker-accent': '#2ac3de',
    },
  },

  sunset: {
    label: 'Sunset',
    description: 'Warm dusk with coral and amber',
    swatch: ['#120a08', '#240e14', '#ff9e64', '#f7768e'],
    vars: {
      '--bg-start':      '#120a08',
      '--bg-end':        '#1e0a14',
      '--blob-1':        'rgba(255,158,100, 0.28)',
      '--blob-2':        'rgba(247,118,142, 0.22)',
      '--blob-3':        'rgba(100, 40,  20, 0.42)',
      '--glass-bg':      'rgba(18,  10,  8,  0.54)',
      '--glass-border':  'rgba(255,158,100, 0.14)',
      '--glass-shadow':  'rgba(14,  2,   0,  0.40)',
      '--accent':        '#ff9e64',
      '--accent2':       '#a9dc76',
      '--red':           '#f7768e',
      '--yellow':        '#ffd700',
      '--text':          '#e8d5c8',
      '--text-muted':    '#7a5548',
      '--ticker-accent': '#ff9e64',
    },
  },

  arctic: {
    label: 'Arctic',
    description: 'Cold silver with glacial blue',
    swatch: ['#080c12', '#0d1520', '#89b4fa', '#b4befe'],
    vars: {
      '--bg-start':      '#080c12',
      '--bg-end':        '#0c1520',
      '--blob-1':        'rgba(137,180,250, 0.22)',
      '--blob-2':        'rgba(180,190,254, 0.18)',
      '--blob-3':        'rgba(30,  50, 110, 0.38)',
      '--glass-bg':      'rgba(8,  12,  20,  0.56)',
      '--glass-border':  'rgba(180,190,254, 0.12)',
      '--glass-shadow':  'rgba(0,   4,  16,  0.40)',
      '--accent':        '#89b4fa',
      '--accent2':       '#a6e3a1',
      '--red':           '#f38ba8',
      '--yellow':        '#f9e2af',
      '--text':          '#cdd6f4',
      '--text-muted':    '#585b70',
      '--ticker-accent': '#b4befe',
    },
  },

  rosegold: {
    label: 'Rose Gold',
    description: 'Warm rose with gilded shimmer',
    swatch: ['#12080e', '#200c16', '#f5a8b8', '#d4956a'],
    vars: {
      '--bg-start':      '#12080e',
      '--bg-end':        '#1c0c18',
      '--blob-1':        'rgba(245,168,184, 0.26)',
      '--blob-2':        'rgba(212,149,106, 0.20)',
      '--blob-3':        'rgba(100, 30,  55, 0.40)',
      '--glass-bg':      'rgba(18,  8,   14,  0.54)',
      '--glass-border':  'rgba(245,168,184, 0.14)',
      '--glass-shadow':  'rgba(14,  0,   8,  0.40)',
      '--accent':        '#f5a8b8',
      '--accent2':       '#a6e3a1',
      '--red':           '#f2cdcd',
      '--yellow':        '#f9e2af',
      '--text':          '#f2cdcd',
      '--text-muted':    '#7a5568',
      '--ticker-accent': '#d4956a',
    },
  },

  forest: {
    label: 'Forest',
    description: 'Deep woodland with emerald glow',
    swatch: ['#060e08', '#0b1a0d', '#40bf80', '#26a65b'],
    vars: {
      '--bg-start':      '#060e08',
      '--bg-end':        '#0a1a0e',
      '--blob-1':        'rgba(64, 191,128, 0.22)',
      '--blob-2':        'rgba(38, 166, 91,  0.18)',
      '--blob-3':        'rgba(15,  60,  25,  0.48)',
      '--glass-bg':      'rgba(6,  14,  8,   0.54)',
      '--glass-border':  'rgba(64, 191,128, 0.14)',
      '--glass-shadow':  'rgba(0,  8,   2,   0.40)',
      '--accent':        '#40bf80',
      '--accent2':       '#73daca',
      '--red':           '#f7768e',
      '--yellow':        '#e0af68',
      '--text':          '#d4e8d8',
      '--text-muted':    '#4a7555',
      '--ticker-accent': '#40bf80',
    },
  },
};

const THEME_KEY = 'officeDisplayTheme';

function applyTheme(themeId) {
  const theme = window.OFFICE_THEMES[themeId] || window.OFFICE_THEMES.midnight;
  const root  = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  document.body.dataset.theme = themeId;
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'midnight';
  applyTheme(saved);
  return saved;
}

function saveTheme(themeId) {
  localStorage.setItem(THEME_KEY, themeId);
  applyTheme(themeId);
}

window.applyTheme = applyTheme;
window.loadTheme  = loadTheme;
window.saveTheme  = saveTheme;
window.THEME_KEY  = THEME_KEY;

// Self-initialize: apply the saved theme as soon as this script executes,
// so there is never a flash of the default CSS variables on any page.
loadTheme();
