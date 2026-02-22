/**
 * Maneja el flujo de autenticación sin errores 404
 * Intercepta redirecciones y las maneja correctamente
 */
export function setupAuthRedirectHandler() {
  // Detectar si estamos volviendo de un redirect de OAuth
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('from_url');
  
  if (fromUrl) {
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Monitorear cambios de autenticación
  let lastAuthState = null;

  const checkAuthChange = async () => {
    try {
      const isAuth = await window.base44?.auth?.isAuthenticated?.();
      
      if (isAuth !== lastAuthState) {
        lastAuthState = isAuth;
        
        if (isAuth) {
          // Navegar a home sin problemas de redirect
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  // Verificar cada 500ms
  const interval = setInterval(checkAuthChange, 500);

  // Limpiar cuando se navegue
  return () => clearInterval(interval);
}

export default setupAuthRedirectHandler;