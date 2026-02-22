import React, { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const GoogleLogin = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    initializeGoogle();
  }, []);

  const initializeGoogle = () => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        window.google.accounts.id.initialize({
          client_id: '783742843638-88j2f3nqkp6hvk4nvlqnvtoj08g7t6o1.apps.googleusercontent.com',
          callback: handleCredentialResponse
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'filled_blue',
          size: 'large',
          width: '100%',
          text: 'signin'
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

  return (
    <div ref={containerRef} className="flex justify-center">
    </div>
  );
};

export default GoogleLogin;