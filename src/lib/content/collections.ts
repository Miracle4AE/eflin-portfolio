import type { Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";
import type { Project } from "@/types";
import type { ContentCollection, ContentProject, SiteContent } from "@/lib/content/types";
import { ls, pickLocale } from "@/lib/content/locale-field";

const SEEDED_AT = "2026-01-01T00:00:00.000Z";

export const DEFAULT_COLLECTIONS: ContentCollection[] = [
  {
    id: "book-cover-design",
    slug: ls("book-cover-design", "kitap-kapagi-tasarimi"),
    title: ls("Book Cover Design", "Kitap Kapağı Tasarımı"),
    description: ls(
      "Cover systems, series treatments, and art book jackets shaped around typographic atmosphere.",
      "Tipografik atmosfer etrafında şekillenen kapak sistemleri, seri tasarımları ve sanat kitabı kapakları.",
    ),
    order: 10,
    featured: true,
    seo: {
      title: ls("Book Cover Design", "Kitap Kapağı Tasarımı"),
      description: ls(
        "Selected book cover and art book design projects.",
        "Seçili kitap kapağı ve sanat kitabı tasarımı projeleri.",
      ),
    },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "brand-identity",
    slug: ls("brand-identity", "marka-kimligi"),
    title: ls("Brand Identity", "Marka Kimliği"),
    description: ls(
      "Visual identities, brand systems, and launch-ready design languages for considered brands.",
      "Düşünülmüş markalar için görsel kimlikler, marka sistemleri ve yayına hazır tasarım dilleri.",
    ),
    order: 20,
    featured: true,
    seo: {
      title: ls("Brand Identity", "Marka Kimliği"),
      description: ls(
        "Selected brand identity and visual system projects.",
        "Seçili marka kimliği ve görsel sistem projeleri.",
      ),
    },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "editorial-design",
    slug: ls("editorial-design", "editoryal-tasarim"),
    title: ls("Editorial Design", "Editoryal Tasarım"),
    description: ls(
      "Books, reports, magazines, and long-form editorial systems built around rhythm and hierarchy.",
      "Ritim ve hiyerarşi etrafında kurulan kitap, rapor, dergi ve uzun soluklu editoryal sistemler.",
    ),
    order: 30,
    featured: true,
    seo: {
      title: ls("Editorial Design", "Editoryal Tasarım"),
      description: ls(
        "Selected editorial design, book, and publication systems.",
        "Seçili editoryal tasarım, kitap ve yayın sistemi projeleri.",
      ),
    },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "packaging-design",
    slug: ls("packaging-design", "ambalaj-tasarimi"),
    title: ls("Packaging Design", "Ambalaj Tasarımı"),
    description: ls(
      "Packaging, labels, and tactile print systems that carry identity at product scale.",
      "Kimliği ürün ölçeğinde taşıyan ambalaj, etiket ve dokunsal baskı sistemleri.",
    ),
    order: 40,
    featured: true,
    seo: {
      title: ls("Packaging Design", "Ambalaj Tasarımı"),
      description: ls(
        "Selected packaging, label, and product identity projects.",
        "Seçili ambalaj, etiket ve ürün kimliği projeleri.",
      ),
    },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "illustration",
    slug: ls("illustration", "illustrasyon"),
    title: ls("Illustration", "İllüstrasyon"),
    description: ls(
      "Custom illustration and graphic art for editorial, packaging, and campaign contexts.",
      "Editoryal, ambalaj ve kampanya bağlamları için özel illüstrasyon ve grafik sanatlar.",
    ),
    order: 50,
    featured: true,
    seo: {
      title: ls("Illustration", "İllüstrasyon"),
      description: ls(
        "Selected illustration and graphic art projects.",
        "Seçili illüstrasyon ve grafik sanat projeleri.",
      ),
    },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "digital-design",
    slug: ls("digital-design", "dijital-tasarim"),
    title: ls("Digital Design", "Dijital Tasarım"),
    description: ls(
      "Digital identities, interfaces, and responsive systems for culture and commerce.",
      "Kültür ve ticaret için dijital kimlikler, arayüzler ve responsive sistemler.",
    ),
    order: 60,
    featured: true,
    seo: {
      title: ls("Digital Design", "Dijital Tasarım"),
      description: ls(
        "Selected digital design and interface projects.",
        "Seçili dijital tasarım ve arayüz projeleri.",
      ),
    },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
  {
    id: "art-direction",
    slug: ls("art-direction", "sanat-yonetimi"),
    title: ls("Art Direction", "Sanat Yönetimi"),
    description: ls(
      "Campaign, photography, and visual direction systems with a clear editorial point of view.",
      "Net bir editoryal bakışa sahip kampanya, fotoğraf ve görsel yön sistemleri.",
    ),
    order: 70,
    featured: true,
    seo: {
      title: ls("Art Direction", "Sanat Yönetimi"),
      description: ls(
        "Selected art direction and campaign image systems.",
        "Seçili sanat yönetimi ve kampanya görsel sistemi projeleri.",
      ),
    },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  },
];

type ProjectLike = Pick<Project, "filterCategory" | "category" | "title" | "tags"> & {
  collectionId?: string;
};

type ContentProjectLike = Pick<ContentProject, "filterCategory" | "category" | "title" | "tags"> & {
  collectionId?: string;
};

type AnyProjectLike = ProjectLike | ContentProjectLike;

function normalizeSearchText(project: AnyProjectLike): string {
  const category =
    typeof project.category === "string"
      ? project.category
      : `${project.category.en} ${project.category.tr}`;
  const title =
    typeof project.title === "string"
      ? project.title
      : `${project.title.en} ${project.title.tr}`;
  const tags = Array.isArray(project.tags)
    ? project.tags.join(" ")
    : [...project.tags.en, ...project.tags.tr].join(" ");
  return `${title} ${category} ${tags}`.toLowerCase();
}

function inferLegacyCollectionId(project: AnyProjectLike): string {
  const text = normalizeSearchText(project);
  if (text.includes("book cover") || text.includes("kitap kapa")) return "book-cover-design";
  if (text.includes("packaging") || text.includes("ambalaj")) return "packaging-design";
  if (text.includes("illustration") || text.includes("illüstrasyon")) return "illustration";
  if (project.filterCategory === "editorial") return "editorial-design";
  if (project.filterCategory === "digital") return "digital-design";
  if (project.filterCategory === "art-direction") return "art-direction";
  return "brand-identity";
}

function sortCollections(collections: ContentCollection[]): ContentCollection[] {
  return [...collections].sort((a, b) => a.order - b.order || a.title.en.localeCompare(b.title.en));
}

export function ensureContentCollections(content: SiteContent): SiteContent {
  const source = content as SiteContent & { collections?: ContentCollection[] };
  const collections =
    Array.isArray(source.collections) && source.collections.length > 0
      ? source.collections
      : DEFAULT_COLLECTIONS;
  const collectionIds = new Set(collections.map((collection) => collection.id));
  const fallbackId = collections[0]?.id ?? DEFAULT_COLLECTIONS[0].id;

  return {
    ...content,
    collections: sortCollections(collections),
    projects: content.projects.map((project) => {
      if (project.collectionId && collectionIds.has(project.collectionId)) {
        return project;
      }
      const inferred = inferLegacyCollectionId(project);
      return {
        ...project,
        collectionId: collectionIds.has(inferred) ? inferred : fallbackId,
      };
    }),
  };
}

export function resolveProjectCollectionId(
  project: AnyProjectLike,
  collections: ContentCollection[],
): string {
  const ids = new Set(collections.map((collection) => collection.id));
  if (project.collectionId && ids.has(project.collectionId)) return project.collectionId;
  const inferred = inferLegacyCollectionId(project);
  return ids.has(inferred) ? inferred : collections[0]?.id ?? DEFAULT_COLLECTIONS[0].id;
}

export function getCollectionSlug(collection: ContentCollection, locale: Locale): string {
  return pickLocale(collection.slug, locale) || collection.id;
}

export function getCollectionPath(collection: ContentCollection, locale: Locale): string {
  return localizedPath(locale, `/work/collections/${getCollectionSlug(collection, locale)}`);
}

export function getCollectionBySlug(
  collections: ContentCollection[],
  slug: string,
  locale: Locale,
): ContentCollection | undefined {
  return collections.find(
    (collection) =>
      getCollectionSlug(collection, locale) === slug ||
      collection.slug.en === slug ||
      collection.slug.tr === slug,
  );
}

export function getProjectsForCollection<T extends AnyProjectLike>(
  projects: T[],
  collections: ContentCollection[],
  collectionId: string,
): T[] {
  return projects.filter(
    (project) => resolveProjectCollectionId(project, collections) === collectionId,
  );
}

export function getSortedCollections(collections: ContentCollection[]): ContentCollection[] {
  return sortCollections(collections).filter((collection) => collection.featured !== false);
}

export type ResolvedWorkCollection = {
  id: string;
  slug: string;
  path: string;
  title: string;
  description: string;
  coverImage?: string;
  order: number;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  source: ContentCollection;
};

export function resolveWorkCollection(
  collection: ContentCollection,
  locale: Locale,
): ResolvedWorkCollection {
  return {
    id: collection.id,
    slug: getCollectionSlug(collection, locale),
    path: getCollectionPath(collection, locale),
    title: pickLocale(collection.title, locale),
    description: pickLocale(collection.description, locale),
    coverImage: collection.coverImage,
    order: collection.order,
    featured: collection.featured,
    seoTitle: collection.seo?.title ? pickLocale(collection.seo.title, locale) : undefined,
    seoDescription: collection.seo?.description
      ? pickLocale(collection.seo.description, locale)
      : undefined,
    source: collection,
  };
}

export function resolveWorkCollections(
  collections: ContentCollection[],
  locale: Locale,
): ResolvedWorkCollection[] {
  return getSortedCollections(collections).map((collection) =>
    resolveWorkCollection(collection, locale),
  );
}

export function getDefaultCollectionId(collections: ContentCollection[]): string {
  return getSortedCollections(collections)[0]?.id ?? DEFAULT_COLLECTIONS[0].id;
}

export const HOMEPAGE_COLLECTION_LIMIT = 4;

export function selectHomepageCollections(
  collections: ResolvedWorkCollection[],
): ResolvedWorkCollection[] {
  const featured = collections.filter((collection) => collection.featured);
  const homepageCollections = featured.length > 0 ? featured : collections;
  return homepageCollections.slice(0, HOMEPAGE_COLLECTION_LIMIT);
}
