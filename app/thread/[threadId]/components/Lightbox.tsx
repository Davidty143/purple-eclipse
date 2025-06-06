'use client';

import { X } from 'lucide-react';
import Image from 'next/image'; // Import Image component from Next.js

interface LightboxProps {
  lightboxImage: string | null;
  closeLightbox: () => void;
}

export default function Lightbox({ lightboxImage, closeLightbox }: LightboxProps) {
  if (!lightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4 md:p-6" onClick={closeLightbox} role="dialog" aria-modal="true">
      <button className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 z-10 focus:outline-none focus:ring-2 focus:ring-white/50" onClick={closeLightbox} aria-label="Close lightbox">
        <X className="h-6 w-6" />
      </button>
      <div className="relative max-w-full max-h-[90vh] w-auto h-auto">
        {/* Replace <img> with <Image> */}
        <Image
          src={lightboxImage}
          alt="Enlarged thread image"
          className="max-w-full max-h-[90vh] object-contain rounded shadow-lg"
          layout="intrinsic" // Preserves aspect ratio
          onClick={(e) => e.stopPropagation()}
          width={800} // You can adjust the width and height as needed
          height={600} // Adjust the height accordingly
        />
      </div>
    </div>
  );
}
