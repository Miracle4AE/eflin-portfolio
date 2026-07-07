"use client";

import type { ResolvedGalleryItem } from "@/types";
import { ProjectImage } from "@/components/work/ProjectImage";
import { MaskReveal, ImageReveal } from "@/components/motion/MaskReveal";
import { ParallaxBlock } from "@/components/motion/ParallaxBlock";
import { useDictionary } from "@/i18n/locale-context";
import { VisualField } from "@/components/admin/visual/EditableText";
import { VisualImage } from "@/components/admin/visual/EditableImage";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { cn } from "@/lib/utils";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

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
  const visualEdit = useVisualEditOptional();
  const alt = item.alt ?? imageAlt;
  const slug = visualEdit?.projectSlug ?? "";
  const imagePath = `projects.${slug}.gallery.${item.id}.imagePath`;
  const captionPath = `projects.${slug}.gallery.${item.id}.caption`;
  const openCursor = useMountedCursor(visualEdit ? undefined : "open");

  const imageNode = (
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
  );

  return (
    <figure className={cn("group", isWide && "md:col-span-2")}>
      <button
        type="button"
        onClick={() => !visualEdit && onOpen(index)}
        {...openCursor}
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
              {visualEdit && slug ? (
                <VisualImage
                  fieldPath={imagePath}
                  src={item.src}
                  alt={alt}
                  label={`Gallery image ${index + 1}`}
                  pickerType="gallery"
                  projectSlug={slug}
                >
                  {imageNode}
                </VisualImage>
              ) : (
                imageNode
              )}
            </ImageReveal>
          </MaskReveal>
        </ParallaxBlock>
      </button>
      {item.caption ? (
        <figcaption className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-muted">
          <span className="h-px w-6 bg-accent/40" aria-hidden="true" />
          {visualEdit && slug ? (
            <VisualField
              fieldPath={captionPath}
              value={item.caption}
              label={`Gallery caption ${index + 1}`}
            />
          ) : (
            item.caption
          )}
        </figcaption>
      ) : null}
    </figure>
  );
}
