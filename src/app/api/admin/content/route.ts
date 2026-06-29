import { NextResponse } from "next/server";
import {
  getContentStorageStatus,
  loadSiteContent,
  readSiteContentFresh,
  writeSiteContent,
} from "@/lib/content/loader";
import { revalidateSiteContent } from "@/lib/content/revalidate";
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

  const fresh = request.nextUrl.searchParams.get("fresh") === "1";
  const content = fresh ? await readSiteContentFresh() : await loadSiteContent();
  const warnings = collectContentWarnings(content);
  const storage = await getContentStorageStatus();

  return NextResponse.json({
    content,
    saveMode: storage.saveMode,
    canWrite: storage.canWrite,
    storageMessage: storage.message,
    warnings,
    revisionId: content.meta?.revisionId ?? null,
    updatedAt: content.meta?.updatedAt ?? null,
    readSource: storage.readSource,
    blobKey: storage.blobKey,
    fallbackActive: storage.fallbackActive ?? false,
    fresh,
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
    const result = await writeSiteContent(validation.data);
    await revalidateSiteContent(result.content);

    const message =
      result.saveMode === "local"
        ? "Content saved to content/site-content.json"
        : "Content saved to Vercel Blob";

    return NextResponse.json({
      ok: true,
      verified: result.verified,
      revisionId: result.revisionId,
      updatedAt: result.updatedAt,
      saveMode: result.saveMode,
      message,
      warnings: collectContentWarnings(result.content),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Save failed verification. The site was not updated.";
    return NextResponse.json({ error: message, verified: false }, { status: 500 });
  }
}
