import type { Locale } from "@/i18n/config";
import type { ResolvedProject } from "@/types";
import {
  getContentProjectBySlug,
  resolveContentPortrait,
} from "@/lib/content/resolve";
import { loadSiteContent } from "@/lib/content/loader";
import {
  getFeaturedProjects,
  getProjectBySlug,
  resolveContentProjectWithSource,
} from "@/lib/projects";

export async function getHomepagePortrait(): Promise<string | null> {
  return resolveContentPortrait();
}

export async function getHomepageFeaturedProjects(
  locale: Locale,
): Promise<ResolvedProject[]> {
  const content = await loadSiteContent();
  const slugs = content.homepage.featuredProjectSlugs;

  if (slugs.length === 0) {
    return getFeaturedProjects(locale);
  }

  const projects = (
    await Promise.all(
      slugs.map(async (slug) => {
        const source = content.projects.find((project) => project.slug === slug);
        const project = await getContentProjectBySlug(slug, locale);
        if (project && source) {
          return resolveContentProjectWithSource(project, source);
        }
        return getProjectBySlug(slug, locale);
      }),
    )
  ).filter((project): project is ResolvedProject => Boolean(project));

  return projects.length > 0 ? projects : getFeaturedProjects(locale);
}

export async function getHomepageShowcaseProject(
  locale: Locale,
): Promise<ResolvedProject | undefined> {
  const content = await loadSiteContent();
  const slug = content.homepage.showcaseProjectSlug;
  const source = content.projects.find((project) => project.slug === slug);
  const project = await getContentProjectBySlug(slug, locale);

  if (project && source) {
    return resolveContentProjectWithSource(project, source);
  }

  return getProjectBySlug(slug, locale);
}

export async function getSiteThemeStyle(): Promise<React.CSSProperties | undefined> {
  return undefined;
}

export { getContentProjectBySlug, getContentProjectSlugs } from "@/lib/content/resolve";
