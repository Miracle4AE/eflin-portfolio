import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminDisabled,
  verifyAdminSessionToken,
} from "@/lib/admin/auth";

export { isAdminDisabled, isAdminBlockedInProduction } from "@/lib/admin/auth";

export function isAdminApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/admin");
}

export function isAdminLoginRoute(pathname: string): boolean {
  return pathname === "/admin/login";
}

export function getAdminSessionFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value;
}

export async function isAdminAuthenticated(
  request: NextRequest,
): Promise<boolean> {
  if (isAdminDisabled()) return false;
  return verifyAdminSessionToken(getAdminSessionFromRequest(request));
}

export async function setAdminSessionCookie(
  response: NextResponse,
): Promise<NextResponse> {
  const token = await createAdminSessionToken();
  if (!token) return response;
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}

export function clearAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
