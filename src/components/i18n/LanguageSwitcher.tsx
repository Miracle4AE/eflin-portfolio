"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeLabels, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { switchLocalePath, stripLocaleFromPathname } from "@/i18n/navigation";
import { useLocale } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

const switcherButtonClass =
  "min-w-[2.25rem] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-300";

export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const { locale: contextLocale } = useLocale();
  const locale = stripLocaleFromPathname(pathname).locale ?? contextLocale;

  return (
    <div
      className={cn(
        "flex items-center gap-1 border border-foreground/10 px-1 py-0.5",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {locales.map((code) => {
        const isActive = code === locale;
        const label = localeLabels[code];

        if (isActive) {
          return (
            <span
              key={code}
              aria-current="true"
              aria-label={`${label} (current)`}
              className={cn(switcherButtonClass, "bg-foreground text-background")}
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={code}
            href={switchLocalePath(pathname, code)}
            prefetch={false}
            onClick={() => setLocaleCookie(code)}
            aria-label={label}
            className={cn(
              switcherButtonClass,
              "text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
