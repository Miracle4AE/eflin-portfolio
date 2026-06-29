import type { Locale } from "@/i18n/config";
import { defaultLocale, locales } from "@/i18n/config";

export function localizedPath(locale: Locale, path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `/${locale}${normalized}`;
}

export function stripLocaleFromPathname(pathname: string): {
  locale: Locale | null;
  pathnameWithoutLocale: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && locales.includes(first as Locale)) {
    const locale = first as Locale;
    const rest = segments.slice(1).join("/");
    return {
      locale,
      pathnameWithoutLocale: rest ? `/${rest}` : "",
    };
  }

  return { locale: null, pathnameWithoutLocale: pathname };
}

export function switchLocalePath(pathname: string, newLocale: Locale): string {
  const { pathnameWithoutLocale } = stripLocaleFromPathname(pathname);
  return localizedPath(newLocale, pathnameWithoutLocale);
}

export function isHomePath(pathname: string): boolean {
  const { pathnameWithoutLocale } = stripLocaleFromPathname(pathname);
  return pathnameWithoutLocale === "" || pathnameWithoutLocale === "/";
}

/** Legacy paths without locale prefix */
export function legacyRedirectPath(pathname: string): string | null {
  if (pathname === "/work") return localizedPath(defaultLocale, "/work");
  if (pathname === "/contact") return localizedPath(defaultLocale, "/contact");
  const workMatch = pathname.match(/^\/work\/([^/]+)$/);
  if (workMatch) {
    return localizedPath(defaultLocale, `/work/${workMatch[1]}`);
  }
  return null;
}
