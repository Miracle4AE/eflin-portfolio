import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canUploadMedia,
  type MediaFileType,
} from "@/lib/admin/media.constants";
import {
  listMediaFiles,
  listProjectSlugsFromMedia,
} from "@/lib/admin/media.server";
import {
  isAdminAuthenticated,
  isAdminDisabled,
} from "@/lib/admin/session";

export async function GET(request: NextRequest) {
  if (isAdminDisabled()) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") as MediaFileType | "all" | null;
  const projectSlug = request.nextUrl.searchParams.get("projectSlug");

  let files = listMediaFiles();

  if (type && type !== "all") {
    files = files.filter((file) => file.type === type);
  }

  if (projectSlug && projectSlug !== "all") {
    files = files.filter((file) => file.projectSlug === projectSlug);
  }

  return NextResponse.json({
    files,
    projectSlugs: listProjectSlugsFromMedia(),
    uploadEnabled: canUploadMedia(),
  });
}
