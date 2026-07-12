"use client";

import { motion } from "framer-motion";
import type { BookPageData } from "@/lib/work/book-pages";
import { BookPage } from "@/components/work/book/BookPage";
import { cn } from "@/lib/utils";

type TurningPageProps = {
  front: BookPageData;
  back: BookPageData;
  direction: "forward" | "backward";
  paperClass: string;
  reducedMotion: boolean;
  pageNumberFront?: number;
  pageNumberBack?: number;
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
          showProjectLink={false}
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
      style={{
        transformOrigin: isForward ? "left center" : "right center",
      }}
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
          showProjectLink={false}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[rgba(42,30,24,0.08)]"
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
          paperClass={paperClass}
          side={isForward ? "left" : "right"}
          pageNumber={pageNumberBack}
          showProjectLink={false}
        />
      </div>
    </motion.div>
  );
}
