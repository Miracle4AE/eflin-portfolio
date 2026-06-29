import type { Locale } from "@/i18n/config";
import type { LocaleField, LocaleTags } from "@/lib/content/types";

export function pickLocale(field: LocaleField | undefined, locale: Locale): string {
  if (!field) return "";
  const value = field[locale]?.trim();
  if (value) return value;
  return field.en?.trim() ?? "";
}

export function pickLocaleTags(field: LocaleTags | undefined, locale: Locale): string[] {
  if (!field) return [];
  const tags = field[locale];
  if (tags && tags.length > 0) return tags;
  return field.en ?? [];
}

export function ls(en: string, tr: string): LocaleField {
  return { en, tr };
}
