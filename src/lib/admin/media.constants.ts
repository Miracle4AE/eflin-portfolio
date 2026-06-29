export type MediaFileType = "portrait" | "cover" | "hero" | "gallery" | "other";

export type UploadDestination =
  | "portrait"
  | "cover"
  | "hero"
  | "gallery"
  | "general";

export const MEDIA_BLOB_PREFIX = "media";

export const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

export const REJECTED_UPLOAD_EXTENSIONS = new Set([
  ".svg",
  ".psd",
  ".ai",
  ".pdf",
  ".mp4",
  ".mov",
  ".webm",
]);

export const ALLOWED_UPLOAD_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const UPLOAD_SIZE_LIMITS: Record<UploadDestination, number> = {
  portrait: 2 * 1024 * 1024,
  cover: 3 * 1024 * 1024,
  hero: 4 * 1024 * 1024,
  gallery: 3 * 1024 * 1024,
  general: 3 * 1024 * 1024,
};

export const PRIVATE_BLOB_MEDIA_ERROR =
  "This Blob store is private. Public media upload requires a public Blob store or image proxy route.";

export function isDevelopmentMediaUpload(): boolean {
  return process.env.NODE_ENV === "development";
}
