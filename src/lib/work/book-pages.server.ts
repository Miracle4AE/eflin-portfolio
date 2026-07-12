import type { Locale } from "@/i18n/config";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { resolveGalleryItems } from "@/lib/images.server";
import type { ResolvedProject } from "@/types";
import { buildBookExperienceData, type BookExperienceData } from "@/lib/work/book-pages";

export function buildServerBookExperienceData(
  collection: ResolvedWorkCollection,
  projects: ResolvedProject[],
  locale: Locale,
): BookExperienceData {
  return buildBookExperienceData(collection, projects, locale, (project) =>
    resolveGalleryItems(project.slug, project.galleryItems),
  );
}
