import { NextResponse } from "next/server";
import {
  canWriteContentFile,
  loadSiteContent,
  writeSiteContent,
} from "@/lib/content/loader";
import { validateSiteContent } from "@/lib/content/validate";
import { collectContentWarnings } from "@/lib/content/warnings";
import {
  isAdminAuthenticated,
  isAdminDisabled,
} from "@/lib/admin/session";
import type { NextRequest } from "next/server";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function blocked() {
  return NextResponse.json(
    { error: "Admin is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD." },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  if (isAdminDisabled()) return blocked();
  if (!(await isAdminAuthenticated(request))) return unauthorized();

  const content = loadSiteContent();
  const warnings = collectContentWarnings(content);
  return NextResponse.json({
    content,
    saveMode: canWriteContentFile() ? "file-write" : "export-only",
    canWrite: canWriteContentFile(),
    warnings,
  });
}

export async function POST(request: NextRequest) {
  if (isAdminDisabled()) return blocked();
  if (!(await isAdminAuthenticated(request))) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = (body as { content?: unknown }).content ?? body;
  const validation = validateSiteContent(payload);

  if (!validation.ok) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.errors },
      { status: 400 },
    );
  }

  if (!canWriteContentFile()) {
    return NextResponse.json({
      ok: true,
      saveMode: "export-only",
      message:
        "Production save requires a storage provider. Export JSON is always available.",
      content: validation.data,
      warnings: collectContentWarnings(validation.data),
    });
  }

  writeSiteContent(validation.data);
  return NextResponse.json({
    ok: true,
    saveMode: "file-write",
    message: "Content saved to content/site-content.json",
    warnings: collectContentWarnings(validation.data),
  });
}
