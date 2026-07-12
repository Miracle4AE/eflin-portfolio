"use client";

import { motion } from "framer-motion";
import type { BookLightboxImage, BookPageData } from "@/lib/work/book-pages";
import { BookPage } from "@/components/work/book/BookPage";
import { cn } from "@/lib/utils";
import { BOOK_PAPER_BACK_CLASS } from "@/components/work/book/book-styles";

type TurningPageProps = {
  front: BookPageData;
  back: BookPageData;
  direction: "forward" | "backward";
  paperClass: string;
  reducedMotion: boolean;
  pageNumberFront?: number;
  pageNumberBack?: number;
  onOpenLightbox?: (images: BookLightboxImage[], index: number) => void;
  projectLightboxImages?: Record<string, BookLightboxImage[]>;
  onComplete: () => void;
};

export function TurningPage({
  front,
  back,
  direction,
  paperClass,
  reducedMotion,
  pageNumberFront,
  pageNumberBack,
  onOpenLightbox,
  projectLightboxImages = {},
  onComplete,
}: TurningPageProps) {
  const isForward = direction === "forward";
  const duration = reducedMotion ? 0.22 : 0.82;

  if (reducedMotion) {
    return (
      <motion.div
        className="absolute inset-0 z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        onAnimationComplete={onComplete}
      >
        <BookPage
          page={front}
          paperClass={paperClass}
          side={isForward ? "right" : "left"}
          pageNumber={pageNumberFront}
          onOpenLightbox={onOpenLightbox}
          projectLightboxImages={
            front.projectSlug ? projectLightboxImages[front.projectSlug] ?? [] : []
          }
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "absolute inset-0 z-30 [transform-style:preserve-3d]",
        isForward ? "origin-left" : "origin-right",
      )}
      initial={{ rotateY: isForward ? 0 : 180 }}
      animate={{ rotateY: isForward ? -180 : 0 }}
      transition={{ duration, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={onComplete}
      style={{ transformOrigin: isForward ? "left center" : "right center" }}
    >
      <div
        className="absolute inset-0 [backface-visibility:hidden]"
        style={{ WebkitBackfaceVisibility: "hidden" }}
      >
        <BookPage
          page={front}
          paperClass={paperClass}
          side={isForward ? "right" : "left"}
          pageNumber={pageNumberFront}
          onOpenLightbox={onOpenLightbox}
          projectLightboxImages={
            front.projectSlug ? projectLightboxImages[front.projectSlug] ?? [] : []
          }
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0.04 }}
          animate={{ opacity: isForward ? 0.16 : 0.08 }}
          transition={{ duration: duration * 0.9 }}
          style={{
            background: isForward
              ? "linear-gradient(90deg, transparent, rgba(36,26,20,0.18))"
              : "linear-gradient(270deg, transparent, rgba(36,26,20,0.14))",
          }}
        />
      </div>
      <div
        className="absolute inset-0 [backface-visibility:hidden]"
        style={{
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        <BookPage
          page={back}
          paperClass={BOOK_PAPER_BACK_CLASS}
          side={isForward ? "left" : "right"}
          pageNumber={pageNumberBack}
          onOpenLightbox={onOpenLightbox}
          projectLightboxImages={
            back.projectSlug ? projectLightboxImages[back.projectSlug] ?? [] : []
          }
        />
      </div>
    </motion.div>
  );
}
