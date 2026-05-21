# sleeptime-clac

Simple, dependency-free Sleep Time Calculator with PWA support.

## Files

- `index.html` - Main HTML with PWA metadata
- `styles.css` - Styling
- `script.js` - Application logic with localStorage persistence
- `manifest.json` - PWA configuration
- `service-worker.js` - Offline support and asset caching
- `favicon.ico` - Single multi-size icon for browser and app metadata

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

Ensure your server serves ICO files with the correct MIME type:

**Apache (.htaccess)**
```
AddType image/x-icon .ico
```

**Nginx**
```
types {
  image/x-icon ico;
}
```

**Node.js/Express**
```javascript
app.use(express.static('.', {
  setHeaders: (res, path) => {
    if (path.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
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
