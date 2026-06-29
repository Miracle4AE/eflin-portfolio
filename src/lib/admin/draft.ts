import type { SiteContent } from "@/lib/content/types";

const DRAFT_KEY = "eflin-admin-draft";
const DRAFT_META_KEY = "eflin-admin-draft-meta";

export type DraftMeta = {
  savedAt: string;
};

export function saveDraft(content: SiteContent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
    localStorage.setItem(
      DRAFT_META_KEY,
      JSON.stringify({ savedAt: new Date().toISOString() } satisfies DraftMeta),
    );
  } catch {
    // ignore quota errors
  }
}

export function loadDraft(): SiteContent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SiteContent;
  } catch {
    return null;
  }
}

export function loadDraftMeta(): DraftMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_META_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftMeta;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
  localStorage.removeItem(DRAFT_META_KEY);
}

export function contentEquals(a: SiteContent, b: SiteContent): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export type ContentDiffSummary = {
  projectsAdded: number;
  projectsRemoved: number;
  projectsChanged: number;
  fieldsChangedEstimate: number;
};

export function summarizeContentDiff(
  before: SiteContent,
  after: SiteContent,
): ContentDiffSummary {
  const beforeSlugs = new Set(before.projects.map((p) => p.slug));
  const afterSlugs = new Set(after.projects.map((p) => p.slug));

  const projectsAdded = after.projects.filter((p) => !beforeSlugs.has(p.slug)).length;
  const projectsRemoved = before.projects.filter((p) => !afterSlugs.has(p.slug)).length;

  const beforeBySlug = new Map(before.projects.map((p) => [p.slug, p]));
  let projectsChanged = 0;
  for (const project of after.projects) {
    const prev = beforeBySlug.get(project.slug);
    if (prev && JSON.stringify(prev) !== JSON.stringify(project)) {
      projectsChanged += 1;
    }
  }

  const fieldsChangedEstimate = Math.max(
    0,
    Math.floor(
      (JSON.stringify(before).length - JSON.stringify(after).length) / 100,
    ),
  );

  return {
    projectsAdded,
    projectsRemoved,
    projectsChanged,
    fieldsChangedEstimate,
  };
}

export function downloadJson(content: SiteContent, filename: string): void {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function timestampFilename(prefix: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${prefix}-${stamp}.json`;
}
