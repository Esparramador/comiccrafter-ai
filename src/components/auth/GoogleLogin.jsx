import React, { useEffect } from 'react';

const GoogleLogin = () => {
  
  useEffect(() => {
    // Cargar el script de Google si no está en la página
    if (window.google) return;
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  const handleGoogleLogin = async () => {
    if (window.google && window.google.accounts) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-client-id'
        });
        
        // Trigger Google Sign In
        window.google.accounts.id.prompt();
      } catch (error) {
        console.error("Error al abrir Google:", error);
      }
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