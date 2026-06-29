import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isAdminAuthenticated,
  isAdminDisabled,
  isAdminLoginRoute,
} from "@/lib/admin/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (isAdminDisabled()) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Admin is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD." },
        { status: 503 },
      );
    }
    return new NextResponse(
      "Admin is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in your environment.",
      { status: 503 },
    );
  }

  if (pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  if (isAdminLoginRoute(pathname)) {
    if (await isAdminAuthenticated(request)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (await isAdminAuthenticated(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
