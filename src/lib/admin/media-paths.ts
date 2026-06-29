import fs from "fs";
import path from "path";
import type { UploadDestination } from "@/lib/admin/media.constants";
import { MEDIA_BLOB_PREFIX } from "@/lib/admin/media.constants";

const PUBLIC_IMAGES = path.join(process.cwd(), "public", "images");

function normalizeUploadExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if (ext === ".png") return ".png";
  if (ext === ".webp") return ".webp";
  if (ext === ".avif") return ".avif";
  return ".jpg";
}

function nextGalleryFilename(existingNames: string[], ext: string): string {
  let max = 0;
  for (const file of existingNames) {
    const match = file.match(/^gallery-(\d{2})\./i);
    if (match) max = Math.max(max, Number.parseInt(match[1], 10));
  }
  return `gallery-${String(max + 1).padStart(2, "0")}${ext}`;
}

function safeSlug(projectSlug: string): string {
  return projectSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

function safeGeneralName(originalFilename: string, ext: string): string {
  const base = path.basename(originalFilename, path.extname(originalFilename))
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
  return base.endsWith(ext) ? base : `${base || "upload"}${ext}`;
}

export type UploadTarget = {
  filename: string;
  localDiskPath: string | null;
  localPublicPath: string;
  blobPathname: string;
  blobPublicPath: string;
};

export function resolveUploadTarget(
  destination: UploadDestination,
  projectSlug: string | undefined,
  originalFilename: string,
  existingGalleryNames: string[] = [],
): UploadTarget {
  const ext = normalizeUploadExtension(originalFilename);

  if (destination === "portrait") {
    const filename = ext === ".webp" ? "portrait.webp" : ext === ".avif" ? "portrait.avif" : "portrait.jpg";
    return {
      filename,
      localDiskPath: path.join(PUBLIC_IMAGES, filename),
      localPublicPath: `/images/${filename}`,
      blobPathname: `${MEDIA_BLOB_PREFIX}/${filename}`,
      blobPublicPath: `/media/${filename}`,
    };
  }

  if (destination === "general") {
    const filename = safeGeneralName(originalFilename, ext);
    return {
      filename,
      localDiskPath: path.join(PUBLIC_IMAGES, "general", filename),
      localPublicPath: `/images/general/${filename}`,
      blobPathname: `${MEDIA_BLOB_PREFIX}/general/${filename}`,
      blobPublicPath: `/media/general/${filename}`,
    };
  }

  if (!projectSlug?.trim()) {
    throw new Error("Project slug is required for project uploads");
  }

  const slug = safeSlug(projectSlug);
  const projectDir = path.join(PUBLIC_IMAGES, "projects", slug);

  if (destination === "cover") {
    const filename =
      ext === ".webp" ? "cover.webp" : ext === ".avif" ? "cover.avif" : "cover.jpg";
    return {
      filename,
      localDiskPath: path.join(projectDir, filename),
      localPublicPath: `/images/projects/${slug}/${filename}`,
      blobPathname: `${MEDIA_BLOB_PREFIX}/projects/${slug}/${filename}`,
      blobPublicPath: `/media/projects/${slug}/${filename}`,
    };
  }

  if (destination === "hero") {
    const filename =
      ext === ".webp" ? "hero.webp" : ext === ".avif" ? "hero.avif" : "hero.jpg";
    return {
      filename,
      localDiskPath: path.join(projectDir, filename),
      localPublicPath: `/images/projects/${slug}/${filename}`,
      blobPathname: `${MEDIA_BLOB_PREFIX}/projects/${slug}/${filename}`,
      blobPublicPath: `/media/projects/${slug}/${filename}`,
    };
  }

  const filename = nextGalleryFilename(existingGalleryNames, ext);
  return {
    filename,
    localDiskPath: path.join(projectDir, filename),
    localPublicPath: `/images/projects/${slug}/${filename}`,
    blobPathname: `${MEDIA_BLOB_PREFIX}/projects/${slug}/${filename}`,
    blobPublicPath: `/media/projects/${slug}/${filename}`,
  };
}

export function uploadTargetExists(target: UploadTarget, mode: "local" | "blob"): boolean {
  if (mode === "local" && target.localDiskPath) {
    return fs.existsSync(target.localDiskPath);
  }
  return false;
}

export function blobPathnameFromPublicPath(publicPath: string): string | null {
  if (publicPath.startsWith("https://")) {
    return null;
  }
  if (publicPath.startsWith("/media/")) {
    return `${MEDIA_BLOB_PREFIX}/${publicPath.slice("/media/".length)}`;
  }
  return null;
}
