import type { Locale } from "@/i18n/config";
import type { AspectRatio, ProjectCategory } from "@/types";

export type LocaleField = Record<Locale, string>;
export type LocaleTags = Record<Locale, string[]>;

export type ContentGalleryItem = {
  id: string;
  imagePath?: string;
  gradient: string;
  aspectRatio: AspectRatio;
  caption: LocaleField;
  alt: LocaleField;
};

export type ContentPaletteColor = {
  name: LocaleField;
  hex: string;
};

export type ContentCollection = {
  id: string;
  slug: LocaleField;
  title: LocaleField;
  description: LocaleField;
  coverImage?: string;
  order: number;
  featured: boolean;
  seo?: {
    title?: LocaleField;
    description?: LocaleField;
  };
  createdAt: string;
  updatedAt: string;
};

export type ContentProject = {
  slug: string;
  collectionId?: string;
  title: LocaleField;
  category: LocaleField;
  filterCategory: ProjectCategory;
  year: string;
  role: LocaleField;
  client: LocaleField;
  summary: LocaleField;
  description: LocaleField;
  concept: LocaleField;
  challenge: LocaleField;
  solution: LocaleField;
  visualDirection: LocaleField;
  typography: LocaleField;
  tags: LocaleTags;
  palette: ContentPaletteColor[];
  galleryItems: ContentGalleryItem[];
  gradient: string;
  aspectRatio: "portrait" | "landscape" | "square";
  featured?: boolean;
  seoTitle?: LocaleField;
  seoDescription?: LocaleField;
  coverImagePath?: string;
  heroImagePath?: string;
  imageAlt: LocaleField;
};

export type ContentServiceItem = {
  id: string;
  index: string;
  title: LocaleField;
  description: LocaleField;
};

export type ContentMeta = {
  revisionId: string;
  updatedAt: string;
  updatedBy: string;
};

export type SiteContent = {
  version: 1;
  meta?: ContentMeta;
  site: {
    name: string;
    email: string;
    phone?: string;
    location: LocaleField;
    availability?: LocaleField;
    social: { label: string; href: string }[];
  };
  homepage: {
    designerName: string;
    portraitImagePath: string;
    featuredProjectSlugs: string[];
    showcaseProjectSlug: string;
    hero: {
      role: LocaleField;
      headline: LocaleField;
      subtitle: LocaleField;
      description: LocaleField;
      viewWork: LocaleField;
      contact: LocaleField;
    };
    about: {
      label: LocaleField;
      title: LocaleField;
      bio: LocaleField;
      philosophy: LocaleField;
      portraitAlt: LocaleField;
    };
    services: {
      label: LocaleField;
      title: LocaleField;
      description: LocaleField;
      items: ContentServiceItem[];
    };
    work: {
      featuredLabel: LocaleField;
      featuredTitle: LocaleField;
      featuredDescription: LocaleField;
      indexLabel: LocaleField;
      indexTitle: LocaleField;
      indexDescription: LocaleField;
    };
  };
  contact: {
    label: LocaleField;
    title: LocaleField;
    description: LocaleField;
  };
  footer: {
    headline: LocaleField;
    intro: LocaleField;
    tagline: LocaleField;
    copyright: LocaleField;
  };
  seo: {
    siteTitle: LocaleField;
    siteDescription: LocaleField;
    portfolioTitle: LocaleField;
    workTitle: LocaleField;
    workDescription: LocaleField;
    contactTitle: LocaleField;
    contactDescription: LocaleField;
    ogImagePath?: string;
  };
  collections: ContentCollection[];
  projects: ContentProject[];
};
