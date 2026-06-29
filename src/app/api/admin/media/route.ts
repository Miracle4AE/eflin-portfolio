import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canUploadMedia,
  deleteMediaFile,
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

  const type = request.nextUrl.searchParams.get("type");
  const projectSlug = request.nextUrl.searchParams.get("projectSlug");

  let files = await listMediaFiles();

  if (type && type !== "all") {
    files = files.filter((file) => file.type === type);
  }

  if (projectSlug && projectSlug !== "all") {
    files = files.filter((file) => file.projectSlug === projectSlug);
  }

  return NextResponse.json({
    files,
    projectSlugs: await listProjectSlugsFromMedia(),
    uploadEnabled: await canUploadMedia(),
  });
}

export async function DELETE(request: NextRequest) {
  if (isAdminDisabled()) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const publicPath = (body as { path?: string }).path;
  if (!publicPath?.trim()) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  try {
    await deleteMediaFile(publicPath);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 400 },
    );
  }
}
