'use client';

import { useState } from 'react';

type Props = {
  images: string[];
  alt?: string;
};

export function ImageGallery({ images, alt = 'Image' }: Props) {
  const [selected, setSelected] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <>
        <div className="overflow-hidden rounded-lg cursor-pointer" onClick={() => setShowLightbox(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[0]} alt={alt} className="max-h-[500px] w-full object-contain" />
        </div>
        {showLightbox && (
          <Lightbox src={images[0]} alt={alt} onClose={() => setShowLightbox(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="overflow-hidden rounded-lg cursor-pointer" onClick={() => setShowLightbox(true)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[selected]} alt={`${alt} ${selected + 1}`} className="max-h-[500px] w-full object-contain" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                idx === selected ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
      </div>
      {showLightbox && (
        <Lightbox src={images[selected]} alt={alt} onClose={() => setShowLightbox(false)} />
      )}
    </>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      <button className="absolute top-4 right-4 text-3xl text-white hover:text-gray-300" onClick={onClose}>
        &times;
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
