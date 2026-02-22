import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const GoogleLogin = () => {
  useEffect(() => {
    initializeGoogle();
  }, []);

  const initializeGoogle = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "783742843638-88j2f3nqkp6hvk4nvlqnvtoj08g7t6o1.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse
        });
      }
    };
    document.head.appendChild(script);
  };

  const handleCredentialResponse = async (response) => {
    try {
      const result = await base44.functions.invoke('verifyGoogleToken', {
        token: response.credential
      });

      if (result.data?.success) {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error en Google Login:', error);
    }
  };

  const handleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button 
        onClick={handleClick}
        className="flex items-center gap-2 bg-white text-black border border-gray-300 px-6 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-all"
      >
        <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
        <span>Continuar con Google</span>
      </button>
    </div>
  );
};

export default GoogleLogin;