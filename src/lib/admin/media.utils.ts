import path from "path";
import type { MediaFileType, UploadDestination } from "@/lib/admin/media.constants";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  ALLOWED_UPLOAD_MIME,
  REJECTED_UPLOAD_EXTENSIONS,
  UPLOAD_SIZE_LIMITS,
} from "@/lib/admin/media.constants";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function classifyMediaFile(publicPath: string): MediaFileType {
  const filename = path.basename(publicPath).toLowerCase();
  if (filename === "portrait.jpg" || filename === "portrait.webp" || filename === "portrait.avif") {
    return "portrait";
  }
  if (filename === "cover.jpg" || filename === "cover.webp" || filename === "cover.avif") {
    return "cover";
  }
  if (filename === "hero.jpg" || filename === "hero.webp" || filename === "hero.avif") {
    return "hero";
  }
  if (/^gallery-\d{2}\.(jpg|jpeg|webp|png|avif)$/i.test(filename)) return "gallery";
  return "other";
}

export function extractProjectSlug(publicPath: string): string | null {
  const match = publicPath.match(/\/(?:images|media)\/projects\/([^/]+)\//);
  return match?.[1] ?? null;
}

export function validateUploadFile(
  file: File,
  destination: UploadDestination,
): string | null {
  const ext = path.extname(file.name).toLowerCase();

  if (REJECTED_UPLOAD_EXTENSIONS.has(ext)) {
    return "Unsupported file type. Use JPG, PNG, WebP, or AVIF only.";
  }

  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext) && ext !== ".jpeg") {
    return "Unsupported file type. Use JPG, PNG, WebP, or AVIF only.";
  }

  if (file.type && !ALLOWED_UPLOAD_MIME.has(file.type)) {
    return "Unsupported MIME type. Use JPG, PNG, WebP, or AVIF only.";
  }

  const limit = UPLOAD_SIZE_LIMITS[destination];
  if (file.size > limit) {
    return `File is too large (${formatBytes(file.size)}). Max ${formatBytes(limit)} for ${destination}.`;
  }

  return null;
}

export function resolveContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".avif") return "image/avif";
  return "image/jpeg";
}
