# Comic Crafter - APK/AAB Build Instructions

## Important: Your App is Already a PWA
The app is already installable from any browser at `https://comiccrafter.es` or your Replit URL.
Users can install it directly — no app store needed. This works on Android, iOS, and desktop.

## Option 1: PWABuilder (Recommended - Easiest)

1. Go to https://www.pwabuilder.com/
2. Enter the published URL (your Replit .replit.app URL or `https://app.comiccrafter.es`)
3. Click "Start" and wait for analysis
4. Click "Package for stores" > "Android"
5. Configure:
   - Package ID: `es.comiccrafter.app`
   - App name: `Comic Crafter`
   - Version: `1.0.0`
   - Version code: `1`
   - Signing key: Generate new or use existing
6. Download the generated `.apk` and `.aab` files
7. The download includes signing key info
8. Copy the SHA256 fingerprint and update `assetlinks.json` (see below)

## Option 2: Bubblewrap CLI (Local Build)

### Prerequisites
- Node.js 14+
- Java JDK 11+
- Android SDK (or let bubblewrap download it)

### Steps

```bash
npm install -g @nicolo-ribaudo/bubblewrap-cli
cd twa-project
bubblewrap init --manifest https://app.comiccrafter.es/manifest.json
bubblewrap build
```

This generates:
- `app-release-signed.apk` (for direct install/testing)
- `app-release-bundle.aab` (for Google Play Store upload)

### Generate Signing Key (first time only)

```bash
keytool -genkey -v \
  -keystore comic-crafter-key.keystore \
  -alias comiccrafter \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass comic2025 \
  -keypass comic2025 \
  -dname "CN=Comic Crafter, OU=App, O=ComicCrafter, L=Barcelona, ST=Catalonia, C=ES"
```

### Get SHA256 Fingerprint

```bash
keytool -list -v \
  -keystore comic-crafter-key.keystore \
  -alias comiccrafter \
  -storepass comic2025 | grep SHA256
```

## Option 3: Android Studio (Full Control)

1. Open `twa-project/` in Android Studio
2. Sync Gradle
3. Build > Generate Signed Bundle/APK
4. Select "Android App Bundle"
5. Use existing keystore or create new
6. Build the AAB for upload to Google Play

## After Building: Update Digital Asset Links

After you have the SHA256 fingerprint from your signing key:

1. Update `client/public/.well-known/assetlinks.json`:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "es.comiccrafter.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_HERE"]
  }
}]
```

2. Redeploy the app so the file is accessible at your published URL.

## Upload to Google Play Store

1. Go to https://play.google.com/console
2. Create new app "Comic Crafter"
3. Upload the `.aab` file
4. Fill in store listing:
   - Title: Comic Crafter - IA Stories
   - Short description: Crea comics, modelos 3D, voces y videos con IA
   - Icon: Use `client/public/icons/play-store-icon-512.png`
   - Feature graphic: Use `client/public/gallery/feature-graphic-play.png`
   - Screenshots: Use files from `client/public/gallery/`
5. Set content rating, pricing (Free), and target audience
6. Submit for review

## While Waiting for Google Play Approval

Users can already install the app as a PWA:
- **Android**: Visit the URL in Chrome > "Install" banner appears automatically
- **iOS**: Visit in Safari > Share > "Add to Home Screen"
- **Desktop**: Visit in Chrome/Edge > click install icon in address bar
- **Shopify (comiccrafter.es)**: Visitors see an "Install App" banner that prompts PWA install

The PWA provides the same full experience as the native app.
