"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import {
  getPageIndexForSpread,
  getSpreadIndexForPage,
  type BookExperienceData,
} from "@/lib/work/book-pages";
import {
  clampBookState,
  readBookState,
  readBookStateFromUrl,
  writeBookState,
  writeBookStateToUrl,
} from "@/lib/work/book-persistence";
import { useDictionary } from "@/i18n/locale-context";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useBookViewport } from "@/lib/hooks/useBookViewport";
import { usePageTurnSound } from "@/lib/hooks/usePageTurnSound";
import { BOOK_PAPER_CLASSES } from "@/components/work/book/book-styles";
import { BookCover } from "@/components/work/book/BookCover";
import { BookSpread } from "@/components/work/book/BookSpread";
import { BookProgress } from "@/components/work/book/BookProgress";
import { PageTurnControls } from "@/components/work/book/PageTurnControls";

type InteractiveProjectBookProps = {
  collection: ResolvedWorkCollection;
  bookData: BookExperienceData;
  onProjectOpen?: (slug: string) => void;
};

export function InteractiveProjectBook({
  collection,
  bookData,
  onProjectOpen,
}: InteractiveProjectBookProps) {
  const dict = useDictionary();
  const reducedMotion = useReducedMotion();
  const { isMobile } = useBookViewport();
  const sound = usePageTurnSound(collection.bookSettings?.soundEnabled ?? true);
  const [isOpen, setIsOpen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const previousViewportRef = useRef(isMobile);

  const paperClass =
    BOOK_PAPER_CLASSES[collection.bookSettings?.paperStyle ?? "ivory"] ?? BOOK_PAPER_CLASSES.ivory;
  const spreads = bookData.spreads;
  const flatPages = bookData.flatPages;
  const spreadMax = Math.max(0, spreads.length - 1);
  const pageMax = Math.max(0, flatPages.length - 1);

  const currentSpread = spreads[spreadIndex] ?? spreads[0];
  const currentPage = flatPages[pageIndex] ?? flatPages[0];
  const totalSteps = isMobile ? flatPages.length : spreads.length;
  const currentStep = isMobile ? pageIndex + 1 : spreadIndex + 1;
  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < totalSteps;

  const currentProjectTitle = useMemo(() => {
    const page = isMobile ? currentPage : currentSpread?.left ?? currentSpread?.right;
    return page?.projectTitle ?? page?.introTitle;
  }, [currentPage, currentSpread, isMobile]);

  const persistState = useCallback(
    (next: { isOpen: boolean; spreadIndex: number; pageIndex: number }) => {
      const clamped = clampBookState(next, spreadMax, pageMax);
      writeBookState(collection.id, clamped);
      writeBookStateToUrl(clamped);
      return clamped;
    },
    [collection.id, pageMax, spreadMax],
  );

  const playTurnSound = useCallback(() => {
    if (!reducedMotion) sound.play();
  }, [reducedMotion, sound]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;
    if (isMobile) {
      setPageIndex((value) => Math.min(value + 1, pageMax));
    } else {
      setSpreadIndex((value) => {
        const next = Math.min(value + 1, spreadMax);
        setPageIndex(getPageIndexForSpread(spreads, next));
        return next;
      });
    }
    playTurnSound();
  }, [canGoForward, isMobile, pageMax, playTurnSound, spreadMax, spreads]);

  const goBackward = useCallback(() => {
    if (!canGoBack) return;
    if (isMobile) {
      setPageIndex((value) => Math.max(value - 1, 0));
    } else {
      setSpreadIndex((value) => {
        const next = Math.max(value - 1, 0);
        setPageIndex(getPageIndexForSpread(spreads, next));
        return next;
      });
    }
    playTurnSound();
  }, [canGoBack, isMobile, playTurnSound, spreads]);

  const openBook = useCallback(() => {
    void sound.unlock();
    const stored = readBookState(collection.id);
    const next = clampBookState(
      stored
        ? { isOpen: true, spreadIndex: stored.spreadIndex, pageIndex: stored.pageIndex }
        : { isOpen: true, spreadIndex, pageIndex },
      spreadMax,
      pageMax,
    );
    setSpreadIndex(next.spreadIndex);
    setPageIndex(next.pageIndex);
    setIsOpen(true);
    persistState(next);
  }, [collection.id, pageIndex, pageMax, persistState, sound, spreadIndex, spreadMax]);

  const closeBook = useCallback(() => {
    setIsOpen(false);
    persistState({ isOpen: false, spreadIndex, pageIndex });
  }, [pageIndex, persistState, spreadIndex]);

  const handlePersistBeforeNavigate = useCallback(() => {
    persistState({ isOpen: true, spreadIndex, pageIndex });
  }, [pageIndex, persistState, spreadIndex]);

  const handleProjectOpen = useCallback(
    (slug: string) => {
      persistState({ isOpen: true, spreadIndex, pageIndex });
      onProjectOpen?.(slug);
    },
    [onProjectOpen, pageIndex, persistState, spreadIndex],
  );

  useEffect(() => {
    const urlState = readBookStateFromUrl();
    const stored = readBookState(collection.id);
    const raw = urlState ?? stored;
    if (!raw) {
      setHydrated(true);
      return;
    }

    const clamped = clampBookState(raw, spreadMax, pageMax);
    setSpreadIndex(clamped.spreadIndex);
    setPageIndex(clamped.pageIndex);
    if (clamped.isOpen) {
      setIsOpen(true);
      void sound.unlock();
    }
    setHydrated(true);
  }, [collection.id, pageMax, sound, spreadMax]);

  useEffect(() => {
    if (!hydrated) return;
    persistState({ isOpen, spreadIndex, pageIndex });
  }, [hydrated, isOpen, pageIndex, persistState, spreadIndex]);

  useEffect(() => {
    if (!hydrated || previousViewportRef.current === isMobile) return;
    if (isMobile) {
      setPageIndex(getPageIndexForSpread(spreads, spreadIndex));
    } else {
      setSpreadIndex(getSpreadIndexForPage(spreads, pageIndex));
    }
    previousViewportRef.current = isMobile;
  }, [hydrated, isMobile, pageIndex, spreadIndex, spreads]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goForward();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goBackward();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeBook();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeBook, goBackward, goForward, isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobile) return;
    let startX = 0;
    let tracking = false;

    function onTouchStart(event: TouchEvent) {
      startX = event.touches[0]?.clientX ?? 0;
      tracking = true;
    }

    function onTouchEnd(event: TouchEvent) {
      if (!tracking) return;
      const endX = event.changedTouches[0]?.clientX ?? 0;
      const delta = endX - startX;
      if (Math.abs(delta) > 48) {
        if (delta < 0) goForward();
        else goBackward();
      }
      tracking = false;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goBackward, goForward, isMobile, isOpen]);

  const coverImage =
    collection.bookSettings?.coverImage ??
    collection.coverImage ??
    bookData.spreads[0]?.right?.imageSrc ??
    null;

  return (
    <div className="relative">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isOpen
          ? `${dict.work.bookPageStatus} ${currentStep} / ${totalSteps}${
              currentProjectTitle ? ` — ${currentProjectTitle}` : ""
            }`
          : dict.work.bookClosed}
      </div>

      {!isOpen ? (
        <BookCover
          title={collection.title}
          subtitle={collection.bookSettings?.subtitle}
          description={collection.bookSettings?.intro ?? collection.description}
          projectCount={bookData.spreads[0]?.left?.projectCount ?? 0}
          projectsLabel={dict.work.projectsLabel}
          coverImage={coverImage}
          coverGradient="from-[#f6eee4] via-[#ead8ce] to-[#b98f83]"
          openLabel={dict.work.openBook}
          paperClass={paperClass}
          onOpen={openBook}
        />
      ) : (
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {currentSpread ? (
              <BookSpread
                spread={currentSpread}
                page={currentPage}
                paperClass={paperClass}
                reducedMotion={reducedMotion}
                isMobile={isMobile}
                previousPageLabel={dict.work.bookPreviousPage}
                nextPageLabel={dict.work.bookNextPage}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
                onProjectOpen={handleProjectOpen}
                onPersistBeforeNavigate={handlePersistBeforeNavigate}
                onTurnForward={goForward}
                onTurnBackward={goBackward}
              />
            ) : null}
          </AnimatePresence>

          <BookProgress
            current={currentStep}
            total={totalSteps}
            projectTitle={currentProjectTitle}
            label={dict.work.bookProgress}
          />

          <PageTurnControls
            previousLabel={dict.work.bookPrevious}
            nextLabel={dict.work.bookNext}
            closeLabel={dict.work.closeBook}
            soundOnLabel={dict.work.soundOn}
            soundOffLabel={dict.work.soundOff}
            soundUnavailableLabel={dict.work.soundUnavailable}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            soundEnabled={sound.enabled}
            soundAvailable={sound.available}
            soundProbed={sound.probed}
            onPrevious={goBackward}
            onNext={goForward}
            onClose={closeBook}
            onToggleSound={sound.toggle}
          />
        </div>
      )}
    </div>
  );
}
