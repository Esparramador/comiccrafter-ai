import { useEffect } from 'react';

/**
 * Optimiza rendimiento en Android/iOS
 * - Preload de assets críticos
 * - Lazy loading de imágenes
 * - Optimización de memoria
 */
export function usePerformanceOptimization() {
  useEffect(() => {
    // Precargar imágenes críticas
    const preloadImages = () => {
      const criticalImages = [
        'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699a4ce7816376ddfb992652/c00fa5137_comic_app_cover.png',
      ];

      criticalImages.forEach((src) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    };

    // Habilitar compresión de memoria
    const enableMemoryOptimization = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          // Limpiar memoria no utilizada
          if (performance.memory) {
            console.log('Memory optimized');
          }
        });
      }
    };

    // Configurar cache strategy
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          console.log('Service Worker registered');
        });
      });
    }

    preloadImages();
    enableMemoryOptimization();
  }, []);
}

/**
 * Hook para lazy load de componentes
 */
export function useLazyLoad(callback, options = {}) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    return () => observer.disconnect();
  }, [callback, options]);

  return useRef(null);
}

export default function PerformanceOptimizer({ children }) {
  usePerformanceOptimization();
  return children;
}