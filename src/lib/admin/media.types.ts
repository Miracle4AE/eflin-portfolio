import type { MediaFileType } from "@/lib/admin/media.constants";

export type MediaFile = {
  path: string;
  filename: string;
  size: number;
  width: number | null;
  height: number | null;
  type: MediaFileType;
  projectSlug: string | null;
};
