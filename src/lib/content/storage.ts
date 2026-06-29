import fs from "fs";
import path from "path";
import { list, put } from "@vercel/blob";
import { buildFallbackSiteContent } from "@/lib/content/fallback";
import type { SiteContent } from "@/lib/content/types";
import { validateSiteContent } from "@/lib/content/validate";

export const BLOB_PATHNAME = "site-content.json";

export const LOCAL_CONTENT_PATH = path.join(
  process.cwd(),
  "content",
  "site-content.json",
);

export type SaveMode = "local" | "blob" | "unconfigured";

export type StorageStatus = {
  configured: boolean;
  readSource: "blob" | "local" | "fallback";
  canWrite: boolean;
  saveMode: SaveMode;
  message?: string;
};

let cachedContent: SiteContent | null = null;
let cacheKey = "";

function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

function parseSiteContent(raw: string): SiteContent | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const validation = validateSiteContent(parsed);
    if (!validation.ok) {
      console.warn("[Content] Invalid site content JSON:", validation.errors);
      return null;
    }
    return validation.data;
  } catch (error) {
    console.warn("[Content] Failed to parse site content JSON:", error);
    return null;
  }
}

function readLocalFile(): SiteContent | null {
  try {
    if (!fs.existsSync(LOCAL_CONTENT_PATH)) return null;
    const raw = fs.readFileSync(LOCAL_CONTENT_PATH, "utf8");
    return parseSiteContent(raw);
  } catch (error) {
    console.warn("[Content] Failed to read local site-content.json:", error);
    return null;
  }
}

async function readBlobFile(): Promise<SiteContent | null> {
  if (!isBlobConfigured()) return null;

  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    const blob = blobs.find((item) => item.pathname === BLOB_PATHNAME);
    if (!blob) return null;

    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) {
      console.warn("[Content] Failed to fetch blob content:", response.status);
      return null;
    }

    return parseSiteContent(await response.text());
  } catch (error) {
    console.warn("[Content] Failed to read site content from Vercel Blob:", error);
    return null;
  }
}

function writeLocalFile(content: SiteContent): void {
  const dir = path.dirname(LOCAL_CONTENT_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    LOCAL_CONTENT_PATH,
    `${JSON.stringify(content, null, 2)}\n`,
    "utf8",
  );
}

async function writeBlobFile(content: SiteContent): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(content, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function currentCacheKey(): string {
  if (isBlobConfigured()) return "blob";
  if (readLocalFile()) return "local";
  return "fallback";
}

export function invalidateStorageCache(): void {
  cachedContent = null;
  cacheKey = "";
}

export function getStorageStatus(): StorageStatus {
  if (isDevelopment()) {
    return {
      configured: true,
      readSource: "local",
      canWrite: true,
      saveMode: "local",
    };
  }

  if (isBlobConfigured()) {
    return {
      configured: true,
      readSource: "blob",
      canWrite: true,
      saveMode: "blob",
    };
  }

  return {
    configured: false,
    readSource: readLocalFile() ? "local" : "fallback",
    canWrite: false,
    saveMode: "unconfigured",
    message:
      "Persistent storage is not configured. Add BLOB_READ_WRITE_TOKEN or use Export JSON.",
  };
}

export async function readContent(): Promise<SiteContent> {
  const nextCacheKey = currentCacheKey();
  if (cachedContent && cacheKey === nextCacheKey) {
    return cachedContent;
  }

  if (isBlobConfigured()) {
    const fromBlob = await readBlobFile();
    if (fromBlob) {
      cachedContent = fromBlob;
      cacheKey = "blob";
      return fromBlob;
    }
  }

  const fromLocal = readLocalFile();
  if (fromLocal) {
    cachedContent = fromLocal;
    cacheKey = "local";
    return fromLocal;
  }

  const fallback = buildFallbackSiteContent();
  cachedContent = fallback;
  cacheKey = "fallback";
  return fallback;
}

export async function writeContent(content: SiteContent): Promise<"local" | "blob"> {
  if (isDevelopment()) {
    writeLocalFile(content);
    cachedContent = content;
    cacheKey = "local";
    return "local";
  }

  if (isBlobConfigured()) {
    await writeBlobFile(content);
    cachedContent = content;
    cacheKey = "blob";
    return "blob";
  }

  throw new Error(
    "Persistent storage is not configured. Add BLOB_READ_WRITE_TOKEN or use Export JSON.",
  );
}
