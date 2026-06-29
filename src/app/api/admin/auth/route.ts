import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminDisabled, verifyAdminCredentials } from "@/lib/admin/auth";
import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
  setAdminSessionCookie,
} from "@/lib/admin/session";

export async function GET(request: NextRequest) {
  if (isAdminDisabled()) {
    return NextResponse.json({ authenticated: false, configured: false });
  }

  return NextResponse.json({
    authenticated: await isAdminAuthenticated(request),
    configured: true,
  });
}

export async function POST(request: NextRequest) {
  if (isAdminDisabled()) {
    return NextResponse.json(
      { error: "Admin is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD." },
      { status: 503 },
    );
  }

  let body: { username?: string; password?: string; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.action === "logout") {
    const response = NextResponse.json({ ok: true });
    return clearAdminSessionCookie(response);
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  if (!(await verifyAdminCredentials(username, password))) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  return setAdminSessionCookie(response);
}
