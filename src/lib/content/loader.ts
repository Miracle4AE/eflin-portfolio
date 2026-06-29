import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  getStorageStatus,
  invalidateStorageCache,
  readContent,
  writeAndVerifyContent,
  type SaveMode,
  type StorageStatus,
  type WriteContentResult,
} from "@/lib/content/storage";
import { SITE_CONTENT_TAG } from "@/lib/content/revalidate";
import type { SiteContent } from "@/lib/content/types";

export { LOCAL_CONTENT_PATH as CONTENT_FILE_PATH } from "@/lib/content/storage";
export { CONTENT_BLOB_KEY } from "@/lib/content/storage";

const getProductionSiteContent = unstable_cache(
  async () => readContent({ fresh: true }),
  ["site-content-v1"],
  { tags: [SITE_CONTENT_TAG] },
);

export const loadSiteContent = cache(async (): Promise<SiteContent> => {
  if (process.env.NODE_ENV === "production") {
    return getProductionSiteContent();
  }
  return readContent();
});

export async function readSiteContentFresh(): Promise<SiteContent> {
  invalidateStorageCache();
  return readContent({ fresh: true });
}

export async function writeSiteContent(content: SiteContent): Promise<WriteContentResult> {
  const result = await writeAndVerifyContent(content);
  invalidateStorageCache();
  return result;
}

export async function getContentStorageStatus(): Promise<StorageStatus> {
  return getStorageStatus();
}

export type { SaveMode, StorageStatus, WriteContentResult };

export function invalidateContentCache(): void {
  invalidateStorageCache();
}
