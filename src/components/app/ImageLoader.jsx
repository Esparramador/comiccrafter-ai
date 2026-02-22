import React, { useState, useEffect } from 'react';

export default function ImageLoader({ src, alt, className, fallback = '🖼️' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    const img = new Image();
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
    img.src = src;
  }, [src]);

  if (error) {
    return (
      <div className={`${className} bg-gray-800 flex items-center justify-center text-2xl`}>
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ opacity: loaded ? 1 : 0.5 }}
      loading="lazy"
    />
  );
}