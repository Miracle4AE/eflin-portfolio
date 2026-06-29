"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDictionary, useSiteConfig } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/config";
import { localizedPath, isHomePath } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { VisualField } from "@/components/admin/visual/EditableText";
import { cn, scrollToSection } from "@/lib/utils";

interface HeaderProps {
  locale: Locale;
  previewMode?: boolean;
}

export function Header({ locale, previewMode = false }: HeaderProps) {
  const pathname = usePathname();
  const dict = useDictionary();
  const siteConfig = useSiteConfig();
  const isHome = isHomePath(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = useMemo(
    () => [
      {
        label: dict.nav.work,
        href: localizedPath(locale, "/work"),
        type: "route" as const,
        match: "/work",
      },
      {
        label: dict.nav.about,
        href: localizedPath(locale, "/#about"),
        section: "about",
        type: "section" as const,
      },
      {
        label: dict.nav.services,
        href: localizedPath(locale, "/#services"),
        section: "services",
        type: "section" as const,
      },
      {
        label: dict.nav.contact,
        href: localizedPath(locale, "/contact"),
        type: "route" as const,
        match: "/contact",
      },
    ],
    [dict, locale],
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSectionNav = (section: string) => {
    setMenuOpen(false);
    if (isHome) {
      scrollToSection(section);
    }
  };

  const navLinkClass =
    "text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-foreground";

  const isRouteActive = (match: string) =>
    pathname.includes(`${locale}${match}`);

  const renderNavLink = (
    link: (typeof navLinks)[number],
    mobile = false,
  ) => {
    if (link.type === "route") {
      if (previewMode) {
        return (
          <span
            key={link.href}
            className={cn(
              mobile
                ? "py-4 font-display text-3xl font-light text-foreground/70"
                : navLinkClass,
            )}
          >
            {link.label}
          </span>
        );
      }
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setMenuOpen(false)}
          data-cursor={link.match === "/contact" ? "contact" : "view"}
          className={cn(
            mobile
              ? "py-4 font-display text-3xl font-light text-foreground"
              : navLinkClass,
            isRouteActive(link.match) && !mobile && "text-foreground",
          )}
        >
          {link.label}
        </Link>
      );
    }

    if (isHome) {
      if (previewMode) {
        return (
          <span
            key={link.section}
            className={
              mobile
                ? "py-4 font-display text-3xl font-light text-foreground/70"
                : navLinkClass
            }
          >
            {link.label}
          </span>
        );
      }
      return (
        <button
          key={link.section}
          type="button"
          onClick={() => handleSectionNav(link.section)}
          className={
            mobile
              ? "py-4 font-display text-3xl font-light text-foreground"
              : navLinkClass
          }
        >
          {link.label}
        </button>
      );
    }

    return previewMode ? (
      <span
        key={link.section}
        className={
          mobile
            ? "py-4 font-display text-3xl font-light text-foreground/70"
            : navLinkClass
        }
      >
        {link.label}
      </span>
    ) : (
      <Link
        key={link.section}
        href={link.href}
        onClick={() => setMenuOpen(false)}
        className={
          mobile
            ? "py-4 font-display text-3xl font-light text-foreground"
            : navLinkClass
        }
      >
        {link.label}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-700",
        scrolled || !isHome
          ? "bg-background/80 py-4 backdrop-blur-md"
          : "bg-transparent py-6 md:py-8",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-10 lg:px-16">
        <Link
          href={localizedPath(locale)}
          data-cursor="default"
          className="font-display text-xl font-light tracking-wide text-foreground transition-opacity hover:opacity-60 md:text-2xl"
          aria-label={dict.nav.home}
        >
          {previewMode ? (
            <VisualField
              fieldPath="homepage.designerName"
              value={siteConfig.name}
              label="Site name"
            />
          ) : (
            siteConfig.name
          )}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-10" aria-label="Main navigation">
            {navLinks.map((link) => renderNavLink(link))}
          </nav>
          {previewMode ? null : <LanguageSwitcher />}
        </div>

        <div className="flex items-center gap-4 md:hidden">
          {previewMode ? null : <LanguageSwitcher />}
          <button
            type="button"
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            aria-expanded={menuOpen}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block h-px w-6 bg-foreground"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-px w-6 bg-foreground"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block h-px w-6 bg-foreground"
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background md:hidden"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.type === "route" ? link.href : link.section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                {renderNavLink(link, true)}
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
