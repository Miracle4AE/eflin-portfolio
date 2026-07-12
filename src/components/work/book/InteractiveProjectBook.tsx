"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import type { BookExperienceData } from "@/lib/work/book-pages";
import {
  persistBookState,
  readBookState,
  restoreBookState,
  type BookPersistedState,
} from "@/lib/work/book-persistence";
import { useDictionary } from "@/i18n/locale-context";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useBookViewport } from "@/lib/hooks/useBookViewport";
import { usePageTurnSound } from "@/lib/hooks/usePageTurnSound";
import { BOOK_PAPER_CLASSES } from "@/components/work/book/book-styles";
import { BookCover } from "@/components/work/book/BookCover";
import { BookStage } from "@/components/work/book/BookStage";
import { BookProgress } from "@/components/work/book/BookProgress";
import { PageTurnControls } from "@/components/work/book/PageTurnControls";

type Direction = "forward" | "backward";

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
  const { isSinglePage } = useBookViewport();
  const sound = usePageTurnSound(collection.bookSettings?.soundEnabled ?? true);

  const [isOpen, setIsOpen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [mobileSide, setMobileSide] = useState<0 | 1>(0);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetSpreadIndex, setTargetSpreadIndex] = useState<number | null>(null);

  const hasRestoredRef = useRef(false);
  const lastPersistedRef = useRef("");

  const spreads = useMemo(() => bookData.spreads, [bookData.spreads]);
  const spreadMax = Math.max(0, spreads.length - 1);
  const flatMax = Math.max(0, spreads.length * 2 - 1);
  const flatPosition = spreadIndex * 2 + mobileSide;

  const paperClass =
    BOOK_PAPER_CLASSES[collection.bookSettings?.paperStyle ?? "ivory"] ?? BOOK_PAPER_CLASSES.ivory;

  const canGoBack = isSinglePage ? flatPosition > 0 : spreadIndex > 0;
  const canGoForward = isSinglePage ? flatPosition < flatMax : spreadIndex < spreadMax;
  const totalSteps = isSinglePage ? flatMax + 1 : spreadMax + 1;
  const currentStep = isSinglePage ? flatPosition + 1 : spreadIndex + 1;

  const currentSpread = spreads[spreadIndex];
  const currentPage = mobileSide === 0 ? currentSpread?.left : currentSpread?.right;

  const currentProjectTitle = useMemo(() => {
    const page = isSinglePage ? currentPage : currentSpread?.left ?? currentSpread?.right;
    return page?.projectTitle ?? page?.introTitle;
  }, [currentPage, currentSpread, isSinglePage]);

  const persistNow = useCallback(
    (state: BookPersistedState) => {
      const snapshot = JSON.stringify(state);
      if (snapshot === lastPersistedRef.current) return;
      lastPersistedRef.current = snapshot;
      persistBookState(collection.id, state);
    },
    [collection.id],
  );

  const getSnapshot = useCallback(
    (overrides?: Partial<BookPersistedState>): BookPersistedState => ({
      isOpen: overrides?.isOpen ?? isOpen,
      spreadIndex: overrides?.spreadIndex ?? spreadIndex,
      mobilePageSide: overrides?.mobilePageSide ?? mobileSide,
    }),
    [isOpen, mobileSide, spreadIndex],
  );

  const targetSpreadRef = useRef<number | null>(null);

  const onTurnComplete = useCallback(() => {
    const pending = targetSpreadRef.current;
    if (pending !== null) {
      setSpreadIndex(pending);
      persistNow(getSnapshot({ isOpen: true, spreadIndex: pending }));
    }
    targetSpreadRef.current = null;
    setTargetSpreadIndex(null);
    setDirection(null);
    setIsAnimating(false);
  }, [getSnapshot, persistNow]);

  const goToSpread = useCallback(
    (nextIndex: number, dir: Direction) => {
      if (isAnimating) return;

      const clamped = Math.max(0, Math.min(nextIndex, spreadMax));
      if (!isSinglePage && clamped === spreadIndex) return;

      if (isSinglePage) {
        const nextFlat = dir === "forward" ? flatPosition + 1 : flatPosition - 1;
        const nextSpread = Math.floor(nextFlat / 2);
        const nextSide = (nextFlat % 2) as 0 | 1;
        setSpreadIndex(nextSpread);
        setMobileSide(nextSide);
        if (!reducedMotion) sound.play();
        persistNow(getSnapshot({ isOpen: true, spreadIndex: nextSpread, mobilePageSide: nextSide }));
        return;
      }

      if (reducedMotion) {
        setSpreadIndex(clamped);
        persistNow(getSnapshot({ isOpen: true, spreadIndex: clamped }));
        return;
      }

      setDirection(dir);
      targetSpreadRef.current = clamped;
      setTargetSpreadIndex(clamped);
      setIsAnimating(true);
      sound.play();
    },
    [
      flatPosition,
      getSnapshot,
      isAnimating,
      isSinglePage,
      persistNow,
      reducedMotion,
      sound,
      spreadIndex,
      spreadMax,
    ],
  );

  const goForward = useCallback(() => {
    if (!canGoForward || isAnimating) return;

    if (isSinglePage) {
      if (mobileSide === 0) {
        setMobileSide(1);
        if (!reducedMotion) sound.play();
        persistNow(getSnapshot({ isOpen: true, mobilePageSide: 1 }));
        return;
      }
      goToSpread(spreadIndex + 1, "forward");
      return;
    }

    goToSpread(spreadIndex + 1, "forward");
  }, [
    canGoForward,
    getSnapshot,
    goToSpread,
    isAnimating,
    isSinglePage,
    mobileSide,
    persistNow,
    reducedMotion,
    sound,
    spreadIndex,
  ]);

  const goBackward = useCallback(() => {
    if (!canGoBack || isAnimating) return;

    if (isSinglePage) {
      if (mobileSide === 1) {
        setMobileSide(0);
        if (!reducedMotion) sound.play();
        persistNow(getSnapshot({ isOpen: true, mobilePageSide: 0 }));
        return;
      }
      goToSpread(spreadIndex - 1, "backward");
      return;
    }

    goToSpread(spreadIndex - 1, "backward");
  }, [
    canGoBack,
    getSnapshot,
    goToSpread,
    isAnimating,
    isSinglePage,
    mobileSide,
    persistNow,
    reducedMotion,
    sound,
    spreadIndex,
  ]);

  const openBook = useCallback(() => {
    const stored = readBookState(collection.id);
    if (stored) {
      setSpreadIndex(stored.spreadIndex);
      setMobileSide(stored.mobilePageSide);
    }
    setIsOpen(true);
    persistNow(
      getSnapshot({
        isOpen: true,
        spreadIndex: stored?.spreadIndex ?? spreadIndex,
        mobilePageSide: stored?.mobilePageSide ?? mobileSide,
      }),
    );
  }, [collection.id, getSnapshot, mobileSide, persistNow, spreadIndex]);

  const closeBook = useCallback(() => {
    setIsOpen(false);
    setDirection(null);
    setIsAnimating(false);
    targetSpreadRef.current = null;
    setTargetSpreadIndex(null);
    persistNow(getSnapshot({ isOpen: false }));
  }, [getSnapshot, persistNow]);

  const handlePersistBeforeNavigate = useCallback(() => {
    persistNow(getSnapshot({ isOpen: true }));
  }, [getSnapshot, persistNow]);

  const handleProjectOpen = useCallback(
    (slug: string) => {
      persistNow(getSnapshot({ isOpen: true }));
      onProjectOpen?.(slug);
    },
    [getSnapshot, onProjectOpen, persistNow],
  );

  const navRef = useRef({
    goForward,
    goBackward,
    closeBook,
    isOpen,
    isAnimating,
  });

  navRef.current = { goForward, goBackward, closeBook, isOpen, isAnimating };

  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const restored = restoreBookState(collection.id, spreadMax);
    if (!restored) return;

    setSpreadIndex(restored.spreadIndex);
    setMobileSide(restored.mobilePageSide);
    if (restored.isOpen) setIsOpen(true);
    lastPersistedRef.current = JSON.stringify(restored);
  }, [collection.id, spreadMax]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const nav = navRef.current;
      if (!nav.isOpen || nav.isAnimating) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nav.goForward();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nav.goBackward();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        nav.closeBook();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    let startX = 0;
    let tracking = false;

    function onTouchStart(event: TouchEvent) {
      const nav = navRef.current;
      if (!nav.isOpen || nav.isAnimating) return;
      startX = event.touches[0]?.clientX ?? 0;
      tracking = true;
    }

    function onTouchEnd(event: TouchEvent) {
      const nav = navRef.current;
      if (!tracking || !nav.isOpen || nav.isAnimating) return;
      const endX = event.changedTouches[0]?.clientX ?? 0;
      const delta = endX - startX;
      if (Math.abs(delta) > 48) {
        if (delta < 0) nav.goForward();
        else nav.goBackward();
      }
      tracking = false;
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

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
        <div className="space-y-10">
          <BookStage
            spreads={spreads}
            spreadIndex={spreadIndex}
            targetSpreadIndex={targetSpreadIndex}
            direction={direction}
            isAnimating={isAnimating}
            isSinglePage={isSinglePage}
            mobileSide={mobileSide}
            paperClass={paperClass}
            reducedMotion={reducedMotion}
            previousPageLabel={dict.work.bookPreviousPage}
            nextPageLabel={dict.work.bookNextPage}
            canGoBack={canGoBack && !isAnimating}
            canGoForward={canGoForward && !isAnimating}
            onProjectOpen={handleProjectOpen}
            onPersistBeforeNavigate={handlePersistBeforeNavigate}
            onTurnForward={goForward}
            onTurnBackward={goBackward}
            onTurnComplete={onTurnComplete}
          />

          <BookProgress
            current={currentStep}
            total={totalSteps}
            projectTitle={currentProjectTitle}
          />

          <PageTurnControls
            previousLabel={dict.work.bookPrevious}
            nextLabel={dict.work.bookNext}
            closeLabel={dict.work.closeBook}
            soundOnLabel={dict.work.soundOn}
            soundOffLabel={dict.work.soundOff}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            isAnimating={isAnimating}
            soundEnabled={sound.enabled}
            soundAvailable={sound.available}
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
