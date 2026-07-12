"use client";

import { motion } from "framer-motion";
import type { BookLightboxImage, BookPageData, BookSpreadData } from "@/lib/work/book-pages";
import { BookPage } from "@/components/work/book/BookPage";
import { TurningPage } from "@/components/work/book/TurningPage";
import { cn } from "@/lib/utils";
import {
  BOOK_BODY_CLASS,
  BOOK_GUTTER_CLASS,
  BOOK_PAGE_HEIGHT,
  BOOK_SHADOW_CLASS,
  BOOK_SHELL_CLASS,
  BOOK_STAGE_CLASS,
} from "@/components/work/book/book-styles";

type BookStageProps = {
  spreads: BookSpreadData[];
  spreadIndex: number;
  targetSpreadIndex: number | null;
  direction: "forward" | "backward" | null;
  isAnimating: boolean;
  isSinglePage: boolean;
  mobileSide: 0 | 1;
  paperClass: string;
  reducedMotion: boolean;
  previousPageLabel: string;
  nextPageLabel: string;
  canGoBack: boolean;
  canGoForward: boolean;
  projectLightboxImages: Record<string, BookLightboxImage[]>;
  onOpenProjectDetail?: (slug: string) => void;
  onOpenLightbox?: (images: BookLightboxImage[], index: number) => void;
  onTurnForward?: () => void;
  onTurnBackward?: () => void;
  onTurnComplete: () => void;
};

function PageStack({ side, count }: { side: "left" | "right"; count: number }) {
  const layers = Math.min(Math.max(count, 1), 8);
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-5 bottom-5 hidden md:block",
        side === "left" ? "-left-[12px]" : "-right-[12px]",
      )}
    >
      {Array.from({ length: layers }).map((_, index) => (
        <div
          key={`${side}-${index}`}
          className={cn(
            "absolute h-full w-[4px] rounded-[2px] border border-[#d9cbbb]/40 bg-gradient-to-b from-[#f3ebe2] via-[#e8ddd0] to-[#d4c4b5]",
            side === "left" ? "left-0" : "right-0",
          )}
          style={{
            transform:
              side === "left"
                ? `translateX(${index * -1.8}px) translateZ(${-index * 0.6}px)`
                : `translateX(${index * 1.8}px) translateZ(${-index * 0.6}px)`,
            opacity: 0.35 + index * 0.07,
          }}
        />
      ))}
    </div>
  );
}

function Gutter() {
  return (
    <div className={BOOK_GUTTER_CLASS} aria-hidden="true">
      <div
        className="h-full w-full rounded-[1px]"
        style={{
          background:
            "linear-gradient(90deg, rgba(62,48,38,0.12), rgba(255,255,255,0.28) 48%, rgba(62,48,38,0.12))",
          boxShadow:
            "inset 0 0 22px rgba(42,30,22,0.16), inset 5px 0 10px rgba(255,255,255,0.18), inset -5px 0 10px rgba(42,30,22,0.1)",
        }}
      />
    </div>
  );
}

function getFlatPageNumber(spreadIndex: number, side: 0 | 1): number {
  return spreadIndex * 2 + side + 1;
}

export function BookStage({
  spreads,
  spreadIndex,
  targetSpreadIndex,
  direction,
  isAnimating,
  isSinglePage,
  mobileSide,
  paperClass,
  reducedMotion,
  previousPageLabel,
  nextPageLabel,
  canGoBack,
  canGoForward,
  projectLightboxImages,
  onOpenProjectDetail,
  onOpenLightbox,
  onTurnForward,
  onTurnBackward,
  onTurnComplete,
}: BookStageProps) {
  const current = spreads[spreadIndex];
  const target = targetSpreadIndex !== null ? spreads[targetSpreadIndex] : null;

  if (!current) return null;

  const renderPage = (page: BookPageData, side: "left" | "right", pageNumber?: number) => (
    <BookPage
      page={page}
      paperClass={paperClass}
      side={side}
      pageNumber={pageNumber}
      onOpenProjectDetail={onOpenProjectDetail}
      onOpenLightbox={onOpenLightbox}
      projectLightboxImages={
        page.projectSlug ? projectLightboxImages[page.projectSlug] ?? [] : []
      }
    />
  );

  const leftPage =
    isAnimating && direction === "forward"
      ? current.left
      : isAnimating && direction === "backward" && target
        ? target.left
        : current.left;

  const rightPage = isAnimating && target ? target.right : current.right;

  if (isSinglePage) {
    const page: BookPageData = mobileSide === 0 ? current.left : current.right;
    const flatIndex = spreadIndex * 2 + mobileSide;

    return (
      <div className="relative mx-auto w-full max-w-md px-1">
        <div className={BOOK_SHADOW_CLASS} />
        <motion.div
          key={`${spreadIndex}-${mobileSide}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 18 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ duration: reducedMotion ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[0.9rem] border border-[#d8c9bb]/80 bg-[linear-gradient(180deg,#ebe2d7,#e3d8cb)] p-2.5 shadow-[0_28px_70px_rgba(48,34,26,0.16)]"
        >
          {renderPage(page, "right", flatIndex + 1)}
        </motion.div>
      </div>
    );
  }

  const leftPageNumber = getFlatPageNumber(
    isAnimating && direction === "backward" && target ? targetSpreadIndex! : spreadIndex,
    0,
  );
  const rightPageNumber = getFlatPageNumber(
    isAnimating && direction === "forward" && target ? targetSpreadIndex! : spreadIndex,
    1,
  );

  const showForwardTurn =
    isAnimating && direction === "forward" && target !== null && !reducedMotion;
  const showBackwardTurn =
    isAnimating && direction === "backward" && target !== null && !reducedMotion;

  return (
    <div className={BOOK_STAGE_CLASS}>
      <div className={BOOK_SHADOW_CLASS} />

      <div className={BOOK_SHELL_CLASS}>
        <PageStack side="left" count={spreadIndex + 1} />
        <PageStack side="right" count={spreads.length - spreadIndex} />

        <div
          className={cn(BOOK_BODY_CLASS, BOOK_PAGE_HEIGHT)}
          style={{ transform: "rotateX(1.35deg)" }}
        >
          <button
            type="button"
            aria-label={previousPageLabel}
            onClick={(event) => {
              event.stopPropagation();
              if (canGoBack && !isAnimating) onTurnBackward?.();
            }}
            disabled={!canGoBack || isAnimating}
            className="absolute inset-y-0 left-0 z-40 hidden w-[18%] md:block"
          />

          <div className="relative z-10">
            {!showBackwardTurn ? (
              renderPage(leftPage, "left", leftPageNumber)
            ) : target ? (
              <>
                {renderPage(target.left, "left", getFlatPageNumber(targetSpreadIndex!, 0))}
                <TurningPage
                  front={current.left}
                  back={target.right}
                  direction="backward"
                  paperClass={paperClass}
                  reducedMotion={reducedMotion}
                  pageNumberFront={leftPageNumber}
                  pageNumberBack={getFlatPageNumber(targetSpreadIndex!, 1)}
                  onOpenLightbox={onOpenLightbox}
                  projectLightboxImages={projectLightboxImages}
                  onComplete={onTurnComplete}
                />
              </>
            ) : null}
          </div>

          <Gutter />

          <div className="relative z-10">
            {!showForwardTurn ? (
              renderPage(rightPage, "right", rightPageNumber)
            ) : (
              <>
                {target ? renderPage(target.right, "right", getFlatPageNumber(targetSpreadIndex!, 1)) : null}
                <TurningPage
                  front={current.right}
                  back={target?.left ?? current.left}
                  direction="forward"
                  paperClass={paperClass}
                  reducedMotion={reducedMotion}
                  pageNumberFront={rightPageNumber}
                  pageNumberBack={target ? getFlatPageNumber(targetSpreadIndex!, 0) : undefined}
                  onOpenLightbox={onOpenLightbox}
                  projectLightboxImages={projectLightboxImages}
                  onComplete={onTurnComplete}
                />
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={nextPageLabel}
            onClick={(event) => {
              event.stopPropagation();
              if (canGoForward && !isAnimating) onTurnForward?.();
            }}
            disabled={!canGoForward || isAnimating}
            className="absolute inset-y-0 right-0 z-40 hidden w-[18%] md:block"
          />
        </div>
      </div>
    </div>
  );
}
