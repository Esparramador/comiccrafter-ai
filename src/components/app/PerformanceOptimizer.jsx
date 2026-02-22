import { useEffect, useRef } from 'react';

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