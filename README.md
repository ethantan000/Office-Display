# Office Display Dashboard

A self-contained office TV dashboard. No server required — open `index.html` in a browser.

## What it shows

| Widget | Description |
|--------|-------------|
| **Clock & Date** | Live clock (12 or 24h), full date |
| **Weather** | Current conditions + 4-day forecast |
| **Calendar** | Current month with today highlighted |
| **Stocks** | Live prices with % change |
| **Message of the Day** | Rotating quote (custom or auto-fetched) |
| **Bottom Ticker** | Scrolling stock prices that alternate with news headlines |

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
  // ...
};
```

### 3. Run it

**Option A — No server needed (simplest):**
```bash
# Double-click index.html, or:
open index.html       # macOS
xdg-open index.html   # Linux
```

> Note: NewsAPI requires a local server (CORS) in production. See Option B.

**Option B — Local HTTP server (recommended for all features):**
```bash
# Python 3 (built-in):
python3 -m http.server 8080
# Then open: http://localhost:8080

# Node.js (if installed):
npx serve .
```

**Option C — Auto-launch on boot (Raspberry Pi / spare PC):**

See `launch-kiosk.sh` for a ready-made kiosk launcher.

---

## Kiosk Mode (TV Setup)

Run the dashboard full-screen on boot using Chromium:

```bash
# Make launcher executable
chmod +x launch-kiosk.sh

# Test it
./launch-kiosk.sh

# To run on boot, add to /etc/xdg/autostart/ or crontab @reboot
```

The script starts a local HTTP server and opens Chromium in kiosk mode (no address bar, no cursor, no sleep).

---

## Customization

### Company Logo
Drop your logo image into this folder and set `logoUrl: "logo.png"` in `config.js`.

### Custom Messages
Set `useCustomMessages: true` and fill in the `customMessages` array in `config.js`.

### Stock Symbols
Edit `stockSymbols` in `config.js`. Supports any symbol Finnhub knows (US equities, ETFs, crypto pairs like `BINANCE:BTCUSDT`).

### Colors / Layout
Edit `styles.css`. The `:root` block at the top has all color variables.

---

## Running on a Raspberry Pi

1. Install Raspberry Pi OS Lite + desktop
2. Clone this repo: `git clone <url> ~/office-display`
3. Install Chromium: `sudo apt install chromium-browser`
4. `chmod +x ~/office-display/launch-kiosk.sh`
5. Add to autostart: `echo "@/home/pi/office-display/launch-kiosk.sh" >> ~/.config/lxsession/LXDE-pi/autostart`

---

## Files

```
index.html        — Main dashboard page
config.js         — All configuration (edit this)
app.js            — All logic (clock, weather, stocks, news, calendar)
styles.css        — All styling
launch-kiosk.sh   — Kiosk mode launcher script
```
