import type { Locale } from "@/i18n/config";
import type { LocaleField, SiteContent } from "@/lib/content/types";

function isLocaleField(value: unknown): value is LocaleField {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as LocaleField).en === "string" &&
    typeof (value as LocaleField).tr === "string"
  );
}

function parseIndexedSegment(segment: string): { key: string; index: number } | null {
  const match = segment.match(/^([a-zA-Z]+)\[(\d+)\]$/);
  if (!match) return null;
  return { key: match[1], index: Number.parseInt(match[2], 10) };
}

function getLocaleValue(field: LocaleField, locale: Locale): string {
  return field[locale];
}

function setLocaleValue(field: LocaleField, locale: Locale, value: string): LocaleField {
  return { ...field, [locale]: value };
}

function parseGalleryRest(rest: string): { id: string; field: string } | null {
  if (!rest.startsWith("gallery.")) return null;
  const tail = rest.slice("gallery.".length);
  const dot = tail.indexOf(".");
  if (dot === -1) return null;
  return { id: tail.slice(0, dot), field: tail.slice(dot + 1) };
}

export function getLocalizedPath(basePath: string, locale: Locale): string {
  return `${basePath}.${locale}`;
}

function readLeaf(value: unknown, locale: Locale): string {
  if (typeof value === "string") return value;
  if (isLocaleField(value)) return getLocaleValue(value, locale);
  return "";
}

function writeLeaf(existing: unknown, value: string, locale: Locale): unknown {
  if (isLocaleField(existing)) return setLocaleValue(existing, locale, value);
  if (existing !== undefined && typeof existing !== "string") {
    warnContentPath(`Expected string or localized field but got ${typeof existing}`);
    return existing;
  }
  return value;
}

function warnContentPath(message: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[VisualEditor] ${message}`);
  }
}

function setStringByPath(content: SiteContent, path: string, value: string): SiteContent | null {
  const parts = path.split(".");
  const next = structuredClone(content) as SiteContent;
  const target = traverseToParent(next, parts);
  if (!target) {
    warnContentPath(`Path not found: ${path}`);
    return null;
  }

  const { parent, leafKey } = target;
  const existing = parent[leafKey];
  if (existing !== undefined && typeof existing !== "string" && !isLocaleField(existing)) {
    warnContentPath(`Path "${path}" is not a string or localized field`);
    return null;
  }

  parent[leafKey] = value;
  return next;
}

function traverseToParent(
  root: SiteContent,
  parts: string[],
): { parent: Record<string, unknown>; leafKey: string } | null {
  let current: unknown = root;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const indexed = parseIndexedSegment(parts[i]);
    if (indexed && current && typeof current === "object") {
      const container = current as Record<string, unknown>;
      const list = container[indexed.key];
      if (!Array.isArray(list)) return null;
      current = list[indexed.index];
      continue;
    }

    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[parts[i]];
  }

  if (!current || typeof current !== "object") return null;
  return { parent: current as Record<string, unknown>, leafKey: parts[parts.length - 1] };
}

export function getValueByPath(
  content: SiteContent,
  path: string,
  locale: Locale,
): string {
  const serviceMatch = path.match(/^homepage\.services\.items\.([^.]+)\.(.+)$/);
  if (serviceMatch) {
    const [, id, field] = serviceMatch;
    const item = content.homepage.services.items.find((entry) => entry.id === id);
    if (!item) return "";
    return readLeaf((item as Record<string, unknown>)[field], locale);
  }

  const projectMatch = path.match(/^projects\.([^.]+)\.(.+)$/);
  if (projectMatch) {
    const [, slug, rest] = projectMatch;
    const project = content.projects.find((p) => p.slug === slug);
    if (!project) return "";

    const gallery = parseGalleryRest(rest);
    if (gallery) {
      const item = project.galleryItems.find((g) => g.id === gallery.id);
      if (!item) return "";
      return readLeaf((item as Record<string, unknown>)[gallery.field], locale);
    }

    return readLeaf((project as Record<string, unknown>)[rest], locale);
  }

  const parts = path.split(".");
  const leaf = parts[parts.length - 1];
  const indexedLeaf = parseIndexedSegment(leaf);
  if (indexedLeaf && parts.length === 1) return "";

  const target = traverseToParent(content, parts);
  if (!target) return "";

  const { parent, leafKey } = target;
  const indexed = parseIndexedSegment(leafKey);
  if (indexed) {
    const list = parent[indexed.key];
    if (!Array.isArray(list)) return "";
    return readLeaf(list[indexed.index], locale);
  }

  return readLeaf(parent[leafKey], locale);
}

export function setValueByPath(
  content: SiteContent,
  path: string,
  value: string,
  locale: Locale,
): SiteContent {
  const next = structuredClone(content) as SiteContent;

  const serviceMatch = path.match(/^homepage\.services\.items\.([^.]+)\.(.+)$/);
  if (serviceMatch) {
    const [, id, field] = serviceMatch;
    const item = next.homepage.services.items.find((entry) => entry.id === id);
    if (!item) {
      warnContentPath(`Service item not found: ${id}`);
      return content;
    }
    const existing = (item as Record<string, unknown>)[field];
    if (existing === undefined) {
      warnContentPath(`Service field not found: ${path}`);
      return content;
    }
    (item as Record<string, unknown>)[field] = writeLeaf(existing, value, locale);
    return next;
  }

  const projectMatch = path.match(/^projects\.([^.]+)\.(.+)$/);
  if (projectMatch) {
    const [, slug, rest] = projectMatch;
    const project = next.projects.find((p) => p.slug === slug);
    if (!project) {
      warnContentPath(`Project slug not found: ${slug}`);
      return content;
    }

    const gallery = parseGalleryRest(rest);
    if (gallery) {
      const item = project.galleryItems.find((g) => g.id === gallery.id);
      if (!item) {
        warnContentPath(`Gallery item not found: ${gallery.id} in project ${slug}`);
        return content;
      }
      const existing = (item as Record<string, unknown>)[gallery.field];
      if (existing === undefined) {
        warnContentPath(`Gallery field not found: ${path}`);
        return content;
      }
      (item as Record<string, unknown>)[gallery.field] = writeLeaf(existing, value, locale);
      return next;
    }

    const existing = (project as Record<string, unknown>)[rest];
    if (existing === undefined) {
      warnContentPath(`Project field not found: ${path}`);
      return content;
    }
    (project as Record<string, unknown>)[rest] = writeLeaf(existing, value, locale);
    return next;
  }

  const parts = path.split(".");
  const target = traverseToParent(next, parts);
  if (!target) {
    warnContentPath(`Path not found: ${path}`);
    return content;
  }

  const { parent, leafKey } = target;
  const indexed = parseIndexedSegment(leafKey);
  if (indexed) {
    const list = parent[indexed.key];
    if (!Array.isArray(list)) return content;
    list[indexed.index] = writeLeaf(list[indexed.index], value, locale);
    return next;
  }

  parent[leafKey] = writeLeaf(parent[leafKey], value, locale);
  return next;
}

export function setImagePathByPath(
  content: SiteContent,
  path: string,
  value: string | null,
): SiteContent {
  const updated = setStringByPath(content, path, value ?? "");
  if (!updated) return content;
  return updated;
}
