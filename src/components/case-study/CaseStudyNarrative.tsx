"use client";

import { motion } from "framer-motion";
import { useDictionary } from "@/i18n/locale-context";
import { Container } from "@/components/ui/Container";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { fadeUp, staggerContainer, defaultViewport } from "@/lib/motion";

interface NarrativeSection {
  label: string;
  content: string;
  contentPath?: string;
}

interface CaseStudyNarrativeProps {
  sections: NarrativeSection[];
}

export function CaseStudyNarrative({ sections }: CaseStudyNarrativeProps) {
  const dict = useDictionary();
  const visualEdit = useVisualEditOptional();

  return (
    <section className="border-t border-border-soft py-16 md:py-24 lg:py-32" aria-label="Process notes">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-12 md:mb-16"
        >
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
            {dict.caseStudy.processNotes}
          </span>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-16 md:gap-24 lg:grid-cols-3"
        >
          {sections.map((section) => (
            <motion.article key={section.label} variants={fadeUp}>
              <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
                {section.label}
              </span>
              <p className="text-base leading-[1.85] text-foreground/85 md:text-lg md:leading-[1.9]">
                {visualEdit && section.contentPath ? (
                  <VisualField
                    fieldPath={section.contentPath}
                    value={section.content}
                    label={section.label}
                    multiline
                  />
                ) : (
                  section.content
                )}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
