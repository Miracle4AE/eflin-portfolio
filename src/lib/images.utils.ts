import type { ProjectImages } from "@/types";

export function pickPrimaryProjectImage(images: ProjectImages): string | null {
  return images.coverImage ?? images.heroImage;
}

export function pickHeroProjectImage(images: ProjectImages): string | null {
  return images.heroImage ?? images.coverImage;
}
