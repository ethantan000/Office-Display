#!/usr/bin/env bash
# ============================================================
#  launch-kiosk.sh — Start the Office Display in kiosk mode
#
#  Usage:
#    chmod +x launch-kiosk.sh
#    ./launch-kiosk.sh
#
#  To run on boot (Raspberry Pi / Linux):
#    Add this line to ~/.config/lxsession/LXDE-pi/autostart:
#      @/path/to/office-display/launch-kiosk.sh
#
#    Or add to crontab:
#      @reboot /path/to/office-display/launch-kiosk.sh
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8765

# ── Disable screen blanking / screensaver ────────────────────
xset s off     2>/dev/null || true
xset s noblank 2>/dev/null || true
xset -dpms     2>/dev/null || true

# ── Start a local HTTP server ────────────────────────────────
# Needed for NewsAPI CORS. Uses Python 3 if available, else Node.
if command -v python3 &>/dev/null; then
  cd "$SCRIPT_DIR"
  python3 -m http.server "$PORT" &>/dev/null &
  SERVER_PID=$!
elif command -v npx &>/dev/null; then
  npx serve "$SCRIPT_DIR" -l "$PORT" &>/dev/null &
  SERVER_PID=$!
else
  echo "Warning: No HTTP server found. Install Python 3 or Node.js."
  # Fall back to file:// URL (NewsAPI won't work but everything else will)
  DIRECT_FILE=true
fi

# Give the server a moment to start
sleep 2

# ── Launch browser in kiosk mode ────────────────────────────
URL="${DIRECT_FILE:+file://$SCRIPT_DIR/index.html}"
URL="${URL:-http://localhost:$PORT}"

# Try Chromium variants in order of preference
for BROWSER in chromium-browser chromium google-chrome google-chrome-stable; do
  if command -v "$BROWSER" &>/dev/null; then
    "$BROWSER" \
      --kiosk \
      --noerrdialogs \
      --disable-infobars \
      --disable-session-crashed-bubble \
      --disable-restore-session-state \
      --disable-translate \
      --no-first-run \
      --start-fullscreen \
      --window-position=0,0 \
      --app="$URL" \
      &
    break
  fi
done

# ── Wait for browser to exit, then clean up server ──────────
wait
[ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
