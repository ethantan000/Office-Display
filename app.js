// ============================================================
//  OFFICE DISPLAY — MAIN APPLICATION
// ============================================================

const CFG = window.OFFICE_CONFIG;

// ── Settings ─────────────────────────────────────────────────
// localStorage overrides values from config.js at runtime.
// The admin UI writes to this key; the viewer re-reads it.

const SETTINGS_KEY = 'officeDisplaySettings';

function getSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    // Deep-merge saved values over config.js defaults
    return Object.assign({}, CFG, saved);
  } catch {
    return Object.assign({}, CFG);
  }
}

// Apply overrides onto CFG in-place so all existing widget code uses CFG
function applySettings() {
  const s = getSettings();
  Object.keys(s).forEach(k => { CFG[k] = s[k]; });
}
applySettings();

// Live-update theme when admin changes it in another tab/window
window.addEventListener('storage', e => {
  if (e.key === window.THEME_KEY) loadTheme();
  if (e.key === SETTINGS_KEY) {
    // Brief overlay, then reload to pick up all setting changes
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);font-size:1.4rem;color:rgba(255,255,255,0.85);letter-spacing:0.06em;';
    overlay.textContent = '⚙  Applying new settings…';
    document.body.appendChild(overlay);
    setTimeout(() => location.reload(), 1800);
  }
});

// ── Helpers ──────────────────────────────────────────────────

function $(id) { return document.getElementById(id); }

function pad(n) { return String(n).padStart(2, '0'); }

function directionArrow(change) {
  if (change > 0) return '▲';
  if (change < 0) return '▼';
  return '—';
}

function changeClass(change) {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'flat';
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ── Clock & Date ─────────────────────────────────────────────

function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  let suffix = '';

  if (CFG.clockFormat === 12) {
    suffix = h >= 12 ? ' PM' : ' AM';
    h = h % 12 || 12;
  } else {
    h = pad(h);
  }

  $('clock').textContent = `${h}:${m}:${s}${suffix}`;
  $('date').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

setInterval(updateClock, 1000);
updateClock();

// ── Branding ─────────────────────────────────────────────────

$('company-name').textContent = CFG.companyName;
if (CFG.logoUrl) {
  const logo = $('company-logo');
  logo.src = CFG.logoUrl;
  logo.style.display = 'block';
}

// ── Calendar ─────────────────────────────────────────────────

function buildCalendar() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const container = $('calendar-container');
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'cal-header';
  header.textContent = monthName;
  container.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => {
    const dn = document.createElement('div');
    dn.className = 'day-name';
    dn.textContent = d;
    grid.appendChild(dn);
  });

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day empty';
    grid.appendChild(blank);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    const dow = (firstDay + d - 1) % 7;
    if (d === today)                   cell.classList.add('today');
    else if (dow === 0 || dow === 6)   cell.classList.add('weekend');
    cell.textContent = d;
    grid.appendChild(cell);
  }

  container.appendChild(grid);
}

buildCalendar();

(function scheduleMidnight() {
  const now = new Date();
  const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  setTimeout(() => { buildCalendar(); scheduleMidnight(); }, msUntilMidnight);
})();

// ── Weather ──────────────────────────────────────────────────

const WEATHER_ICONS = {
  '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅',
  '03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️',
  '09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌧️',
  '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️','50d':'🌫️','50n':'🌫️',
};

async function fetchWeather() {
  const key = CFG.weatherApiKey;
  if (!key) { showWeatherDemo(); return; }

  const loc   = CFG.weatherLocation;
  const units = CFG.weatherUnits;
  const unitLabel = units === 'metric' ? '°C' : '°F';
  const windLabel = units === 'metric' ? 'km/h' : 'mph';
  const q = encodeURIComponent(loc);

  try {
    const [curr, fore] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${key}&units=${units}`).then(r => r.json()),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=${key}&units=${units}&cnt=40`).then(r => r.json()),
    ]);

    if (curr.cod !== 200) throw new Error(curr.message || 'Weather error');

    $('weather-icon').textContent = WEATHER_ICONS[curr.weather[0].icon] || '🌡️';
    $('weather-temp').textContent = `${Math.round(curr.main.temp)}${unitLabel}`;
    $('weather-desc').textContent = curr.weather[0].description;
    $('weather-location').textContent = `${curr.name}, ${curr.sys.country}`;
    $('weather-humidity').textContent = `${curr.main.humidity}%`;
    $('weather-wind').textContent = `${Math.round(curr.wind.speed)} ${windLabel}`;

    if (fore.cod === '200') {
      const days = {};
      fore.list.forEach(item => {
        const d = item.dt_txt.slice(0, 10);
        const today = new Date().toISOString().slice(0, 10);
        if (d === today) return;
        if (!days[d]) days[d] = [];
        days[d].push(item);
      });

      const foreEl = $('weather-forecast');
      foreEl.innerHTML = '';

      Object.entries(days).slice(0, 4).forEach(([date, items]) => {
        const noon = items.find(i => i.dt_txt.includes('12:00')) || items[Math.floor(items.length / 2)];
        const hi   = Math.round(Math.max(...items.map(i => i.main.temp_max)));
        const lo   = Math.round(Math.min(...items.map(i => i.main.temp_min)));
        const label = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });

        const fc = document.createElement('div');
        fc.className = 'forecast-day';
        fc.innerHTML = `
          <div class="f-label">${label}</div>
          <div class="f-icon">${WEATHER_ICONS[noon.weather[0].icon] || '🌡️'}</div>
          <div class="f-hi">${hi}${unitLabel}</div>
          <div class="f-lo">${lo}${unitLabel}</div>
        `;
        foreEl.appendChild(fc);
      });
    }
  } catch (e) {
    $('weather-desc').textContent = 'Unable to load weather';
    $('weather-desc').className = 'weather-desc error';
    console.error('Weather error:', e);
  }
}

function showWeatherDemo() {
  $('weather-icon').textContent = '☀️';
  $('weather-temp').textContent = '72°F';
  $('weather-desc').textContent = 'Set weatherApiKey in config.js';
  $('weather-location').textContent = 'Demo Mode';
  $('weather-humidity').textContent = '45%';
  $('weather-wind').textContent = '8 mph';

  const foreEl = $('weather-forecast');
  foreEl.innerHTML = '';
  ['Mon','Tue','Wed','Thu'].forEach((d, i) => {
    const icons = ['⛅','🌧️','☀️','☁️'];
    const fc = document.createElement('div');
    fc.className = 'forecast-day';
    fc.innerHTML = `
      <div class="f-label">${d}</div>
      <div class="f-icon">${icons[i]}</div>
      <div class="f-hi">${68 + i * 2}°F</div>
      <div class="f-lo">${55 + i}°F</div>
    `;
    foreEl.appendChild(fc);
  });
}

fetchWeather();
setInterval(fetchWeather, CFG.weatherRefreshMinutes * 60 * 1000);

// ── Stocks ───────────────────────────────────────────────────

let stockData = {};

async function fetchStocks() {
  const key     = CFG.stocksApiKey;
  const symbols = CFG.stockSymbols;

  if (!key) { showStocksDemo(); return; }

  const results = await Promise.allSettled(
    symbols.map(sym =>
      fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`)
        .then(r => r.json())
        .then(data => ({ sym, price: data.c, change: data.d, changePct: data.dp }))
    )
  );

  results.forEach(r => {
    if (r.status === 'fulfilled') stockData[r.value.sym] = r.value;
  });

  renderStocks();
  renderBottomTicker();
}

function renderStocks() {
  const container = $('stocks-container');
  container.innerHTML = '';

  CFG.stockSymbols.forEach(sym => {
    const d   = stockData[sym];
    const row = document.createElement('div');
    row.className = 'stock-row';

    if (!d) {
      row.innerHTML = `<span class="stock-symbol">${sym}</span><span class="loading">—</span>`;
    } else {
      const cls = changeClass(d.change);
      const arrow = directionArrow(d.change);
      row.innerHTML = `
        <span class="stock-symbol">${sym}</span>
        <span class="stock-price">$${d.price.toFixed(2)}</span>
        <span class="stock-change ${cls}">${arrow} ${Math.abs(d.changePct).toFixed(2)}%</span>
      `;
    }
    container.appendChild(row);
  });
}

function renderBottomTicker() {
  const ticker = $('bottom-ticker');
  ticker.innerHTML = '';

  CFG.stockSymbols.forEach(sym => {
    const d    = stockData[sym];
    const item = document.createElement('span');
    item.className = 'ticker-item';

    if (!d) {
      item.innerHTML = `<span class="ticker-sym">${sym}</span><span class="ticker-price">—</span>`;
    } else {
      const cls   = changeClass(d.change);
      const arrow = directionArrow(d.change);
      item.innerHTML = `
        <span class="ticker-sym">${sym}</span>
        <span class="ticker-price">$${d.price.toFixed(2)}</span>
        <span class="ticker-chg ${cls}">${arrow} ${Math.abs(d.changePct).toFixed(2)}%</span>
      `;
    }
    ticker.appendChild(item);
  });

  ticker.style.animation = 'none';
  ticker.offsetHeight;
  ticker.style.animation = '';
}

function showStocksDemo() {
  const demos = [
    { sym: 'AAPL',  price: 189.30, change: 2.14,  changePct: 1.14  },
    { sym: 'MSFT',  price: 415.00, change: -1.22, changePct: -0.29 },
    { sym: 'GOOGL', price: 175.50, change: 0.95,  changePct: 0.54  },
    { sym: 'AMZN',  price: 198.75, change: 3.40,  changePct: 1.74  },
    { sym: 'TSLA',  price: 172.00, change: -5.60, changePct: -3.15 },
    { sym: 'SPY',   price: 524.00, change: 1.80,  changePct: 0.34  },
  ];
  demos.forEach(d => { stockData[d.sym] = d; });
  renderStocks();
  renderBottomTicker();
}

fetchStocks();
setInterval(fetchStocks, CFG.stocksRefreshSeconds * 1000);

// ── Daily Message ─────────────────────────────────────────────
//
//  Sources:
//    quotes  — fresh quote from quotable.io each day
//    tips    — built-in workplace productivity tips, one per day
//    facts   — built-in fun facts, one per day
//    custom  — user-defined list from admin settings, one per day

const TIPS_LIST = [
  { text: "The two-minute rule: if a task takes less than two minutes, do it right now.", author: "David Allen" },
  { text: "Start each morning by identifying your three most important tasks for the day.", author: "Productivity Tip" },
  { text: "Batch similar tasks together to reduce context-switching and mental load.", author: "Productivity Tip" },
  { text: "Leave buffer time between meetings to process notes and recharge your focus.", author: "Productivity Tip" },
  { text: "Use the Pomodoro technique: 25 minutes of focused work, then a 5-minute break.", author: "Francesco Cirillo" },
  { text: "A tidy desk leads to a tidy mind — spend five minutes clearing up before you leave.", author: "Productivity Tip" },
  { text: "Saying no gracefully protects your time for the things that matter most.", author: "Productivity Tip" },
  { text: "Over-communicate progress on projects — silence creates uncertainty for everyone.", author: "Productivity Tip" },
  { text: "A weekly 15-minute review on Fridays helps you close loops and plan ahead.", author: "Productivity Tip" },
  { text: "Standing meetings tend to be shorter, more focused, and more energizing.", author: "Productivity Tip" },
  { text: "Writing things down externalizes your memory and frees mental bandwidth for thinking.", author: "Productivity Tip" },
  { text: "Distinguish between urgent and important — not everything urgent is truly important.", author: "Dwight D. Eisenhower" },
  { text: "Celebrate small wins with your team. Recognition fuels sustained motivation.", author: "Productivity Tip" },
  { text: "Async first: ask yourself if this meeting could be a shared doc or a quick message.", author: "Productivity Tip" },
  { text: "Deep work requires protecting large, uninterrupted blocks of time. Guard them fiercely.", author: "Cal Newport" },
];

const FACTS_LIST = [
  { text: "A group of flamingos is called a 'flamboyance'.", author: "Fun Fact" },
  { text: "Honey never spoils — edible honey has been found in 3,000-year-old Egyptian tombs.", author: "Fun Fact" },
  { text: "The average person walks about 100,000 miles in their lifetime — four laps around the Earth.", author: "Fun Fact" },
  { text: "Octopuses have three hearts, blue blood, and can edit their own RNA.", author: "Fun Fact" },
  { text: "The shortest war in recorded history lasted between 38 and 45 minutes (Anglo-Zanzibar War, 1896).", author: "Fun Fact" },
  { text: "A day on Venus is longer than a year on Venus — it rotates extremely slowly.", author: "Fun Fact" },
  { text: "There are more possible chess games than there are atoms in the observable universe.", author: "Fun Fact" },
  { text: "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.", author: "Fun Fact" },
  { text: "Crows can recognize individual human faces and remember people who have wronged them for years.", author: "Fun Fact" },
  { text: "Bananas are berries by botanical definition, but strawberries are not.", author: "Fun Fact" },
  { text: "A bolt of lightning is about five times hotter than the surface of the sun.", author: "Fun Fact" },
  { text: "The human nose can detect over one trillion different scents.", author: "Fun Fact" },
  { text: "Nintendo was founded in 1889 — as a playing card company.", author: "Fun Fact" },
  { text: "Wombats produce cube-shaped droppings — the only known animal to do so.", author: "Fun Fact" },
  { text: "The dot above a lowercase 'i' and 'j' is called a tittle.", author: "Fun Fact" },
];

// Returns an index that stays stable for the entire day, then advances
function getDailyIndex(list) {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day   = Math.floor((now - start) / 86_400_000);
  return day % list.length;
}

async function fetchMessage() {
  const src = CFG.messageSource || 'quotes';

  if (src === 'tips') {
    const m = TIPS_LIST[getDailyIndex(TIPS_LIST)];
    $('daily-message').textContent = `"${m.text}"`;
    $('daily-author').textContent   = `— ${m.author}`;
    return;
  }

  if (src === 'facts') {
    const m = FACTS_LIST[getDailyIndex(FACTS_LIST)];
    $('daily-message').textContent = `"${m.text}"`;
    $('daily-author').textContent   = `— ${m.author}`;
    return;
  }

  if (src === 'custom') {
    const msgs = CFG.customMessages;
    if (msgs && msgs.length) {
      const m = msgs[getDailyIndex(msgs)];
      $('daily-message').textContent = `"${m.text}"`;
      $('daily-author').textContent  = m.author ? `— ${m.author}` : '';
    } else {
      $('daily-message').textContent = '"Add custom messages in the playlist manager."';
      $('daily-author').textContent  = '';
    }
    return;
  }

  // Default: quotes from quotable.io
  try {
    const data = await fetch('https://api.quotable.io/random?maxLength=160').then(r => r.json());
    $('daily-message').textContent = `"${data.content}"`;
    $('daily-author').textContent   = `— ${data.author}`;
  } catch {
    // Fallback to tips on API failure
    const m = TIPS_LIST[getDailyIndex(TIPS_LIST)];
    $('daily-message').textContent = `"${m.text}"`;
    $('daily-author').textContent   = `— ${m.author}`;
  }
}

fetchMessage();
// Refresh at midnight so the daily message advances
(function scheduleDailyMessage() {
  const now = new Date();
  const msTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
  setTimeout(() => { fetchMessage(); scheduleDailyMessage(); }, msTillMidnight);
})();

// ── News ──────────────────────────────────────────────────────

let newsHeadlines = [];
let newsIndex     = 0;

async function fetchNews() {
  const key = CFG.newsApiKey;
  if (!key) {
    newsHeadlines = [
      'Set newsApiKey in config.js to display live headlines',
      'Get a free API key at newsapi.org',
      'Configure your office display at config.js',
    ];
    return;
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=${CFG.newsCountry}&category=${CFG.newsCategory}&pageSize=${CFG.newsCount}&apiKey=${key}`;
    const data = await fetch(url).then(r => r.json());
    if (data.status === 'ok' && data.articles.length) {
      newsHeadlines = data.articles.map(a => a.title).filter(Boolean);
    }
  } catch (e) {
    console.error('News error:', e);
  }
}

function startNewsCycle() {
  if (!newsHeadlines.length) return;

  const label  = document.querySelector('.ticker-label');
  const ticker = $('bottom-ticker');
  let isNews = false;

  setInterval(() => {
    isNews = !isNews;
    if (isNews && newsHeadlines.length) {
      label.textContent = 'NEWS';
      label.style.background = '#d29922';
      ticker.innerHTML = '';
      const item = document.createElement('span');
      item.className = 'ticker-item';
      item.style.fontSize = '1rem';
      item.textContent = newsHeadlines[newsIndex % newsHeadlines.length];
      newsIndex++;
      ticker.appendChild(item);
      ticker.style.animation = 'none';
      ticker.offsetHeight;
      ticker.style.animationDuration = '22s';
      ticker.style.animation = '';
    } else {
      label.textContent = 'STOCKS';
      label.style.background = '';
      renderBottomTicker();
    }
  }, 20000);
}

(async () => {
  await fetchNews();
  startNewsCycle();
  setInterval(fetchNews, CFG.newsRefreshMinutes * 60 * 1000);
})();

// ── Admin shortcut hint ───────────────────────────────────────

(function showAdminHint() {
  const hint = $('admin-hint');
  setTimeout(() => hint.classList.add('visible'), 500);
  setTimeout(() => hint.classList.remove('visible'), 4000);
})();

// ============================================================
//  YOUTUBE MUSIC PLAYER
//
//  Loads the YouTube IFrame API, creates a hidden player, and
//  surfaces custom glass controls in the #music-player widget.
//  The player persists across slide transitions.
// ============================================================

let ytPlayer     = null;
let ytApiReady   = false;
let ytPendingUrl = null;

// Called by YouTube IFrame API when the script loads
window.onYouTubeIframeAPIReady = function () {
  ytApiReady = true;
  if (ytPendingUrl) {
    createYTPlayer(ytPendingUrl, CFG.musicVolume ?? 60);
    ytPendingUrl = null;
  }
};

function loadYouTubeAPI() {
  if (document.getElementById('yt-api-script')) return;
  const s   = document.createElement('script');
  s.id      = 'yt-api-script';
  s.src     = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(s);
}

function parseYouTubeUrl(url) {
  try {
    const u = new URL(url);
    let videoId = null, listId = null;
    if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v');
      listId  = u.searchParams.get('list');
      if (u.pathname === '/playlist') videoId = null;
    } else if (u.hostname === 'youtu.be') {
      videoId = u.pathname.replace('/', '');
      listId  = u.searchParams.get('list');
    }
    return (videoId || listId) ? { videoId, listId } : null;
  } catch {
    return null;
  }
}

function createYTPlayer(url, volume) {
  const parsed = parseYouTubeUrl(url);
  if (!parsed) return;

  // Destroy old player and re-create the container div
  if (ytPlayer) { try { ytPlayer.destroy(); } catch {} ytPlayer = null; }
  const container = $('yt-player-container');
  container.innerHTML = '<div id="yt-player"></div>';

  const playerVars = {
    autoplay:       1,
    controls:       0,
    modestbranding: 1,
    playsinline:    1,
    rel:            0,
    origin:         location.origin,
  };

  if (parsed.listId) {
    playerVars.listType = 'playlist';
    playerVars.list     = parsed.listId;
  }

  ytPlayer = new YT.Player('yt-player', {
    width:   '2',
    height:  '2',
    videoId: parsed.videoId || '',
    playerVars,
    events: {
      onReady(e) {
        e.target.setVolume(volume ?? 60);
        e.target.playVideo();
        // If only a playlist ID was provided, use loadPlaylist for reliability
        if (parsed.listId && !parsed.videoId) {
          e.target.loadPlaylist({ listType: 'playlist', list: parsed.listId });
        }
        updateMusicUI();
      },
      onStateChange: updateMusicUI,
      onError(e) { console.warn('YouTube player error code:', e.data); },
    },
  });
}

function updateMusicUI() {
  const player = $('music-player');
  if (!player) return;

  if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;

  const state     = ytPlayer.getPlayerState();
  const isPlaying = state === 1; // YT.PlayerState.PLAYING
  const isReady   = state !== -1 && state !== undefined;

  const playBtn = $('music-play-btn');
  if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';

  if (isReady) {
    try {
      const data = ytPlayer.getVideoData();
      if (data && data.title) {
        $('music-title').textContent = data.title;
      }
    } catch {}
  }
}

function initMusicPlayer() {
  const s = getSettings();
  const player = $('music-player');
  if (!player) return;

  if (!s.musicEnabled || !s.musicUrl) {
    player.classList.add('hidden');
    return;
  }

  player.classList.remove('hidden');
  $('music-vol').value = String(s.musicVolume ?? 60);

  loadYouTubeAPI();

  if (ytApiReady) {
    createYTPlayer(s.musicUrl, s.musicVolume ?? 60);
  } else {
    ytPendingUrl = s.musicUrl;
  }
}

// Music player controls
document.addEventListener('DOMContentLoaded', () => {
  const playBtn  = $('music-play-btn');
  const prevBtn  = $('music-prev-btn');
  const nextBtn  = $('music-next-btn');
  const volSlider = $('music-vol');

  playBtn?.addEventListener('click', () => {
    if (!ytPlayer) return;
    const state = ytPlayer.getPlayerState();
    state === 1 ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
  });

  prevBtn?.addEventListener('click', () => ytPlayer?.previousVideo?.());
  nextBtn?.addEventListener('click', () => ytPlayer?.nextVideo?.());

  volSlider?.addEventListener('input', () => {
    ytPlayer?.setVolume(parseInt(volSlider.value, 10));
  });
});

initMusicPlayer();

// ============================================================
//  PLAYLIST ENGINE  (Anthias-inspired)
//
//  Reads a playlist from localStorage, filters active assets
//  based on scheduling rules, and cycles through them with a
//  progress-bar countdown. Supports asset types:
//    dashboard — the existing info widgets
//    image     — fullscreen image (URL or data URL)
//    video     — fullscreen video (URL or data URL)
//    url       — fullscreen iframe embed
// ============================================================

const PLAYLIST_KEY = 'officeDisplayPlaylist';

const DEFAULT_PLAYLIST = [
  {
    id: 'default-dashboard',
    name: 'Dashboard',
    type: 'dashboard',
    src: '',
    duration: CFG.defaultSlideDuration,
    enabled: true,
    schedule: null,
  },
];

// ── Playlist persistence ──────────────────────────────────────

function loadPlaylist() {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_PLAYLIST;
}

function savePlaylist(playlist) {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist));
}

// Seed localStorage with the default if nothing is stored yet
if (!localStorage.getItem(PLAYLIST_KEY)) {
  savePlaylist(DEFAULT_PLAYLIST);
}

// ── Schedule filtering ────────────────────────────────────────

function isAssetActive(asset) {
  if (!asset.enabled) return false;
  if (!asset.schedule) return true;

  const now  = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const dow  = now.getDay(); // 0=Sun

  const { startDate, endDate, daysOfWeek, startTime, endTime } = asset.schedule;

  if (startDate && date < startDate) return false;
  if (endDate   && date > endDate)   return false;

  if (daysOfWeek && daysOfWeek.length && !daysOfWeek.includes(dow)) return false;

  if (startTime && endTime) {
    if (startTime <= endTime) {
      if (time < startTime || time > endTime) return false;
    } else {
      // overnight window e.g. 22:00–06:00
      if (time < startTime && time > endTime) return false;
    }
  }

  return true;
}

// ── Viewer ────────────────────────────────────────────────────

const overlay    = $('slide-overlay');
const slideImg   = $('slide-img');
const slideVideo = $('slide-video');
const slideIframe = $('slide-iframe');
const slideBadge = $('slide-name-badge');
const progressBar = $('slide-progress-bar');
const dashboardEls = document.querySelectorAll('.dashboard-only');

let currentIndex  = 0;
let slideTimer    = null;
let progressTimer = null;

function showDashboard() {
  overlay.classList.add('hidden');
  [slideImg, slideVideo, slideIframe].forEach(el => {
    el.classList.add('hidden');
    if (el === slideVideo) el.pause?.();
    if (el === slideIframe) el.src = 'about:blank';
  });
  dashboardEls.forEach(el => el.classList.remove('hidden'));
}

function showOverlay(asset) {
  dashboardEls.forEach(el => el.classList.add('hidden'));
  [slideImg, slideVideo, slideIframe].forEach(el => el.classList.add('hidden'));

  overlay.classList.remove('hidden');
  slideBadge.textContent = asset.name;

  if (asset.type === 'image') {
    slideImg.src = asset.src;
    slideImg.classList.remove('hidden');
  } else if (asset.type === 'video') {
    slideVideo.src = asset.src;
    slideVideo.classList.remove('hidden');
    slideVideo.play().catch(() => {});
  } else if (asset.type === 'url') {
    slideIframe.src = asset.src;
    slideIframe.classList.remove('hidden');
  }
}

function startProgressBar(durationSeconds) {
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
  progressBar.offsetHeight; // reflow
  progressBar.style.transition = `width ${durationSeconds}s linear`;
  progressBar.style.width = '100%';
}

function showAsset(asset) {
  if (asset.type === 'dashboard') {
    showDashboard();
  } else {
    showOverlay(asset);
  }

  // For video with duration=0, advance when the video ends
  if (asset.type === 'video' && asset.duration === 0) {
    slideVideo.onended = () => advance();
    return; // no timer
  }

  const duration = asset.duration > 0 ? asset.duration : CFG.defaultSlideDuration;
  startProgressBar(duration);

  clearTimeout(slideTimer);
  slideTimer = setTimeout(advance, duration * 1000);
}

function advance() {
  clearTimeout(slideTimer);
  const playlist = loadPlaylist();
  const active   = playlist.filter(isAssetActive);

  if (!active.length) {
    // Nothing scheduled — fall back to dashboard
    showDashboard();
    startProgressBar(CFG.defaultSlideDuration);
    slideTimer = setTimeout(advance, CFG.defaultSlideDuration * 1000);
    return;
  }

  currentIndex = currentIndex % active.length;
  const asset  = active[currentIndex];
  currentIndex = (currentIndex + 1) % active.length;

  showAsset(asset);
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  const key = e.key.toUpperCase();
  if (key === 'A') {
    window.location.href = 'admin.html';
  } else if (key === 'ARROWRIGHT' || key === ' ') {
    clearTimeout(slideTimer);
    advance();
  } else if (key === 'F') {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
});

// Re-read playlist every 30 s so admin changes apply without a page reload
setInterval(() => {
  // Only interrupt if the playlist structure has changed
  const playlist = loadPlaylist();
  const active   = playlist.filter(isAssetActive);
  if (active.length && currentIndex >= active.length) {
    currentIndex = 0;
  }
}, 30000);

// Start the playlist
advance();
