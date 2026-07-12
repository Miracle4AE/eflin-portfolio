"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import type { BookExperienceData, BookLightboxImage } from "@/lib/work/book-pages";
import {
  clampBookState,
  persistBookState,
  readBookState,
  restoreBookState,
  type BookPersistedState,
  type BookViewMode,
} from "@/lib/work/book-persistence";
import { useDictionary } from "@/i18n/locale-context";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useBookViewport } from "@/lib/hooks/useBookViewport";
import { usePageTurnSound } from "@/lib/hooks/usePageTurnSound";
import { BOOK_PAPER_CLASSES } from "@/components/work/book/book-styles";
import { BookCover } from "@/components/work/book/BookCover";
import { BookImageLightbox } from "@/components/work/book/BookImageLightbox";
import { BookStage } from "@/components/work/book/BookStage";
import { BookProgress } from "@/components/work/book/BookProgress";
import { PageTurnControls } from "@/components/work/book/PageTurnControls";

type Direction = "forward" | "backward";

type InteractiveProjectBookProps = {
  collection: ResolvedWorkCollection;
  bookData: BookExperienceData;
  onProjectOpen?: (slug: string) => void;
};

type LightboxState = {
  images: BookLightboxImage[];
  index: number;
} | null;

export function InteractiveProjectBook({
  collection,
  bookData,
}: InteractiveProjectBookProps) {
  const dict = useDictionary();
  const reducedMotion = useReducedMotion();
  const { isSinglePage } = useBookViewport();
  const sound = usePageTurnSound(collection.bookSettings?.soundEnabled ?? true);

  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<BookViewMode>("collection");
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [mobileSide, setMobileSide] = useState<0 | 1>(0);
  const [collectionSpreadIndex, setCollectionSpreadIndex] = useState(0);
  const [collectionMobileSide, setCollectionMobileSide] = useState<0 | 1>(0);
  const [direction, setDirection] = useState<Direction | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [targetSpreadIndex, setTargetSpreadIndex] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const hasRestoredRef = useRef(false);
  const lastPersistedRef = useRef("");
  const targetSpreadRef = useRef<number | null>(null);

  const collectionSpreads = useMemo(() => bookData.spreads, [bookData.spreads]);
  const collectionSpreadMax = Math.max(0, collectionSpreads.length - 1);

  const activeSpreads = useMemo(() => {
    if (viewMode === "project-detail" && activeProjectSlug) {
      return bookData.projectDetails[activeProjectSlug]?.spreads ?? collectionSpreads;
    }
    return collectionSpreads;
  }, [activeProjectSlug, bookData.projectDetails, collectionSpreads, viewMode]);

  const spreadMax = Math.max(0, activeSpreads.length - 1);
  const flatMax = Math.max(0, activeSpreads.length * 2 - 1);
  const flatPosition = spreadIndex * 2 + mobileSide;

  const paperClass =
    BOOK_PAPER_CLASSES[collection.bookSettings?.paperStyle ?? "ivory"] ?? BOOK_PAPER_CLASSES.ivory;

  const canGoBack = isSinglePage ? flatPosition > 0 : spreadIndex > 0;
  const canGoForward = isSinglePage ? flatPosition < flatMax : spreadIndex < spreadMax;

  const currentSpread = activeSpreads[spreadIndex];
  const currentPage = mobileSide === 0 ? currentSpread?.left : currentSpread?.right;

  const activeProjectTitle = useMemo(() => {
    if (viewMode === "project-detail" && activeProjectSlug) {
      const detail = bookData.projectDetails[activeProjectSlug];
      return detail?.spreads[0]?.left.projectTitle ?? detail?.spreads[0]?.right.projectTitle;
    }
    const page = isSinglePage ? currentPage : currentSpread?.left ?? currentSpread?.right;
    return page?.projectTitle ?? page?.introTitle;
  }, [
    activeProjectSlug,
    bookData.projectDetails,
    currentPage,
    currentSpread,
    isSinglePage,
    viewMode,
  ]);

  const progressMeta = useMemo(() => {
    if (viewMode === "project-detail") {
      return {
        mode: "project-detail" as const,
        current: isSinglePage ? flatPosition + 1 : spreadIndex + 1,
        total: isSinglePage ? flatMax + 1 : spreadMax + 1,
        projectTitle: activeProjectTitle,
      };
    }

    const overviewPage =
      currentSpread?.left.kind === "project-overview"
        ? currentSpread.left
        : currentSpread?.right.kind === "project-overview"
          ? currentSpread.right
          : null;

    if (overviewPage?.projectIndex && overviewPage.projectTotal) {
      return {
        mode: "collection" as const,
        current: overviewPage.projectIndex,
        total: overviewPage.projectTotal,
        projectTitle: overviewPage.projectTitle,
      };
    }

    return {
      mode: "collection" as const,
      current: spreadIndex + 1,
      total: collectionSpreads.length,
      projectTitle: activeProjectTitle,
    };
  }, [
    activeProjectTitle,
    collectionSpreads.length,
    currentSpread,
    flatMax,
    flatPosition,
    isSinglePage,
    spreadIndex,
    spreadMax,
    viewMode,
  ]);

  const persistNow = useCallback(
    (state: BookPersistedState) => {
      const spreadCap =
        state.viewMode === "project-detail" && state.activeProjectSlug
          ? Math.max(0, (bookData.projectDetails[state.activeProjectSlug]?.spreads.length ?? 1) - 1)
          : collectionSpreadMax;
      const clamped = clampBookState(state, spreadCap);
      const snapshot = JSON.stringify(clamped);
      if (snapshot === lastPersistedRef.current) return;
      lastPersistedRef.current = snapshot;
      persistBookState(collection.id, clamped);
    },
    [bookData.projectDetails, collection.id, collectionSpreadMax],
  );

  const getSnapshot = useCallback(
    (overrides?: Partial<BookPersistedState>): BookPersistedState => ({
      isOpen: overrides?.isOpen ?? isOpen,
      viewMode: overrides?.viewMode ?? viewMode,
      spreadIndex: overrides?.spreadIndex ?? spreadIndex,
      mobilePageSide: overrides?.mobilePageSide ?? mobileSide,
      activeProjectSlug: overrides?.activeProjectSlug ?? activeProjectSlug,
      collectionSpreadIndex: overrides?.collectionSpreadIndex ?? collectionSpreadIndex,
      collectionMobilePageSide: overrides?.collectionMobilePageSide ?? collectionMobileSide,
    }),
    [
      activeProjectSlug,
      collectionMobileSide,
      collectionSpreadIndex,
      isOpen,
      mobileSide,
      spreadIndex,
      viewMode,
    ],
  );

  const resetAnimation = useCallback(() => {
    setDirection(null);
    setIsAnimating(false);
    targetSpreadRef.current = null;
    setTargetSpreadIndex(null);
  }, []);

  const onTurnComplete = useCallback(() => {
    const pending = targetSpreadRef.current;
    if (pending !== null) {
      setSpreadIndex(pending);
      persistNow(getSnapshot({ isOpen: true, spreadIndex: pending }));
    }
    resetAnimation();
  }, [getSnapshot, persistNow, resetAnimation]);

  const goToSpread = useCallback(
    (nextIndex: number, dir: Direction) => {
      if (isAnimating || lightbox) return;

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
      lightbox,
      persistNow,
      reducedMotion,
      sound,
      spreadIndex,
      spreadMax,
    ],
  );

  const goForward = useCallback(() => {
    if (!canGoForward || isAnimating || lightbox) return;

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
    lightbox,
    mobileSide,
    persistNow,
    reducedMotion,
    sound,
    spreadIndex,
  ]);

  const goBackward = useCallback(() => {
    if (!canGoBack || isAnimating || lightbox) return;

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
    lightbox,
    mobileSide,
    persistNow,
    reducedMotion,
    sound,
    spreadIndex,
  ]);

  const openProjectDetail = useCallback(
    (slug: string) => {
      if (!bookData.projectDetails[slug] || lightbox) return;

      setCollectionSpreadIndex(spreadIndex);
      setCollectionMobileSide(mobileSide);
      setViewMode("project-detail");
      setActiveProjectSlug(slug);
      setSpreadIndex(0);
      setMobileSide(0);
      resetAnimation();

      persistNow(
        getSnapshot({
          isOpen: true,
          viewMode: "project-detail",
          activeProjectSlug: slug,
          spreadIndex: 0,
          mobilePageSide: 0,
          collectionSpreadIndex: spreadIndex,
          collectionMobilePageSide: mobileSide,
        }),
      );
    },
    [
      bookData.projectDetails,
      getSnapshot,
      lightbox,
      mobileSide,
      persistNow,
      resetAnimation,
      spreadIndex,
    ],
  );

  const closeProjectDetail = useCallback(() => {
    const returnSpread = collectionSpreadIndex;
    const returnSide = collectionMobileSide;

    setViewMode("collection");
    setActiveProjectSlug(null);
    setSpreadIndex(returnSpread);
    setMobileSide(returnSide);
    resetAnimation();

    persistNow(
      getSnapshot({
        isOpen: true,
        viewMode: "collection",
        activeProjectSlug: null,
        spreadIndex: returnSpread,
        mobilePageSide: returnSide,
      }),
    );
  }, [
    collectionMobileSide,
    collectionSpreadIndex,
    getSnapshot,
    persistNow,
    resetAnimation,
  ]);

  const openBook = useCallback(() => {
    const stored = readBookState(collection.id);
    if (stored) {
      const slug =
        stored.viewMode === "project-detail" && stored.activeProjectSlug
          ? stored.activeProjectSlug
          : null;
      const validDetail = slug && bookData.projectDetails[slug];

      setViewMode(validDetail ? "project-detail" : "collection");
      setActiveProjectSlug(validDetail ? slug : null);
      setSpreadIndex(stored.spreadIndex);
      setMobileSide(stored.mobilePageSide);
      setCollectionSpreadIndex(stored.collectionSpreadIndex);
      setCollectionMobileSide(stored.collectionMobilePageSide);
    }
    setIsOpen(true);
    persistNow(
      getSnapshot({
        isOpen: true,
        spreadIndex: stored?.spreadIndex ?? spreadIndex,
        mobilePageSide: stored?.mobilePageSide ?? mobileSide,
        viewMode: stored?.viewMode === "project-detail" && stored.activeProjectSlug && bookData.projectDetails[stored.activeProjectSlug] ? "project-detail" : "collection",
        activeProjectSlug:
          stored?.viewMode === "project-detail" && stored.activeProjectSlug && bookData.projectDetails[stored.activeProjectSlug]
            ? stored.activeProjectSlug
            : null,
      }),
    );
  }, [bookData.projectDetails, collection.id, getSnapshot, mobileSide, persistNow, spreadIndex]);

  const closeBook = useCallback(() => {
    setIsOpen(false);
    resetAnimation();
    persistNow(getSnapshot({ isOpen: false }));
  }, [getSnapshot, persistNow, resetAnimation]);

  const openLightbox = useCallback((images: BookLightboxImage[], index: number) => {
    if (!images[index]) return;
    setLightbox({ images, index });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const lightboxPrevious = useCallback(() => {
    setLightbox((current) => {
      if (!current || current.index <= 0) return current;
      return { ...current, index: current.index - 1 };
    });
  }, []);

  const lightboxNext = useCallback(() => {
    setLightbox((current) => {
      if (!current || current.index >= current.images.length - 1) return current;
      return { ...current, index: current.index + 1 };
    });
  }, []);

  const navRef = useRef({
    goForward,
    goBackward,
    closeBook,
    closeProjectDetail,
    isOpen,
    isAnimating,
    lightboxOpen: false,
    viewMode: "collection" as BookViewMode,
  });

  navRef.current = {
    goForward,
    goBackward,
    closeBook,
    closeProjectDetail,
    isOpen,
    isAnimating,
    lightboxOpen: Boolean(lightbox),
    viewMode,
  };

  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;

    const restored = restoreBookState(collection.id);
    if (!restored) return;

    const slug =
      restored.viewMode === "project-detail" && restored.activeProjectSlug
        ? restored.activeProjectSlug
        : null;
    const validDetail = Boolean(slug && bookData.projectDetails[slug]);
    const spreadCap = validDetail
      ? Math.max(0, bookData.projectDetails[slug!].spreads.length - 1)
      : collectionSpreadMax;

    setViewMode(validDetail ? "project-detail" : "collection");
    setActiveProjectSlug(validDetail ? slug : null);
    setSpreadIndex(Math.min(restored.spreadIndex, spreadCap));
    setMobileSide(restored.mobilePageSide);
    setCollectionSpreadIndex(Math.min(restored.collectionSpreadIndex, collectionSpreadMax));
    setCollectionMobileSide(restored.collectionMobilePageSide);
    if (restored.isOpen) setIsOpen(true);
    lastPersistedRef.current = JSON.stringify(
      clampBookState(
        {
          ...restored,
          viewMode: validDetail ? "project-detail" : "collection",
          activeProjectSlug: validDetail ? slug : null,
          spreadIndex: Math.min(restored.spreadIndex, spreadCap),
          collectionSpreadIndex: Math.min(restored.collectionSpreadIndex, collectionSpreadMax),
        },
        spreadCap,
      ),
    );
  }, [bookData.projectDetails, collection.id, collectionSpreadMax]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const nav = navRef.current;
      if (!nav.isOpen || nav.isAnimating || nav.lightboxOpen) return;

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
        if (nav.viewMode === "project-detail") nav.closeProjectDetail();
        else nav.closeBook();
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
      if (!nav.isOpen || nav.isAnimating || nav.lightboxOpen) return;
      startX = event.touches[0]?.clientX ?? 0;
      tracking = true;
    }

    function onTouchEnd(event: TouchEvent) {
      const nav = navRef.current;
      if (!tracking || !nav.isOpen || nav.isAnimating || nav.lightboxOpen) return;
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
          ? viewMode === "project-detail"
            ? `${activeProjectTitle ?? ""} — ${dict.work.bookDetailPageLabel} ${progressMeta.current} / ${progressMeta.total}`
            : `${dict.work.bookProjectLabel} ${progressMeta.current} / ${progressMeta.total}${
                activeProjectTitle ? ` — ${activeProjectTitle}` : ""
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
            spreads={activeSpreads}
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
            canGoBack={canGoBack && !isAnimating && !lightbox}
            canGoForward={canGoForward && !isAnimating && !lightbox}
            projectLightboxImages={bookData.projectLightboxImages}
            onOpenProjectDetail={openProjectDetail}
            onOpenLightbox={openLightbox}
            onTurnForward={goForward}
            onTurnBackward={goBackward}
            onTurnComplete={onTurnComplete}
          />

          <BookProgress
            mode={progressMeta.mode}
            current={progressMeta.current}
            total={progressMeta.total}
            projectTitle={progressMeta.projectTitle}
            projectLabel={dict.work.bookProjectLabel}
            detailPageLabel={dict.work.bookDetailPageLabel}
          />

          <PageTurnControls
            previousLabel={dict.work.bookPrevious}
            nextLabel={dict.work.bookNext}
            closeLabel={dict.work.closeBook}
            backToBookLabel={dict.work.backToBook}
            showBackToBook={viewMode === "project-detail"}
            soundOnLabel={dict.work.soundOn}
            soundOffLabel={dict.work.soundOff}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            isAnimating={isAnimating || Boolean(lightbox)}
            soundEnabled={sound.enabled}
            soundAvailable={sound.available}
            onPrevious={goBackward}
            onNext={goForward}
            onClose={closeBook}
            onBackToBook={closeProjectDetail}
            onToggleSound={sound.toggle}
          />
        </div>
      )}

      {lightbox ? (
        <BookImageLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={closeLightbox}
          onPrevious={lightboxPrevious}
          onNext={lightboxNext}
          previousLabel={dict.work.bookPrevious}
          nextLabel={dict.work.bookNext}
          closeLabel={dict.work.lightboxClose}
        />
      ) : null}
    </div>
  );
}
