# PWA Icons Setup

You need to create two icon files for your PWA:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

## Quick Way to Create Icons:

### Option 1: Use your church logo
1. Take your church logo image
2. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
3. Upload your logo
4. Download the generated icons
5. Rename them to `icon-192.png` and `icon-512.png`
6. Place them in the `frontend/public/` folder

### Option 2: Create programmatically
Run this command in the frontend folder:
```bash
npm install --save-dev pwa-asset-generator
npx pwa-asset-generator your-logo.png ./public --icon-only --path-override ./
```

### Option 3: Use ImageMagick (if installed)
```bash
# From a source image
convert your-logo.png -resize 192x192 public/icon-192.png
convert your-logo.png -resize 512x512 public/icon-512.png
```

## For now (temporary)
The app will work without icons, but the install prompt won't look as nice.
You can add them later without any code changes.

## Screenshots (Optional)
For a better install experience, you can also add screenshots:
- `screenshot-desktop.png` (1280x720)
- `screenshot-mobile.png` (750x1334)

These show users what your app looks like before installing.
