import type { ResolvedGalleryItem } from "@/types";

export interface LightboxItem {
  id: string;
  src: string | null;
  alt: string;
  caption?: string;
  gradient: string;
}

export function toLightboxItems(
  items: ResolvedGalleryItem[],
  fallbackAlt: string,
): LightboxItem[] {
  return items.map((item) => ({
    id: item.id,
    src: item.src,
    alt: item.alt ?? fallbackAlt,
    caption: item.caption,
    gradient: item.gradient,
  }));
}
