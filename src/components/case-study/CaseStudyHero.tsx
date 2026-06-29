"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { Container } from "@/components/ui/Container";
import { ProjectImage } from "@/components/work/ProjectImage";
import { VideoHero } from "@/components/case-study/VideoHero";
import { TextRevealInstant } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { IMAGE_SIZES } from "@/lib/images";
import { easeOutExpo, DURATION } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface CaseStudyHeroProps {
  project: ResolvedProject;
}

export function CaseStudyHero({ project }: CaseStudyHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  const heroSrc = project.images.heroImage ?? project.images.coverImage;
  const heroVideo = project.images.videoPlaceholder;
  const useVideo = Boolean(heroVideo) && !reducedMotion;

  return (
    <section
      ref={ref}
      className="relative flex min-h-[90vh] items-end overflow-hidden md:min-h-screen"
      aria-label={`${project.title} hero`}
    >
      <motion.div
        style={reducedMotion ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0"
      >
        {useVideo && heroVideo ? (
          <>
            <VideoHero
              src={heroVideo}
              poster={heroSrc}
              gradient={project.gradient}
              ariaLabel={project.images.imageAlt}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20"
              aria-hidden="true"
            />
            <div className="grain-overlay pointer-events-none" aria-hidden="true" />
          </>
        ) : (
          <ProjectImage
            src={heroSrc}
            alt={project.images.imageAlt}
            gradient={project.gradient}
            blurDataURL={project.images.blurDataURL}
            aspectRatio="wide"
            sizes={IMAGE_SIZES.hero}
            priority
            framed={false}
            overlay
            className="!aspect-auto h-full min-h-[90vh] md:min-h-screen"
            imageClassName="scale-105"
          />
        )}
      </motion.div>

      <Container className="relative z-10 pb-16 pt-32 md:pb-24">
        <motion.div style={reducedMotion ? undefined : { opacity: contentOpacity, y: contentY }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.slow, delay: 0.2, ease: easeOutExpo }}
          >
            <MaskReveal>
              <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
                {project.category}
              </span>
            </MaskReveal>
          </motion.div>
          <TextRevealInstant
            as="h1"
            text={project.title}
            delay={0.35}
            className="font-display text-5xl font-light leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-8xl"
          />
          <TextRevealInstant
            as="p"
            text={project.summary}
            delay={0.5}
            className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/75 md:text-lg"
          />
        </motion.div>
      </Container>

      {!reducedMotion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1, ease: easeOutExpo }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="h-12 w-px bg-accent/40"
          />
        </motion.div>
      )}
    </section>
  );
}
