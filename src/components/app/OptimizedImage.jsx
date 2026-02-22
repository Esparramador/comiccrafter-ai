import React, { useState, useEffect } from 'react';

/**
 * Componente de imagen optimizado para web y mobile
 * - Lazy loading
 * - Responsive
 * - Fallback en caso de error
 */
export default function OptimizedImage({
  src,
  alt = 'Image',
  className = '',
  width = 'auto',
  height = 'auto',
  placeholder = 'bg-gray-900',
  priority = false,
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (priority || !src) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = () => {
      setError(true);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src, priority]);

  // Si es prioritario, cargar inmediatamente
  useEffect(() => {
    if (priority) {
      setImageSrc(src);
      setIsLoaded(true);
    }
  }, [priority, src]);

  if (error) {
    return (
      <div
        className={`${placeholder} flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Imagen no disponible</span>
      </div>
    );
  }

  return (
    <div
      className={`${placeholder} ${isLoaded ? '' : 'animate-pulse'} transition-opacity duration-300`}
      style={{ width, height }}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}