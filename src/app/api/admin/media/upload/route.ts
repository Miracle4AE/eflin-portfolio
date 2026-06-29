import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canUploadMedia,
  type UploadDestination,
} from "@/lib/admin/media.constants";
import { saveUploadedFile } from "@/lib/admin/media.server";
import {
  isAdminAuthenticated,
  isAdminDisabled,
} from "@/lib/admin/session";

const VALID_DESTINATIONS = new Set<UploadDestination>([
  "portrait",
  "cover",
  "hero",
  "gallery",
  "general",
]);

export async function POST(request: NextRequest) {
  if (isAdminDisabled()) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
  }
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canUploadMedia()) {
    return NextResponse.json(
      {
        error:
          "Production uploads require external storage. Use Export JSON workflow or configure storage later.",
        uploadEnabled: false,
      },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const destination = formData.get("destination");
  const projectSlug = formData.get("projectSlug");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (typeof destination !== "string" || !VALID_DESTINATIONS.has(destination as UploadDestination)) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  try {
    const result = await saveUploadedFile(
      file,
      destination as UploadDestination,
      typeof projectSlug === "string" ? projectSlug : undefined,
    );

    return NextResponse.json({
      ok: true,
      publicPath: result.publicPath,
      filename: result.filename,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
