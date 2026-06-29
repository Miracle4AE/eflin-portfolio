import type { Locale } from "@/i18n/config";
import type { ResolvedProject } from "@/types";
import {
  getContentProjectBySlug,
  resolveContentPortrait,
} from "@/lib/content/resolve";
import { loadSiteContent } from "@/lib/content/loader";
import { resolveProject } from "@/lib/images.server";
import { getFeaturedProjects, getProjectBySlug } from "@/lib/projects";

export async function getHomepagePortrait(): Promise<string | null> {
  return resolveContentPortrait();
}

export async function getHomepageFeaturedProjects(
  locale: Locale,
): Promise<ResolvedProject[]> {
  const content = loadSiteContent();
  const slugs = content.homepage.featuredProjectSlugs;

  if (slugs.length === 0) {
    return getFeaturedProjects(locale);
  }

  const projects = slugs
    .map((slug) => getContentProjectBySlug(slug, locale))
    .filter(Boolean)
    .map((project) => resolveProject(project!));

  return projects.length > 0 ? projects : getFeaturedProjects(locale);
}

export async function getHomepageShowcaseProject(
  locale: Locale,
): Promise<ResolvedProject | undefined> {
  const content = loadSiteContent();
  const slug = content.homepage.showcaseProjectSlug;
  const project = getContentProjectBySlug(slug, locale);

  if (project) {
    return resolveProject(project);
  }

  return getProjectBySlug(slug, locale);
}

export async function getSiteThemeStyle(): Promise<React.CSSProperties | undefined> {
  return undefined;
}

export { getContentProjectBySlug, getContentProjectSlugs } from "@/lib/content/resolve";
