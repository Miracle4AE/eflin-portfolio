"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { ProjectImage } from "@/components/work/ProjectImage";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { caseStudyAriaLabel } from "@/i18n/localize";
import { IMAGE_SIZES } from "@/lib/images";
import { pickPrimaryProjectImage } from "@/lib/images.utils";
import { VisualField } from "@/components/admin/visual/EditableText";
import { VisualImage } from "@/components/admin/visual/EditableImage";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { fadeUp } from "@/lib/motion";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

const CARD_HEIGHT_CLASS = "h-[520px] md:h-[560px] lg:h-[540px] 2xl:h-[600px]";
const THUMBNAIL_HEIGHT_CLASS = "h-[360px] md:h-[392px] lg:h-[376px] 2xl:h-[428px]";
const clampTwoLines =
  "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]";
const clampOneLine =
  "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]";

interface ProjectCardProps {
  project: ResolvedProject;
  index?: number;
  variants?: typeof fadeUp;
}

export function ProjectCard({
  project,
  index = 0,
  variants = fadeUp,
}: ProjectCardProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const visualEdit = useVisualEditOptional();
  const base = `projects.${project.slug}`;
  const viewCursor = useMountedCursor("view");

  const imageSizes = IMAGE_SIZES.card;
  const coverSrc = pickPrimaryProjectImage(project.images);

  const cardInner = (
    <>
      <div className={`relative shrink-0 overflow-hidden bg-greige ${THUMBNAIL_HEIGHT_CLASS}`}>
        {visualEdit ? (
          <VisualImage
            fieldPath={`${base}.coverImagePath`}
            src={coverSrc}
            alt={project.images.imageAlt}
            label="Cover image"
            pickerType="cover"
            projectSlug={project.slug}
            className="h-full"
          >
            <ProjectImage
              src={coverSrc}
              alt={project.images.imageAlt}
              gradient={project.gradient}
              blurDataURL={project.images.blurDataURL}
              aspectRatio="portrait"
              mode="cover"
              sizes={imageSizes}
              framed={false}
              overlay
              className="h-full"
            />
          </VisualImage>
        ) : (
          <ProjectImage
            src={coverSrc}
            alt={project.images.imageAlt}
            gradient={project.gradient}
            blurDataURL={project.images.blurDataURL}
            aspectRatio="portrait"
            mode="cover"
            sizes={imageSizes}
            framed={false}
            overlay
            imageClassName="transition-[filter] duration-500 group-hover:brightness-[0.92]"
            className="h-full"
          />
        )}

        {!visualEdit ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/18 via-transparent to-background/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        ) : null}
      </div>

      <div className="flex h-[160px] shrink-0 flex-col justify-between border-t border-border-soft bg-surface px-4 py-4 md:h-[168px] md:px-5 md:py-5 lg:h-[164px] 2xl:h-[172px]">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <p className="mb-3 text-[10px] uppercase tracking-[0.26em] text-muted">
              {project.year}
            </p>
            <h3 className={`font-display text-[1.35rem] font-light leading-[1.05] text-foreground transition-colors duration-300 group-hover:text-accent md:text-[1.55rem] ${clampTwoLines}`}>
              {visualEdit ? (
                <VisualField fieldPath={`${base}.title`} value={project.title} label="Title" />
              ) : (
                project.title
              )}
            </h3>
          </div>
          <span
            className="shrink-0 font-display text-base leading-none text-muted/35 transition-colors duration-300 group-hover:text-accent"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <p className={`text-[10px] uppercase tracking-[0.2em] text-muted ${clampOneLine}`}>
          {visualEdit ? (
            <VisualField
              fieldPath={`${base}.category`}
              value={project.category}
              label="Category"
            />
          ) : (
            project.category
          )}
        </p>
      </div>
    </>
  );

  return (
    <motion.article
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`group relative ${CARD_HEIGHT_CLASS}`}
    >
      {visualEdit ? (
        <div
          className="museum-card flex h-full flex-col overflow-hidden rounded-[1.5rem] transition duration-500"
        >
          {cardInner}
        </div>
      ) : (
        <Link
          href={localizedPath(locale, `/work/${project.slug}`)}
          {...viewCursor}
          className="museum-card flex h-full flex-col overflow-hidden rounded-[1.5rem] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_30px_90px_rgba(61,56,52,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={caseStudyAriaLabel(project.title, dict.work.viewCaseStudyAria)}
        >
          {cardInner}
        </Link>
      )}
    </motion.article>
  );
}
