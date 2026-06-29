import { cache } from "react";
import {
  getStorageStatus,
  invalidateStorageCache,
  readContent,
  writeContent,
  type SaveMode,
  type StorageStatus,
} from "@/lib/content/storage";
import type { SiteContent } from "@/lib/content/types";

export { LOCAL_CONTENT_PATH as CONTENT_FILE_PATH } from "@/lib/content/storage";

export const loadSiteContent = cache(async (): Promise<SiteContent> => {
  return readContent();
});

export async function writeSiteContent(
  content: SiteContent,
): Promise<"local" | "blob"> {
  const saveMode = await writeContent(content);
  invalidateStorageCache();
  return saveMode;
}

export function getContentStorageStatus(): StorageStatus {
  return getStorageStatus();
}

export type { SaveMode, StorageStatus };

export function invalidateContentCache(): void {
  invalidateStorageCache();
}

/** @deprecated Use getContentStorageStatus().canWrite instead. */
export function canWriteContentFile(): boolean {
  return getStorageStatus().canWrite;
}
