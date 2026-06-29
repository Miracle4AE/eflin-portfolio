"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface VideoHeroProps {
  src: string;
  poster?: string | null;
  gradient: string;
  className?: string;
  ariaLabel?: string;
}

export function VideoHero({
  src,
  poster,
  gradient,
  className,
  ariaLabel = "Project hero video",
}: VideoHeroProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (poster) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- poster fallback when video fails
        <img
          src={poster}
          alt={ariaLabel}
          className={cn("absolute inset-0 h-full w-full object-cover", className)}
        />
      );
    }

    return (
      <div
        className={cn("absolute inset-0 bg-gradient-to-br", gradient, className)}
        role="img"
        aria-label={ariaLabel}
      />
    );
  }

  return (
    <video
      src={src}
      poster={poster ?? undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={ariaLabel}
      onError={() => setFailed(true)}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
