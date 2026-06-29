"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResolvedGalleryItem } from "@/types";
import { Container } from "@/components/ui/Container";
import { Lightbox } from "@/components/gallery/Lightbox";
import { GalleryItem } from "@/components/gallery/GalleryItem";
import { TextReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { toLightboxItems } from "@/lib/gallery";
import { useDictionary } from "@/i18n/locale-context";
import { IMAGE_SIZES } from "@/lib/images";
import { fadeUp, defaultViewport } from "@/lib/motion";

interface CaseStudyGalleryProps {
  items: ResolvedGalleryItem[];
  imageAlt: string;
  blurDataURL?: string;
}

export function CaseStudyGallery({
  items,
  imageAlt,
  blurDataURL,
}: CaseStudyGalleryProps) {
  const dict = useDictionary();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxItems = toLightboxItems(items, imageAlt);

  return (
    <section className="py-16 md:py-24 lg:py-32" aria-label="Project gallery">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-12 md:mb-16"
        >
          <MaskReveal className="mb-4">
            <span className="block text-xs font-medium uppercase tracking-[0.3em] text-accent">
              {dict.caseStudy.gallery}
            </span>
          </MaskReveal>
          <TextReveal
            as="h2"
            text={dict.caseStudy.galleryTitle}
            className="font-display text-3xl font-light text-foreground md:text-4xl"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {items.map((item, index) => {
            const isWide = item.aspectRatio === "wide" || index === 0;
            const sizes = isWide ? IMAGE_SIZES.galleryWide : IMAGE_SIZES.gallery;

            return (
              <motion.div
                key={item.id}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                variants={fadeUp}
              >
                <GalleryItem
                  item={item}
                  index={index}
                  imageAlt={imageAlt}
                  blurDataURL={blurDataURL}
                  isWide={isWide}
                  sizes={sizes}
                  onOpen={setLightboxIndex}
                />
              </motion.div>
            );
          })}
        </div>
      </Container>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            key="gallery-lightbox"
            items={lightboxItems}
            activeIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
            blurDataURL={blurDataURL}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
