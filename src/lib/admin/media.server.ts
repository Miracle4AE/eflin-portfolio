import fs from "fs";
import path from "path";
import { isBlobStorageAvailable } from "@/lib/content/storage";
import {
  isDevelopmentMediaUpload,
  type UploadDestination,
} from "@/lib/admin/media.constants";
import {
  deleteBlobMedia,
  getExistingGalleryNames,
  listBlobMediaFiles,
  uploadBlobMedia,
} from "@/lib/admin/media-blob";
import {
  resolveUploadTarget,
  uploadTargetExists,
} from "@/lib/admin/media-paths";
import type { MediaFile, UploadResult } from "@/lib/admin/media.types";
import {
  classifyMediaFile,
  extractProjectSlug,
  formatBytes,
  resolveContentType,
  validateUploadFile,
} from "@/lib/admin/media.utils";

export { formatBytes };

const PUBLIC_IMAGES = path.join(process.cwd(), "public", "images");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function getImageDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(64 * 1024);
    const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);
    const buf = buffer.subarray(0, bytesRead);

    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50) {
      return {
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20),
      };
    }

    let offset = 0;
    while (offset < buf.length - 10) {
      if (buf[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buf[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buf.readUInt16BE(offset + 5),
          width: buf.readUInt16BE(offset + 7),
        };
      }
      const segmentLength = buf.readUInt16BE(offset + 2);
      offset += 2 + segmentLength;
    }

    return null;
  } catch {
    return null;
  }
}

function walkImages(dir: string, results: string[]): void {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkImages(fullPath, results);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      results.push(fullPath);
    }
  }
}

function listLocalMediaFiles(): MediaFile[] {
  const files: string[] = [];
  walkImages(PUBLIC_IMAGES, files);

  return files
    .map((absolutePath) => {
      const relativeFromPublic = absolutePath
        .replace(path.join(process.cwd(), "public"), "")
        .replace(/\\/g, "/");
      const publicPath = relativeFromPublic.startsWith("/")
        ? relativeFromPublic
        : `/${relativeFromPublic}`;
      const stat = fs.statSync(absolutePath);
      const dimensions = getImageDimensions(absolutePath);

      return {
        path: publicPath,
        filename: path.basename(publicPath),
        size: stat.size,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        type: classifyMediaFile(publicPath),
        projectSlug: extractProjectSlug(publicPath),
        source: "local" as const,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function listMediaFiles(): Promise<MediaFile[]> {
  const localFiles = listLocalMediaFiles();

  if (isDevelopmentMediaUpload()) {
    return localFiles;
  }

  try {
    const blobAvailable = await isBlobStorageAvailable();
    if (!blobAvailable) {
      return localFiles;
    }

    const blobFiles = await listBlobMediaFiles();
    const merged = new Map<string, MediaFile>();
    for (const file of localFiles) merged.set(file.path, file);
    for (const file of blobFiles) merged.set(file.path, file);
    return [...merged.values()].sort((a, b) => a.path.localeCompare(b.path));
  } catch {
    return localFiles;
  }
}

export function publicPathExists(webPath: string): boolean {
  if (!webPath.trim()) return false;
  if (webPath.startsWith("https://") || webPath.startsWith("/media/")) return true;
  const normalized = webPath.startsWith("/") ? webPath : `/${webPath}`;
  const fullPath = path.join(process.cwd(), "public", normalized.replace(/^\//, ""));
  return fs.existsSync(fullPath);
}

export async function canUploadMedia(): Promise<boolean> {
  if (isDevelopmentMediaUpload()) return true;
  return isBlobStorageAvailable();
}

export async function saveUploadedFile(
  file: File,
  destination: UploadDestination,
  projectSlug?: string,
  overwrite = false,
): Promise<UploadResult> {
  const validationError = validateUploadFile(file, destination);
  if (validationError) throw new Error(validationError);

  const existingFiles = await listMediaFiles();
  const galleryNames = getExistingGalleryNames(destination, projectSlug, existingFiles);
  const target = resolveUploadTarget(destination, projectSlug, file.name, galleryNames);
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = resolveContentType(target.filename);

  if (isDevelopmentMediaUpload()) {
    if (!overwrite && uploadTargetExists(target, "local")) {
      throw new Error(`File already exists at ${target.localPublicPath}. Confirm overwrite to replace it.`);
    }

    if (!target.localDiskPath) {
      throw new Error("Local upload target is missing.");
    }

    fs.mkdirSync(path.dirname(target.localDiskPath), { recursive: true });
    fs.writeFileSync(target.localDiskPath, buffer);

    return {
      publicPath: target.localPublicPath,
      filename: target.filename,
      source: "local",
    };
  }

  const blobAvailable = await isBlobStorageAvailable(true);
  if (!blobAvailable) {
    throw new Error(
      "Media upload is not available. Connect a Vercel Blob store to this project.",
    );
  }

  const uploaded = await uploadBlobMedia(buffer, target, contentType, overwrite);

  return {
    publicPath: uploaded.publicPath,
    filename: target.filename,
    blobPathname: uploaded.blobPathname,
    source: "blob",
  };
}

export async function deleteMediaFile(publicPath: string): Promise<void> {
  if (publicPath.startsWith("/media/") || publicPath.startsWith("https://")) {
    await deleteBlobMedia(publicPath);
    return;
  }

  const normalized = publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
  const fullPath = path.join(process.cwd(), "public", normalized.replace(/^\//, ""));
  if (!fs.existsSync(fullPath)) {
    throw new Error("File not found.");
  }
  fs.unlinkSync(fullPath);
}

export async function listProjectSlugsFromMedia(): Promise<string[]> {
  const files = await listMediaFiles();
  const slugs = new Set<string>();

  for (const file of files) {
    if (file.projectSlug) slugs.add(file.projectSlug);
  }

  const projectsDir = path.join(PUBLIC_IMAGES, "projects");
  if (fs.existsSync(projectsDir)) {
    for (const entry of fs.readdirSync(projectsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) slugs.add(entry.name);
    }
  }

  return [...slugs].sort();
}

export type { MediaFile, UploadResult };
