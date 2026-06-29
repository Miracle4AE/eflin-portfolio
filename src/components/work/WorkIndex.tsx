"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategoryFilter, ResolvedProject } from "@/types";
import { filterProjectsByCategory } from "@/lib/projects.utils";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Container } from "@/components/ui/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { useDictionary } from "@/i18n/locale-context";
import type { CategoryFilterKey } from "@/i18n/types";
import { cn } from "@/lib/utils";
import { filterItem, fadeUp, defaultViewport } from "@/lib/motion";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";

const categoryKeys: CategoryFilterKey[] = [
  "all",
  "branding",
  "editorial",
  "identity",
  "digital",
  "art-direction",
];

interface WorkIndexProps {
  projects: ResolvedProject[];
}

export function WorkIndex({ projects }: WorkIndexProps) {
  const dict = useDictionary();
  const visualEdit = useVisualEditOptional();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const filtered = filterProjectsByCategory(projects, activeCategory);

  return (
    <section className="pb-24 pt-32 md:pb-32 md:pt-40 lg:pb-40 lg:pt-48">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-16 md:mb-24"
        >
          <MaskReveal className="mb-4">
            <span className="block text-xs font-medium uppercase tracking-[0.3em] text-accent">
              {dict.work.portfolio}
            </span>
          </MaskReveal>
          {visualEdit ? (
            <>
              <h1 className="font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                <VisualField
                  fieldPath="homepage.work.indexTitle"
                  value={dict.work.indexTitle}
                  label="Work page title"
                />
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
                <VisualField
                  fieldPath="homepage.work.indexDescription"
                  value={dict.work.indexDescription}
                  label="Work page description"
                  multiline
                />
              </p>
            </>
          ) : (
            <>
              <TextReveal
                as="h1"
                text={dict.work.indexTitle}
                className="font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl"
              />
              <TextReveal
                as="p"
                text={dict.work.indexDescription}
                delay={0.12}
                className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg"
              />
            </>
          )}
        </motion.div>

        <div className="editorial-divider mb-12 md:mb-16" aria-hidden="true" />

        <motion.nav
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-12 flex flex-wrap gap-x-8 gap-y-3 md:mb-16"
          aria-label="Project categories"
        >
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              type="button"
              data-cursor="default"
              onClick={() => setActiveCategory(cat as CategoryFilter)}
              className={cn(
                "relative py-1 text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300",
                activeCategory === cat
                  ? "text-foreground"
                  : "text-muted hover:text-foreground/70",
              )}
            >
              {dict.categories[cat]}
              {activeCategory === cat && (
                <motion.span
                  layoutId="category-indicator"
                  className="absolute -bottom-1 left-0 h-px w-full bg-accent"
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          ))}
        </motion.nav>

        <motion.div
          layout
          className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-14 lg:grid-cols-12 lg:gap-y-16"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                layout="editorial"
                variants={filterItem}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center text-sm text-muted"
          >
            {dict.work.emptyCategory}
          </motion.p>
        )}
      </Container>
    </section>
  );
}
