import fs from "fs";
import path from "path";
import { del as deleteBlob, get, list, put } from "@vercel/blob";
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

type BlobWriteInfo = {
  pathname?: string;
  url?: string;
  downloadUrl?: string;
};

type ContentBlobCandidate = {
  pathname: string;
  url?: string;
  downloadUrl?: string;
  size?: number;
  uploadedAt?: string;
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function isContentBlobPathname(pathname: string | undefined): pathname is string {
  if (!pathname) return false;
  const normalized = pathname.replace(/^\/+/, "");
  return (
    normalized === CONTENT_BLOB_KEY ||
    normalized === `content/${CONTENT_BLOB_KEY}` ||
    /^site-content(?:-[a-zA-Z0-9]+)?\.json$/.test(normalized)
  );
}

function candidateUploadedTime(candidate: ContentBlobCandidate): number {
  if (!candidate.uploadedAt) return 0;
  const time = new Date(candidate.uploadedAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function sortContentBlobCandidates(
  candidates: ContentBlobCandidate[],
): ContentBlobCandidate[] {
  return [...candidates].sort((a, b) => {
    const byTime = candidateUploadedTime(b) - candidateUploadedTime(a);
    if (byTime !== 0) return byTime;
    return (b.size ?? 0) - (a.size ?? 0);
  });
}

async function listContentBlobCandidates(): Promise<ContentBlobCandidate[]> {
  const prefixes = [CONTENT_BLOB_KEY, "site-content", `content/${CONTENT_BLOB_KEY}`];
  const candidates = new Map<string, ContentBlobCandidate>();

  for (const prefix of prefixes) {
    try {
      const result = await list({ prefix, limit: 100 });
      for (const blob of result.blobs ?? []) {
        const candidate = blob as {
          pathname?: string;
          url?: string;
          downloadUrl?: string;
          size?: number;
          uploadedAt?: Date | string;
        };
        if (!isContentBlobPathname(candidate.pathname)) continue;

        const key = candidate.url ?? candidate.pathname;
        if (!key) continue;
        candidates.set(key, {
          pathname: candidate.pathname,
          url: candidate.url,
          downloadUrl: candidate.downloadUrl,
          size: candidate.size,
          uploadedAt: candidate.uploadedAt
            ? new Date(candidate.uploadedAt).toISOString()
            : undefined,
        });
      }
    } catch (error) {
      console.warn("[Content] Failed to list content Blob candidates:", error);
    }
  }

  return sortContentBlobCandidates([...candidates.values()]);
}

async function readBlobText(identifier: string): Promise<string | null> {
  try {
    const result = await get(identifier, { access: BLOB_ACCESS });
    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new Error(`Blob get failed with status ${result?.statusCode ?? "unknown"}`);
    }

    return await new Response(result.stream).text();
  } catch (error) {
    if (!identifier.startsWith("http")) {
      console.warn("[Content] Failed to read site content from Vercel Blob:", error);
      return null;
    }
  }

  try {
    const response = await fetch(identifier, { cache: "no-store" });
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    console.warn("[Content] Failed to fetch exact content Blob URL:", error);
    return null;
  }
}

async function readBlobCandidate(
  candidate: ContentBlobCandidate,
): Promise<SiteContent | null> {
  const identifiers = [
    candidate.downloadUrl,
    candidate.url,
    candidate.pathname,
    CONTENT_BLOB_KEY,
  ].filter((value): value is string => Boolean(value));

  for (const identifier of identifiers) {
    const raw = await readBlobText(identifier);
    if (!raw) continue;
    const content = parseSiteContent(raw);
    if (content) return content;
  }

  return null;
}

async function readBlobFile(): Promise<SiteContent | null> {
  const candidates = await listContentBlobCandidates();
  for (const candidate of candidates) {
    const content = await readBlobCandidate(candidate);
    if (content) return content;
  }

  const raw = await readBlobText(CONTENT_BLOB_KEY);
  return raw ? parseSiteContent(raw) : null;
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

async function writeBlobFile(content: SiteContent): Promise<BlobWriteInfo> {
  const result = await put(CONTENT_BLOB_KEY, JSON.stringify(content, null, 2), {
    access: BLOB_ACCESS,
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  }) as BlobWriteInfo;

  return result;
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

async function readPutResultContent(
  writeInfo: BlobWriteInfo | undefined,
): Promise<SiteContent | null> {
  const identifiers = [
    writeInfo?.downloadUrl,
    writeInfo?.url,
    writeInfo?.pathname,
  ].filter((value): value is string => Boolean(value));

  for (const identifier of identifiers) {
    const raw = await readBlobText(identifier);
    if (!raw) continue;
    const content = parseSiteContent(raw);
    if (content) return content;
  }

  return null;
}

async function cleanupDuplicateContentBlobs(
  protectedWriteInfo: BlobWriteInfo | undefined,
): Promise<number> {
  if (isDevelopment()) return 0;

  const candidates = await listContentBlobCandidates();
  if (candidates.length <= 1) return 0;

  const protectedKeys = new Set(
    [
      protectedWriteInfo?.url,
      protectedWriteInfo?.downloadUrl,
      protectedWriteInfo?.pathname,
    ].filter((value): value is string => Boolean(value)),
  );
  const [newest, ...duplicates] = candidates;
  let deleted = 0;

  for (const duplicate of duplicates) {
    const identifier = duplicate.url ?? duplicate.pathname;
    if (!identifier || protectedKeys.has(identifier)) continue;
    if (newest.url && identifier === newest.url) continue;
    if (newest.pathname && identifier === newest.pathname) continue;

    try {
      await deleteBlob(identifier);
      deleted += 1;
    } catch (error) {
      console.warn("[Content] Failed to delete duplicate content Blob:", error);
    }
  }

  return deleted;
}

async function verifyReadAfterWrite(
  expected: SiteContent,
  writeInfo: BlobWriteInfo | undefined,
): Promise<SiteContent> {
  const retryDelays = [0, 300, 600, 1000, 1500];
  let lastRead: SiteContent | null = null;
  let exactPutRead: SiteContent | null = null;
  let lastReason = "Blob returned an older revision";

  for (const delay of retryDelays) {
    if (delay > 0) await sleep(delay);

    if (!exactPutRead) {
      exactPutRead = await readPutResultContent(writeInfo);
    }

    const { content } = await readContentFromSource();
    lastRead = content;
    const verification = verifyContentMatch(expected, content);
    if (verification.verified) {
      await cleanupDuplicateContentBlobs(writeInfo);
      return content;
    }

    lastReason = verification.reason ?? lastReason;
  }

  const exactVerification = exactPutRead
    ? verifyContentMatch(expected, exactPutRead)
    : { verified: false, reason: "The newly written Blob could not be read by URL" };
  const readRevision = lastRead?.meta?.revisionId ?? "unknown";
  const exactRevision = exactPutRead?.meta?.revisionId ?? "unreadable";

  throw new Error(
    [
      "Save verification failed because Blob returned an older revision. Please retry once. If it continues, run debug.",
      `Expected ${expected.meta?.revisionId ?? "unknown"}, got ${readRevision}.`,
      `Exact write read revision: ${exactRevision}.`,
      exactVerification.reason,
      lastReason,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

async function persistContent(
  content: SiteContent,
): Promise<{ saveMode: "local" | "blob"; writeInfo?: BlobWriteInfo }> {
  if (isDevelopment()) {
    writeLocalFile(content);
    return { saveMode: "local" };
  }

  const probe = await probeBlobAccess(true);
  if (!probe.available) {
    throw new Error(STORAGE_UNAVAILABLE_MESSAGE);
  }

  try {
    const writeInfo = await writeBlobFile(content);
    blobAccessProbe = { available: true, checkedAt: Date.now() };
    return { saveMode: "blob", writeInfo };
  } catch (error) {
    blobAccessProbe = null;
    throw new Error(formatBlobStorageError(error));
  }
}

export async function writeContent(content: SiteContent): Promise<"local" | "blob"> {
  const { saveMode } = await persistContent(content);
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
  const { saveMode, writeInfo } = await persistContent(stamped);
  invalidateStorageCache();

  const readBack = await verifyReadAfterWrite(stamped, writeInfo);
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
  selectedBlobPathname: string | null;
  duplicateContentBlobCount: number;
  contentBlobCandidates: Array<{
    pathname: string;
    size?: number;
    uploadedAt?: string;
    url?: string;
    hasDownloadUrl: boolean;
    revisionId: string | null;
    updatedAt: string | null;
    readOk: boolean;
  }>;
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
  const candidates = await listContentBlobCandidates();
  const contentBlobCandidates = await Promise.all(
    candidates.map(async (candidate) => {
      const content = await readBlobCandidate(candidate);
      return {
        pathname: candidate.pathname,
        size: candidate.size,
        uploadedAt: candidate.uploadedAt,
        url: candidate.url,
        hasDownloadUrl: Boolean(candidate.downloadUrl),
        revisionId: content?.meta?.revisionId ?? null,
        updatedAt: content?.meta?.updatedAt ?? null,
        readOk: Boolean(content),
      };
    }),
  );
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
    selectedBlobPathname: candidates[0]?.pathname ?? null,
    duplicateContentBlobCount: Math.max(candidates.length - 1, 0),
    contentBlobCandidates,
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
