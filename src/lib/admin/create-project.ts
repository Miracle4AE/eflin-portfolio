import type { ProjectCategory } from "@/types";
import type { ContentProject, LocaleField } from "@/lib/content/types";
import { ls } from "@/lib/content/locale-field";

export const PROJECT_CATEGORIES = [
  "branding",
  "editorial",
  "identity",
  "digital",
  "art-direction",
] as const satisfies readonly ProjectCategory[];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, LocaleField> = {
  branding: ls("Branding", "Marka"),
  editorial: ls("Editorial Design", "Editoryal Tasarım"),
  identity: ls("Visual Identity", "Görsel Kimlik"),
  digital: ls("Digital Design", "Dijital Tasarım"),
  "art-direction": ls("Art Direction", "Sanat Yönetimi"),
};

export type CreateProjectDraftInput = {
  titleEn: string;
  titleTr: string;
  slug: string;
  collectionId: string;
  filterCategory: ProjectCategory;
  year: string;
  client: string;
  roleEn: string;
  roleTr: string;
  summaryEn: string;
  summaryTr: string;
  coverImagePath?: string;
  heroImagePath?: string;
  featured?: boolean;
};

export function slugifyProjectTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidProjectSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export function getUniqueProjectSlug(baseSlug: string, existingSlugs: string[]): string {
  const normalized = slugifyProjectTitle(baseSlug) || "project";
  const used = new Set(existingSlugs);
  if (!used.has(normalized)) return normalized;

  let index = 2;
  let candidate = `${normalized}-${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${normalized}-${index}`;
  }
  return candidate;
}

export function createProjectDraft(input: CreateProjectDraftInput): ContentProject {
  const slug = slugifyProjectTitle(input.slug);
  const category = PROJECT_CATEGORY_LABELS[input.filterCategory];
  const titleEn = input.titleEn.trim();
  const titleTr = input.titleTr.trim();
  const summaryEn = input.summaryEn.trim();
  const summaryTr = input.summaryTr.trim();

  return {
    slug,
    collectionId: input.collectionId,
    title: ls(titleEn, titleTr),
    category,
    filterCategory: input.filterCategory,
    year: input.year.trim() || new Date().getFullYear().toString(),
    role: ls(input.roleEn.trim(), input.roleTr.trim()),
    client: ls(input.client.trim(), input.client.trim()),
    summary: ls(summaryEn, summaryTr),
    description: ls(summaryEn, summaryTr),
    concept: ls("", ""),
    challenge: ls("", ""),
    solution: ls("", ""),
    visualDirection: ls("", ""),
    typography: ls("", ""),
    tags: { en: [], tr: [] },
    palette: [{ name: ls("Black", "Siyah"), hex: "#0a0a0a" }],
    galleryItems: [],
    gradient: "from-[#8f6f64] via-[#b99287] to-[#ead8ce]",
    aspectRatio: "portrait",
    featured: Boolean(input.featured),
    coverImagePath: input.coverImagePath?.trim() ?? "",
    heroImagePath: input.heroImagePath?.trim() ?? "",
    imageAlt: ls(titleEn, titleTr || titleEn),
    seoTitle: ls(titleEn, titleTr),
    seoDescription: ls(summaryEn, summaryTr),
  };
}
