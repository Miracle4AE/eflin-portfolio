"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { htmlLang, isLocale } from "@/i18n/config";

export function HtmlLang() {
  const pathname = usePathname();

  useEffect(() => {
    const segment = pathname.split("/").filter(Boolean)[0];
    const lang = segment && isLocale(segment) ? htmlLang[segment] : htmlLang.en;
    document.documentElement.lang = lang;
  }, [pathname]);

  return null;
}
