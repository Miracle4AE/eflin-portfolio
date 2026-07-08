import type { MetadataRoute } from "next";

import { locales } from "@/i18n/config";

import { localizedPath } from "@/i18n/navigation";
import { getCollectionSlug } from "@/lib/content/collections";
import { loadSiteContent } from "@/lib/content/loader";

import { getAllSlugs } from "@/lib/projects";

import { getSiteUrl } from "@/lib/seo";



export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const baseUrl = getSiteUrl();

  const now = new Date();

  const projectSlugs = await getAllSlugs();
  const content = await loadSiteContent();



  const staticPaths = ["", "/work", "/contact"];



  const localizedEntries = locales.flatMap((locale) =>

    staticPaths.map((path) => ({

      url: `${baseUrl}${localizedPath(locale, path)}`,

      lastModified: now,

      changeFrequency: path === "/work" ? ("weekly" as const) : ("monthly" as const),

      priority: path === "" ? 1 : path === "/work" ? 0.9 : 0.85,

    })),

  );



  const projectEntries = locales.flatMap((locale) =>

    projectSlugs.map((slug) => ({

      url: `${baseUrl}${localizedPath(locale, `/work/${slug}`)}`,

      lastModified: now,

      changeFrequency: "yearly" as const,

      priority: 0.8,

    })),

  );

  const collectionEntries = locales.flatMap((locale) =>
    content.collections.map((collection) => ({
      url: `${baseUrl}${localizedPath(
        locale,
        `/work/collections/${getCollectionSlug(collection, locale)}`,
      )}`,
      lastModified: collection.updatedAt ? new Date(collection.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.82,
    })),
  );



  return [...localizedEntries, ...collectionEntries, ...projectEntries];

}

