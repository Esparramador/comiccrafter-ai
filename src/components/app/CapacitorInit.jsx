import { useEffect } from 'react';

/**
 * Inicializa Capacitor y optimizaciones para Android/iOS
 */
export function useCapacitorInit() {
  useEffect(() => {
    const initCapacitor = async () => {
      if (!window.Capacitor) return;

      try {
        // Splash Screen
        const SplashScreen = window.Capacitor.Plugins?.SplashScreen;
        if (SplashScreen) {
          await SplashScreen.show({
            showDuration: 2000,
            autoHide: false,
            backgroundColor: '#0a0a0f',
          });

          setTimeout(() => SplashScreen.hide(), 2000);
        }

        // Status Bar
        const StatusBar = window.Capacitor.Plugins?.StatusBar;
        if (StatusBar) {
          await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
          await StatusBar.setStyle({ style: 'dark' });
        }

        // Hardware Acceleration
        const App = window.Capacitor.Plugins?.App;
        if (App) {
          App.addListener('backButton', () => {
            if (window.location.pathname === '/') {
              App.exitApp();
            } else {
              window.history.back();
            }
          });
        }
      } catch (error) {
        console.warn('Capacitor init error:', error);
      }
    };

    initCapacitor();
  }, []);
}

/**
 * Componente wrapper para inicializar Capacitor
 */
export default function CapacitorInit({ children }) {
  useCapacitorInit();
  return children;
}