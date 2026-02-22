import React, { useState } from 'react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

const LoginGoogle = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamar a GoogleAuth.signIn() de Capacitor
      const result = await GoogleAuth.signIn();
      
      const email = result.email;

      // Hacer fetch a la Edge Function de Deno
      const response = await fetch('/api/registerGoogleUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          full_name: result.name || '',
          profile_image: result.photoUrl || ''
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirigir a home
        window.location.href = '/';
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      console.error('Error en Google Sign In:', err);
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex items-center gap-2 bg-white text-black border border-gray-300 px-6 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
        <span>{loading ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
      </button>
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
};

export default LoginGoogle;