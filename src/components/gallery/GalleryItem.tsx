"use client";

import type { ResolvedGalleryItem } from "@/types";
import { ProjectImage } from "@/components/work/ProjectImage";
import { MaskReveal, ImageReveal } from "@/components/motion/MaskReveal";
import { ParallaxBlock } from "@/components/motion/ParallaxBlock";
import { useDictionary } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";

interface GalleryItemProps {
  item: ResolvedGalleryItem;
  index: number;
  imageAlt: string;
  blurDataURL?: string;
  isWide: boolean;
  sizes: string;
  onOpen: (index: number) => void;
}

export function GalleryItem({
  item,
  index,
  imageAlt,
  blurDataURL,
  isWide,
  sizes,
  onOpen,
}: GalleryItemProps) {
  const dict = useDictionary();
  const alt = item.alt ?? imageAlt;

  return (
    <figure className={cn("group", isWide && "md:col-span-2")}>
      <button
        type="button"
        onClick={() => onOpen(index)}
        data-cursor="open"
        aria-label={
          item.caption
            ? `${dict.caseStudy.viewGalleryImage}: ${item.caption}`
            : `${dict.caseStudy.viewGalleryImage} ${index + 1}`
        }
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ParallaxBlock offset={index % 2 === 0 ? 16 : 24}>
          <MaskReveal>
            <ImageReveal>
              <ProjectImage
                src={item.src}
                alt={alt}
                gradient={item.gradient}
                blurDataURL={blurDataURL}
                aspectRatio={item.aspectRatio}
                mode="contain"
                sizes={sizes}
                framed
                overlay
                interactive={false}
                className="group-hover:[&_img]:scale-[1.02] [&_img]:transition-transform [&_img]:duration-[900ms] cursor-zoom-in"
              />
            </ImageReveal>
          </MaskReveal>
        </ParallaxBlock>
      </button>
      {item.caption && (
        <figcaption className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-muted">
          <span className="h-px w-6 bg-accent/40" aria-hidden="true" />
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}
