"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { LightboxItem } from "@/lib/gallery";
import { DEFAULT_BLUR_DATA_URL } from "@/lib/images.constants";
import { cn } from "@/lib/utils";
import { easeOutExpo, DURATION } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useDictionary } from "@/i18n/locale-context";

interface LightboxProps {
  items: LightboxItem[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  blurDataURL?: string;
}

export function Lightbox({
  items,
  activeIndex,
  onClose,
  onNavigate,
  blurDataURL = DEFAULT_BLUR_DATA_URL,
}: LightboxProps) {
  const dict = useDictionary();
  const reducedMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const item = items[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(activeIndex - 1);
  }, [activeIndex, hasPrev, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(activeIndex + 1);
  }, [activeIndex, hasNext, onNavigate]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          event.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          event.preventDefault();
          goNext();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, goPrev, goNext]);

  if (!item) return null;

  const transition = reducedMotion
    ? { duration: 0.2 }
    : { duration: DURATION.base, ease: easeOutExpo };

  return (
    <motion.div
      key="lightbox-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
        <motion.div
          key={item.id}
          role="dialog"
          aria-modal="true"
          aria-label={dict.caseStudy.gallery}
          aria-describedby={item.caption ? "lightbox-caption" : undefined}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={transition}
          className="relative flex h-full w-full max-w-6xl flex-col px-4 py-16 md:px-8 md:py-20"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-xs uppercase tracking-[0.25em] text-muted">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center border border-foreground/15 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={dict.caseStudy.closeGallery}
            >
              ✕
            </button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden editorial-frame bg-surface">
            {item.src ? (
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 1200px) 100vw, 1152px"
                placeholder="blur"
                blurDataURL={blurDataURL}
                className="object-contain"
                priority
              />
            ) : (
              <div
                className={cn("absolute inset-0 bg-gradient-to-br", item.gradient)}
                role="img"
                aria-label={item.alt}
              />
            )}
            <div className="grain-overlay pointer-events-none" aria-hidden="true" />
          </div>

          {item.caption && (
            <p
              id="lightbox-caption"
              className="mt-4 text-center text-xs uppercase tracking-[0.15em] text-muted"
            >
              {item.caption}
            </p>
          )}

          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:px-4">
            <NavButton
              direction="previous"
              label={dict.caseStudy.previousImage}
              disabled={!hasPrev}
              onClick={goPrev}
              className="pointer-events-auto"
            />
            <NavButton
              direction="next"
              label={dict.caseStudy.nextImage}
              disabled={!hasNext}
              onClick={goNext}
              className="pointer-events-auto ml-auto"
            />
          </div>
        </motion.div>
      </motion.div>
  );
}

function NavButton({
  direction,
  label,
  disabled,
  onClick,
  className,
}: {
  direction: "previous" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center border border-foreground/15 bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-25",
        className,
      )}
    >
      <span aria-hidden="true">{direction === "previous" ? "←" : "→"}</span>
    </button>
  );
}
