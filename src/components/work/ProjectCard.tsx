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
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

const cardAspectClasses = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
} as const;

interface ProjectCardProps {
  project: ResolvedProject;
  index?: number;
  layout?: "default" | "editorial";
  variants?: typeof fadeUp;
}

export function ProjectCard({
  project,
  index = 0,
  layout = "default",
  variants = fadeUp,
}: ProjectCardProps) {
  const dict = useDictionary();
  const { locale } = useLocale();

  const isWide =
    layout === "editorial"
      ? index === 0 || index === 3 || index === 4
      : index === 1 || index === 3;
  const isTall = layout === "editorial" && index === 2;
  const imageSizes = isWide ? IMAGE_SIZES.cardWide : IMAGE_SIZES.card;

  return (
    <motion.article
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn(
        "group relative",
        isWide && "md:col-span-2",
        layout === "editorial" && isTall && "md:row-span-2",
      )}
    >
      <Magnetic strength={0.12} className="block">
        <Link
          href={localizedPath(locale, `/work/${project.slug}`)}
          data-cursor="view"
          className="museum-card block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={caseStudyAriaLabel(project.title, dict.work.viewCaseStudyAria)}
        >
          <div className="relative overflow-hidden p-px">
            <MaskReveal>
              <ImageReveal>
                <ProjectImage
                  src={project.images.coverImage}
                  alt={project.images.imageAlt}
                  gradient={project.gradient}
                  blurDataURL={project.images.blurDataURL}
                  aspectRatio={project.aspectRatio}
                  sizes={imageSizes}
                  framed={false}
                  overlay
                  className={cn(
                    cardAspectClasses[project.aspectRatio],
                    isWide && "md:aspect-[16/9]",
                    isTall && "md:aspect-auto md:h-full md:min-h-[480px]",
                    "group-hover:scale-[1.01] [&_img]:transition-transform [&_img]:duration-[900ms] [&_img]:ease-out group-hover:[&_img]:scale-[1.04]",
                  )}
                />
              </ImageReveal>
            </MaskReveal>

            <div className="absolute inset-0 flex items-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:p-8">
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/35 to-transparent" aria-hidden="true" />
              <div className="relative translate-y-3 transition-transform duration-500 group-hover:translate-y-0">
                <p className="text-xs uppercase tracking-[0.2em] text-foreground/85">
                  {project.category} · {project.year}
                </p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                  {project.summary}
                </p>
              </div>
            </div>

            <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:opacity-100 md:right-8 md:top-8">
              <span className="text-sm text-foreground" aria-hidden="true">
                →
              </span>
            </div>
          </div>

          <div className="border-t border-border-soft px-5 py-5 md:px-6 md:py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-light text-foreground transition-colors duration-300 group-hover:text-accent md:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">
                  {project.category}
                </p>
              </div>
              <span
                className="mt-2 shrink-0 font-display text-lg text-muted/40 transition-colors duration-300 group-hover:text-accent"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        </Link>
      </Magnetic>
    </motion.article>
  );
}
