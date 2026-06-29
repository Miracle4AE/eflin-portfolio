"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { localizedPath } from "@/i18n/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { useDictionary } from "@/i18n/locale-context";

function resolveLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isLocale(segment) ? segment : "en";
}

export default function CaseStudyNotFound() {
  const pathname = usePathname();
  const locale = resolveLocaleFromPath(pathname);
  const dict = useDictionary();

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-32 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent">404</p>
      <h1 className="font-display text-4xl font-light text-foreground md:text-5xl">
        {dict.meta.notFound}
      </h1>
      <Link
        href={localizedPath(locale, "/work")}
        className="mt-10 text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
      >
        {dict.caseStudy.allWorks}
      </Link>
    </Container>
  );
}
