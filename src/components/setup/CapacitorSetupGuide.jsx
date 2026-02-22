/**
 * CAPACITOR SETUP GUIDE
 * 
 * Para llevar esta app a Android Studio, sigue estos pasos:
 * 
 * 1. INSTALA CAPACITOR
 * npm install @capacitor/core @capacitor/cli @capacitor/android
 * 
 * 2. AGREGA ANDROID
 * npx cap add android
 * 
 * 3. CREA capacitor.config.json EN LA RAÍZ:
 * {
 *   "appId": "com.comiccrafter.app",
 *   "appName": "ComicCrafter",
 *   "webDir": "dist",
 *   "server": {
 *     "androidScheme": "https"
 *   },
 *   "plugins": {
 *     "SplashScreen": { "launchShowDuration": 0 },
 *     "StatusBar": { "style": "DARK" }
 *   }
 * }
 * 
 * 4. CONFIGURA GOOGLE SIGN-IN
 * - Ve a https://console.cloud.google.com
 * - Crea credenciales OAuth 2.0 (Web application)
 * - Autoriza orígenes: http://localhost, http://localhost:5173
 * - Copia el Client ID en .env:
 *   VITE_GOOGLE_CLIENT_ID=TU_CLIENT_ID
 * 
 * 5. BUILD Y SINCRONIZA
 * npm run build
 * npx cap sync
 * npx cap open android
 * 
 * 6. EN ANDROID STUDIO
 * - File → Open → selecciona carpeta android/
 * - Click Run → Run 'app'
 */

export default function CapacitorSetupGuide() {
  return null;
}