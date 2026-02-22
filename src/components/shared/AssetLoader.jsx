import React, { useEffect, useState } from 'react';

/**
 * Preload de assets críticos para evitar pantallas en blanco
 */
export const useAssetPreload = () => {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const preloadAssets = async () => {
      const criticalImages = [
        'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699a4ce7816376ddfb992652/c00fa5137_comic_app_cover.png',
        'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=800&fit=crop',
      ];

      const imagePromises = criticalImages.map(
        (src) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve;
            img.src = src;
          })
      );

      try {
        await Promise.all(imagePromises);
        setAssetsLoaded(true);
      } catch (error) {
        console.warn('Asset preload error:', error);
        setAssetsLoaded(true); // Continuar sin bloquear
      }
    };

    preloadAssets();
  }, []);

  return assetsLoaded;
};

/**
 * Componente para lazy load de imágenes
 */
export function LazyImage({
  src,
  alt,
  className,
  placeholderColor = 'bg-gray-900',
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`${placeholderColor} ${!isLoaded ? 'animate-pulse' : ''}`}>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );
}

/**
 * Optimizador de rendimiento para navegación entre páginas
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = async (path) => {
    setIsTransitioning(true);
    // Dar tiempo para que se complete la animación de transición
    await new Promise((resolve) => setTimeout(resolve, 300));
    window.location.pathname = path;
  };

  return { isTransitioning, navigateTo };
}