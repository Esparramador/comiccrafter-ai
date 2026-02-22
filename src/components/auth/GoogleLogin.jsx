import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const GoogleLogin = () => {
  
  useEffect(() => {
    initializeGoogle();
  }, []);

  const initializeGoogle = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: document.querySelector('meta[name="google-client-id"]')?.content || 'your-client-id',
        callback: handleCredentialResponse
      });
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: document.querySelector('meta[name="google-client-id"]')?.content || 'your-client-id',
            callback: handleCredentialResponse
          });
        }
      };
      document.head.appendChild(script);
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      // Enviar el token a tu backend para verificar y crear/actualizar el usuario
      const result = await base44.functions.invoke('verifyGoogleToken', {
        token: response.credential
      });

      if (result.data?.success) {
        // Redirigir a la página principal
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error en Google Login:', error);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button 
        onClick={handleGoogleLogin}
        className="flex items-center gap-2 bg-white text-black border border-gray-300 px-6 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
      >
        <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
        <span>Continuar con Google</span>
      </button>
    </div>
  );
};

export default GoogleLogin;