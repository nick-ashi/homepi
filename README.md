# homepi

A swipeable, always-on display app for a Raspberry Pi 5 behind a touchscreen frame: Spotify now-playing, weather + local photos, and more pages to come.

## Structure

- `frontend/` — Vite + React + TypeScript. Swipeable full-screen pages (Embla carousel).
- `backend/` — Express + TypeScript. Holds API keys/tokens; the frontend never talks to third-party APIs directly.

## Running locally (Mac)

```bash
cd backend && cp .env.example .env   # fill in Spotify credentials, photo dir, lat/lon
npm install
npm run dev                          # http://localhost:3001

cd ../frontend && cp .env.example .env
npm install
npm run dev                          # http://localhost:5173
```

First-time Spotify setup: visit `http://localhost:3001/api/spotify/login` once in a browser, log in, and the backend stores a refresh token on disk (`backend/data/spotify-tokens.json`, gitignored) so it never needs to happen again.

## Deploying to the Pi

Not yet set up — kiosk mode (full-screen Chromium, auto-start on boot), nightly reload, crash recovery, and screen dimming are still TODO. See project notes for constraints (port conflicts with Pi-hole, SD card write wear, thermal considerations).

## Open questions

- Exact touchscreen resolution (currently designed responsively, no fixed breakpoint assumed)
- Additional pages beyond Spotify + widgets (calendar, Pi-hole stats, transit, clock?)
