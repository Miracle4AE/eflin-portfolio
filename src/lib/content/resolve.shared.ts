import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import type { GalleryItem, Project, SiteConfig } from "@/types";
import { pickLocale, pickLocaleTags } from "@/lib/content/locale-field";
import type { ContentGalleryItem, ContentProject, SiteContent } from "@/lib/content/types";

function imagePathToFilename(imagePath: string | undefined): string | undefined {
  if (!imagePath) return undefined;
  const parts = imagePath.split("/");
  return parts[parts.length - 1] || undefined;
}

function contentGalleryToGalleryItem(item: ContentGalleryItem): GalleryItem {
  return {
    id: item.id,
    file: imagePathToFilename(item.imagePath),
    imagePath: item.imagePath,
    gradient: item.gradient,
    aspectRatio: item.aspectRatio,
    caption: item.caption.en,
    alt: item.alt.en,
  };
}

export function contentProjectToProject(
  project: ContentProject,
  locale: Locale,
): Project {
  const trGallery = project.galleryItems.reduce<
    Record<string, { caption: string; alt: string }>
  >((acc, item) => {
    acc[item.id] = {
      caption: pickLocale(item.caption, locale),
      alt: pickLocale(item.alt, locale),
    };
    return acc;
  }, {});

  const base: Project = {
    slug: project.slug,
    title: pickLocale(project.title, locale),
    category: pickLocale(project.category, locale),
    filterCategory: project.filterCategory,
    year: project.year,
    role: pickLocale(project.role, locale),
    client: pickLocale(project.client, locale),
    summary: pickLocale(project.summary, locale),
    description: pickLocale(project.description, locale),
    concept: pickLocale(project.concept, locale),
    challenge: pickLocale(project.challenge, locale),
    solution: pickLocale(project.solution, locale),
    visualDirection: pickLocale(project.visualDirection, locale),
    typography: pickLocale(project.typography, locale),
    palette: project.palette.map((color) => ({
      hex: color.hex,
      name: pickLocale(color.name, locale),
    })),
    galleryItems: project.galleryItems.map((item) => ({
      ...contentGalleryToGalleryItem(item),
      caption: pickLocale(item.caption, locale),
      alt: pickLocale(item.alt, locale),
    })),
    tags: pickLocaleTags(project.tags, locale),
    gradient: project.gradient,
    aspectRatio: project.aspectRatio,
    featured: project.featured,
    seoTitle: project.seoTitle ? pickLocale(project.seoTitle, locale) : undefined,
    seoDescription: project.seoDescription
      ? pickLocale(project.seoDescription, locale)
      : undefined,
    images: {
      imageAlt: pickLocale(project.imageAlt, locale),
    },
  };

  void trGallery;
  return base;
}

export function mergeContentIntoDictionary(
  base: Dictionary,
  content: SiteContent,
  locale: Locale,
): Dictionary {
  const servicesItems = { ...base.services.items } as Dictionary["services"]["items"];
  for (const item of content.homepage.services.items) {
    const key = item.id as keyof typeof servicesItems;
    if (key in servicesItems) {
      servicesItems[key] = {
        index: item.index,
        title: pickLocale(item.title, locale),
        description: pickLocale(item.description, locale),
      };
    }
  }

  return {
    ...base,
    meta: {
      ...base.meta,
      siteTitle: pickLocale(content.seo.siteTitle, locale),
      siteDescription: pickLocale(content.seo.siteDescription, locale),
      portfolioTitle: pickLocale(content.seo.portfolioTitle, locale),
      workTitle: pickLocale(content.seo.workTitle, locale),
      workDescription: pickLocale(content.seo.workDescription, locale),
      contactTitle: pickLocale(content.seo.contactTitle, locale),
      contactDescription: pickLocale(content.seo.contactDescription, locale),
    },
    hero: {
      ...base.hero,
      role: pickLocale(content.homepage.hero.role, locale),
      headline: pickLocale(content.homepage.hero.headline, locale) || content.site.name,
      subtitle: pickLocale(content.homepage.hero.subtitle, locale),
      description: pickLocale(content.homepage.hero.description, locale),
      viewWork: pickLocale(content.homepage.hero.viewWork, locale),
      contact: pickLocale(content.homepage.hero.contact, locale),
    },
    work: {
      ...base.work,
      indexLabel: pickLocale(content.homepage.work.indexLabel, locale),
      indexTitle: pickLocale(content.homepage.work.indexTitle, locale),
      indexDescription: pickLocale(content.homepage.work.indexDescription, locale),
      featuredLabel: pickLocale(content.homepage.work.featuredLabel, locale),
      featuredTitle: pickLocale(content.homepage.work.featuredTitle, locale),
      featuredDescription: pickLocale(content.homepage.work.featuredDescription, locale),
    },
    about: {
      ...base.about,
      label: pickLocale(content.homepage.about.label, locale),
      title: pickLocale(content.homepage.about.title, locale),
      bio: pickLocale(content.homepage.about.bio, locale),
      philosophy: pickLocale(content.homepage.about.philosophy, locale),
      location: pickLocale(content.site.location, locale),
      portraitAlt: pickLocale(content.homepage.about.portraitAlt, locale),
    },
    services: {
      ...base.services,
      label: pickLocale(content.homepage.services.label, locale),
      title: pickLocale(content.homepage.services.title, locale),
      description: pickLocale(content.homepage.services.description, locale),
      items: servicesItems,
    },
    contact: {
      ...base.contact,
      label: pickLocale(content.contact.label, locale),
      title: pickLocale(content.contact.title, locale),
      description: pickLocale(content.contact.description, locale),
    },
    footer: {
      ...base.footer,
      headline: pickLocale(content.footer.headline, locale),
      intro: pickLocale(content.footer.intro, locale),
      tagline: pickLocale(content.footer.tagline, locale),
      copyright: pickLocale(content.footer.copyright, locale),
    },
  };
}

export function contentToSiteConfig(
  content: SiteContent,
  locale: Locale,
): SiteConfig {
  return {
    name: content.homepage.designerName || content.site.name,
    tagline: pickLocale(content.seo.siteDescription, locale),
    email: content.site.email,
    phone: content.site.phone,
    location: pickLocale(content.site.location, locale),
    availability: content.site.availability
      ? pickLocale(content.site.availability, locale)
      : undefined,
    bio: pickLocale(content.homepage.about.bio, locale),
    philosophy: pickLocale(content.homepage.about.philosophy, locale),
    portraitAlt: pickLocale(content.homepage.about.portraitAlt, locale),
    social: content.site.social,
  };
}

export function resolveContentImagePath(
  imagePath: string | undefined,
): string | null {
  if (!imagePath?.trim()) return null;
  const normalized = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return normalized;
}
