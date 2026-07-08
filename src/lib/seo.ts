import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { defaultLocale, ogLocales } from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";
import type { ResolvedProject } from "@/types";
import { getProjectOgImage } from "@/lib/images.server";
import { getMergedDictionary, getMergedSiteConfig } from "@/lib/content";
import type { ContentCollection } from "@/lib/content/types";
import { getCollectionSlug } from "@/lib/content/collections";
import { pickLocale } from "@/lib/content/locale-field";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function getSiteUrl(): string {
  return siteUrl;
}

function buildLanguageAlternates(
  pathWithoutLocale = "",
  locale: Locale = defaultLocale,
): Metadata["alternates"] {
  const normalized = pathWithoutLocale.startsWith("/")
    ? pathWithoutLocale
    : pathWithoutLocale
      ? `/${pathWithoutLocale}`
      : "";

  return {
    canonical: `${siteUrl}${localizedPath(locale, normalized)}`,
    languages: {
      en: `${siteUrl}${localizedPath("en", normalized)}`,
      tr: `${siteUrl}${localizedPath("tr", normalized)}`,
      "x-default": `${siteUrl}${localizedPath(defaultLocale, normalized)}`,
    },
  };
}

export async function buildRootMetadata(locale: Locale): Promise<Metadata> {
  const [dict, siteConfig] = await Promise.all([
    getMergedDictionary(locale),
    getMergedSiteConfig(locale),
  ]);

  return {
    title: {
      default: dict.meta.siteTitle,
      template: `%s | ${siteConfig.name}`,
    },
    description: dict.meta.siteDescription,
    alternates: buildLanguageAlternates("", locale),
    openGraph: {
      title: dict.meta.portfolioTitle,
      description: dict.meta.siteDescription,
      type: "website",
      siteName: siteConfig.name,
      locale: ogLocales[locale],
      url: `${siteUrl}${localizedPath(locale)}`,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.portfolioTitle,
      description: dict.meta.siteDescription,
    },
  };
}

export async function buildWorkMetadata(locale: Locale): Promise<Metadata> {
  const [dict, siteConfig] = await Promise.all([
    getMergedDictionary(locale),
    getMergedSiteConfig(locale),
  ]);

  return {
    title: dict.meta.workTitle,
    description: dict.meta.workDescription,
    alternates: buildLanguageAlternates("/work", locale),
    openGraph: {
      title: `${dict.meta.workTitle} | ${siteConfig.name}`,
      description: dict.meta.workDescription,
      url: `${siteUrl}${localizedPath(locale, "/work")}`,
      type: "website",
      locale: ogLocales[locale],
    },
  };
}

function buildCollectionLanguageAlternates(
  collection: ContentCollection,
  locale: Locale,
): Metadata["alternates"] {
  const enPath = `/work/collections/${getCollectionSlug(collection, "en")}`;
  const trPath = `/work/collections/${getCollectionSlug(collection, "tr")}`;
  const currentPath = locale === "tr" ? trPath : enPath;

  return {
    canonical: `${siteUrl}${localizedPath(locale, currentPath)}`,
    languages: {
      en: `${siteUrl}${localizedPath("en", enPath)}`,
      tr: `${siteUrl}${localizedPath("tr", trPath)}`,
      "x-default": `${siteUrl}${localizedPath(defaultLocale, enPath)}`,
    },
  };
}

export async function buildWorkCollectionMetadata(
  collection: ContentCollection,
  locale: Locale,
): Promise<Metadata> {
  const siteConfig = await getMergedSiteConfig(locale);
  const title =
    (collection.seo?.title && pickLocale(collection.seo.title, locale).trim()) ||
    pickLocale(collection.title, locale);
  const description =
    (collection.seo?.description &&
      pickLocale(collection.seo.description, locale).trim()) ||
    pickLocale(collection.description, locale);
  const path = `/work/collections/${getCollectionSlug(collection, locale)}`;
  const ogImage = collection.coverImage
    ? collection.coverImage.startsWith("http")
      ? collection.coverImage
      : `${siteUrl}${collection.coverImage}`
    : null;

  return {
    title,
    description,
    alternates: buildCollectionLanguageAlternates(collection, locale),
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: `${siteUrl}${localizedPath(locale, path)}`,
      type: "website",
      locale: ogLocales[locale],
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export async function buildContactMetadata(locale: Locale): Promise<Metadata> {
  const [dict, siteConfig] = await Promise.all([
    getMergedDictionary(locale),
    getMergedSiteConfig(locale),
  ]);

  return {
    title: dict.meta.contactTitle,
    description: dict.meta.contactDescription,
    alternates: buildLanguageAlternates("/contact", locale),
    openGraph: {
      title: `${dict.meta.contactTitle} | ${siteConfig.name}`,
      description: dict.meta.contactDescription,
      url: `${siteUrl}${localizedPath(locale, "/contact")}`,
      type: "website",
      locale: ogLocales[locale],
    },
  };
}

export async function buildProjectMetadata(
  project: ResolvedProject,
  locale: Locale,
): Promise<Metadata> {
  const siteConfig = await getMergedSiteConfig(locale);
  const ogImage = getProjectOgImage(project);
  const absoluteOgImage = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : `${siteUrl}${ogImage}`
    : null;
  const pageTitle =
    project.seoTitle?.trim() || `${project.title} — ${project.category}`;
  const description = project.seoDescription?.trim() || project.summary;

  const path = `/work/${project.slug}`;

  return {
    title: pageTitle,
    description,
    alternates: buildLanguageAlternates(path, locale),
    openGraph: {
      title: `${project.title} | ${siteConfig.name}`,
      description,
      type: "article",
      url: `${siteUrl}${localizedPath(locale, path)}`,
      locale: ogLocales[locale],
      ...(absoluteOgImage && {
        images: [
          {
            url: absoluteOgImage,
            width: 1200,
            height: 630,
            alt: project.images.imageAlt,
          },
        ],
      }),
    },
    twitter: {
      card: absoluteOgImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      ...(absoluteOgImage && {
        images: [absoluteOgImage],
      }),
    },
  };
}

export async function buildProjectNotFoundMetadata(locale: Locale): Promise<Metadata> {
  const dict = await getMergedDictionary(locale);
  return { title: dict.meta.notFound };
}
