import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  src: string;
  width: number;
  height: number;
}

interface Props {
  images: GalleryImage[];
  title: string;
}

export default function ProjectGallery({ images, title }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef(0);

  const open = useCallback((index: number) => {
    setCurrentIndex(index);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!dialogRef.current?.open) return;
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [prev, next]);

  // Preload adjacent images
  useEffect(() => {
    const preload = (idx: number) => {
      if (idx >= 0 && idx < images.length) {
        const img = new Image();
        img.src = images[idx].src;
      }
    };
    preload(currentIndex - 1);
    preload(currentIndex + 1);
  }, [currentIndex, images]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }

  if (images.length === 0) return null;

  return (
    <>
      {/* Thumbnail strip */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => open(i)}
            className="group/thumb relative aspect-video overflow-hidden rounded-lg"
            aria-label={`View ${title} image ${i + 1}`}
          >
            <img
              src={img.src}
              alt={`${title} screenshot ${i + 1}`}
              width={img.width}
              height={img.height}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/thumb:bg-black/30">
              <ZoomIn
                size={20}
                className="text-white opacity-0 transition-opacity group-hover/thumb:opacity-100"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox dialog */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-50 m-0 open:grid h-full w-full max-w-full max-h-full place-items-center bg-transparent p-4 backdrop:bg-zinc-900/80"
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex w-full max-w-4xl flex-col items-center" onClick={(e) => e.stopPropagation()}>
          {/* Top bar */}
          <div className="mb-4 flex w-full items-center justify-between">
            <span className="text-sm text-white/70">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={close}
              className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none"
              aria-label="Close lightbox"
            >
              <X size={20} />
            </button>
          </div>

          {/* Image area */}
          <div className="relative flex w-full items-center justify-center overflow-hidden">
            {images.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <img
              src={images[currentIndex].src}
              alt={`${title} screenshot ${currentIndex + 1}`}
              className="max-h-[75vh] max-w-full rounded-lg object-contain"
            />

            {images.length > 1 && (
              <button
                onClick={next}
                className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
