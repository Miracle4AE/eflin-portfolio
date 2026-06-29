"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { useDictionary, useLocale, useSiteConfig } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const columnLabelClass =
  "mb-6 text-[10px] uppercase tracking-[0.25em] text-muted";

const linkClass =
  "inline-block text-sm text-muted transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function Footer() {
  const year = new Date().getFullYear();
  const dict = useDictionary();
  const { locale } = useLocale();
  const siteConfig = useSiteConfig();

  const navLinks = useMemo(
    () => [
      { label: dict.nav.work, href: localizedPath(locale, "/work") },
      { label: dict.nav.about, href: localizedPath(locale, "/#about") },
      { label: dict.nav.services, href: localizedPath(locale, "/#services") },
      { label: dict.nav.contact, href: localizedPath(locale, "/contact") },
    ],
    [dict, locale],
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <footer
      className="relative overflow-hidden border-t border-border-soft bg-linen"
      aria-labelledby="footer-headline"
    >
      <div className="editorial-divider" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--color-accent-soft)_35%,transparent),transparent_70%)]"
        aria-hidden="true"
      />

      <Container className="relative py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl lg:max-w-4xl">
          <h2
            id="footer-headline"
            className="font-display text-4xl font-light leading-[1.1] text-foreground md:text-5xl lg:text-6xl xl:text-7xl"
          >
            {dict.footer.headline}
          </h2>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg md:leading-[1.85]">
            {dict.footer.intro}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent/80">
            {dict.about.location}
          </p>
        </div>

        <div className="mt-20 grid gap-14 sm:grid-cols-2 lg:mt-28 lg:grid-cols-3 lg:gap-16">
          <div>
            <p className={columnLabelClass}>{dict.footer.contactLabel}</p>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label={`${dict.footer.emailAria} ${siteConfig.email}`}
              className="font-display text-2xl font-light text-foreground transition-colors duration-300 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-3xl"
            >
              {siteConfig.email}
            </a>
          </div>

          <nav aria-label={dict.footer.navigationLabel}>
            <p className={columnLabelClass}>{dict.footer.navigationLabel}</p>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sm:col-span-2 lg:col-span-1">
            <p className={columnLabelClass}>{dict.footer.socialLabel}</p>
            <ul className="flex flex-col gap-3">
              {siteConfig.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${dict.footer.visitSocial} ${link.label}`}
                    className={cn(linkClass, "uppercase tracking-[0.15em]")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="editorial-divider mt-20 lg:mt-28" aria-hidden="true" />

        <div className="mt-8 flex flex-col items-start gap-6 text-xs uppercase tracking-[0.2em] text-muted md:flex-row md:items-center md:justify-between">
          <span className="text-foreground/70">
            {dict.footer.copyright.trim() ||
              `© ${year} ${siteConfig.name}`}
          </span>
          <span className="text-foreground/30">{dict.footer.tagline}</span>
          <button
            type="button"
            onClick={scrollToTop}
            className="text-muted transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {dict.footer.backToTop}
          </button>
        </div>
      </Container>
    </footer>
  );
}
