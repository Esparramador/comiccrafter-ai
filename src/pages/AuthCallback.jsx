import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader } from 'lucide-react';

export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Esperar a que Base44 procese la autenticación
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          // Extraer URL de retorno desde parámetros
          const params = new URLSearchParams(window.location.search);
          const fromUrl = params.get('from_url') || '/';
          window.location.href = fromUrl;
        } else {
          // Si no se autenticó, volver al login
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        window.location.href = '/';
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Completando autenticación...</p>
      </div>
    </div>
  );
}