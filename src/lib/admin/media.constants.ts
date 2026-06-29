export type MediaFileType = "portrait" | "cover" | "hero" | "gallery" | "other";

export type UploadDestination =
  | "portrait"
  | "cover"
  | "hero"
  | "gallery"
  | "general";

export const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

export const ALLOWED_UPLOAD_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const UPLOAD_SIZE_LIMITS: Record<UploadDestination, number> = {
  portrait: 800 * 1024,
  cover: 1024 * 1024,
  hero: 1536 * 1024,
  gallery: 1024 * 1024,
  general: 1024 * 1024,
};

export function canUploadMedia(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ADMIN_ENABLE_FILE_WRITE === "true"
  );
}
