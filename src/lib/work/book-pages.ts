import type { Locale } from "@/i18n/config";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { localizedPath } from "@/i18n/navigation";
import type { ResolvedGalleryItem, ResolvedProject } from "@/types";

export type BookPageKind =
  | "intro"
  | "project-overview"
  | "project-cover"
  | "gallery-image"
  | "excerpt"
  | "closing"
  | "filler"
  | "detail-intro"
  | "detail-meta"
  | "detail-closing";

export type BookLightboxImage = {
  src: string;
  alt: string;
  caption?: string;
};

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
  shortTagline?: string;
  projectIndex?: number;
  projectTotal?: number;
  imageSrc?: string | null;
  imageAlt?: string;
  imageGradient?: string;
  imageCaption?: string;
  excerptTitle?: string;
  excerptBody?: string;
  introTitle?: string;
  introSubtitle?: string;
  introDescription?: string;
  projectCount?: number;
  lightboxEnabled?: boolean;
};

export type BookSpreadData = {
  id: string;
  left: BookPageData;
  right: BookPageData;
};

export type ProjectDetailData = {
  spreads: BookSpreadData[];
  flatPages: BookPageData[];
};

export type BookExperienceData = {
  spreads: BookSpreadData[];
  flatPages: BookPageData[];
  projectSpreadIndexBySlug: Record<string, number>;
  projectDetails: Record<string, ProjectDetailData>;
  projectLightboxImages: Record<string, BookLightboxImage[]>;
};

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

function firstSentence(text: string, maxLength = 110): string | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^[^.!?]+[.!?]?/);
  const sentence = (match?.[0] ?? trimmed).trim();
  if (sentence.length <= maxLength) return sentence;
  return `${sentence.slice(0, maxLength - 1).trim()}…`;
}

function excerptLabels(locale: Locale) {
  return locale === "tr"
    ? {
        concept: "Konsept",
        challenge: "Zorluk",
        solution: "Çözüm",
        visualDirection: "Görsel Yön",
        continued: "devam",
        projectEnd: "Proje Sonu",
      }
    : {
        concept: "Concept",
        challenge: "Challenge",
        solution: "Solution",
        visualDirection: "Visual Direction",
        continued: "continued",
        projectEnd: "End of Project",
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
  };
}

function createImagePage(
  id: string,
  project: ResolvedProject,
  projectPath: string,
  imageSrc: string | null,
  imageAlt: string,
  imageGradient: string,
  caption?: string,
  lightboxEnabled = true,
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
    imageCaption: caption,
    lightboxEnabled,
  };
}

function pairPages(
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

    spreads.push({ id: `${spreadPrefix}-${i}`, left, right });
  }

  return spreads;
}

function buildProjectLightboxImages(
  project: ResolvedProject,
  cover: string | null,
  coverAlt: string,
  gallery: ResolvedGalleryItem[],
): BookLightboxImage[] {
  const images: BookLightboxImage[] = [];
  if (cover) {
    images.push({ src: cover, alt: coverAlt, caption: project.title });
  }
  gallery.forEach((item) => {
    if (!item.src) return;
    images.push({
      src: item.src,
      alt: item.alt ?? project.title,
      caption: item.caption,
    });
  });
  return images;
}

function buildProjectDetailSpreads(
  project: ResolvedProject,
  locale: Locale,
  gallery: ResolvedGalleryItem[],
): ProjectDetailData {
  const spreads: BookSpreadData[] = [];
  const projectPath = localizedPath(locale, `/work/${project.slug}`);
  const cover = project.images.coverImage ?? project.images.heroImage ?? null;
  const labels = excerptLabels(locale);

  spreads.push({
    id: `${project.slug}-detail-intro`,
    left: {
      id: `${project.slug}-detail-intro-left`,
      kind: "detail-intro",
      projectSlug: project.slug,
      projectTitle: project.title,
      projectPath,
      summary: hasText(project.summary) ? project.summary : undefined,
    },
    right: cover
      ? {
          id: `${project.slug}-detail-hero`,
          kind: "project-cover",
          projectSlug: project.slug,
          projectTitle: project.title,
          projectPath,
          imageSrc: cover,
          imageAlt: project.images.imageAlt,
          imageGradient: project.gradient,
          lightboxEnabled: true,
        }
      : createFillerPage(`${project.slug}-detail-hero-filler`, project.title),
  });

  const metaPage: BookPageData = {
    id: `${project.slug}-detail-meta`,
    kind: "detail-meta",
    projectSlug: project.slug,
    projectTitle: project.title,
    projectPath,
    year: hasText(project.year) ? project.year : undefined,
    category: hasText(project.category) ? project.category : undefined,
    client: hasText(project.client) ? project.client : undefined,
    role: hasText(project.role) ? project.role : undefined,
  };

  const conceptChunks = hasText(project.concept) ? chunkText(project.concept, EXCERPT_CHUNK) : [];
  if (conceptChunks.length > 0) {
    spreads.push({
      id: `${project.slug}-detail-meta-concept`,
      left: metaPage,
      right: {
        id: `${project.slug}-detail-concept-0`,
        kind: "excerpt",
        projectSlug: project.slug,
        projectTitle: project.title,
        projectPath,
        excerptTitle: labels.concept,
        excerptBody: conceptChunks[0],
      },
    });
    if (conceptChunks.length > 1) {
      spreads.push(
        ...pairPages(
          conceptChunks.slice(1).map((body, index) => ({
            id: `${project.slug}-detail-concept-${index + 1}`,
            kind: "excerpt" as const,
            projectSlug: project.slug,
            projectTitle: project.title,
            projectPath,
            excerptTitle: `${labels.concept} (${labels.continued})`,
            excerptBody: body,
          })),
          project,
          projectPath,
          cover,
          project.images.imageAlt,
          project.gradient,
          `${project.slug}-detail-concept-extra`,
        ),
      );
    }
  } else {
    spreads.push({
      id: `${project.slug}-detail-meta-only`,
      left: metaPage,
      right: cover
        ? createImagePage(
            `${project.slug}-detail-meta-image`,
            project,
            projectPath,
            cover,
            project.images.imageAlt,
            project.gradient,
          )
        : createFillerPage(`${project.slug}-detail-meta-filler`, project.title),
    });
  }

  const challengeSolutionPages: BookPageData[] = [];
  if (hasText(project.challenge)) {
    chunkText(project.challenge, EXCERPT_CHUNK).forEach((body, index) => {
      challengeSolutionPages.push({
        id: `${project.slug}-detail-challenge-${index}`,
        kind: "excerpt",
        projectSlug: project.slug,
        projectTitle: project.title,
        projectPath,
        excerptTitle: index === 0 ? labels.challenge : `${labels.challenge} (${labels.continued})`,
        excerptBody: body,
      });
    });
  }
  if (hasText(project.solution)) {
    chunkText(project.solution, EXCERPT_CHUNK).forEach((body, index) => {
      challengeSolutionPages.push({
        id: `${project.slug}-detail-solution-${index}`,
        kind: "excerpt",
        projectSlug: project.slug,
        projectTitle: project.title,
        projectPath,
        excerptTitle: index === 0 ? labels.solution : `${labels.solution} (${labels.continued})`,
        excerptBody: body,
      });
    });
  }
  if (challengeSolutionPages.length > 0) {
    spreads.push(
      ...pairPages(
        challengeSolutionPages,
        project,
        projectPath,
        cover,
        project.images.imageAlt,
        project.gradient,
        `${project.slug}-detail-process`,
      ),
    );
  }

  if (hasText(project.visualDirection)) {
    chunkText(project.visualDirection, EXCERPT_CHUNK).forEach((body, index) => {
      spreads.push({
        id: `${project.slug}-detail-visual-${index}`,
        left: {
          id: `${project.slug}-detail-visual-left-${index}`,
          kind: "excerpt",
          projectSlug: project.slug,
          projectTitle: project.title,
          projectPath,
          excerptTitle:
            index === 0 ? labels.visualDirection : `${labels.visualDirection} (${labels.continued})`,
          excerptBody: body,
        },
        right:
          index === 0 && cover
            ? createImagePage(
                `${project.slug}-detail-visual-image-${index}`,
                project,
                projectPath,
                cover,
                project.images.imageAlt,
                project.gradient,
              )
            : createFillerPage(`${project.slug}-detail-visual-filler-${index}`, project.title),
      });
    });
  }

  if (gallery.length > 0) {
    for (let i = 0; i < gallery.length; i += 2) {
      const leftItem = gallery[i];
      const rightItem = gallery[i + 1];
      spreads.push({
        id: `${project.slug}-detail-gallery-${i}`,
        left: createImagePage(
          `${project.slug}-detail-gallery-left-${i}`,
          project,
          projectPath,
          leftItem.src,
          leftItem.alt ?? project.title,
          leftItem.gradient ?? project.gradient,
          leftItem.caption,
        ),
        right: rightItem
          ? createImagePage(
              `${project.slug}-detail-gallery-right-${i}`,
              project,
              projectPath,
              rightItem.src,
              rightItem.alt ?? project.title,
              rightItem.gradient ?? project.gradient,
              rightItem.caption,
            )
          : createFillerPage(`${project.slug}-detail-gallery-filler-${i}`, project.title),
      });
    }
  }

  spreads.push({
    id: `${project.slug}-detail-closing`,
    left: {
      id: `${project.slug}-detail-closing-page`,
      kind: "detail-closing",
      projectSlug: project.slug,
      projectTitle: project.title,
      introTitle: project.title,
      introSubtitle: labels.projectEnd,
    },
    right: createFillerPage(`${project.slug}-detail-closing-filler`),
  });

  return {
    spreads,
    flatPages: spreads.flatMap((spread) => [spread.left, spread.right]),
  };
}

export function buildBookExperienceData(
  collection: ResolvedWorkCollection,
  projects: ResolvedProject[],
  locale: Locale,
  resolveGallery: (project: ResolvedProject) => ResolvedGalleryItem[],
): BookExperienceData {
  const spreads: BookSpreadData[] = [];
  const projectSpreadIndexBySlug: Record<string, number> = {};
  const projectDetails: Record<string, ProjectDetailData> = {};
  const projectLightboxImages: Record<string, BookLightboxImage[]> = {};

  const settings = collection.bookSettings;
  const coverImage =
    settings?.coverImage ?? collection.coverImage ?? projects[0]?.images.coverImage ?? null;
  const defaultGradient = projects[0]?.gradient ?? "from-[#f6eee4] via-[#ead8ce] to-[#b98f83]";

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
          lightboxEnabled: false,
        }
      : createFillerPage("intro-right-filler", collection.title),
  });

  projects.forEach((project, index) => {
    const projectPath = localizedPath(locale, `/work/${project.slug}`);
    const cover = project.images.coverImage ?? project.images.heroImage ?? null;
    const gallery = resolveGallery(project).filter((item) => item.src);

    projectSpreadIndexBySlug[project.slug] = spreads.length;
    projectLightboxImages[project.slug] = buildProjectLightboxImages(
      project,
      cover,
      project.images.imageAlt,
      gallery,
    );
    projectDetails[project.slug] = buildProjectDetailSpreads(project, locale, gallery);

    spreads.push({
      id: `${project.slug}-overview`,
      left: {
        id: `${project.slug}-overview-left`,
        kind: "project-overview",
        projectSlug: project.slug,
        projectTitle: project.title,
        projectPath,
        year: hasText(project.year) ? project.year : undefined,
        category: hasText(project.category) ? project.category : undefined,
        shortTagline: firstSentence(project.summary),
        projectIndex: index + 1,
        projectTotal: projects.length,
      },
      right: cover
        ? {
            id: `${project.slug}-overview-cover`,
            kind: "project-cover",
            projectSlug: project.slug,
            projectTitle: project.title,
            projectPath,
            imageSrc: cover,
            imageAlt: project.images.imageAlt,
            imageGradient: project.gradient,
            lightboxEnabled: true,
          }
        : createFillerPage(`${project.slug}-overview-cover-filler`, project.title),
    });
  });

  if (projects.length === 0) {
    spreads.push({
      id: "empty-collection",
      left: createClosingPage(collection, locale),
      right: createFillerPage("empty-collection-filler"),
    });
  } else {
    spreads.push({
      id: "closing",
      left: createClosingPage(collection, locale),
      right: createFillerPage("closing-filler"),
    });
  }

  const flatPages = spreads.flatMap((spread) => [spread.left, spread.right]);

  return {
    spreads,
    flatPages,
    projectSpreadIndexBySlug,
    projectDetails,
    projectLightboxImages,
  };
}

export function getSpreadIndexForPage(spreads: BookSpreadData[], pageIndex: number): number {
  let count = 0;
  for (let spreadIndex = 0; spreadIndex < spreads.length; spreadIndex += 1) {
    count += 2;
    if (pageIndex < count) return spreadIndex;
  }
  return Math.max(0, spreads.length - 1);
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
