"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { getProjectsForCollection } from "@/lib/content/collections";
import { WorkCollectionCard } from "@/components/work/WorkCollectionCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useDictionary, useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { fadeUp, staggerContainer, defaultViewport } from "@/lib/motion";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

interface FeaturedWorksProps {
  projects: ResolvedProject[];
  collections: ResolvedWorkCollection[];
}

export function FeaturedWorks({ projects, collections }: FeaturedWorksProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const visualEdit = useVisualEditOptional();
  const viewCursor = useMountedCursor("view");

  return (
    <section id="work" className="border-t border-border-soft bg-section py-24 md:py-32 lg:py-40" aria-labelledby="work-heading">
      <Container>
        <SectionHeading
          label={dict.work.portfolio}
          title={dict.nav.work}
          description={dict.work.collectionsDescription}
          editPaths={
            visualEdit
              ? {
                  description: "homepage.work.indexDescription",
                }
              : undefined
          }
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7"
        >
          {collections.map((collection, index) => (
            <WorkCollectionCard
              key={collection.id}
              collection={collection}
              projects={getProjectsForCollection(
                projects,
                collections.map((item) => item.source),
                collection.id,
              )}
              index={index}
              projectsLabel={dict.work.projectsLabel}
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
            {...viewCursor}
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
