import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook para manejar la autenticación con Google de forma segura
 * Evita el problema de redirect a /login que causa 404
 */
export const useGoogleAuth = () => {
  useEffect(() => {
    // Inicializar Capacitor Google Auth si está disponible (Android/iOS)
    if (window.Capacitor && window.googleAuth) {
      initializeCapacitorGoogleAuth();
    }
  }, []);

  const initializeCapacitorGoogleAuth = async () => {
    try {
      const GoogleAuth = window.googleAuth;
      await GoogleAuth.initialize({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
      });
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      let result;

      // Si estamos en una app nativa (Capacitor)
      if (window.Capacitor && window.googleAuth) {
        const GoogleAuth = window.googleAuth;
        result = await GoogleAuth.signIn();
      } else {
        // En web, usar el método de Base44
        // NO usar redirectToLogin porque causa problemas con /login
        // Simplemente iniciar el flujo de auth
        await base44.auth.redirectToLogin(window.location.pathname);
        return;
      }

      if (result && result.user) {
        // El usuario se autenticó exitosamente
        // Base44 lo detectará automáticamente en el siguiente check
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  return { handleGoogleLogin };
};

export default useGoogleAuth;