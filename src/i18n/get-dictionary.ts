import type { Locale } from "@/i18n/config";
import { isLocale, defaultLocale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { dictionaryEn } from "@/i18n/dictionaries/en";
import { dictionaryTr } from "@/i18n/dictionaries/tr";

const dictionaries: Record<Locale, Dictionary> = {
  en: dictionaryEn,
  tr: dictionaryTr,
};

export function getDictionary(locale: string): Dictionary {
  const resolved = isLocale(locale) ? locale : defaultLocale;
  return dictionaries[resolved];
}

export function getLocaleLabel(locale: Locale): "English" | "Turkish" {
  return locale === "tr" ? "Turkish" : "English";
}
