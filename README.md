# sleep cycles

Sleepytime-style sleep cycle calculator. Pick when you want to go to bed or wake up and it suggests times aligned to 90-minute sleep cycles, so your alarm lands between cycles instead of mid–deep sleep. Dependency-free PWA: pure HTML/CSS/JS.

## Features

- **Two modes** — "go to bed at" (when will I wake well?) and "wake up at" (when should I sleep?), each with its own accent color
- **Sleep now** — one tap to calculate wake times from the current moment
- **6 suggestions per calculation**, rated (😊 😐 ☹️) against the recommended sleep range for your age
- **Settings** — age range, time to fall asleep (latency), 24-hour (default) or 12-hour AM/PM format
- **Night-sky design** — CSS-only stars, shooting star, and layered mountain silhouettes; no images fetched
- 📱 Installable on Android & iOS, works offline after first load
- 💾 Remembers mode, times, and settings in localStorage

## Files

- `index.html` — markup, PWA metadata, dialogs (settings, "How does it work?")
- `styles.css` — mobile-first styling; mountains are inline SVG data-URIs, so they cache with the CSS
- `script.js` — calculator logic, custom hh:mm input, persistence, service-worker registration
- `manifest.json` — PWA configuration (install, "Sleep now" shortcut)
- `service-worker.js` — offline cache (bump `CACHE_NAME` when assets change)
- `faces/` — SVG source for the rating faces (inlined into `script.js` at runtime; kept as design source)

## Develop / test locally

```bash
python -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`. To install on a phone: Android menu → "Install app"; iOS Share → "Add to Home Screen".

## Deploy

PWA features (service worker, install) require HTTPS — GitHub Pages, Netlify, Vercel, or self-hosted with Let's Encrypt all work. If serving with Apache, `.htaccess` sets the correct MIME type for `favicon.ico`.

When you change `index.html`, `styles.css`, or `script.js`, bump `CACHE_NAME` in `service-worker.js` so installed clients pick up the new version.
