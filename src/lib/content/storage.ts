import fs from "fs";
import path from "path";
import { get, list, put } from "@vercel/blob";
import { buildFallbackSiteContent } from "@/lib/content/fallback";
import type { SiteContent } from "@/lib/content/types";
import { validateSiteContent } from "@/lib/content/validate";

export const BLOB_PATHNAME = "site-content.json";
export const BLOB_ACCESS = "private" as const;

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

type BlobAccessProbe = {
  available: boolean;
  checkedAt: number;
  error?: string;
};

const BLOB_PROBE_TTL_MS = 60_000;
const STORAGE_UNAVAILABLE_MESSAGE =
  "Persistent storage is not available. Connect a Vercel Blob store to this project, or use Export JSON.";
export const BLOB_ACCESS_MISMATCH_MESSAGE =
  "Blob store access mode mismatch. Content storage expects private Blob access.";

let cachedContent: SiteContent | null = null;
let cacheKey = "";
let blobAccessProbe: BlobAccessProbe | null = null;

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

export function formatBlobStorageError(error: unknown): string {
  if (!(error instanceof Error)) {
    return STORAGE_UNAVAILABLE_MESSAGE;
  }

  const message = error.message.toLowerCase();
  if (
    message.includes("public access on a private store") ||
    message.includes("private access on a public store") ||
    message.includes("access mode")
  ) {
    return BLOB_ACCESS_MISMATCH_MESSAGE;
  }

  return error.message;
}

async function probeBlobAccess(force = false): Promise<BlobAccessProbe> {
  if (
    !force &&
    blobAccessProbe &&
    Date.now() - blobAccessProbe.checkedAt < BLOB_PROBE_TTL_MS
  ) {
    return blobAccessProbe;
  }

  try {
    await list({ prefix: BLOB_PATHNAME, limit: 1 });
    blobAccessProbe = { available: true, checkedAt: Date.now() };
    return blobAccessProbe;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vercel Blob access failed";
    if (process.env.VERCEL === "1") {
      console.warn("[Content] Blob access probe failed:", message);
    }
    blobAccessProbe = {
      available: false,
      checkedAt: Date.now(),
      error: message,
    };
    return blobAccessProbe;
  }
}

async function readBlobFile(): Promise<SiteContent | null> {
  try {
    const result = await get(BLOB_PATHNAME, { access: BLOB_ACCESS });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    const raw = await new Response(result.stream).text();
    return parseSiteContent(raw);
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
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function currentCacheKey(source: "blob" | "local" | "fallback"): string {
  return source;
}

export function invalidateStorageCache(): void {
  cachedContent = null;
  cacheKey = "";
  blobAccessProbe = null;
}

export async function getStorageStatus(): Promise<StorageStatus> {
  if (isDevelopment()) {
    return {
      configured: true,
      readSource: "local",
      canWrite: true,
      saveMode: "local",
    };
  }

  const probe = await probeBlobAccess();
  if (probe.available) {
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
    message: STORAGE_UNAVAILABLE_MESSAGE,
  };
}

export async function readContent(): Promise<SiteContent> {
  if (isDevelopment()) {
    const fromLocal = readLocalFile();
    if (fromLocal) {
      cachedContent = fromLocal;
      cacheKey = currentCacheKey("local");
      return fromLocal;
    }

    const fallback = buildFallbackSiteContent();
    cachedContent = fallback;
    cacheKey = currentCacheKey("fallback");
    return fallback;
  }

  const probe = await probeBlobAccess();
  if (probe.available) {
    if (cachedContent && cacheKey === "blob") {
      return cachedContent;
    }

    const fromBlob = await readBlobFile();
    if (fromBlob) {
      cachedContent = fromBlob;
      cacheKey = currentCacheKey("blob");
      return fromBlob;
    }
  }

  const fromLocal = readLocalFile();
  if (fromLocal) {
    cachedContent = fromLocal;
    cacheKey = currentCacheKey("local");
    return fromLocal;
  }

  const fallback = buildFallbackSiteContent();
  cachedContent = fallback;
  cacheKey = currentCacheKey("fallback");
  return fallback;
}

export async function writeContent(content: SiteContent): Promise<"local" | "blob"> {
  if (isDevelopment()) {
    writeLocalFile(content);
    cachedContent = content;
    cacheKey = currentCacheKey("local");
    return "local";
  }

  const probe = await probeBlobAccess(true);
  if (!probe.available) {
    throw new Error(STORAGE_UNAVAILABLE_MESSAGE);
  }

  try {
    await writeBlobFile(content);
    cachedContent = content;
    cacheKey = currentCacheKey("blob");
    blobAccessProbe = { available: true, checkedAt: Date.now() };
    return "blob";
  } catch (error) {
    blobAccessProbe = null;
    throw new Error(formatBlobStorageError(error));
  }
}
