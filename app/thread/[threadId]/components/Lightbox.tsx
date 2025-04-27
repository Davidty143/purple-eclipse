'use client';

interface LightboxProps {
  lightboxImage: string | null;
  closeLightbox: () => void;
}

export default function Lightbox({ lightboxImage, closeLightbox }: LightboxProps) {
  if (!lightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={closeLightbox}>
      <img src={lightboxImage} alt="Enlarged thread image" className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
