import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  defaultLocale,
  LOCALE_COOKIE,
  type Locale,
  isLocale,
} from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";

async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language")?.toLowerCase() ?? "";

  if (acceptLanguage.includes("tr")) {
    return "tr";
  }

  return defaultLocale;
}

export default async function RootPage() {
  const locale = await detectLocale();
  redirect(localizedPath(locale));
}
