"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ResolvedProject } from "@/types";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import type { BookExperienceData } from "@/lib/work/book-pages";
import { BookFallback } from "@/components/work/book/BookFallback";
import { useDictionary } from "@/i18n/locale-context";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

const InteractiveProjectBook = dynamic(
  () =>
    import("@/components/work/book/InteractiveProjectBook").then(
      (module) => module.InteractiveProjectBook,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex min-h-[520px] w-full max-w-[420px] items-center justify-center rounded-[1.35rem] border border-border-soft bg-surface/40 text-sm text-muted">
        Loading book…
      </div>
    ),
  },
);

type CollectionBookIndexProps = {
  collection: ResolvedWorkCollection;
  projects: ResolvedProject[];
  bookData: BookExperienceData;
  workPath: string;
  afterGridItems?: ReactNode;
  onBackToCollections?: () => void;
  onProjectOpen?: (slug: string) => void;
};

export function CollectionBookIndex({
  collection,
  projects,
  bookData,
  workPath,
  afterGridItems,
  onBackToCollections,
  onProjectOpen,
}: CollectionBookIndexProps) {
  const dict = useDictionary();
  const cursor = useMountedCursor("default");

  return (
    <section className="pb-24 pt-32 md:pb-32 md:pt-40 lg:pb-40 lg:pt-48">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          {onBackToCollections ? (
            <button
              type="button"
              {...cursor}
              onClick={() => onBackToCollections()}
              className="inline-flex items-center rounded-full border border-border-soft bg-surface/50 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted transition-colors duration-300 hover:border-accent/35 hover:text-foreground"
            >
              {dict.work.backToCollections}
            </button>
          ) : (
            <Link
              href={workPath}
              {...cursor}
              className="inline-flex items-center rounded-full border border-border-soft bg-surface/50 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted transition-colors duration-300 hover:border-accent/35 hover:text-foreground"
            >
              {dict.work.backToCollections}
            </Link>
          )}
          <div className="min-w-0 text-right">
            <h1 className="font-display text-3xl font-light tracking-tight text-foreground md:text-4xl">
              {collection.title}
            </h1>
            <p className="mt-2 text-sm text-muted">{collection.description}</p>
          </div>
        </div>

        <BookFallback
          collection={collection}
          projects={projects}
          workPath={workPath}
          onBackToCollections={onBackToCollections}
          onProjectOpen={onProjectOpen}
          afterGridItems={afterGridItems}
        >
          <InteractiveProjectBook
            collection={collection}
            bookData={bookData}
            onProjectOpen={onProjectOpen}
          />
        </BookFallback>

        <nav className="sr-only" aria-label={collection.title}>
          <ul>
            {projects.map((project) => (
              <li key={project.slug}>
                <Link href={`${workPath}/${project.slug}`}>
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {afterGridItems ? <div className="mt-10">{afterGridItems}</div> : null}
      </div>
    </section>
  );
}
