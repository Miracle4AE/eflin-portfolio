import Image from "next/image";
import type { AspectRatio } from "@/types";
import { DEFAULT_BLUR_DATA_URL } from "@/lib/images.constants";
import { cn } from "@/lib/utils";

const aspectClasses: Record<AspectRatio, string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  wide: "aspect-[16/9]",
};

interface ProjectImageProps {
  src?: string | null;
  alt: string;
  gradient: string;
  aspectRatio?: AspectRatio;
  className?: string;
  imageClassName?: string;
  overlay?: boolean;
  interactive?: boolean;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  framed?: boolean;
}

export function ProjectImage({
  src,
  alt,
  gradient,
  aspectRatio = "landscape",
  className,
  imageClassName,
  overlay = false,
  interactive = true,
  priority = false,
  sizes = "100vw",
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  framed = false,
}: ProjectImageProps) {
  const hasImage = Boolean(src);

  return (
    <div
      data-cursor={interactive ? "open" : undefined}
      className={cn(
        "editorial-visual relative w-full overflow-hidden bg-surface",
        aspectClasses[aspectRatio],
        framed && "editorial-frame",
        className,
      )}
    >
      {hasImage ? (
        <Image
          src={src!}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          placeholder="blur"
          blurDataURL={blurDataURL}
          className={cn(
            "object-cover transition-transform duration-[900ms] ease-out",
            imageClassName,
          )}
        />
      ) : (
        <div
          className={cn("absolute inset-0 bg-gradient-to-br", gradient)}
          role="img"
          aria-label={alt}
        />
      )}

      <div className="grain-overlay pointer-events-none" aria-hidden="true" />
      {overlay && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/10"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/** @deprecated Use ProjectImage — kept for gradual migration */
export function ProjectVisual(props: ProjectImageProps) {
  return <ProjectImage {...props} />;
}
