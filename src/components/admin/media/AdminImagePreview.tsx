"use client";

import { useMemo, useState } from "react";
import { useMediaPicker } from "@/components/admin/media/MediaPickerContext";
import { cn } from "@/lib/utils";

type AdminImagePreviewProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  placeholderLabel?: string;
};

function normalizePath(src: string): string {
  return src.startsWith("/") ? src : `/${src}`;
}

function canRenderAdminImage(
  src: string | null | undefined,
  knownMediaPaths: Set<string>,
): src is string {
  if (!src?.trim()) return false;
  if (src.startsWith("https://") || src.startsWith("http://")) return true;
  const normalized = normalizePath(src);
  if (normalized.startsWith("/media/")) return true;
  if (normalized.startsWith("/images/")) return knownMediaPaths.has(normalized);
  return false;
}

export function AdminImagePreview({
  src,
  alt = "",
  className,
  imageClassName,
  placeholderLabel = "No preview",
}: AdminImagePreviewProps) {
  const { files } = useMediaPicker();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const knownMediaPaths = useMemo(
    () => new Set(files.map((file) => file.path)),
    [files],
  );
  const safeSrc =
    src && canRenderAdminImage(src, knownMediaPaths) && src !== failedSrc
      ? src
      : null;

  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg border border-border-soft bg-greige",
        className,
      )}
    >
      {safeSrc ? (
        // Admin previews intentionally use a plain img so missing files never hit /_next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt={alt}
          className={cn("h-full w-full object-cover", imageClassName)}
          onError={() => setFailedSrc(safeSrc)}
        />
      ) : (
        <span className="px-3 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
          {placeholderLabel}
        </span>
      )}
    </div>
  );
}
