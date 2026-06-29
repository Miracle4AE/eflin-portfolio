import type { SiteContent } from "@/lib/content/types";
import { publicPathExists } from "@/lib/admin/media.server";

function warnMissingPath(label: string, imagePath: string | undefined, warnings: string[]): void {
  if (!imagePath?.trim()) return;
  if (!publicPathExists(imagePath)) {
    warnings.push(`${label} file not found locally: ${imagePath}`);
  }
}

export function collectContentWarnings(content: SiteContent): string[] {
  const warnings: string[] = [];

  warnMissingPath("Portrait", content.homepage.portraitImagePath, warnings);
  warnMissingPath("OpenGraph image", content.seo.ogImagePath, warnings);

  for (const project of content.projects) {
    const label = `Project "${project.slug}"`;
    warnMissingPath(`${label} cover`, project.coverImagePath, warnings);
    warnMissingPath(`${label} hero`, project.heroImagePath, warnings);

    if (project.featured) {
      if (!project.coverImagePath?.trim()) {
        warnings.push(`${label} is featured but has no cover image path`);
      }
      if (!project.heroImagePath?.trim()) {
        warnings.push(`${label} is featured but has no hero image path`);
      }
    }

    const seenGalleryPaths = new Set<string>();
    project.galleryItems.forEach((item, index) => {
      if (item.imagePath) {
        warnMissingPath(`${label} gallery #${index + 1}`, item.imagePath, warnings);
        if (seenGalleryPaths.has(item.imagePath)) {
          warnings.push(`${label} gallery item #${index + 1} uses duplicate image: ${item.imagePath}`);
        }
        seenGalleryPaths.add(item.imagePath);
      }
      if (!item.alt.en.trim() && !item.alt.tr.trim() && item.imagePath?.trim()) {
        warnings.push(`${label} gallery item #${index + 1} is missing alt text (EN/TR)`);
      }
    });
  }

  return warnings;
}
