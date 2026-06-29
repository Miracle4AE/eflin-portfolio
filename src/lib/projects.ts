import type { Locale } from "@/i18n/config";
import type {
  GalleryItem,
  PaletteColor,
  Project,
  ProjectCategory,
  ResolvedGalleryItem,
  ResolvedProject,
} from "@/types";
import { projects as rawProjects } from "@/data/projects";
import { projectTranslationsTr } from "@/data/projects-i18n-tr";
import {
  contentProjectToProject,
  getContentProjectBySlug,
  getContentProjectSlugs,
} from "@/lib/content/resolve";
import { loadSiteContent } from "@/lib/content/loader";
import type { ContentProject } from "@/lib/content/types";
import { resolveGalleryItems, resolveProject } from "@/lib/images.server";

function applyStaticLocale(project: Project, locale: Locale): Project {
  if (locale === "en") return project;

  const tr = projectTranslationsTr[project.slug];
  if (!tr) return project;

  return {
    ...project,
    title: tr.title,
    category: tr.category,
    role: tr.role,
    client: tr.client,
    summary: tr.summary,
    description: tr.description,
    concept: tr.concept,
    challenge: tr.challenge,
    solution: tr.solution,
    visualDirection: tr.visualDirection,
    typography: tr.typography,
    tags: tr.tags,
    palette: project.palette.map((color, index) => ({
      ...color,
      name: tr.paletteNames[index] ?? color.name,
    })),
    galleryItems: project.galleryItems.map((item) => ({
      ...item,
      caption: tr.gallery[item.id]?.caption ?? item.caption,
      alt: tr.gallery[item.id]?.alt ?? item.alt,
    })),
    images: {
      ...project.images,
      imageAlt: tr.imageAlt,
    },
  };
}

function getAllProjectsStatic(locale: Locale = "en"): ResolvedProject[] {
  return rawProjects.map((project) =>
    resolveProject(applyStaticLocale(project, locale)),
  );
}

function getProjectBySlugStatic(
  slug: string,
  locale: Locale = "en",
): ResolvedProject | undefined {
  const project = rawProjects.find((p) => p.slug === slug);
  return project ? resolveProject(applyStaticLocale(project, locale)) : undefined;
}

function getStaticSlugs(): string[] {
  return rawProjects.map((p) => p.slug);
}

function resolveContentProject(
  project: Project,
  source: ContentProject,
): ResolvedProject {
  return resolveProject(project, {
    coverImagePath: source.coverImagePath,
    heroImagePath: source.heroImagePath,
  });
}

async function getProjectsFromContent(locale: Locale): Promise<ResolvedProject[]> {
  try {
    const content = await loadSiteContent();
    return content.projects.map((source) =>
      resolveContentProject(contentProjectToProject(source, locale), source),
    );
  } catch (error) {
    console.warn("[Content] Falling back to static projects:", error);
    return getAllProjectsStatic(locale);
  }
}

export async function getAllProjects(locale: Locale = "en"): Promise<ResolvedProject[]> {
  return getProjectsFromContent(locale);
}

export async function getProjectBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<ResolvedProject | undefined> {
  try {
    const content = await loadSiteContent();
    const source = content.projects.find((p) => p.slug === slug);
    const project = await getContentProjectBySlug(slug, locale);
    if (project && source) return resolveContentProject(project, source);
    return getProjectBySlugStatic(slug, locale);
  } catch (error) {
    console.warn(`[Content] Falling back to static project "${slug}":`, error);
    return getProjectBySlugStatic(slug, locale);
  }
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const slugs = await getContentProjectSlugs();
    return slugs.length > 0 ? slugs : getStaticSlugs();
  } catch {
    return getStaticSlugs();
  }
}

export async function getNextProject(
  slug: string,
  locale: Locale = "en",
): Promise<ResolvedProject> {
  const projects = await getAllProjects(locale);
  const index = projects.findIndex((project) => project.slug === slug);
  const nextIndex = index === -1 ? 0 : (index + 1) % projects.length;
  return projects[nextIndex];
}

export async function getFeaturedProjects(
  locale: Locale = "en",
): Promise<ResolvedProject[]> {
  const projects = await getAllProjects(locale);
  const featured = projects.filter((project) => project.featured);
  return featured.length > 0 ? featured : projects.slice(0, 4);
}

export async function getProjectGallery(
  slug: string,
  locale: Locale = "en",
): Promise<ResolvedGalleryItem[]> {
  const project = await getContentProjectBySlug(slug, locale);
  if (project) {
    return resolveGalleryItems(slug, project.galleryItems);
  }

  const staticProject = rawProjects.find((p) => p.slug === slug);
  if (!staticProject) return [] as ResolvedGalleryItem[];

  const localized = applyStaticLocale(staticProject, locale);
  return resolveGalleryItems(slug, localized.galleryItems);
}

export async function getAllProjectsSync(
  locale: Locale = "en",
): Promise<ResolvedProject[]> {
  return getProjectsFromContent(locale);
}

export { filterProjectsByCategory } from "@/lib/projects.utils";
export type { ProjectCategory, GalleryItem, PaletteColor };

export async function isContentLoaded(): Promise<boolean> {
  try {
    await loadSiteContent();
    return true;
  } catch {
    return false;
  }
}
