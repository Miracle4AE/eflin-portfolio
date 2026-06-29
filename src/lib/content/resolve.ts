import type { Locale } from "@/i18n/config";
import type { Project } from "@/types";
import { getDictionary } from "@/i18n/get-dictionary";
import { loadSiteContent } from "@/lib/content/loader";
import {
  contentProjectToProject,
  contentToSiteConfig,
  mergeContentIntoDictionary,
  resolveContentImagePath,
} from "@/lib/content/resolve.shared";

export {
  contentProjectToProject,
  contentToSiteConfig,
  mergeContentIntoDictionary,
  resolveContentImagePath,
} from "@/lib/content/resolve.shared";

export async function getSiteContent() {
  return loadSiteContent();
}

export async function getMergedDictionary(locale: Locale) {
  const base = getDictionary(locale);
  const content = await loadSiteContent();
  return mergeContentIntoDictionary(base, content, locale);
}

export async function getMergedSiteConfig(locale: Locale) {
  const content = await loadSiteContent();
  return contentToSiteConfig(content, locale);
}

export async function getContentProjects(locale: Locale): Promise<Project[]> {
  const content = await loadSiteContent();
  return content.projects.map((project) => contentProjectToProject(project, locale));
}

export async function getContentProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<Project | undefined> {
  const content = await loadSiteContent();
  const project = content.projects.find((p) => p.slug === slug);
  return project ? contentProjectToProject(project, locale) : undefined;
}

export async function getContentProjectSlugs(): Promise<string[]> {
  const content = await loadSiteContent();
  return content.projects.map((p) => p.slug);
}

export async function resolveContentPortrait(): Promise<string | null> {
  const content = await loadSiteContent();
  return resolveContentImagePath(content.homepage.portraitImagePath);
}

export async function getContentSeoOgImage(): Promise<string | null> {
  const content = await loadSiteContent();
  return resolveContentImagePath(content.seo.ogImagePath);
}
