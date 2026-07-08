"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { ProjectCard } from "@/components/work/ProjectCard";
import { useDictionary } from "@/i18n/locale-context";
import { fadeUp, defaultViewport } from "@/lib/motion";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

interface CollectionProjectsIndexProps {
  collection: ResolvedWorkCollection;
  projects: ResolvedProject[];
  workPath: string;
  afterGridItems?: ReactNode;
  onBackToCollections?: () => void;
  onProjectOpen?: (slug: string) => void;
}

export function CollectionProjectsIndex({
  collection,
  projects,
  workPath,
  afterGridItems,
  onBackToCollections,
  onProjectOpen,
}: CollectionProjectsIndexProps) {
  const dict = useDictionary();
  const cursor = useMountedCursor("default");
  const hasGridItems = projects.length > 0 || Boolean(afterGridItems);

  return (
    <section className="pb-24 pt-32 md:pb-32 md:pt-40 lg:pb-40 lg:pt-48">
      <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-10 2xl:px-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mx-auto mb-14 max-w-5xl text-center md:mb-20"
        >
          {onBackToCollections ? (
            <button
              type="button"
              {...cursor}
              onClick={() => onBackToCollections()}
              className="mb-8 inline-flex items-center rounded-full border border-border-soft bg-surface/50 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted transition-colors duration-300 hover:border-accent/35 hover:text-foreground"
            >
              {dict.work.backToCollections}
            </button>
          ) : (
            <Link
              href={workPath}
              {...cursor}
              className="mb-8 inline-flex items-center rounded-full border border-border-soft bg-surface/50 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted transition-colors duration-300 hover:border-accent/35 hover:text-foreground"
            >
              {dict.work.backToCollections}
            </Link>
          )}
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-accent">
            {projects.length} {dict.work.projectsLabel}
          </p>
          <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            {collection.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {collection.description}
          </p>
        </motion.div>

        <div className="editorial-divider mb-10 md:mb-14" aria-hidden="true" />

        {hasGridItems ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-x-7 md:gap-y-14 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16 2xl:grid-cols-4 2xl:gap-x-9 2xl:gap-y-20"
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                onVisualOpen={onProjectOpen}
              />
            ))}
            {afterGridItems}
          </motion.div>
        ) : (
          <p className="py-20 text-center text-sm text-muted">{dict.work.emptyCategory}</p>
        )}
      </div>
    </section>
  );
}
