"use client";

import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { Container } from "@/components/ui/Container";
import { useDictionary } from "@/i18n/locale-context";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { fadeUp, staggerContainer, defaultViewport, lineReveal } from "@/lib/motion";

interface CaseStudyVisualSystemProps {
  project: ResolvedProject;
}

export function CaseStudyVisualSystem({ project }: CaseStudyVisualSystemProps) {
  const dict = useDictionary();
  const visualEdit = useVisualEditOptional();
  const base = `projects.${project.slug}`;
  return (
    <section
      className="border-t border-border-soft py-16 md:py-24 lg:py-32"
      aria-label="Design system"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-12 md:mb-16"
        >
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
            {dict.caseStudy.designSystem}
          </span>
          <h2 className="font-display text-3xl font-light text-foreground md:text-4xl">
            {dict.caseStudy.designSystemTitle}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
          >
            <h3 className="mb-4 text-[10px] uppercase tracking-[0.25em] text-muted">
              {dict.caseStudy.typography}
            </h3>
            <p className="text-base leading-[1.85] text-foreground/85 md:text-lg">
              {visualEdit ? (
                <VisualField
                  fieldPath={`${base}.typography`}
                  value={project.typography}
                  label="Typography"
                  multiline
                />
              ) : (
                project.typography
              )}
            </p>

            <motion.div
              variants={lineReveal}
              className="my-10 h-px w-full bg-foreground/10"
              aria-hidden="true"
            />

            <h3 className="mb-4 text-[10px] uppercase tracking-[0.25em] text-muted">
              {dict.caseStudy.visualDirection}
            </h3>
            <p className="text-base leading-[1.85] text-foreground/85 md:text-lg">
              {visualEdit ? (
                <VisualField
                  fieldPath={`${base}.visualDirection`}
                  value={project.visualDirection}
                  label="Visual direction"
                  multiline
                />
              ) : (
                project.visualDirection
              )}
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainer}
          >
            <h3 className="mb-6 text-[10px] uppercase tracking-[0.25em] text-muted">
              {dict.caseStudy.colorPalette}
            </h3>
            <div className="space-y-4">
              {project.palette.map((color) => (
                <motion.div
                  key={color.hex}
                  variants={fadeUp}
                  className="group flex items-center gap-5"
                >
                  <div
                    className="h-12 w-12 shrink-0 border border-foreground/10 transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm text-foreground">{color.name}</p>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted">
                      {color.hex}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
