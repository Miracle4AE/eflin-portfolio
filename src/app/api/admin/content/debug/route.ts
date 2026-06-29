import { NextResponse } from "next/server";
import { getContentDebugSnapshot } from "@/lib/content/storage";
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

  const snapshot = await getContentDebugSnapshot();

  return NextResponse.json({
    ok: true,
    ...snapshot,
  });
}
