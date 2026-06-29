import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  contentToSiteConfig,
  mergeContentIntoDictionary,
} from "@/lib/content/resolve";
import { loadSiteContent } from "@/lib/content/loader";
import type { ResolvedProject } from "@/types";
import { getSiteUrl } from "@/lib/seo";

type JsonLd = Record<string, unknown>;

export async function buildWebsiteSchema(locale: Locale): Promise<JsonLd> {
  const siteUrl = getSiteUrl();
  const content = await loadSiteContent();
  const dict = mergeContentIntoDictionary(getDictionary(locale), content, locale);
  const siteConfig = contentToSiteConfig(content, locale);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}${localizedPath(locale)}`,
        name: siteConfig.name,
        description: dict.meta.siteDescription,
        inLanguage: locale,
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: siteConfig.name,
        url: `${siteUrl}${localizedPath(locale)}`,
        email: siteConfig.email,
        jobTitle: dict.hero.role,
        description: dict.about.bio,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Istanbul",
        },
        sameAs: siteConfig.social.map((link) => link.href),
      },
    ],
  };
}

export async function buildCollectionPageSchema(
  projects: ResolvedProject[],
  locale: Locale,
): Promise<JsonLd> {
  const siteUrl = getSiteUrl();
  const content = await loadSiteContent();
  const dict = mergeContentIntoDictionary(getDictionary(locale), content, locale);
  const workPath = localizedPath(locale, "/work");

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}${workPath}#collection`,
    url: `${siteUrl}${workPath}`,
    name: dict.meta.workTitle,
    description: dict.meta.workDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${siteUrl}/#website` },
    author: { "@id": `${siteUrl}/#person` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}${localizedPath(locale, `/work/${project.slug}`)}`,
        name: project.title,
      })),
    },
  };
}

export async function buildCreativeWorkSchema(
  project: ResolvedProject,
  locale: Locale,
): Promise<JsonLd> {
  const siteUrl = getSiteUrl();
  const content = await loadSiteContent();
  const siteConfig = contentToSiteConfig(content, locale);
  const path = localizedPath(locale, `/work/${project.slug}`);
  const image =
    project.images.heroImage ??
    project.images.coverImage ??
    undefined;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${siteUrl}${path}#creativework`,
    url: `${siteUrl}${path}`,
    name: project.title,
    headline: project.title,
    description: project.summary,
    abstract: project.concept,
    dateCreated: project.year,
    inLanguage: locale,
    creator: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: siteConfig.name,
    },
    about: project.category,
    keywords: project.tags.join(", "),
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: `${siteUrl}${image}`,
        caption: project.images.imageAlt,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: project.client,
    },
  };
}

export async function buildContactPageSchema(locale: Locale): Promise<JsonLd> {
  const siteUrl = getSiteUrl();
  const content = await loadSiteContent();
  const dict = mergeContentIntoDictionary(getDictionary(locale), content, locale);
  const siteConfig = contentToSiteConfig(content, locale);
  const contactPath = localizedPath(locale, "/contact");

  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${siteUrl}${contactPath}#contactpage`,
    url: `${siteUrl}${contactPath}`,
    name: `${dict.meta.contactTitle} — ${siteConfig.name}`,
    description: dict.meta.contactDescription,
    inLanguage: locale,
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntity: {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      email: siteConfig.email,
    },
  };
}
