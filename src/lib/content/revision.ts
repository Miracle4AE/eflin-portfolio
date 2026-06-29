import { randomUUID } from "crypto";
import type { ContentMeta, SiteContent } from "@/lib/content/types";

export function stampContentRevision(
  content: SiteContent,
  updatedBy = "admin",
): SiteContent {
  const meta: ContentMeta = {
    revisionId: randomUUID(),
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  return {
    ...content,
    meta,
  };
}

export function verifyContentMatch(
  written: SiteContent,
  readBack: SiteContent,
): { verified: boolean; reason?: string } {
  const writtenMeta = written.meta;
  const readMeta = readBack.meta;

  if (!writtenMeta?.revisionId || !readMeta?.revisionId) {
    return { verified: false, reason: "Missing revision metadata after read-back" };
  }

  if (writtenMeta.revisionId !== readMeta.revisionId) {
    return {
      verified: false,
      reason: `Revision ID mismatch (expected ${writtenMeta.revisionId}, got ${readMeta.revisionId})`,
    };
  }

  if (writtenMeta.updatedAt !== readMeta.updatedAt) {
    return { verified: false, reason: "Updated timestamp mismatch after read-back" };
  }

  return { verified: true };
}
