"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { CategoryFilter, ResolvedProject } from "@/types";
import { filterProjectsByCategory } from "@/lib/projects.utils";
import { ProjectCard } from "@/components/work/ProjectCard";
import { TextReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { useDictionary } from "@/i18n/locale-context";
import type { CategoryFilterKey } from "@/i18n/types";
import { cn } from "@/lib/utils";
import { fadeUp, defaultViewport } from "@/lib/motion";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

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
  afterGridItems?: React.ReactNode;
  onVisualProjectOpen?: (slug: string) => void;
}

export function WorkIndex({
  projects,
  afterGridItems,
  onVisualProjectOpen,
}: WorkIndexProps) {
  const dict = useDictionary();
  const visualEdit = useVisualEditOptional();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const filtered = filterProjectsByCategory(projects, activeCategory);
  const defaultCursor = useMountedCursor("default");

  return (
    <section className="pb-24 pt-32 md:pb-32 md:pt-40 lg:pb-40 lg:pt-48">
      <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-10 2xl:px-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mx-auto mb-14 max-w-5xl text-center md:mb-20 lg:mb-24"
        >
          <MaskReveal className="mb-5">
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
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
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
                className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg"
              />
            </>
          )}
        </motion.div>

        <div className="editorial-divider mb-8 md:mb-10 lg:mb-12" aria-hidden="true" />

        <motion.nav
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-16 flex gap-3 overflow-x-auto pb-2 md:mb-20 md:justify-center md:overflow-visible md:pb-0 lg:mb-24"
          aria-label="Project categories"
        >
          {categoryKeys.map((cat) => (
            <button
              key={cat}
              type="button"
              {...defaultCursor}
              onClick={() => setActiveCategory(cat as CategoryFilter)}
              className={cn(
                "relative shrink-0 rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em] transition-all duration-300",
                activeCategory === cat
                  ? "border-accent/45 bg-accent/10 text-foreground shadow-[0_10px_30px_rgba(121,91,76,0.08)]"
                  : "border-border-soft bg-surface/55 text-muted hover:border-accent/30 hover:text-foreground/75",
              )}
            >
              {dict.categories[cat]}
              {activeCategory === cat && (
                <motion.span
                  layoutId="category-indicator"
                  className="pointer-events-none absolute inset-x-4 -bottom-0.5 h-px bg-accent"
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          ))}
        </motion.nav>

        <motion.div
          className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-x-7 md:gap-y-14 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16 2xl:grid-cols-4 2xl:gap-x-9 2xl:gap-y-20"
        >
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              onVisualOpen={onVisualProjectOpen}
            />
          ))}
          {afterGridItems}
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
      </div>
    </section>
  );
}
