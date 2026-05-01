// ============================================================
//  OFFICE DISPLAY — CONFIGURATION
//  Edit this file to customize the dashboard.
// ============================================================

window.OFFICE_CONFIG = {
  // --- Company branding ---
  companyName: "Your Company",
  // Path to your logo image (relative or absolute URL).
  // Leave empty ("") to hide the logo image and show only the name.
  logoUrl: "",

  // --- Weather ---
  // Get a free API key at https://openweathermap.org/api (free tier is sufficient)
  weatherApiKey: "",
  // City name, or "lat,lon" e.g. "40.7128,-74.0060" for New York
  weatherLocation: "New York",
  // "imperial" (°F, mph) or "metric" (°C, km/h)
  weatherUnits: "imperial",
  // How often to refresh weather, in minutes
  weatherRefreshMinutes: 10,

  // --- Stocks ---
  // Get a free key at https://finnhub.io (free tier: 60 req/min)
  stocksApiKey: "",
  // Ticker symbols to display
  stockSymbols: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "SPY"],
  // How often to refresh stock prices, in seconds
  stocksRefreshSeconds: 60,

  // --- News ---
  // Get a free key at https://newsapi.org (free tier: developer use)
  newsApiKey: "",
  // News category: business | technology | general | health | science | sports | entertainment
  newsCategory: "technology",
  // Country code for news: us | gb | ca | au ...
  newsCountry: "us",
  // How many headlines to show
  newsCount: 10,
  // How often to refresh news, in minutes
  newsRefreshMinutes: 30,

  // --- Messages of the Day ---
  // If useCustomMessages is true, cycles through your customMessages list.
  // If false, fetches an inspirational quote from quotable.io (no key needed).
  useCustomMessages: false,
  customMessages: [
    { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
    { text: "Teamwork makes the dream work.", author: "John C. Maxwell" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
  ],

  // --- Display ---
  // Rotate through news headlines every N seconds
  newsRotateSeconds: 8,
  // 12 or 24 hour clock
  clockFormat: 12,
};
