'use client';

import { useState, useEffect } from 'react';

export function useLightbox() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };

    if (lightboxImage) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [lightboxImage]);

  return {
    lightboxImage,
    openLightbox,
    closeLightbox
  };
}
