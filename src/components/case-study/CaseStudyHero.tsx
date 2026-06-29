"use client";

import type { ResolvedProject } from "@/types";
import { Container } from "@/components/ui/Container";
import { TextRevealInstant } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { easeOutExpo, DURATION } from "@/lib/motion";
import { motion } from "framer-motion";

interface CaseStudyHeroProps {
  project: ResolvedProject;
}

export function CaseStudyHero({ project }: CaseStudyHeroProps) {
  const visualEdit = useVisualEditOptional();
  const base = `projects.${project.slug}`;

  return (
    <section
      className="border-b border-border-soft bg-background pt-28 md:pt-36"
      aria-label={`${project.title} hero`}
    >
      <Container className="pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.slow, delay: 0.2, ease: easeOutExpo }}
        >
          <MaskReveal>
            <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
              {visualEdit ? (
                <VisualField
                  fieldPath={`${base}.category`}
                  value={project.category}
                  label="Category"
                />
              ) : (
                project.category
              )}
            </span>
          </MaskReveal>
        </motion.div>
        {visualEdit ? (
          <>
            <h1 className="max-w-4xl font-display text-5xl font-light leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-8xl">
              <VisualField fieldPath={`${base}.title`} value={project.title} label="Project title" />
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
              <VisualField
                fieldPath={`${base}.summary`}
                value={project.summary}
                label="Project summary"
                multiline
              />
            </p>
          </>
        ) : (
          <>
            <TextRevealInstant
              as="h1"
              text={project.title}
              delay={0.35}
              className="max-w-4xl font-display text-5xl font-light leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-8xl"
            />
            <TextRevealInstant
              as="p"
              text={project.summary}
              delay={0.5}
              className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg"
            />
          </>
        )}
      </Container>
    </section>
  );
}
