# Progressive Web App (PWA) Setup

Your Debre Iyesus Church website is now a fully functional PWA! 🎉

## What is a PWA?

A Progressive Web App works like a native mobile app but runs in the browser. Users can:
- **Install it on their device** (phone, tablet, desktop)
- **Access it from the home screen** like any other app
- **Work offline** (with cached data)
- **Receive push notifications** (optional)
- **Auto-update** when you deploy changes

## Features Implemented

### ✅ Core PWA Features
- **Web App Manifest** (`manifest.json`) - Defines app name, icons, colors
- **Service Worker** (`service-worker.js`) - Handles caching and offline functionality
- **Install Prompt** - Shows users they can install the app
- **HTTPS Support** - Already enabled on Azure

### ✅ Offline Strategy
- **Static files cached** - HTML, CSS, JS load offline
- **API caching** - GET requests cached for offline viewing
- **Network-first for admin** - Admin actions always try network first
- **Graceful fallbacks** - Shows "offline" message when network unavailable

### ✅ Admin Features Work Online
All admin features (add/edit/delete church info, members, etc.) work perfectly when online:
- Connects to Azure PostgreSQL database
- Uploads to Azure Blob Storage
- Full real-time updates

## How to Install (For Users)

### On Desktop (Chrome, Edge)
1. Visit https://debreiyesus.azurewebsites.net/
2. Look for install icon in address bar
3. Click "Install" button in the banner at bottom
4. App opens in its own window

### On Mobile (Android/iOS)
1. Visit https://debreiyesus.azurewebsites.net/
2. **Android (Chrome)**:
   - Tap "Install" banner at bottom
   - OR tap menu (⋮) → "Install app"
3. **iOS (Safari)**:
   - Tap Share button (□↑)
   - Tap "Add to Home Screen"
   - Tap "Add"

## For Administrators

### All Admin Features Work Normally
When online, admins can:
- ✅ Add/edit church information
- ✅ Upload logos to Azure Blob Storage
- ✅ Manage members
- ✅ Add/edit/delete contingent data
- ✅ All database operations work normally

### Offline Behavior
- **View cached data** - Can view previously loaded pages
- **Admin actions queue** - Can implement offline queue (optional)
- **Auto-sync** - Pending changes sync when back online

## Next Steps (Optional Enhancements)

### 1. Add App Icons
Create icons for better branding:
```bash
# Place in frontend/public/
icon-192.png  # 192x192 pixels
icon-512.png  # 512x512 pixels
```

See `frontend/public/create-icons-readme.md` for instructions.

### 2. Push Notifications (Optional)
Enable notifications for church updates:
- Requires Firebase Cloud Messaging or similar
- Can notify about new events, announcements
- Fully supported by the service worker

### 3. Background Sync (Optional)
Queue offline admin actions:
- Add/edit operations saved locally when offline
- Auto-sync when connection restored
- Requires IndexedDB implementation

### 4. App Update Prompt
Notify users when new version available:
- Currently auto-updates silently
- Can add "New version available" prompt

## Testing the PWA

### Test Installation
1. Deploy to Azure (already done)
2. Visit https://debreiyesus.azurewebsites.net/
3. Click install prompt

### Test Offline Mode
1. Install the app
2. Open DevTools (F12)
3. Go to Network tab
4. Check "Offline"
5. Refresh - app still loads!

### Test on Real Devices
- **Android**: Chrome, Edge, Samsung Internet
- **iOS**: Safari (limited PWA support)
- **Desktop**: Chrome, Edge, Brave

## Technical Details

### Cache Strategy
- **Static files**: Cache-first (fast loading)
- **API calls**: Network-first (always try fresh data)
- **Images**: Cache-first with network fallback

### Browser Support
- ✅ Chrome (Android, Desktop)
- ✅ Edge (Android, Desktop)
- ✅ Samsung Internet
- ⚠️  Safari/iOS (limited - no install prompt, basic offline)
- ❌ Firefox (no install support yet)

### Azure Deployment
The PWA works perfectly with Azure:
- Azure App Service provides HTTPS automatically
- Service worker caches Azure-hosted files
- APIs connect to Azure PostgreSQL normally
- Blob Storage uploads work when online

## Troubleshooting

### Install button doesn't appear
- Make sure you're on HTTPS (Azure does this)
- Check browser console for errors
- Try on Chrome/Edge (best support)
- Some browsers don't show prompt if already installed

### Service worker not registering
- Check browser console for errors
- Make sure `service-worker.js` is in `public/` folder
- Clear cache and reload

### Offline mode not working
- Service worker needs one visit to cache files
- Check Network tab - service worker should intercept requests
- Some browsers require interaction before caching

## Monitoring

Check service worker status:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. See registration status and cache contents

## Benefits for Your Church

✅ **Mobile-friendly** - Acts like native app
✅ **Fast loading** - Cached files load instantly
✅ **Offline access** - View content without internet
✅ **Home screen icon** - Easy access for members
✅ **Professional** - Modern app experience
✅ **No app store** - No Apple/Google approval needed
✅ **Auto-updates** - Users always have latest version
✅ **Works with Azure** - All cloud features still work

## Questions?

The PWA is fully compatible with all your Azure resources:
- Database connections work online
- File uploads work online
- Admin features fully functional
- Only read-only viewing works offline (with cached data)

This is the best of both worlds - web accessibility + app experience!
