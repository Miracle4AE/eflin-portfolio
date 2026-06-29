import type { AdminLocale } from "./types";

export const ADMIN_LOCALE_STORAGE_KEY = "admin_locale";

export type { AdminLocale };

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? `{${key}}`),
  );
}

export function isAdminLocale(value: string): value is AdminLocale {
  return value === "tr" || value === "en";
}

export function readPublicLocaleCookie(): AdminLocale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)eflin_locale=([^;]+)/);
  const value = match?.[1];
  return value && isAdminLocale(value) ? value : null;
}

export function getInitialAdminLocale(): AdminLocale {
  if (typeof window === "undefined") return "tr";

  const stored = localStorage.getItem(ADMIN_LOCALE_STORAGE_KEY);
  if (stored && isAdminLocale(stored)) return stored;

  const fromCookie = readPublicLocaleCookie();
  if (fromCookie) return fromCookie;

  return "tr";
}

export function persistAdminLocale(locale: AdminLocale): void {
  localStorage.setItem(ADMIN_LOCALE_STORAGE_KEY, locale);
}
