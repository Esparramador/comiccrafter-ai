import React, { useState } from 'react';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { base44 } from '@/api/base44Client';

const LoginGoogle = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Llamar a GoogleAuth.signIn() de Capacitor
      const googleUser = await GoogleAuth.signIn();

      // Invocar función backend para registrar usuario
      const result = await base44.functions.invoke('registerGoogleUser', {
        email: googleUser.email,
        user_name: googleUser.displayName || '',
        profile_image: googleUser.photoUrl || ''
      });

      if (result.data?.success) {
        // Redirigir a home
        window.location.href = '/';
      } else {
        setError(result.data?.error || 'Error al registrar usuario');
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