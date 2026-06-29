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

export type ProjectImageMode = "cover" | "contain" | "natural" | "editorial";

interface ProjectImageProps {
  src?: string | null;
  alt: string;
  gradient: string;
  aspectRatio?: AspectRatio;
  mode?: ProjectImageMode;
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
  mode = "cover",
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
  const objectFitClass = mode === "cover" ? "object-cover" : "object-contain";
  const useFixedAspect = mode !== "natural" && mode !== "editorial";

  if (mode === "editorial") {
    return (
      <div
        data-cursor={interactive ? "open" : undefined}
        className={cn(
          "editorial-visual relative mx-auto aspect-[16/9] max-h-[680px] min-h-[240px] w-full max-w-[1100px] overflow-hidden bg-surface",
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
            className={cn("object-contain", imageClassName)}
          />
        ) : (
          <div
            className={cn("absolute inset-0 bg-gradient-to-br", gradient)}
            role="img"
            aria-label={alt}
          />
        )}
        <div className="grain-overlay pointer-events-none" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      data-cursor={interactive ? "open" : undefined}
      className={cn(
        "editorial-visual relative w-full overflow-hidden bg-surface",
        useFixedAspect && aspectClasses[aspectRatio],
        framed && "editorial-frame",
        className,
      )}
    >
      {hasImage ? (
        mode === "natural" ? (
          <div className="flex w-full items-center justify-center p-4 md:p-8">
            <Image
              src={src!}
              alt={alt}
              width={1600}
              height={1200}
              priority={priority}
              sizes={sizes}
              placeholder="blur"
              blurDataURL={blurDataURL}
              className={cn(
                "h-auto w-full max-h-[min(85vh,900px)] object-contain",
                imageClassName,
              )}
            />
          </div>
        ) : (
          <Image
            src={src!}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            placeholder="blur"
            blurDataURL={blurDataURL}
            className={cn(
              objectFitClass,
              "transition-transform duration-[900ms] ease-out",
              imageClassName,
            )}
          />
        )
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
        />
      )}
    </div>
  );
}

/** @deprecated Use ProjectImage — kept for gradual migration */
export function ProjectVisual(props: ProjectImageProps) {
  return <ProjectImage {...props} />;
}
