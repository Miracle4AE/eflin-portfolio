"use client";

import Link from "next/link";
import type { BookPageData } from "@/lib/work/book-pages";
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
  onProjectOpen?: (slug: string) => void;
  onPersistBeforeNavigate?: () => void;
  showProjectLink?: boolean;
  interactive?: boolean;
};

const IMAGE_FRAME_CLASS =
  "relative mx-auto h-[min(340px,48vh)] w-full max-w-[92%] overflow-hidden";

export function BookPage({
  page,
  paperClass,
  side = "left",
  pageNumber,
  onProjectOpen,
  onPersistBeforeNavigate,
  showProjectLink = false,
  interactive = true,
}: BookPageProps) {
  const dict = useDictionary();

  const metadataItems = [
    page.year ? `${page.year}` : null,
    page.role?.trim() ? page.role : null,
    page.client?.trim() ? page.client : null,
    page.category?.trim() ? page.category : null,
  ].filter(Boolean) as string[];

  const handleProjectNavigate = (slug: string) => {
    onPersistBeforeNavigate?.();
    onProjectOpen?.(slug);
  };

  const projectLink =
    showProjectLink && page.projectPath && page.projectSlug ? (
      onProjectOpen ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleProjectNavigate(page.projectSlug!);
          }}
          className="group/link inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-accent/90 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="border-b border-accent/35 pb-0.5 transition group-hover/link:border-foreground/50">
            {dict.work.viewCaseStudy}
          </span>
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <Link
          href={page.projectPath}
          onClick={(event) => {
            event.stopPropagation();
            onPersistBeforeNavigate?.();
          }}
          className="group/link inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-accent/90 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="border-b border-accent/35 pb-0.5 transition group-hover/link:border-foreground/50">
            {dict.work.viewCaseStudy}
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )
    ) : null;

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

      {page.kind === "closing" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-accent/65">
            Eflin
          </p>
          <h2 className="mt-8 line-clamp-3 max-w-sm font-display text-3xl font-light leading-[1.05] tracking-[-0.03em] text-foreground">
            {page.introTitle}
          </h2>
          <p className="mt-6 text-xs uppercase tracking-[0.26em] text-muted">
            {page.introSubtitle ?? dict.work.bookEndOfCollection}
          </p>
          {page.introDescription ? (
            <p className="mt-5 line-clamp-3 max-w-xs text-sm leading-7 text-muted/90">
              {page.introDescription}
            </p>
          ) : null}
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

      {page.kind === "project-meta" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-accent/70">
            {String(page.projectIndex).padStart(2, "0")} /{" "}
            {String(page.projectTotal).padStart(2, "0")}
          </p>
          <h3 className="mt-8 line-clamp-3 font-display text-[clamp(1.85rem,3.2vw,2.6rem)] font-light leading-[1.06] tracking-[-0.03em] text-foreground">
            {page.projectTitle}
          </h3>
          {page.summary ? (
            <p className="mt-8 line-clamp-[6] max-w-md text-sm leading-[1.9] text-muted">
              {page.summary}
            </p>
          ) : null}
          {metadataItems.length > 0 ? (
            <p className="mt-auto pt-10 text-[10px] uppercase tracking-[0.22em] text-muted/90">
              {metadataItems.join(" · ")}
            </p>
          ) : null}
          {interactive && projectLink ? (
            <div className="mt-6">{projectLink}</div>
          ) : null}
        </div>
      ) : null}

      {page.kind === "project-cover" || page.kind === "gallery-image" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className={cn(IMAGE_FRAME_CLASS, "mt-2 flex flex-1 items-center justify-center")}>
            <ProjectImage
              src={page.imageSrc}
              alt={page.imageAlt ?? page.projectTitle ?? "Project artwork"}
              gradient={page.imageGradient ?? "from-[#f6eee4] via-[#ead8ce] to-[#b98f83]"}
              mode="contain"
              className="h-full w-full"
              imageClassName="p-3"
              sizes="(min-width: 1024px) 38vw, 90vw"
            />
          </div>
          {page.projectTitle ? (
            <p className="mt-5 text-center text-[10px] uppercase tracking-[0.26em] text-muted/85">
              {page.projectTitle}
            </p>
          ) : null}
        </div>
      ) : null}

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
