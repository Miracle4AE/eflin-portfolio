import fs from "fs";
import path from "path";
import type { GalleryItem, Project, ProjectImages, ResolvedGalleryItem, ResolvedProject } from "@/types";
import {
  DEFAULT_BLUR_DATA_URL,
  portraitImagePath,
  projectImagePath,
} from "@/lib/images.constants";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

function imageFileExists(publicPath: string): boolean {
  const relative = publicPath.replace(/^\//, "");
  const fullPath = path.join(PUBLIC_ROOT, relative);
  return fs.existsSync(fullPath);
}

export function resolveProjectImage(
  slug: string,
  filename: string,
): string | null {
  const publicPath = projectImagePath(slug, filename);
  return imageFileExists(publicPath) ? publicPath : null;
}

export function resolvePortraitImage(filename = "portrait.jpg"): string | null {
  const publicPath = portraitImagePath(filename);
  return imageFileExists(publicPath) ? publicPath : null;
}

export function resolvePublicImagePath(publicPath: string | undefined): string | null {
  if (!publicPath?.trim()) return null;

  if (publicPath.startsWith("https://") || publicPath.startsWith("http://")) {
    return publicPath;
  }

  const normalized = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;

  if (normalized.startsWith("/media/")) {
    return normalized;
  }

  return imageFileExists(normalized) ? normalized : null;
}

export function resolveProjectImages(
  project: Project,
  overrides?: { coverImagePath?: string; heroImagePath?: string },
): ProjectImages {
  const coverFromPath = resolvePublicImagePath(overrides?.coverImagePath);
  const heroFromPath = resolvePublicImagePath(overrides?.heroImagePath);

  return {
    coverImage:
      coverFromPath ?? resolveProjectImage(project.slug, "cover.jpg"),
    heroImage:
      heroFromPath ?? resolveProjectImage(project.slug, "hero.jpg"),
    imageAlt: project.images.imageAlt,
    blurDataURL: project.images.blurDataURL ?? DEFAULT_BLUR_DATA_URL,
    videoPlaceholder: resolveProjectImage(project.slug, "hero.mp4"),
  };
}

export function resolveProject(
  project: Project,
  overrides?: { coverImagePath?: string; heroImagePath?: string },
): ResolvedProject {
  return {
    ...project,
    images: resolveProjectImages(project, overrides),
  };
}

export function resolveGalleryItem(
  slug: string,
  item: GalleryItem,
): ResolvedGalleryItem {
  const fromPath = resolvePublicImagePath(item.imagePath);
  const src =
    fromPath ?? (item.file ? resolveProjectImage(slug, item.file) : null);
  return { ...item, src };
}

export function resolveGalleryItems(
  slug: string,
  items: GalleryItem[],
): ResolvedGalleryItem[] {
  return items.map((item) => resolveGalleryItem(slug, item));
}

export function getProjectOgImage(project: ResolvedProject): string | null {
  return project.images.heroImage ?? project.images.coverImage;
}
