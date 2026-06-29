export const locales = ["en", "tr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "eflin_locale";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  tr: "TR",
};

export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  tr: "tr_TR",
};

export const htmlLang: Record<Locale, string> = {
  en: "en",
  tr: "tr",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
