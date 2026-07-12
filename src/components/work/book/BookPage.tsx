"use client";

import Link from "next/link";
import type { BookPageData } from "@/lib/work/book-pages";
import { ProjectImage } from "@/components/work/ProjectImage";
import { useDictionary } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import { BOOK_TEXTURE_CLASS } from "@/components/work/book/book-styles";

type BookPageProps = {
  page: BookPageData;
  paperClass: string;
  onProjectOpen?: (slug: string) => void;
  onPersistBeforeNavigate?: () => void;
  interactive?: boolean;
};

const PAGE_SHELL_CLASS =
  "relative flex h-[460px] flex-col overflow-hidden border border-[#e8ddd2]/80 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] md:p-8";
const IMAGE_FRAME_CLASS =
  "relative h-[300px] w-full shrink-0 overflow-hidden rounded-[1rem] border border-[#e8ddd2]/60 bg-[#f3ebe2]/50";

export function BookPage({
  page,
  paperClass,
  onProjectOpen,
  onPersistBeforeNavigate,
  interactive = true,
}: BookPageProps) {
  const dict = useDictionary();

  const metadataRows = [
    { label: dict.caseStudy.year, value: page.year },
    { label: dict.caseStudy.category, value: page.category },
    { label: dict.caseStudy.client, value: page.client },
    { label: dict.caseStudy.role, value: page.role },
  ].filter((row) => row.value?.trim());

  const handleProjectNavigate = (slug: string) => {
    onPersistBeforeNavigate?.();
    onProjectOpen?.(slug);
  };

  const projectLink =
    page.projectPath && page.projectSlug ? (
      onProjectOpen ? (
        <button
          type="button"
          onClick={() => handleProjectNavigate(page.projectSlug!)}
          className="mt-auto inline-flex items-center gap-2 pt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-accent transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {dict.work.viewCaseStudy}
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <Link
          href={page.projectPath}
          onClick={() => onPersistBeforeNavigate?.()}
          className="mt-auto inline-flex items-center gap-2 pt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-accent transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {dict.work.viewCaseStudy}
          <span aria-hidden="true">→</span>
        </Link>
      )
    ) : null;

  return (
    <div className={cn(PAGE_SHELL_CLASS, paperClass, BOOK_TEXTURE_CLASS)}>
      {page.kind === "intro" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-accent/80">
            {page.projectCount} {dict.work.projectsLabel}
          </p>
          <h2 className="mt-6 line-clamp-3 font-display text-3xl font-light leading-[1.05] tracking-[-0.03em] text-foreground md:text-4xl">
            {page.introTitle}
          </h2>
          {page.introSubtitle ? (
            <p className="mt-4 line-clamp-2 text-sm uppercase tracking-[0.18em] text-muted">
              {page.introSubtitle}
            </p>
          ) : null}
          {page.introDescription ? (
            <p className="mt-6 line-clamp-[8] max-w-md text-sm leading-7 text-muted">
              {page.introDescription}
            </p>
          ) : null}
        </div>
      ) : null}

      {page.kind === "closing" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-accent/70">
            Eflin
          </p>
          <h2 className="mt-6 line-clamp-3 max-w-sm font-display text-3xl font-light leading-[1.05] tracking-[-0.03em] text-foreground">
            {page.introTitle}
          </h2>
          <p className="mt-5 text-sm uppercase tracking-[0.22em] text-muted">
            {page.introSubtitle ?? dict.work.bookEndOfCollection}
          </p>
          {page.introDescription ? (
            <p className="mt-4 line-clamp-3 max-w-xs text-sm leading-7 text-muted/90">
              {page.introDescription}
            </p>
          ) : null}
        </div>
      ) : null}

      {page.kind === "filler" ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
          <div className="h-px w-16 bg-[#d8c8bb]/80" aria-hidden="true" />
          {page.introTitle ? (
            <p className="mt-6 line-clamp-2 max-w-[16rem] text-[10px] font-medium uppercase tracking-[0.28em] text-accent/55">
              {page.introTitle}
            </p>
          ) : null}
        </div>
      ) : null}

      {page.kind === "project-meta" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-accent/80">
            {page.projectIndex} / {page.projectTotal}
          </p>
          <h3 className="mt-5 line-clamp-3 font-display text-3xl font-light leading-[1.05] tracking-[-0.03em] text-foreground">
            {page.projectTitle}
          </h3>
          {metadataRows.length > 0 ? (
            <dl className="mt-6 space-y-3 text-sm text-muted">
              {metadataRows.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between gap-4 border-b border-[#e8ddd2]/70 pb-2"
                >
                  <dt>{row.label}</dt>
                  <dd className="line-clamp-2 text-right text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {page.summary ? (
            <p className="mt-6 line-clamp-[7] text-sm leading-7 text-muted">{page.summary}</p>
          ) : null}
          {interactive ? projectLink : null}
        </div>
      ) : null}

      {page.kind === "project-cover" || page.kind === "gallery-image" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {page.projectTitle ? (
            <p className="mb-4 line-clamp-1 text-[10px] font-medium uppercase tracking-[0.24em] text-accent/75">
              {page.projectTitle}
            </p>
          ) : null}
          <div className={IMAGE_FRAME_CLASS}>
            <ProjectImage
              src={page.imageSrc}
              alt={page.imageAlt ?? page.projectTitle ?? "Project artwork"}
              gradient={page.imageGradient ?? "from-[#f6eee4] via-[#ead8ce] to-[#b98f83]"}
              mode="contain"
              className="h-full w-full"
              imageClassName="p-2"
              sizes="(min-width: 1024px) 40vw, 90vw"
            />
          </div>
          {page.kind === "project-cover" && interactive ? projectLink : null}
        </div>
      ) : null}

      {page.kind === "excerpt" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <p className="line-clamp-1 text-[10px] font-medium uppercase tracking-[0.28em] text-accent/80">
            {page.projectTitle}
          </p>
          <h3 className="mt-5 line-clamp-2 font-display text-2xl font-light text-foreground">
            {page.excerptTitle}
          </h3>
          <p className="mt-5 line-clamp-[14] text-sm leading-7 text-muted">{page.excerptBody}</p>
        </div>
      ) : null}
    </div>
  );
}
