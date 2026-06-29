import type { Locale } from "@/i18n/config";
import type { LocalizedString } from "@/i18n/types";

export function ls(en: string, tr: string): LocalizedString {
  return { en, tr };
}

export function pickLocalized(value: LocalizedString, locale: Locale): string {
  return value[locale] ?? value.en;
}

export function caseStudyAriaLabel(
  title: string,
  template: string,
): string {
  return template.replace("{title}", title);
}
