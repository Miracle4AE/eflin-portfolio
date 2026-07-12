"use client";

import Link from "next/link";
import type { BookLightboxImage, BookPageData } from "@/lib/work/book-pages";
import { ProjectImage } from "@/components/work/ProjectImage";
import { useDictionary } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import {
  BOOK_PAGE_HEIGHT,
  BOOK_TEXTURE_CLASS,
  bookPageEdgeShadow,
  bookPageSideClass,
} from "@/components/work/book/book-styles";

type BookPageProps = {
  page: BookPageData;
  paperClass: string;
  side?: "left" | "right";
  pageNumber?: number;
  onOpenProjectDetail?: (slug: string) => void;
  onOpenLightbox?: (images: BookLightboxImage[], index: number) => void;
  projectLightboxImages?: BookLightboxImage[];
  interactive?: boolean;
};

const OVERVIEW_IMAGE_CLASS =
  "group/image relative mx-auto h-[min(380px,52vh)] w-full max-w-[94%] cursor-zoom-in overflow-hidden transition duration-500";

const DETAIL_IMAGE_CLASS =
  "group/image relative mx-auto h-[min(400px,54vh)] w-full max-w-[94%] cursor-zoom-in overflow-hidden transition duration-500";

export function BookPage({
  page,
  paperClass,
  side = "left",
  pageNumber,
  onOpenProjectDetail,
  onOpenLightbox,
  projectLightboxImages = [],
  interactive = true,
}: BookPageProps) {
  const dict = useDictionary();

  const openLightboxForImage = (src: string | null | undefined) => {
    if (!src || !page.lightboxEnabled || !onOpenLightbox || projectLightboxImages.length === 0) {
      return;
    }
    const imageIndex = projectLightboxImages.findIndex((image) => image.src === src);
    onOpenLightbox(projectLightboxImages, imageIndex >= 0 ? imageIndex : 0);
  };

  const renderImageBlock = (frameClass: string, caption?: string) => (
    <div className="flex min-h-0 flex-1 flex-col">
      <button
        type="button"
        disabled={!page.lightboxEnabled || !page.imageSrc}
        onClick={(event) => {
          event.stopPropagation();
          openLightboxForImage(page.imageSrc);
        }}
        className={cn(
          frameClass,
          "mt-2 flex flex-1 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          !page.lightboxEnabled || !page.imageSrc ? "cursor-default" : "hover:scale-[1.01]",
        )}
      >
        <ProjectImage
          src={page.imageSrc}
          alt={page.imageAlt ?? page.projectTitle ?? "Project artwork"}
          gradient={page.imageGradient ?? "from-[#f6eee4] via-[#ead8ce] to-[#b98f83]"}
          mode="contain"
          className="h-full w-full transition duration-500 group-hover/image:scale-[1.02]"
          imageClassName="p-3"
          sizes="(min-width: 1024px) 38vw, 90vw"
        />
        {page.lightboxEnabled && page.imageSrc ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[9px] uppercase tracking-[0.24em] text-foreground/0 transition group-hover/image:text-foreground/55">
            {dict.work.viewFullSize}
          </span>
        ) : null}
      </button>
      <p className="mt-5 text-center text-[10px] uppercase tracking-[0.26em] text-muted/85">
        {caption ?? page.imageCaption ?? page.projectTitle}
      </p>
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden px-7 py-8 md:px-9 md:py-10",
        BOOK_PAGE_HEIGHT,
        paperClass,
        BOOK_TEXTURE_CLASS,
        bookPageSideClass(side),
        bookPageEdgeShadow(side),
      )}
    >
      {page.kind === "intro" ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-accent/75">
            {page.projectCount} {dict.work.projectsLabel}
          </p>
          <h2 className="mt-8 line-clamp-3 font-display text-[clamp(2rem,4vw,2.75rem)] font-light leading-[1.04] tracking-[-0.035em] text-foreground">
            {page.introTitle}
          </h2>
          {page.introSubtitle ? (
            <p className="mt-5 line-clamp-2 text-xs uppercase tracking-[0.2em] text-muted">
              {page.introSubtitle}
            </p>
          ) : null}
          {page.introDescription ? (
            <p className="mt-8 line-clamp-[7] max-w-md text-sm leading-[1.85] text-muted">
              {page.introDescription}
            </p>
          ) : null}
        </div>
      ) : null}

      {page.kind === "closing" || page.kind === "detail-closing" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-accent/65">
            Eflin
          </p>
          <h2 className="mt-8 line-clamp-3 max-w-sm font-display text-3xl font-light leading-[1.05] tracking-[-0.03em] text-foreground">
            {page.introTitle ?? page.projectTitle}
          </h2>
          <p className="mt-6 text-xs uppercase tracking-[0.26em] text-muted">
            {page.introSubtitle ?? dict.work.bookEndOfCollection}
          </p>
        </div>
      ) : null}

      {page.kind === "filler" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <div className="h-px w-14 bg-[#d5c5b8]/75" aria-hidden="true" />
          {page.introTitle ? (
            <p className="mt-8 line-clamp-2 max-w-[14rem] text-[10px] font-medium uppercase tracking-[0.3em] text-accent/50">
              {page.introTitle}
            </p>
          ) : null}
        </div>
      ) : null}

      {page.kind === "project-overview" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent/70">
            {String(page.projectIndex).padStart(2, "0")} /{" "}
            {String(page.projectTotal).padStart(2, "0")}
          </p>
          <h3 className="mt-8 line-clamp-3 font-display text-[clamp(1.9rem,3.4vw,2.7rem)] font-light leading-[1.05] tracking-[-0.03em] text-foreground">
            {page.projectTitle}
          </h3>
          {page.year || page.category ? (
            <p className="mt-5 text-[10px] uppercase tracking-[0.24em] text-muted/90">
              {[page.year, page.category].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {page.shortTagline ? (
            <p className="mt-8 line-clamp-3 max-w-md text-sm leading-[1.85] text-muted">
              {page.shortTagline}
            </p>
          ) : null}
          {interactive && page.projectSlug && onOpenProjectDetail ? (
            <div className="mt-auto space-y-4 pt-10">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenProjectDetail(page.projectSlug!);
                }}
                className="group/link inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-accent/90 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <span className="border-b border-accent/35 pb-0.5 transition group-hover/link:border-foreground/50">
                  {dict.work.viewProjectDetail}
                </span>
                <span aria-hidden="true">→</span>
              </button>
              {page.projectPath ? (
                <Link
                  href={page.projectPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="block text-[9px] uppercase tracking-[0.2em] text-muted/70 transition hover:text-muted"
                >
                  {dict.work.openStandalonePage}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {page.kind === "detail-intro" ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <h3 className="line-clamp-3 font-display text-[clamp(2rem,3.6vw,2.8rem)] font-light leading-[1.05] tracking-[-0.03em] text-foreground">
            {page.projectTitle}
          </h3>
          {page.summary ? (
            <p className="mt-8 line-clamp-[8] max-w-md text-sm leading-[1.9] text-muted">
              {page.summary}
            </p>
          ) : null}
        </div>
      ) : null}

      {page.kind === "detail-meta" ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent/70">
            {page.projectTitle}
          </p>
          <dl className="mt-10 space-y-5 text-sm text-muted">
            {page.client ? (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em]">{dict.caseStudy.client}</dt>
                <dd className="mt-1 text-foreground">{page.client}</dd>
              </div>
            ) : null}
            {page.year ? (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em]">{dict.caseStudy.year}</dt>
                <dd className="mt-1 text-foreground">{page.year}</dd>
              </div>
            ) : null}
            {page.role ? (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em]">{dict.caseStudy.role}</dt>
                <dd className="mt-1 text-foreground">{page.role}</dd>
              </div>
            ) : null}
            {page.category ? (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.22em]">{dict.caseStudy.category}</dt>
                <dd className="mt-1 text-foreground">{page.category}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {page.kind === "project-cover" ? renderImageBlock(OVERVIEW_IMAGE_CLASS) : null}

      {page.kind === "gallery-image" ? renderImageBlock(DETAIL_IMAGE_CLASS, page.imageCaption) : null}

      {page.kind === "excerpt" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="line-clamp-1 text-[10px] font-medium uppercase tracking-[0.3em] text-accent/70">
            {page.projectTitle}
          </p>
          <h3 className="mt-8 line-clamp-2 font-display text-2xl font-light text-foreground">
            {page.excerptTitle}
          </h3>
          <p className="mt-6 line-clamp-[12] text-sm leading-[1.9] text-muted">{page.excerptBody}</p>
        </div>
      ) : null}

      {pageNumber ? (
        <p
          className={cn(
            "pointer-events-none absolute bottom-5 text-[10px] tabular-nums tracking-[0.18em] text-muted/55",
            side === "left" ? "left-7 md:left-9" : "right-7 md:right-9",
          )}
        >
          {String(pageNumber).padStart(2, "0")}
        </p>
      ) : null}
    </div>
  );
}
