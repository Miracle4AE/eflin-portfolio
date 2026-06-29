"use client";

import { ContactSection } from "@/components/sections/ContactSection";
import { useLocale } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";

export function Contact() {
  const { locale } = useLocale();

  return <ContactSection sourcePage={localizedPath(locale)} showSocial />;
}
