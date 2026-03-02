# Comic Crafter - APK/AAB Build Instructions

## Option 1: PWABuilder (Recommended - Easiest)

1. Go to https://www.pwabuilder.com/
2. Enter the published URL: `https://app.comiccrafter.es`
3. Click "Start" and wait for analysis
4. Click "Package for stores" > "Android"
5. Configure:
   - Package ID: `es.comiccrafter.app`
   - App name: `Comic Crafter`
   - Version: `1.0.0`
   - Version code: `1`
6. Download the generated `.apk` and `.aab` files
7. The download will also include the signing key info
8. Copy the SHA256 fingerprint and update `client/public/.well-known/assetlinks.json`

## Option 2: Bubblewrap CLI (Local Build)

### Prerequisites
- Node.js 14+
- Java JDK 11+
- Android SDK (or let bubblewrap download it)

### Steps

```bash
# Install bubblewrap globally
npm install -g @nicolo-ribaudo/bubblewrap-cli

# Navigate to the twa-project folder
cd twa-project

# Initialize the project (uses twa-manifest.json)
bubblewrap init --manifest https://app.comiccrafter.es/manifest.json

# Build the project
bubblewrap build

# This generates:
# - app-release-signed.apk (for direct install/testing)
# - app-release-bundle.aab (for Google Play Store upload)
```

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
keytool -list -v -keystore comic-crafter-key.keystore -alias comiccrafter -storepass comic2025
```

Copy the SHA256 fingerprint and update `client/public/.well-known/assetlinks.json`.

## Option 3: Android Studio

1. Install Android Studio
2. Create a new project > "No Activity"
3. Set package name: `es.comiccrafter.app`
4. Add TWA dependency to `build.gradle`:
   ```gradle
   implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
   ```
5. Use the `AndroidManifest.xml` from this folder
6. Build > Generate Signed Bundle/APK

## After Building

### Update Digital Asset Links
1. Get the SHA256 fingerprint from your signing key
2. Update `client/public/.well-known/assetlinks.json`:
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
3. Deploy the updated file

### Google Play Console Upload
1. Go to https://play.google.com/console
2. Create app > "Comic Crafter"
3. Upload the `.aab` file
4. Fill in store listing:
   - Title: "Comic Crafter - IA Stories"
   - Short description: "Crea comics, modelos 3D, voces y videos con IA"
   - Icon: Use `client/public/icons/play-store-icon-512.png`
   - Feature graphic: Use `client/public/gallery/feature-graphic-play.png`
   - Screenshots: Use files from `client/public/gallery/`
5. Set content rating, pricing (Free), and target audience
6. Submit for review
