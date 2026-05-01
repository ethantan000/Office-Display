# Office Display Dashboard

A self-contained office TV dashboard inspired by [Anthias (Screenly OSE)](https://github.com/Screenly/Anthias).
No server or build step required — open `index.html` in a browser (or use the kiosk launcher).

---

## What it shows

### Dashboard slide (always included)
| Widget | Description |
|--------|-------------|
| **Clock & Date** | Live clock (12 or 24h), full date |
| **Weather** | Current conditions + 4-day forecast |
| **Calendar** | Current month with today highlighted |
| **Stocks** | Live prices with % change |
| **Message of the Day** | Rotating quote (custom or auto-fetched) |
| **Bottom Ticker** | Scrolling stock prices that alternate with news headlines |

### Playlist (Anthias-inspired)
Add any number of additional slides alongside the dashboard — they cycle automatically:

| Asset type | Description |
|-----------|-------------|
| **Dashboard** | The info-widget screen above |
| **Image** | Full-screen image (URL or uploaded file) |
| **Video** | Full-screen video (URL or uploaded file); auto-advances when done |
| **Web Page / URL** | Full-screen iframe embed of any URL |

Each asset supports:
- **Per-asset duration** — how long it stays on screen before advancing
- **Date range scheduling** — start/end dates (e.g. show a promo only this week)
- **Days-of-week filtering** — e.g. only weekdays, or only weekends
- **Time-of-day window** — e.g. only 09:00–17:00
- **Enable/disable toggle** — skip an asset without deleting it

---

## Quick Start

### 1. Get API keys (free tiers are fine)

| Service | URL | Used for |
|---------|-----|---------|
| OpenWeatherMap | https://openweathermap.org/api | Weather |
| Finnhub | https://finnhub.io | Stock prices |
| NewsAPI | https://newsapi.org | Headlines |

### 2. Edit `config.js`

```js
window.OFFICE_CONFIG = {
  companyName: "Acme Corp",
  logoUrl: "logo.png",          // put your logo in this folder
  weatherApiKey: "YOUR_KEY",
  weatherLocation: "Chicago",
  stocksApiKey: "YOUR_KEY",
  stockSymbols: ["AAPL", "MSFT", "SPY"],
  newsApiKey: "YOUR_KEY",
  defaultSlideDuration: 30,     // seconds per slide
  // ...
};
```

### 3. Run it

**Option A — No server needed (simplest):**
```bash
open index.html       # macOS
xdg-open index.html   # Linux
```
> Note: NewsAPI requires a local server (CORS). See Option B.

**Option B — Local HTTP server (recommended):**
```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

**Option C — Auto-launch on boot:**
```bash
chmod +x launch-kiosk.sh && ./launch-kiosk.sh
```

---

## Playlist Manager (Admin UI)

Open `admin.html` in your browser, or press **`A`** while the display is running.

### Adding a slide

1. Click **+ Add Asset**
2. Choose a type: Dashboard, Image, Video, or Web Page
3. Paste a URL or upload a file (images/video are stored as data URLs in the browser)
4. Set the duration and optional schedule
5. Click **Save Asset**

### Scheduling an asset

In the Add/Edit modal, use the **Schedule** section:

- **Start / End Date** — leave blank to run indefinitely
- **Days of Week** — click day buttons to toggle; all selected = every day
- **Start / End Time** — restrict to office hours, lunch time, etc.

Example: show a "Happy Hour" slide only on Fridays from 17:00–18:00:
- Days of Week: `Fri` only
- Start Time: `17:00`, End Time: `18:00`

### Reordering

Drag rows by the `⠿` handle, or use the `▲`/`▼` buttons.

### Keyboard shortcuts (on the viewer)

| Key | Action |
|-----|--------|
| `A` | Open playlist manager |
| `→` or `Space` | Skip to next slide |
| `F` | Toggle fullscreen |

---

## Kiosk Mode (TV Setup)

```bash
chmod +x launch-kiosk.sh
./launch-kiosk.sh
```

Starts a local HTTP server and opens Chromium in full kiosk mode (no address bar, no cursor, no sleep). Works on Raspberry Pi or any spare Linux/Windows PC.

**To run on boot (Raspberry Pi):**
```bash
echo "@/home/pi/office-display/launch-kiosk.sh" >> ~/.config/lxsession/LXDE-pi/autostart
```

---

## File Structure

```
index.html        — Viewer / display page
admin.html        — Playlist manager UI
config.js         — All configuration (edit this)
app.js            — Viewer logic (clock, weather, stocks, news, playlist engine)
admin.js          — Playlist manager logic
styles.css        — All styling (viewer + admin)
launch-kiosk.sh   — Kiosk launcher script
```

---

## Architecture notes

The playlist is stored in **browser localStorage** under the key `officeDisplayPlaylist` as a JSON array.
The viewer re-reads localStorage every 30 seconds, so changes made in the admin page apply to a running
display without a manual page reload.

For images and videos uploaded via the admin UI, the file is converted to a base64 data URL and stored
in localStorage. Browser localStorage is typically limited to ~5 MB; for larger media use external URLs.
