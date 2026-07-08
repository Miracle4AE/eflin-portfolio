"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { ProjectImage } from "@/components/work/ProjectImage";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";
import { cn } from "@/lib/utils";

const collectionGradients = [
  "from-[#f6eee4] via-[#ead8ce] to-[#b98f83]",
  "from-[#f4eadf] via-[#e2c8bf] to-[#8f6f63]",
  "from-[#f7efe9] via-[#e8d7c9] to-[#c3a08f]",
  "from-[#f5ebdc] via-[#d8bfb0] to-[#7d645b]",
];

interface WorkCollectionCardProps {
  collection: ResolvedWorkCollection;
  projects: ResolvedProject[];
  index: number;
  projectsLabel: string;
  editLabel?: string;
  onEdit?: (collectionId: string) => void;
  onOpen?: (collectionId: string) => void;
}

export function WorkCollectionCard({
  collection,
  projects,
  index,
  projectsLabel,
  editLabel,
  onEdit,
  onOpen,
}: WorkCollectionCardProps) {
  const cursor = useMountedCursor("open");
  const gradient = collectionGradients[index % collectionGradients.length];
  const previewProjects = projects.filter((project) => project.images.coverImage).slice(0, 3);
  const coverImage = collection.coverImage ?? previewProjects[0]?.images.coverImage ?? null;
  const hasCollage = !collection.coverImage && previewProjects.length > 1;
  const cardClassName = cn(
    "relative flex h-[520px] min-h-[520px] flex-col overflow-hidden rounded-[2rem] border border-border-soft/80",
    "bg-[linear-gradient(145deg,rgba(255,250,244,0.88),rgba(244,232,224,0.68))]",
    "shadow-[0_24px_80px_rgba(81,57,45,0.08)] transition-all duration-500 ease-out",
    "hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-[0_34px_100px_rgba(121,91,76,0.14)]",
    onOpen ? "w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background" : undefined,
  );

  const cardContent = (
    <>
      <div className="relative m-4 h-[245px] overflow-hidden rounded-[1.45rem] border border-white/55 bg-surface/70">
        {hasCollage ? (
          <div className="grid h-full grid-cols-[1.25fr_0.85fr] gap-2 p-2">
            <ProjectImage
              src={previewProjects[0]?.images.coverImage}
              alt={previewProjects[0]?.images.imageAlt ?? collection.title}
              gradient={previewProjects[0]?.gradient ?? gradient}
              aspectRatio="landscape"
              className="h-full rounded-[1.05rem]"
              imageClassName="brightness-[0.96] transition-all duration-700 group-hover:brightness-105"
              sizes="(min-width: 1024px) 34vw, (min-width: 768px) 48vw, 100vw"
            />
            <div className="grid h-full grid-rows-2 gap-2">
              {previewProjects.slice(1, 3).map((project) => (
                <ProjectImage
                  key={project.slug}
                  src={project.images.coverImage}
                  alt={project.images.imageAlt}
                  gradient={project.gradient}
                  aspectRatio="landscape"
                  className="h-full rounded-[0.95rem]"
                  imageClassName="brightness-[0.94] transition-all duration-700 group-hover:brightness-105"
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 24vw, 50vw"
                />
              ))}
            </div>
          </div>
        ) : (
          <ProjectImage
            src={coverImage}
            alt={collection.title}
            gradient={gradient}
            aspectRatio="landscape"
            className="h-full"
            imageClassName="brightness-[0.96] transition-all duration-700 group-hover:brightness-105"
            sizes="(min-width: 1024px) 34vw, (min-width: 768px) 48vw, 100vw"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/24 via-transparent to-white/8" />
      </div>

      <div className="flex flex-1 flex-col px-7 pb-7 pt-4">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-accent/85">
            {projects.length} {projectsLabel}
          </p>
          <span
            className="grid size-9 place-items-center rounded-full border border-accent/20 bg-white/35 text-lg text-accent transition-all duration-500 group-hover:border-accent/45 group-hover:bg-accent/10 group-hover:text-foreground"
            aria-hidden="true"
          >
            ↗
          </span>
        </div>

        <h2 className="font-display text-4xl font-light leading-[1.02] tracking-[-0.035em] text-foreground transition-colors duration-500 group-hover:text-accent md:text-[2.7rem]">
          {collection.title}
        </h2>
        <p className="mt-5 line-clamp-3 max-w-[32rem] text-sm leading-7 text-muted">
          {collection.description}
        </p>
      </div>
    </>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-full"
    >
      {onEdit ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onEdit(collection.id);
          }}
          className="absolute right-8 top-8 z-20 translate-y-1 rounded-full border border-accent/25 bg-background/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-accent opacity-0 shadow-[0_12px_34px_rgba(81,57,45,0.12)] backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          {editLabel}
        </button>
      ) : null}
      {onOpen ? (
        <button
          type="button"
          {...cursor}
          className={cardClassName}
          aria-label={collection.title}
          onClick={() => onOpen(collection.id)}
        >
          {cardContent}
        </button>
      ) : (
        <Link href={collection.path} {...cursor} className={cardClassName} aria-label={collection.title}>
          {cardContent}
        </Link>
      )}
    </motion.article>
  );
}
