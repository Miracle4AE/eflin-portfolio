import type { ProjectCategory } from "@/types";
import type { ContentProject, SiteContent } from "@/lib/content/types";
import { ensureContentCollections } from "@/lib/content/collections";

const VALID_CATEGORIES = new Set<ProjectCategory>([
  "branding",
  "editorial",
  "identity",
  "digital",
  "art-direction",
]);

/** Total JSON size guard for API/Blob writes — not a per-field text limit. */
const MAX_PAYLOAD_BYTES = 4 * 1024 * 1024;

export type ValidationResult =
  | { ok: true; data: SiteContent }
  | { ok: false; errors: string[] };

function isLocaleField(value: unknown): value is { en: string; tr: string } {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.en === "string" && typeof obj.tr === "string";
}

function requireLocaleField(
  value: unknown,
  path: string,
  errors: string[],
  required = false,
): void {
  if (!value) {
    if (required) errors.push(`${path} is required`);
    return;
  }
  if (!isLocaleField(value)) {
    errors.push(`${path} must be { en, tr }`);
    return;
  }
  if (required && !value.en.trim()) {
    errors.push(`${path}.en is required`);
  }
}

function validateProject(project: unknown, index: number, errors: string[]): void {
  if (!project || typeof project !== "object") {
    errors.push(`projects[${index}] must be an object`);
    return;
  }
  const p = project as Record<string, unknown>;
  const slug = p.slug;
  if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
    errors.push(`projects[${index}].slug must be a lowercase slug`);
  }
  requireLocaleField(p.title, `projects[${index}].title`, errors, true);
  requireLocaleField(p.summary, `projects[${index}].summary`, errors, true);
  if (typeof p.filterCategory !== "string" || !VALID_CATEGORIES.has(p.filterCategory as ProjectCategory)) {
    errors.push(`projects[${index}].filterCategory is invalid`);
  }
  if (!Array.isArray(p.galleryItems)) {
    errors.push(`projects[${index}].galleryItems must be an array`);
  } else if (p.galleryItems.length > 24) {
    errors.push(`projects[${index}] has too many gallery items`);
  }
}

function validateCollection(collection: unknown, index: number, errors: string[]): void {
  if (!collection || typeof collection !== "object") {
    errors.push(`collections[${index}] must be an object`);
    return;
  }
  const item = collection as Record<string, unknown>;
  if (typeof item.id !== "string" || !/^[a-z0-9-]+$/.test(item.id)) {
    errors.push(`collections[${index}].id must be a lowercase id`);
  }
  requireLocaleField(item.slug, `collections[${index}].slug`, errors, true);
  requireLocaleField(item.title, `collections[${index}].title`, errors, true);
  requireLocaleField(item.description, `collections[${index}].description`, errors, false);
  if (typeof item.order !== "number") {
    errors.push(`collections[${index}].order must be a number`);
  }
  if (
    item.presentationMode !== undefined &&
    item.presentationMode !== "grid" &&
    item.presentationMode !== "book"
  ) {
    errors.push(`collections[${index}].presentationMode must be "grid" or "book"`);
  }
}

export function validateSiteContent(payload: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return { ok: false, errors: ["Invalid JSON string"] };
    }
  }

  const serialized = JSON.stringify(payload);
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    return { ok: false, errors: ["Payload exceeds maximum size (4MB)"] };
  }

  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["Content must be an object"] };
  }

  const data = payload as Record<string, unknown>;

  if (data.version !== 1) {
    errors.push("version must be 1");
  }

  if (data.meta !== undefined) {
    if (!data.meta || typeof data.meta !== "object") {
      errors.push("meta must be an object when provided");
    } else {
      const meta = data.meta as Record<string, unknown>;
      if (typeof meta.revisionId !== "string" || !meta.revisionId.trim()) {
        errors.push("meta.revisionId must be a non-empty string when meta is provided");
      }
      if (typeof meta.updatedAt !== "string" || !meta.updatedAt.trim()) {
        errors.push("meta.updatedAt must be a non-empty string when meta is provided");
      }
      if (typeof meta.updatedBy !== "string" || !meta.updatedBy.trim()) {
        errors.push("meta.updatedBy must be a non-empty string when meta is provided");
      }
    }
  }

  if (!data.site || typeof data.site !== "object") {
    errors.push("site settings are required");
  } else {
    const site = data.site as Record<string, unknown>;
    if (typeof site.email !== "string" || !site.email.includes("@")) {
      errors.push("site.email must be a valid email");
    }
  }

  if (!data.homepage || typeof data.homepage !== "object") {
    errors.push("homepage is required");
  } else {
    const homepage = data.homepage as Record<string, unknown>;
    if (typeof homepage.showcaseProjectSlug !== "string" || !homepage.showcaseProjectSlug.trim()) {
      errors.push("homepage.showcaseProjectSlug is required");
    }
  }

  if (!Array.isArray(data.projects)) {
    errors.push("projects must be an array");
  } else {
    if (data.projects.length > 50) {
      errors.push("Too many projects (max 50)");
    }
    const slugs = new Set<string>();
    data.projects.forEach((project, index) => {
      validateProject(project, index, errors);
      const slug = (project as ContentProject)?.slug;
      if (typeof slug === "string") {
        if (slugs.has(slug)) errors.push(`Duplicate project slug: ${slug}`);
        slugs.add(slug);
      }
    });

    const showcase = (data.homepage as Record<string, unknown> | undefined)?.showcaseProjectSlug;
    if (typeof showcase === "string" && data.projects.length > 0 && !slugs.has(showcase)) {
      errors.push(`showcaseProjectSlug "${showcase}" does not match any project`);
    }
  }

  if (data.collections !== undefined) {
    if (!Array.isArray(data.collections)) {
      errors.push("collections must be an array");
    } else {
      const ids = new Set<string>();
      const slugsEn = new Set<string>();
      const slugsTr = new Set<string>();
      data.collections.forEach((collection, index) => {
        validateCollection(collection, index, errors);
        const item = collection as { id?: unknown; slug?: { en?: unknown; tr?: unknown } };
        if (typeof item.id === "string") {
          if (ids.has(item.id)) errors.push(`Duplicate collection id: ${item.id}`);
          ids.add(item.id);
        }
        if (typeof item.slug?.en === "string") {
          if (slugsEn.has(item.slug.en)) errors.push(`Duplicate collection EN slug: ${item.slug.en}`);
          slugsEn.add(item.slug.en);
        }
        if (typeof item.slug?.tr === "string") {
          if (slugsTr.has(item.slug.tr)) errors.push(`Duplicate collection TR slug: ${item.slug.tr}`);
          slugsTr.add(item.slug.tr);
        }
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: ensureContentCollections(payload as SiteContent) };
}
