"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { Container } from "@/components/ui/Container";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { fadeUp, defaultViewport } from "@/lib/motion";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

interface CaseStudyNavigationProps {
  nextProject: ResolvedProject;
}

export function CaseStudyNavigation({ nextProject }: CaseStudyNavigationProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const viewCursor = useMountedCursor("view");
  return (
    <section className="border-t border-border-soft py-16 md:py-24" aria-label="Project navigation">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between"
        >
          <Link
            href={localizedPath(locale, "/work")}
            {...viewCursor}
            className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-foreground"
          >
            <span
              className="transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            >
              ←
            </span>
            {dict.caseStudy.allWorks}
          </Link>

          <Link
            href={localizedPath(locale, `/work/${nextProject.slug}`)}
            {...viewCursor}
            className="group block text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted">
              {dict.caseStudy.nextProject}
            </span>
            <span className="font-display text-3xl font-light text-foreground transition-colors duration-300 group-hover:text-accent md:text-4xl">
              {nextProject.title}
            </span>
            <span className="mt-1 block text-xs uppercase tracking-[0.15em] text-muted">
              {nextProject.category}
            </span>
            <span
              className="mt-3 inline-block text-lg text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
