"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { BookLightboxImage } from "@/lib/work/book-pages";

type BookImageLightboxProps = {
  images: BookLightboxImage[];
  index: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  previousLabel: string;
  nextLabel: string;
  closeLabel: string;
};

export function BookImageLightbox({
  images,
  index,
  onClose,
  onPrevious,
  onNext,
  previousLabel,
  nextLabel,
  closeLabel,
}: BookImageLightboxProps) {
  const touchStartRef = useRef(0);
  const current = images[index];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrevious();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      }
    },
    [onClose, onNext, onPrevious],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleKeyDown]);

  if (!current || typeof document === "undefined") return null;

  const canGoBack = index > 0;
  const canGoForward = index < images.length - 1;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(34,24,18,0.88)] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-5 top-5 z-20 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {closeLabel}
      </button>

      {canGoBack ? (
        <button
          type="button"
          aria-label={previousLabel}
          onClick={(event) => {
            event.stopPropagation();
            onPrevious();
          }}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/25 px-3 py-3 text-white/80 transition hover:text-white md:left-6"
        >
          ←
        </button>
      ) : null}

      {canGoForward ? (
        <button
          type="button"
          aria-label={nextLabel}
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/25 px-3 py-3 text-white/80 transition hover:text-white md:right-6"
        >
          →
        </button>
      ) : null}

      <div
        className="relative flex h-full w-full max-w-[min(1400px,96vw)] flex-col items-center justify-center px-10 py-16"
        onClick={(event) => event.stopPropagation()}
        onTouchStart={(event) => {
          touchStartRef.current = event.touches[0]?.clientX ?? 0;
        }}
        onTouchEnd={(event) => {
          const endX = event.changedTouches[0]?.clientX ?? 0;
          const delta = endX - touchStartRef.current;
          if (Math.abs(delta) > 48) {
            if (delta < 0 && canGoForward) onNext();
            if (delta > 0 && canGoBack) onPrevious();
          }
        }}
      >
        <div className="relative h-[min(78vh,900px)] w-full">
          <Image
            src={current.src}
            alt={current.alt}
            fill
            className="object-contain"
            sizes="96vw"
            priority
          />
        </div>
        <div className="mt-6 max-w-2xl text-center">
          <p className="text-sm text-white/90">{current.alt}</p>
          {current.caption ? (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/55">{current.caption}</p>
          ) : null}
          {images.length > 1 ? (
            <p className="mt-3 text-[10px] tabular-nums tracking-[0.2em] text-white/45">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
