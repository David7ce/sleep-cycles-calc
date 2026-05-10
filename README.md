# sleeptime-clac

Simple, dependency-free Sleep Time Calculator with PWA support.

## Files

- `index.html` - Main HTML with PWA metadata
- `styles.css` - Styling
- `script.js` - Application logic with localStorage persistence
- `manifest.json` - PWA configuration
- `service-worker.js` - Offline support and asset caching
- `icon-*.svg` - App icons for different sizes and purposes

## Features

- 📱 Installable on Android & iOS as a native-like app
- 💾 Works offline after first load
- 🎨 Remembers user preferences (age range, wake time, bedtime, sleep latency)
- ⚡ Zero dependencies - pure HTML/CSS/JavaScript

## Deploy as PWA

### Local Testing
```bash
# Use a local server (Python 3)
python -m http.server 8000

# Or Node.js
npx serve .
```

Then open `http://localhost:8000` on your phone and:
- **Android**: Tap menu → "Install app" or "Add to home screen"
- **iOS**: Tap Share → "Add to Home Screen"

### Server Configuration

Ensure your server serves SVG files with correct MIME type:

**Apache (.htaccess)**
```
AddType image/svg+xml svg svgz
AddEncoding gzip svgz
```

**Nginx**
```
types {
  image/svg+xml svg svgz;
}
gzip_types image/svg+xml;
```

**Node.js/Express**
```javascript
app.use(express.static('.', {
  setHeaders: (res, path) => {
    if (path.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
  }
}));
```

### HTTPS Required

PWA features (Service Worker, app installation) require HTTPS in production. Use:
- [Netlify](https://netlify.com) (free, automatic HTTPS)
- [Vercel](https://vercel.com) (free, automatic HTTPS)
- [GitHub Pages](https://pages.github.com) (free HTTPS)
- Self-hosted with Let's Encrypt

Open `index.html` in any browser or install as app on mobile.
