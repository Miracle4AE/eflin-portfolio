import { NextResponse } from "next/server";
import {
  getContentStorageStatus,
  loadSiteContent,
  writeSiteContent,
} from "@/lib/content/loader";
import { revalidateSiteContent } from "@/lib/content/revalidate";
import { formatBlobStorageError } from "@/lib/content/storage";
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

  const content = await loadSiteContent();
  const warnings = collectContentWarnings(content);
  const storage = await getContentStorageStatus();

  return NextResponse.json({
    content,
    saveMode: storage.saveMode,
    canWrite: storage.canWrite,
    storageMessage: storage.message,
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

  const storage = await getContentStorageStatus();
  if (!storage.canWrite) {
    return NextResponse.json(
      {
        error: storage.message ?? "Persistent storage is not available. Use Export JSON.",
      },
      { status: 503 },
    );
  }

  try {
    const saveMode = await writeSiteContent(validation.data);
    await revalidateSiteContent(validation.data);

    const message =
      saveMode === "local"
        ? "Content saved to content/site-content.json"
        : "Content saved to Vercel Blob";

    return NextResponse.json({
      ok: true,
      saveMode,
      message,
      warnings: collectContentWarnings(validation.data),
    });
  } catch (error) {
    return NextResponse.json(
      { error: formatBlobStorageError(error) },
      { status: 503 },
    );
  }
}
