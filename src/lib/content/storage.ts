import fs from "fs";
import path from "path";
import { get, list, put } from "@vercel/blob";
import { buildFallbackSiteContent } from "@/lib/content/fallback";
import { stampContentRevision, verifyContentMatch } from "@/lib/content/revision";
import type { SiteContent } from "@/lib/content/types";
import { validateSiteContent } from "@/lib/content/validate";

/** Single canonical Blob object key for site content JSON. */
export const CONTENT_BLOB_KEY = "site-content.json";

/** @deprecated Use CONTENT_BLOB_KEY */
export const BLOB_PATHNAME = CONTENT_BLOB_KEY;

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
  blobKey: string;
  message?: string;
  fallbackActive?: boolean;
};

export type WriteContentResult = {
  saveMode: "local" | "blob";
  revisionId: string;
  updatedAt: string;
  verified: boolean;
  content: SiteContent;
};

type BlobAccessProbe = {
  available: boolean;
  checkedAt: number;
  error?: string;
};

type ReadSourceResult = {
  content: SiteContent;
  source: StorageStatus["readSource"];
  fallbackActive: boolean;
};

const BLOB_PROBE_TTL_MS = 60_000;
const STORAGE_UNAVAILABLE_MESSAGE =
  "Persistent storage is not available. Connect a Vercel Blob store to this project, or use Export JSON.";
export const BLOB_ACCESS_MISMATCH_MESSAGE =
  "Blob store access mode mismatch. Content storage expects private Blob access.";

let cachedContent: SiteContent | null = null;
let cacheKey = "";
let blobAccessProbe: BlobAccessProbe | null = null;
let lastReadSource: StorageStatus["readSource"] = "fallback";

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
    await list({ prefix: CONTENT_BLOB_KEY, limit: 1 });
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
    const result = await get(CONTENT_BLOB_KEY, { access: BLOB_ACCESS });
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
  await put(CONTENT_BLOB_KEY, JSON.stringify(content, null, 2), {
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function currentCacheKey(source: StorageStatus["readSource"]): string {
  return source;
}

export function invalidateStorageCache(): void {
  cachedContent = null;
  cacheKey = "";
  blobAccessProbe = null;
}

export function getLastReadSource(): StorageStatus["readSource"] {
  return lastReadSource;
}

async function readContentFromSource(): Promise<ReadSourceResult> {
  if (isDevelopment()) {
    const fromLocal = readLocalFile();
    if (fromLocal) {
      lastReadSource = "local";
      return { content: fromLocal, source: "local", fallbackActive: false };
    }

    lastReadSource = "fallback";
    return {
      content: buildFallbackSiteContent(),
      source: "fallback",
      fallbackActive: true,
    };
  }

  const probe = await probeBlobAccess();
  if (probe.available) {
    const fromBlob = await readBlobFile();
    if (fromBlob) {
      lastReadSource = "blob";
      return { content: fromBlob, source: "blob", fallbackActive: false };
    }

    console.error(
      `[Content] Blob store is configured but "${CONTENT_BLOB_KEY}" could not be read.`,
    );
  } else {
    console.warn("[Content] Blob store unavailable in production; using fallback chain.");
  }

  const fromLocal = readLocalFile();
  if (fromLocal) {
    lastReadSource = "local";
    console.warn(
      "[Content] WARNING: Public content is using local JSON fallback instead of Blob.",
    );
    return { content: fromLocal, source: "local", fallbackActive: true };
  }

  lastReadSource = "fallback";
  console.warn("[Content] WARNING: Public content is using static build fallback.");
  return {
    content: buildFallbackSiteContent(),
    source: "fallback",
    fallbackActive: true,
  };
}

export async function getStorageStatus(): Promise<StorageStatus> {
  if (isDevelopment()) {
    return {
      configured: true,
      readSource: "local",
      canWrite: true,
      saveMode: "local",
      blobKey: CONTENT_BLOB_KEY,
      fallbackActive: false,
    };
  }

  const probe = await probeBlobAccess();
  if (probe.available) {
    return {
      configured: true,
      readSource: "blob",
      canWrite: true,
      saveMode: "blob",
      blobKey: CONTENT_BLOB_KEY,
      fallbackActive: false,
    };
  }

  const localExists = Boolean(readLocalFile());
  return {
    configured: false,
    readSource: localExists ? "local" : "fallback",
    canWrite: false,
    saveMode: "unconfigured",
    blobKey: CONTENT_BLOB_KEY,
    fallbackActive: !localExists,
    message: STORAGE_UNAVAILABLE_MESSAGE,
  };
}

export async function readContent(options?: { fresh?: boolean }): Promise<SiteContent> {
  const useModuleCache = isDevelopment() && !options?.fresh;

  if (useModuleCache && cachedContent && cacheKey) {
    return cachedContent;
  }

  const { content, source } = await readContentFromSource();

  if (useModuleCache) {
    cachedContent = content;
    cacheKey = currentCacheKey(source);
  }

  return content;
}

export async function isBlobStorageAvailable(force = false): Promise<boolean> {
  const probe = await probeBlobAccess(force);
  return probe.available;
}

async function persistContent(content: SiteContent): Promise<"local" | "blob"> {
  if (isDevelopment()) {
    writeLocalFile(content);
    return "local";
  }

  const probe = await probeBlobAccess(true);
  if (!probe.available) {
    throw new Error(STORAGE_UNAVAILABLE_MESSAGE);
  }

  try {
    await writeBlobFile(content);
    blobAccessProbe = { available: true, checkedAt: Date.now() };
    return "blob";
  } catch (error) {
    blobAccessProbe = null;
    throw new Error(formatBlobStorageError(error));
  }
}

export async function writeContent(content: SiteContent): Promise<"local" | "blob"> {
  const saveMode = await persistContent(content);
  if (isDevelopment()) {
    cachedContent = content;
    cacheKey = currentCacheKey("local");
  } else {
    invalidateStorageCache();
  }
  return saveMode;
}

export async function writeAndVerifyContent(
  content: SiteContent,
): Promise<WriteContentResult> {
  const stamped = stampContentRevision(content);
  const saveMode = await persistContent(stamped);
  invalidateStorageCache();

  const { content: readBack } = await readContentFromSource();
  const verification = verifyContentMatch(stamped, readBack);

  if (!verification.verified) {
    throw new Error(
      verification.reason ?? "Save failed verification. The site was not updated.",
    );
  }

  if (isDevelopment()) {
    cachedContent = readBack;
    cacheKey = currentCacheKey("local");
  }

  return {
    saveMode,
    revisionId: stamped.meta!.revisionId,
    updatedAt: stamped.meta!.updatedAt,
    verified: true,
    content: readBack,
  };
}

export async function getContentDebugSnapshot(): Promise<{
  storageMode: SaveMode;
  blobConfigured: boolean;
  blobAccessible: boolean;
  blobKey: string;
  readSource: StorageStatus["readSource"];
  fallbackActive: boolean;
  revisionId: string | null;
  updatedAt: string | null;
  projectCount: number;
  designerName: string;
  heroTitleTr: string;
  heroTitleEn: string;
  warning?: string;
}> {
  invalidateStorageCache();
  const storage = await getStorageStatus();
  const probe = await probeBlobAccess(true);
  const { content, source, fallbackActive } = await readContentFromSource();

  let warning: string | undefined;
  if (storage.saveMode === "blob" && source !== "blob") {
    warning = "Blob is configured for writes but public reads are not using Blob content.";
  } else if (fallbackActive) {
    warning = "Fallback content is active instead of persisted storage.";
  }

  return {
    storageMode: storage.saveMode,
    blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    blobAccessible: probe.available,
    blobKey: CONTENT_BLOB_KEY,
    readSource: source,
    fallbackActive,
    revisionId: content.meta?.revisionId ?? null,
    updatedAt: content.meta?.updatedAt ?? null,
    projectCount: content.projects.length,
    designerName: content.homepage.designerName,
    heroTitleTr: content.homepage.hero.headline.tr,
    heroTitleEn: content.homepage.hero.headline.en,
    warning,
  };
}
