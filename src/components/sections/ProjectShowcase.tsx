"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { Container } from "@/components/ui/Container";
import { ProjectImage } from "@/components/work/ProjectImage";
import { ParallaxBlock } from "@/components/motion/ParallaxBlock";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { caseStudyAriaLabel } from "@/i18n/localize";
import { IMAGE_SIZES } from "@/lib/images";
import { fadeUp, defaultViewport } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface ProjectShowcaseProps {
  project: ResolvedProject;
}

export function ProjectShowcase({ project }: ProjectShowcaseProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.6]);
  const textY = useTransform(scrollYProgress, [0, 0.4, 1], [60, 0, -30]);

  const heroSrc = project.images.heroImage ?? project.images.coverImage;
  const projectHref = localizedPath(locale, `/work/${project.slug}`);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-border-soft bg-background py-24 md:py-32 lg:py-40"
      aria-label={`Project showcase: ${project.title}`}
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-12 flex items-end justify-between md:mb-16"
        >
          <div>
            <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
              {dict.work.inFocus}
            </span>
            <Link
              href={projectHref}
              data-cursor="view"
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <h2 className="font-display text-4xl font-light text-foreground transition-colors duration-300 group-hover:text-accent md:text-5xl lg:text-6xl">
                {project.title}
              </h2>
            </Link>
          </div>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-muted md:block">
            {project.category} · {project.year}
          </span>
        </motion.div>
      </Container>

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <Link
          href={projectHref}
          data-cursor="view"
          className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={caseStudyAriaLabel(project.title, dict.work.viewCaseStudyAria)}
        >
          <ParallaxBlock offset={28} scale>
            <div className="editorial-frame relative overflow-hidden">
              <ProjectImage
                src={heroSrc}
                alt={project.images.imageAlt}
                gradient={project.gradient}
                blurDataURL={project.images.blurDataURL}
                aspectRatio="wide"
                sizes={IMAGE_SIZES.hero}
                overlay
                framed={false}
                className="md:aspect-[16/9] group-hover:[&_img]:scale-[1.02] [&_img]:transition-transform [&_img]:duration-700"
              />

              <motion.div
                style={reducedMotion ? undefined : { opacity: textOpacity, y: textY }}
                className="absolute inset-0 flex items-end"
              >
                <div className="w-full bg-gradient-to-t from-background/95 via-background/50 to-transparent p-8 md:p-12 lg:p-16">
                  <p className="max-w-2xl text-base leading-relaxed text-foreground/85 md:text-lg">
                    {project.summary}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-foreground/15 px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </ParallaxBlock>
        </Link>
      </div>
    </section>
  );
}
