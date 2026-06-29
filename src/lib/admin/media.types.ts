import type { MediaFileType } from "@/lib/admin/media.constants";

export type MediaFile = {
  path: string;
  filename: string;
  size: number;
  width: number | null;
  height: number | null;
  type: MediaFileType;
  projectSlug: string | null;
  source: "local" | "blob";
  blobPathname?: string;
};

export type UploadResult = {
  publicPath: string;
  filename: string;
  blobPathname?: string;
  source: "local" | "blob";
};
