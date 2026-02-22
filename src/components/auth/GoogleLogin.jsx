import React from 'react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const GoogleLogin = () => {
  
  const handleGoogleLogin = async () => {
    try {
      // Esto abre la interfaz NATIVA de Android
      const user = await GoogleAuth.signIn();
      console.log("Usuario vinculado:", user);
      // Aquí puedes guardar el user.email en tu base de datos
    } catch (error) {
      console.error("Error al abrir Google:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Botón con estilos de Tailwind (los que ya tienes en tu CSS) */}
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