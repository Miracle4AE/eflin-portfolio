import { del, list, put } from "@vercel/blob";
import {
  MEDIA_BLOB_PREFIX,
  PRIVATE_BLOB_MEDIA_ERROR,
  type UploadDestination,
} from "@/lib/admin/media.constants";
import {
  blobPathnameFromPublicPath,
  type UploadTarget,
} from "@/lib/admin/media-paths";
import type { MediaFile } from "@/lib/admin/media.types";
import {
  classifyMediaFile,
  extractProjectSlug,
} from "@/lib/admin/media.utils";

function isPublicOnPrivateStoreError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("public access on a private store") ||
    message.includes("private access on a public store")
  );
}

function blobPathnameToPublicPath(pathname: string, url: string): string {
  if (url.includes(".public.blob.vercel-storage.com")) {
    return url;
  }
  if (pathname.startsWith(`${MEDIA_BLOB_PREFIX}/`)) {
    return `/${pathname}`;
  }
  return url;
}

export async function listBlobMediaFiles(): Promise<MediaFile[]> {
  const { blobs } = await list({ prefix: `${MEDIA_BLOB_PREFIX}/`, limit: 1000 });

  return blobs
    .map((blob) => {
      const publicPath = blobPathnameToPublicPath(blob.pathname, blob.url);
      return {
        path: publicPath,
        filename: blob.pathname.split("/").pop() ?? blob.pathname,
        size: blob.size,
        width: null,
        height: null,
        type: classifyMediaFile(publicPath),
        projectSlug: extractProjectSlug(publicPath),
        source: "blob" as const,
        blobPathname: blob.pathname,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

export async function blobMediaExists(blobPathname: string): Promise<boolean> {
  const { blobs } = await list({ prefix: blobPathname, limit: 1 });
  return blobs.some((blob) => blob.pathname === blobPathname);
}

export async function uploadBlobMedia(
  buffer: Buffer,
  target: UploadTarget,
  contentType: string,
  overwrite: boolean,
): Promise<{ publicPath: string; blobPathname: string }> {
  if (!overwrite && (await blobMediaExists(target.blobPathname))) {
    throw new Error(`File already exists at ${target.blobPublicPath}. Confirm overwrite to replace it.`);
  }

  try {
    const blob = await put(target.blobPathname, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: overwrite,
      contentType,
    });
    return {
      publicPath: blob.url,
      blobPathname: target.blobPathname,
    };
  } catch (error) {
    if (!isPublicOnPrivateStoreError(error)) {
      throw error;
    }

    await put(target.blobPathname, buffer, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: overwrite,
      contentType,
    });

    return {
      publicPath: target.blobPublicPath,
      blobPathname: target.blobPathname,
    };
  }
}

export async function deleteBlobMedia(publicPath: string): Promise<void> {
  const blobPathname = blobPathnameFromPublicPath(publicPath);
  if (!blobPathname) {
    if (publicPath.startsWith("https://")) {
      await del(publicPath);
      return;
    }
    throw new Error("Cannot delete this media path.");
  }

  await del(blobPathname);
}

export function getExistingGalleryNames(
  destination: UploadDestination,
  projectSlug: string | undefined,
  files: MediaFile[],
): string[] {
  if (destination !== "gallery" || !projectSlug) return [];
  return files
    .filter((file) => file.projectSlug === projectSlug && file.type === "gallery")
    .map((file) => file.filename);
}

export { PRIVATE_BLOB_MEDIA_ERROR };
