"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { ProjectImage } from "@/components/work/ProjectImage";
import { Magnetic } from "@/components/motion/Magnetic";
import { MaskReveal, ImageReveal } from "@/components/motion/MaskReveal";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { caseStudyAriaLabel } from "@/i18n/localize";
import { IMAGE_SIZES } from "@/lib/images";
import { pickPrimaryProjectImage } from "@/lib/images.utils";
import { VisualField } from "@/components/admin/visual/EditableText";
import { VisualImage } from "@/components/admin/visual/EditableImage";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

const CARD_THUMBNAIL_ASPECT_CLASS = "aspect-[4/5]";

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

  const imageSizes = IMAGE_SIZES.card;
  const coverSrc = pickPrimaryProjectImage(project.images);

  const cardInner = (
    <>
      <div className="relative overflow-hidden bg-greige">
        <MaskReveal>
          <ImageReveal>
            {visualEdit ? (
              <VisualImage
                fieldPath={`${base}.coverImagePath`}
                src={coverSrc}
                alt={project.images.imageAlt}
                label="Cover image"
                pickerType="cover"
                projectSlug={project.slug}
              >
                <ProjectImage
                  src={coverSrc}
                  alt={project.images.imageAlt}
                  gradient={project.gradient}
                  blurDataURL={project.images.blurDataURL}
                  aspectRatio={project.aspectRatio}
                  mode="cover"
                  sizes={imageSizes}
                  framed={false}
                  overlay
                  className={CARD_THUMBNAIL_ASPECT_CLASS}
                  imageClassName="scale-[1.01]"
                />
              </VisualImage>
            ) : (
              <ProjectImage
                src={coverSrc}
                alt={project.images.imageAlt}
                gradient={project.gradient}
                blurDataURL={project.images.blurDataURL}
                aspectRatio={project.aspectRatio}
                mode="cover"
                sizes={imageSizes}
                framed={false}
                overlay
                className={cn(
                  CARD_THUMBNAIL_ASPECT_CLASS,
                  "[&_img]:scale-[1.01] [&_img]:transition-transform [&_img]:duration-[900ms] [&_img]:ease-out group-hover:[&_img]:scale-[1.045]",
                )}
              />
            )}
          </ImageReveal>
        </MaskReveal>

        {!visualEdit ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        ) : null}
      </div>

      <div className="border-t border-border-soft px-5 py-5 md:px-6 md:py-6">
        <div className="flex min-h-24 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted">
              {project.year}
            </p>
            <h3 className="font-display text-2xl font-light leading-tight text-foreground transition-colors duration-300 group-hover:text-accent md:text-[1.7rem]">
              {visualEdit ? (
                <VisualField fieldPath={`${base}.title`} value={project.title} label="Title" />
              ) : (
                project.title
              )}
            </h3>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-muted">
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
          <span
            className="mt-0.5 shrink-0 font-display text-lg text-muted/35 transition-colors duration-300 group-hover:text-accent"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </>
  );

  return (
    <motion.article
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="group relative"
    >
      <Magnetic strength={visualEdit ? 0 : 0.04} className="block">
        {visualEdit ? (
          <div className="museum-card block overflow-hidden rounded-[1.35rem] transition duration-500">
            {cardInner}
          </div>
        ) : (
          <Link
            href={localizedPath(locale, `/work/${project.slug}`)}
            data-cursor="view"
            className="museum-card block overflow-hidden rounded-[1.35rem] transition duration-500 hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_24px_70px_rgba(61,56,52,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={caseStudyAriaLabel(project.title, dict.work.viewCaseStudyAria)}
          >
            {cardInner}
          </Link>
        )}
      </Magnetic>
    </motion.article>
  );
}
