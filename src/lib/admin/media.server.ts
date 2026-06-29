import fs from "fs";
import path from "path";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  ALLOWED_UPLOAD_MIME,
  type MediaFileType,
  type UploadDestination,
  UPLOAD_SIZE_LIMITS,
} from "@/lib/admin/media.constants";
import type { MediaFile } from "@/lib/admin/media.types";

export type { MediaFile };

const PUBLIC_IMAGES = path.join(process.cwd(), "public", "images");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { formatBytes };

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

export function classifyMediaFile(publicPath: string): MediaFileType {
  const filename = path.basename(publicPath).toLowerCase();
  if (filename === "portrait.jpg" || filename === "portrait.webp") return "portrait";
  if (filename === "cover.jpg" || filename === "cover.webp") return "cover";
  if (filename === "hero.jpg" || filename === "hero.webp") return "hero";
  if (/^gallery-\d{2}\.(jpg|jpeg|webp|png)$/i.test(filename)) return "gallery";
  return "other";
}

export function extractProjectSlug(publicPath: string): string | null {
  const match = publicPath.match(/^\/images\/projects\/([^/]+)\//);
  return match?.[1] ?? null;
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

export function listMediaFiles(): MediaFile[] {
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
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export function publicPathExists(webPath: string): boolean {
  if (!webPath.trim()) return false;
  const normalized = webPath.startsWith("/") ? webPath : `/${webPath}`;
  const fullPath = path.join(process.cwd(), "public", normalized.replace(/^\//, ""));
  return fs.existsSync(fullPath);
}

function normalizeUploadExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpeg") return ".jpg";
  if (ALLOWED_UPLOAD_EXTENSIONS.has(ext)) return ext === ".jpeg" ? ".jpg" : ext;
  return ".jpg";
}

function nextGalleryFilename(projectDir: string, ext: string): string {
  const files = fs.existsSync(projectDir) ? fs.readdirSync(projectDir) : [];
  let max = 0;
  for (const file of files) {
    const match = file.match(/^gallery-(\d{2})\./i);
    if (match) max = Math.max(max, Number.parseInt(match[1], 10));
  }
  return `gallery-${String(max + 1).padStart(2, "0")}${ext}`;
}

export function resolveUploadTarget(
  destination: UploadDestination,
  projectSlug: string | undefined,
  originalFilename: string,
): { diskPath: string; publicPath: string } {
  const ext = normalizeUploadExtension(originalFilename);

  if (destination === "portrait") {
    const filename = ext === ".webp" ? "portrait.webp" : "portrait.jpg";
    const diskPath = path.join(PUBLIC_IMAGES, filename);
    return { diskPath, publicPath: `/images/${filename}` };
  }

  if (!projectSlug?.trim()) {
    throw new Error("Project slug is required for project uploads");
  }

  const safeSlug = projectSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const projectDir = path.join(PUBLIC_IMAGES, "projects", safeSlug);
  fs.mkdirSync(projectDir, { recursive: true });

  if (destination === "cover") {
    const filename = ext === ".webp" ? "cover.webp" : "cover.jpg";
    const diskPath = path.join(projectDir, filename);
    return { diskPath, publicPath: `/images/projects/${safeSlug}/${filename}` };
  }

  if (destination === "hero") {
    const filename = ext === ".webp" ? "hero.webp" : "hero.jpg";
    const diskPath = path.join(projectDir, filename);
    return { diskPath, publicPath: `/images/projects/${safeSlug}/${filename}` };
  }

  if (destination === "gallery") {
    const filename = nextGalleryFilename(projectDir, ext);
    const diskPath = path.join(projectDir, filename);
    return { diskPath, publicPath: `/images/projects/${safeSlug}/${filename}` };
  }

  const generalDir = path.join(PUBLIC_IMAGES, "general");
  fs.mkdirSync(generalDir, { recursive: true });
  const safeName = originalFilename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
  const filename = safeName.endsWith(ext) ? safeName : `${safeName}${ext}`;
  const diskPath = path.join(generalDir, filename);
  return { diskPath, publicPath: `/images/general/${path.basename(filename)}` };
}

export function validateUploadFile(
  file: File,
  destination: UploadDestination,
): string | null {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext) && ext !== ".jpeg") {
    return "Unsupported file type. Use JPG, PNG, or WebP.";
  }
  if (file.type && !ALLOWED_UPLOAD_MIME.has(file.type)) {
    return "Unsupported MIME type. Use JPG, PNG, or WebP.";
  }
  const limit = UPLOAD_SIZE_LIMITS[destination];
  if (file.size > limit) {
    return `File is too large (${formatBytes(file.size)}). Max ${formatBytes(limit)} for ${destination}.`;
  }
  return null;
}

export async function saveUploadedFile(
  file: File,
  destination: UploadDestination,
  projectSlug?: string,
): Promise<{ publicPath: string; filename: string }> {
  const validationError = validateUploadFile(file, destination);
  if (validationError) throw new Error(validationError);

  const { diskPath, publicPath } = resolveUploadTarget(
    destination,
    projectSlug,
    file.name,
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.mkdirSync(path.dirname(diskPath), { recursive: true });
  fs.writeFileSync(diskPath, buffer);

  return {
    publicPath,
    filename: path.basename(diskPath),
  };
}

export function listProjectSlugsFromMedia(): string[] {
  const projectsDir = path.join(PUBLIC_IMAGES, "projects");
  if (!fs.existsSync(projectsDir)) return [];
  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}
