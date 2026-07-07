"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { fadeUp, staggerContainer, defaultViewport } from "@/lib/motion";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";

interface FeaturedWorksProps {
  projects: ResolvedProject[];
}

export function FeaturedWorks({ projects }: FeaturedWorksProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const visualEdit = useVisualEditOptional();

  return (
    <section id="work" className="border-t border-border-soft bg-section py-24 md:py-32 lg:py-40" aria-labelledby="work-heading">
      <Container>
        <SectionHeading
          label={dict.work.featuredLabel}
          title={dict.work.featuredTitle}
          description={dict.work.featuredDescription}
          editPaths={
            visualEdit
              ? {
                  label: "homepage.work.featuredLabel",
                  title: "homepage.work.featuredTitle",
                  description: "homepage.work.featuredDescription",
                }
              : undefined
          }
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-16"
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
            />
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mt-16 text-center md:mt-24"
        >
          <Link
            href={localizedPath(locale, "/work")}
            data-cursor="view"
            className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-foreground"
          >
            {dict.work.viewAll}
            <span
              className="transition-transform duration-300 group-hover:translate-x-1"
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
