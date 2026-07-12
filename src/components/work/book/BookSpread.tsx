"use client";

import { motion } from "framer-motion";
import type { BookPageData, BookSpreadData } from "@/lib/work/book-pages";
import { BookPage } from "@/components/work/book/BookPage";
import { cn } from "@/lib/utils";

type BookSpreadProps = {
  spread: BookSpreadData;
  page?: BookPageData | null;
  paperClass: string;
  reducedMotion: boolean;
  isMobile: boolean;
  previousPageLabel: string;
  nextPageLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onProjectOpen?: (slug: string) => void;
  onPersistBeforeNavigate?: () => void;
  onTurnForward?: () => void;
  onTurnBackward?: () => void;
};

const PAGE_SLOT_CLASS = "h-[460px]";

export function BookSpread({
  spread,
  page,
  paperClass,
  reducedMotion,
  isMobile,
  previousPageLabel,
  nextPageLabel,
  canGoBack,
  canGoForward,
  onProjectOpen,
  onPersistBeforeNavigate,
  onTurnForward,
  onTurnBackward,
}: BookSpreadProps) {
  const transition = reducedMotion
    ? { duration: 0.2, ease: "easeOut" as const }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  if (isMobile && page) {
    return (
      <motion.div
        key={page.id}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
        transition={transition}
        className="mx-auto w-full max-w-md"
      >
        <BookPage
          page={page}
          paperClass={paperClass}
          onProjectOpen={onProjectOpen}
          onPersistBeforeNavigate={onPersistBeforeNavigate}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key={spread.id}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: -4, x: 12 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, rotateY: 0, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, rotateY: 4, x: -12 }}
      transition={transition}
      className="relative mx-auto grid w-full max-w-[1100px] grid-cols-1 md:grid-cols-[1fr_auto_1fr]"
      style={{ perspective: reducedMotion ? undefined : "1800px" }}
    >
      <button
        type="button"
        aria-label={previousPageLabel}
        onClick={() => {
          if (canGoBack) onTurnBackward?.();
        }}
        disabled={!canGoBack}
        className={cn(
          "absolute inset-y-0 left-0 z-10 hidden w-1/4 md:block",
          !canGoBack && "cursor-not-allowed",
        )}
      />
      <div className={cn(PAGE_SLOT_CLASS, "md:pr-2")}>
        <BookPage
          page={spread.left}
          paperClass={paperClass}
          onProjectOpen={onProjectOpen}
          onPersistBeforeNavigate={onPersistBeforeNavigate}
        />
      </div>
      <div
        aria-hidden="true"
        className="hidden w-3 bg-gradient-to-r from-[#d8c8bb] via-[#bda697] to-[#d8c8bb] shadow-[inset_0_0_12px_rgba(61,56,52,0.18)] md:block"
      />
      <button
        type="button"
        aria-label={nextPageLabel}
        onClick={() => {
          if (canGoForward) onTurnForward?.();
        }}
        disabled={!canGoForward}
        className={cn(
          "absolute inset-y-0 right-0 z-10 hidden w-1/4 md:block",
          !canGoForward && "cursor-not-allowed",
        )}
      />
      <div className={cn(PAGE_SLOT_CLASS, "md:pl-2")}>
        <BookPage
          page={spread.right}
          paperClass={paperClass}
          onProjectOpen={onProjectOpen}
          onPersistBeforeNavigate={onPersistBeforeNavigate}
        />
      </div>
    </motion.div>
  );
}
