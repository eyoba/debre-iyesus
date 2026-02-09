# Cache Management Guide

## Overview

This PWA (Progressive Web App) uses service workers and browser caching for offline functionality. This guide explains how to manage caches and force updates.

## For Users: How to See Latest Updates

### Method 1: Automatic Update (Recommended)
The app automatically checks for updates every 60 seconds and reloads when a new version is detected. Just wait 1-2 minutes after deployment.

### Method 2: Keyboard Shortcut (Instant)
Press **Ctrl + Shift + Delete** on the website to:
- Clear all caches
- Unregister service workers
- Clear local storage (preserves admin login)
- Hard reload the page

### Method 3: Browser Hard Refresh
- **Chrome/Edge**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Firefox**: Press `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- **Safari**: Press `Cmd + Option + R`

### Method 4: Manual Cache Clear
1. Open browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Clear site data" or "Clear storage"
4. Reload the page

### Method 5: Clear Browser Data
1. Go to browser Settings
2. Find "Privacy and security"
3. Click "Clear browsing data"
4. Select "Cached images and files"
5. Click "Clear data"

### Method 6: Reinstall PWA (Mobile)
If you installed the app on your phone:
1. Delete the app from home screen
2. Visit the website in browser
3. Click "Install App" button
4. Install fresh copy

## For Developers: Deploying Updates

### IMPORTANT: Increment Cache Version
Every time you deploy changes, you MUST increment the `CACHE_VERSION` in:
```
frontend/public/service-worker.js
```

Current version: **8**

Change this line:
```javascript
const CACHE_VERSION = 8;  // ← Increment this!
```

To:
```javascript
const CACHE_VERSION = 9;  // ← New version
```

### Why Cache Versioning Matters
- Each version uses a different cache name (`debre-iyesus-v8`, `debre-iyesus-v9`, etc.)
- Old caches are automatically deleted when new version activates
- Users get fresh content without manual cache clearing

### Deployment Checklist
1. ✅ Make your code changes
2. ✅ Increment `CACHE_VERSION` in `service-worker.js`
3. ✅ Commit and push to GitHub
4. ✅ Wait for Azure deployment to complete (2-5 minutes)
5. ✅ Test by visiting site (wait 60 seconds for auto-update)

## Cache Strategy

### Static Files (Network First)
- HTML, CSS, JS files
- Always fetches from network first
- Falls back to cache if offline
- Caches successful responses

### API Requests (Network First)
- `/api/*` endpoints
- Always tries network first
- Falls back to cached data if offline
- Shows "Offline - data not available" if no cache

### What Gets Cached
- HTML pages (`/`, `/index.html`)
- App manifest (`/manifest.json`)
- PWA icons
- API responses (GET requests only)

### What Never Gets Cached
- Admin authentication (POST/PUT/DELETE requests)
- File uploads
- Database mutations

## Troubleshooting

### Problem: "Changes not showing up"
**Solution**:
1. Wait 60 seconds (auto-update)
2. Or press `Ctrl + Shift + Delete` on the website
3. Or hard refresh browser (`Ctrl + Shift + R`)

### Problem: "Old content still appears after hard refresh"
**Solution**:
1. Open DevTools (F12)
2. Check Console for service worker logs
3. Go to Application tab → Service Workers
4. Click "Unregister"
5. Go to Application tab → Cache Storage
6. Delete all caches
7. Reload page

### Problem: "App won't update on mobile"
**Solution**:
1. Delete PWA from home screen
2. Clear browser cache in settings
3. Visit website in browser
4. Reinstall app

### Problem: "Different content on localhost vs production"
**Solution**:
- Localhost and production have separate caches
- Both use same service worker code
- Clear cache on both environments separately

## Service Worker Lifecycle

1. **Install**: New service worker downloads and caches files
2. **Waiting**: New worker waits for old worker to finish
3. **Activate**: New worker takes over and deletes old caches
4. **Fetch**: Worker intercepts requests and serves from cache/network

## Automatic Update Detection

The app checks for updates in three ways:

1. **Interval Check**: Every 60 seconds
2. **Page Load**: When user visits site
3. **Navigation**: When user navigates between pages

When update detected:
1. New service worker installs in background
2. New caches are populated
3. Page automatically reloads
4. Old caches are deleted

## Developer Console Commands

Open browser DevTools console and run:

```javascript
// Check current service worker status
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs))

// Check all caches
caches.keys().then(names => console.log(names))

// Clear all caches manually
caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))

// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(regs =>
  Promise.all(regs.map(reg => reg.unregister()))
)

// Force service worker update
navigator.serviceWorker.getRegistrations().then(regs =>
  regs.forEach(reg => reg.update())
)
```

## Best Practices

1. **Always increment cache version** when deploying
2. **Test in incognito mode** to verify updates
3. **Check service worker logs** in DevTools console
4. **Monitor Azure deployment** status before testing
5. **Wait 60 seconds** after deployment for auto-update
6. **Use keyboard shortcut** (`Ctrl+Shift+Delete`) for instant cache clear

## Azure Deployment Notes

- GitHub push triggers automatic Azure deployment
- Deployment takes 2-5 minutes typically
- Service worker update detection starts after deployment completes
- Users get updates within 60 seconds after deployment

## Support

If users report not seeing updates:
1. Ask them to wait 60 seconds and refresh
2. Send them keyboard shortcut: `Ctrl + Shift + Delete`
3. Guide them through browser cache clearing
4. For mobile, ask them to reinstall PWA
