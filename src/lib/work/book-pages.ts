import type { Locale } from "@/i18n/config";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { localizedPath } from "@/i18n/navigation";
import type { ResolvedGalleryItem, ResolvedProject } from "@/types";

export type BookPageKind =
  | "intro"
  | "project-meta"
  | "project-cover"
  | "gallery-image"
  | "excerpt"
  | "closing"
  | "filler";

export type BookPageData = {
  id: string;
  kind: BookPageKind;
  projectSlug?: string;
  projectTitle?: string;
  projectPath?: string;
  year?: string;
  category?: string;
  client?: string;
  role?: string;
  summary?: string;
  projectIndex?: number;
  projectTotal?: number;
  imageSrc?: string | null;
  imageAlt?: string;
  imageGradient?: string;
  excerptTitle?: string;
  excerptBody?: string;
  introTitle?: string;
  introSubtitle?: string;
  introDescription?: string;
  projectCount?: number;
};

export type BookSpreadData = {
  id: string;
  left: BookPageData;
  right: BookPageData;
};

export type BookExperienceData = {
  spreads: BookSpreadData[];
  flatPages: BookPageData[];
};

const SUMMARY_CHUNK = 360;
const EXCERPT_CHUNK = 420;

function hasText(value?: string | null): boolean {
  return Boolean(value?.trim());
}

function chunkText(text: string, maxLength: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLength) return [trimmed];

  const chunks: string[] = [];
  let remaining = trimmed;

  while (remaining.length > maxLength) {
    const sliceAt = remaining.lastIndexOf(" ", maxLength);
    const cut = sliceAt > maxLength * 0.6 ? sliceAt : maxLength;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

function excerptLabels(locale: Locale) {
  return locale === "tr"
    ? {
        concept: "Konsept",
        challenge: "Zorluk",
        solution: "Çözüm",
        summaryContinued: "Özet (devam)",
        continued: "devam",
      }
    : {
        concept: "Concept",
        challenge: "Challenge",
        solution: "Solution",
        summaryContinued: "Summary (continued)",
        continued: "continued",
      };
}

function createFillerPage(id: string, paperAccent?: string): BookPageData {
  return {
    id,
    kind: "filler",
    introTitle: paperAccent,
  };
}

function createClosingPage(collection: ResolvedWorkCollection, locale: Locale): BookPageData {
  return {
    id: "closing-page",
    kind: "closing",
    introTitle: collection.title,
    introSubtitle: locale === "tr" ? "Koleksiyon Sonu" : "End of Collection",
    introDescription:
      locale === "tr"
        ? "Bu koleksiyondaki tüm projeleri incelediniz."
        : "You have reached the end of this collection.",
    projectCount: undefined,
  };
}

function createImagePage(
  id: string,
  project: ResolvedProject,
  projectPath: string,
  imageSrc: string | null,
  imageAlt: string,
  imageGradient: string,
): BookPageData {
  return {
    id,
    kind: "gallery-image",
    projectSlug: project.slug,
    projectTitle: project.title,
    projectPath,
    imageSrc,
    imageAlt,
    imageGradient,
  };
}

function pairExcerptPages(
  pages: BookPageData[],
  project: ResolvedProject,
  projectPath: string,
  cover: string | null,
  coverAlt: string,
  gradient: string,
  spreadPrefix: string,
): BookSpreadData[] {
  const spreads: BookSpreadData[] = [];

  for (let i = 0; i < pages.length; i += 2) {
    const left = pages[i];
    const right =
      pages[i + 1] ??
      (cover
        ? createImagePage(
            `${spreadPrefix}-image-${i}`,
            project,
            projectPath,
            cover,
            coverAlt,
            gradient,
          )
        : createFillerPage(`${spreadPrefix}-filler-${i}`, project.title));

    spreads.push({
      id: `${spreadPrefix}-${i}`,
      left,
      right,
    });
  }

  return spreads;
}

function appendClosingSpread(
  spreads: BookSpreadData[],
  collection: ResolvedWorkCollection,
  locale: Locale,
): void {
  spreads.push({
    id: "closing",
    left: createClosingPage(collection, locale),
    right: createFillerPage("closing-filler"),
  });
}

export function buildBookExperienceData(
  collection: ResolvedWorkCollection,
  projects: ResolvedProject[],
  locale: Locale,
  resolveGallery: (project: ResolvedProject) => ResolvedGalleryItem[],
): BookExperienceData {
  const spreads: BookSpreadData[] = [];
  const settings = collection.bookSettings;
  const coverImage =
    settings?.coverImage ?? collection.coverImage ?? projects[0]?.images.coverImage ?? null;
  const defaultGradient = projects[0]?.gradient ?? "from-[#f6eee4] via-[#ead8ce] to-[#b98f83]";
  const labels = excerptLabels(locale);

  const introDescription = settings?.intro ?? collection.description;
  const introSubtitle = settings?.subtitle ?? collection.description;

  spreads.push({
    id: "intro",
    left: {
      id: "intro-left",
      kind: "intro",
      introTitle: collection.title,
      introSubtitle: hasText(introSubtitle) ? introSubtitle : undefined,
      introDescription: hasText(introDescription) ? introDescription : undefined,
      projectCount: projects.length,
    },
    right: coverImage
      ? {
          id: "intro-right",
          kind: "gallery-image",
          imageSrc: coverImage,
          imageAlt: collection.title,
          imageGradient: defaultGradient,
        }
      : createFillerPage("intro-right-filler", collection.title),
  });

  projects.forEach((project, index) => {
    const projectPath = localizedPath(locale, `/work/${project.slug}`);
    const cover = project.images.coverImage ?? project.images.heroImage ?? null;
    const gallery = resolveGallery(project).filter((item) => item.src);
    const summaryChunks = hasText(project.summary)
      ? chunkText(project.summary, SUMMARY_CHUNK)
      : [];
    const primarySummary = summaryChunks[0];
    const extraSummaryPages = summaryChunks.slice(1).map((body, chunkIndex) => ({
      id: `${project.slug}-summary-extra-${chunkIndex}`,
      kind: "excerpt" as const,
      projectSlug: project.slug,
      projectTitle: project.title,
      projectPath,
      excerptTitle: labels.summaryContinued,
      excerptBody: body,
    }));

    spreads.push({
      id: `${project.slug}-main`,
      left: {
        id: `${project.slug}-meta`,
        kind: "project-meta",
        projectSlug: project.slug,
        projectTitle: project.title,
        projectPath,
        year: hasText(project.year) ? project.year : undefined,
        category: hasText(project.category) ? project.category : undefined,
        client: hasText(project.client) ? project.client : undefined,
        role: hasText(project.role) ? project.role : undefined,
        summary: primarySummary,
        projectIndex: index + 1,
        projectTotal: projects.length,
      },
      right: cover
        ? {
            id: `${project.slug}-cover`,
            kind: "project-cover",
            projectSlug: project.slug,
            projectTitle: project.title,
            projectPath,
            imageSrc: cover,
            imageAlt: project.images.imageAlt,
            imageGradient: project.gradient,
          }
        : createFillerPage(`${project.slug}-cover-filler`, project.title),
    });

    if (extraSummaryPages.length > 0) {
      spreads.push(
        ...pairExcerptPages(
          extraSummaryPages,
          project,
          projectPath,
          cover,
          project.images.imageAlt,
          project.gradient,
          `${project.slug}-summary`,
        ),
      );
    }

    if (gallery.length === 0) {
      spreads.push({
        id: `${project.slug}-gallery-empty`,
        left: createFillerPage(`${project.slug}-gallery-empty-left`, project.title),
        right: cover
          ? createImagePage(
              `${project.slug}-gallery-empty-image`,
              project,
              projectPath,
              cover,
              project.images.imageAlt,
              project.gradient,
            )
          : createFillerPage(`${project.slug}-gallery-empty-right`, project.title),
      });
    } else {
      for (let i = 0; i < gallery.length; i += 2) {
        const leftItem = gallery[i];
        const rightItem = gallery[i + 1];
        spreads.push({
          id: `${project.slug}-gallery-${i}`,
          left: createImagePage(
            `${project.slug}-gallery-left-${i}`,
            project,
            projectPath,
            leftItem.src,
            leftItem.alt ?? project.title,
            leftItem.gradient ?? project.gradient,
          ),
          right: rightItem
            ? createImagePage(
                `${project.slug}-gallery-right-${i}`,
                project,
                projectPath,
                rightItem.src,
                rightItem.alt ?? project.title,
                rightItem.gradient ?? project.gradient,
              )
            : createFillerPage(`${project.slug}-gallery-filler-${i}`, project.title),
        });
      }
    }

    const excerptPages: BookPageData[] = [];
    const excerptSources = [
      { title: labels.concept, body: project.concept },
      { title: labels.challenge, body: project.challenge },
      { title: labels.solution, body: project.solution },
    ].filter((item) => hasText(item.body));

    excerptSources.forEach((item, sourceIndex) => {
      const chunks = chunkText(item.body, EXCERPT_CHUNK);
      chunks.forEach((body, chunkIndex) => {
        excerptPages.push({
          id: `${project.slug}-excerpt-${sourceIndex}-${chunkIndex}`,
          kind: "excerpt",
          projectSlug: project.slug,
          projectTitle: project.title,
          projectPath,
          excerptTitle:
            chunkIndex === 0 ? item.title : `${item.title} (${labels.continued})`,
          excerptBody: body,
        });
      });
    });

    if (excerptPages.length > 0) {
      spreads.push(
        ...pairExcerptPages(
          excerptPages,
          project,
          projectPath,
          cover,
          project.images.imageAlt,
          project.gradient,
          `${project.slug}-excerpt`,
        ),
      );
    }
  });

  if (projects.length === 0) {
    spreads.push({
      id: "empty-collection",
      left: createClosingPage(collection, locale),
      right: createFillerPage("empty-collection-filler"),
    });
  } else {
    appendClosingSpread(spreads, collection, locale);
  }

  const flatPages = spreads.flatMap((spread) => [spread.left, spread.right]);

  return { spreads, flatPages };
}

export function getSpreadIndexForPage(spreads: BookSpreadData[], pageIndex: number): number {
  let count = 0;
  for (let spreadIndex = 0; spreadIndex < spreads.length; spreadIndex += 1) {
    count += 2;
    if (pageIndex < count) return spreadIndex;
  }
  return Math.max(0, spreads.length - 1);
}

export function getPageIndexForSpread(spreads: BookSpreadData[], spreadIndex: number): number {
  let count = 0;
  for (let index = 0; index < spreadIndex; index += 1) {
    count += 2;
  }
  return Math.min(count, Math.max(0, spreads.length * 2 - 1));
}

export function resolveClientGallery(project: ResolvedProject): ResolvedGalleryItem[] {
  return project.galleryItems.map((item) => {
    const path = item.imagePath;
    let src: string | null = null;
    if (path?.startsWith("http://") || path?.startsWith("https://") || path?.startsWith("/media/")) {
      src = path;
    } else if (path?.startsWith("/images/")) {
      src = path;
    } else if (item.file) {
      src = `/images/projects/${project.slug}/${item.file}`;
    }
    return { ...item, src };
  });
}
