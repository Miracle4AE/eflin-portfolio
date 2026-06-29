import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { Project, ResolvedProject, SiteConfig } from "@/types";
import { getDictionary } from "@/i18n/get-dictionary";
import { DEFAULT_BLUR_DATA_URL } from "@/lib/images.constants";
import {
  contentProjectToProject,
  contentToSiteConfig,
  mergeContentIntoDictionary,
  resolveContentImagePath,
} from "@/lib/content/resolve.shared";
import type { AspectRatio } from "@/types";
import { pickLocale } from "@/lib/content/locale-field";
import type { SiteContent } from "@/lib/content/types";

function resolveClientProject(
  project: Project,
  source: SiteContent["projects"][number],
): ResolvedProject {
  const coverImage = resolveContentImagePath(source.coverImagePath);
  const heroImage = resolveContentImagePath(source.heroImagePath);
  const firstGallery = source.galleryItems
    .map((item) => resolveContentImagePath(item.imagePath))
    .find(Boolean);

  const resolvedCover = coverImage ?? heroImage ?? firstGallery ?? null;
  const resolvedHero = heroImage ?? coverImage ?? firstGallery ?? null;

  return {
    ...project,
    images: {
      coverImage: resolvedCover,
      heroImage: resolvedHero,
      imageAlt: project.images.imageAlt,
      blurDataURL: DEFAULT_BLUR_DATA_URL,
      videoPlaceholder: null,
    },
  };
}

export type VisualPreviewData = {
  dictionary: Dictionary;
  siteConfig: SiteConfig;
  portraitSrc: string | null;
  projects: ResolvedProject[];
  featuredProjects: ResolvedProject[];
  showcaseProject: ResolvedProject | null;
  projectSlugs: string[];
};

export function buildVisualPreviewData(
  content: SiteContent,
  locale: Locale,
): VisualPreviewData {
  const dictionary = mergeContentIntoDictionary(getDictionary(locale), content, locale);
  const siteConfig = contentToSiteConfig(content, locale);
  const portraitSrc = resolveContentImagePath(content.homepage.portraitImagePath);

  const projects = content.projects.map((source) =>
    resolveClientProject(contentProjectToProject(source, locale), source),
  );

  const featuredSlugs = content.homepage.featuredProjectSlugs;
  const featuredProjects =
    featuredSlugs.length > 0
      ? featuredSlugs
          .map((slug) => projects.find((p) => p.slug === slug))
          .filter((p): p is ResolvedProject => Boolean(p))
      : projects.filter((p) => p.featured).slice(0, 4);

  const showcaseProject =
    projects.find((p) => p.slug === content.homepage.showcaseProjectSlug) ??
    projects[0] ??
    null;

  return {
    dictionary,
    siteConfig,
    portraitSrc,
    projects,
    featuredProjects,
    showcaseProject,
    projectSlugs: content.projects.map((p) => p.slug),
  };
}

export type VisualGalleryItem = {
  id: string;
  imagePath?: string;
  gradient: string;
  aspectRatio: AspectRatio;
  src: string | null;
  caption: string;
  alt: string;
};

export function getVisualProjectGallery(
  content: SiteContent,
  slug: string,
  locale: Locale,
): VisualGalleryItem[] {
  const source = content.projects.find((p) => p.slug === slug);
  if (!source) return [];
  return source.galleryItems.map((item) => ({
    id: item.id,
    imagePath: item.imagePath,
    gradient: item.gradient,
    aspectRatio: item.aspectRatio,
    src: resolveContentImagePath(item.imagePath),
    caption: pickLocale(item.caption, locale),
    alt: pickLocale(item.alt, locale),
  }));
}
