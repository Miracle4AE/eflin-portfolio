"use client";

import { motion } from "framer-motion";
import type { BookPageData, BookSpreadData } from "@/lib/work/book-pages";
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
  onProjectOpen?: (slug: string) => void;
  onPersistBeforeNavigate?: () => void;
  onTurnForward?: () => void;
  onTurnBackward?: () => void;
  onTurnComplete: () => void;
};

function PageStack({ side, count }: { side: "left" | "right"; count: number }) {
  const layers = Math.min(Math.max(count, 1), 6);
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute top-4 bottom-4 hidden md:block",
        side === "left" ? "-left-[10px]" : "-right-[10px]",
      )}
    >
      {Array.from({ length: layers }).map((_, index) => (
        <div
          key={`${side}-${index}`}
          className={cn(
            "absolute h-full w-[5px] rounded-sm bg-gradient-to-b from-[#efe5da] to-[#d9cbbb]",
            side === "left" ? "left-0" : "right-0",
          )}
          style={{
            transform:
              side === "left"
                ? `translateX(${index * -1.5}px) translateZ(${-index * 0.5}px)`
                : `translateX(${index * 1.5}px) translateZ(${-index * 0.5}px)`,
            opacity: 0.45 + index * 0.08,
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
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(70,55,45,0.10), rgba(255,255,255,0.22), rgba(70,55,45,0.10))",
          boxShadow:
            "inset 0 0 18px rgba(48,36,28,0.18), inset 4px 0 8px rgba(255,255,255,0.15), inset -4px 0 8px rgba(48,36,28,0.12)",
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
  onProjectOpen,
  onPersistBeforeNavigate,
  onTurnForward,
  onTurnBackward,
  onTurnComplete,
}: BookStageProps) {
  const current = spreads[spreadIndex];
  const target = targetSpreadIndex !== null ? spreads[targetSpreadIndex] : null;

  if (!current) return null;

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
          className="relative rounded-[0.85rem] border border-[#ddd0c3]/80 bg-[#ebe2d7] p-2 shadow-[0_24px_60px_rgba(52,36,28,0.14)]"
        >
          <BookPage
            page={page}
            paperClass={paperClass}
            side="right"
            pageNumber={flatIndex + 1}
            onProjectOpen={onProjectOpen}
            onPersistBeforeNavigate={onPersistBeforeNavigate}
            showProjectLink={page.kind === "project-meta"}
          />
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
          style={{ transform: "rotateX(1.2deg)" }}
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
              <BookPage
                page={leftPage}
                paperClass={paperClass}
                side="left"
                pageNumber={leftPageNumber}
                onProjectOpen={onProjectOpen}
                onPersistBeforeNavigate={onPersistBeforeNavigate}
                showProjectLink={leftPage.kind === "project-meta"}
              />
            ) : target ? (
              <>
                <BookPage
                  page={target.left}
                  paperClass={paperClass}
                  side="left"
                  pageNumber={getFlatPageNumber(targetSpreadIndex!, 0)}
                  showProjectLink={target.left.kind === "project-meta"}
                />
                <TurningPage
                  front={current.left}
                  back={target.right}
                  direction="backward"
                  paperClass={paperClass}
                  reducedMotion={reducedMotion}
                  pageNumberFront={leftPageNumber}
                  pageNumberBack={getFlatPageNumber(targetSpreadIndex!, 1)}
                  onComplete={onTurnComplete}
                />
              </>
            ) : null}
          </div>

          <Gutter />

          <div className="relative z-10">
            {!showForwardTurn ? (
              <BookPage
                page={rightPage}
                paperClass={paperClass}
                side="right"
                pageNumber={rightPageNumber}
                onProjectOpen={onProjectOpen}
                onPersistBeforeNavigate={onPersistBeforeNavigate}
                showProjectLink={false}
              />
            ) : (
              <>
                {target ? (
                  <BookPage
                    page={target.right}
                    paperClass={paperClass}
                    side="right"
                    pageNumber={getFlatPageNumber(targetSpreadIndex!, 1)}
                    showProjectLink={false}
                  />
                ) : null}
                <TurningPage
                  front={current.right}
                  back={target?.left ?? current.left}
                  direction="forward"
                  paperClass={paperClass}
                  reducedMotion={reducedMotion}
                  pageNumberFront={rightPageNumber}
                  pageNumberBack={target ? getFlatPageNumber(targetSpreadIndex!, 0) : undefined}
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
