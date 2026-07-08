"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { getProjectsForCollection } from "@/lib/content/collections";
import { WorkCollectionCard } from "@/components/work/WorkCollectionCard";
import { TextReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { useDictionary } from "@/i18n/locale-context";
import { fadeUp, defaultViewport } from "@/lib/motion";

interface WorkIndexProps {
  projects: ResolvedProject[];
  collections: ResolvedWorkCollection[];
  afterGridItems?: ReactNode;
  onCollectionEdit?: (collectionId: string) => void;
  collectionEditLabel?: string;
}

export function WorkIndex({
  projects,
  collections,
  afterGridItems,
  onCollectionEdit,
  collectionEditLabel,
}: WorkIndexProps) {
  const dict = useDictionary();

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
          <TextReveal
            as="h1"
            text={dict.work.collectionsTitle}
            className="font-display text-5xl font-light leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl"
          />
          <TextReveal
            as="p"
            text={dict.work.collectionsDescription}
            delay={0.12}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg"
          />
        </motion.div>

        <div className="editorial-divider mb-8 md:mb-10 lg:mb-12" aria-hidden="true" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 xl:grid-cols-3 xl:gap-8"
        >
          {collections.map((collection, index) => (
            <WorkCollectionCard
              key={collection.id}
              collection={collection}
              projects={getProjectsForCollection(projects, collections.map((item) => item.source), collection.id)}
              index={index}
              projectsLabel={dict.work.projectsLabel}
              editLabel={collectionEditLabel}
              onEdit={onCollectionEdit}
            />
          ))}
          {afterGridItems}
        </motion.div>

        {collections.length === 0 && (
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
