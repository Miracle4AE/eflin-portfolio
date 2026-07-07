"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { Container } from "@/components/ui/Container";
import { ProjectImage } from "@/components/work/ProjectImage";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { caseStudyAriaLabel } from "@/i18n/localize";
import { IMAGE_SIZES } from "@/lib/images";
import { pickHeroProjectImage } from "@/lib/images.utils";
import { fadeUp, defaultViewport } from "@/lib/motion";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

interface ProjectShowcaseProps {
  project: ResolvedProject;
}

export function ProjectShowcase({ project }: ProjectShowcaseProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const heroSrc = pickHeroProjectImage(project.images);
  const projectHref = localizedPath(locale, `/work/${project.slug}`);
  const visibleTags = project.tags.slice(0, 4);
  const viewCursor = useMountedCursor("view");

  return (
    <section
      className="relative overflow-hidden border-t border-border-soft bg-background py-24 md:py-32 lg:py-40"
      aria-label={`Project showcase: ${project.title}`}
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.35fr] lg:gap-16 xl:gap-20"
        >
          <div className="max-w-xl">
            <span className="mb-5 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
              {dict.work.inFocus}
            </span>
            <h2 className="font-display text-4xl font-light leading-[1.02] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              {project.title}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">
              {project.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[10px] uppercase tracking-[0.2em] text-muted">
              <span>{project.category}</span>
              <span aria-hidden="true">/</span>
              <span>{project.year}</span>
              {visibleTags.length > 0 ? (
                <>
                  <span aria-hidden="true">/</span>
                  <span>{visibleTags.join(", ")}</span>
                </>
              ) : null}
            </div>
            <Link
              href={projectHref}
              {...viewCursor}
              className="group mt-10 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={caseStudyAriaLabel(project.title, dict.work.viewCaseStudyAria)}
            >
              {dict.work.viewCaseStudy}
              <span
                className="h-px w-10 bg-accent transition-all duration-300 group-hover:w-14"
                aria-hidden="true"
              />
            </Link>
          </div>

          <Link
            href={projectHref}
            {...viewCursor}
            className="group block transition-transform duration-500 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={caseStudyAriaLabel(project.title, dict.work.viewCaseStudyAria)}
          >
            <ProjectImage
              src={heroSrc}
              alt={project.images.imageAlt}
              gradient={project.gradient}
              blurDataURL={project.images.blurDataURL}
              aspectRatio="wide"
              mode="editorial"
              sizes={IMAGE_SIZES.hero}
              framed={false}
              className="max-w-none bg-transparent"
              imageClassName="drop-shadow-[0_28px_60px_rgba(61,56,52,0.12)] transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
