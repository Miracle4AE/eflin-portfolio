"use client";

import { useAdminLocale } from "@/i18n/admin/AdminI18nProvider";
import type { AdminLocale } from "@/i18n/admin/types";
import { cn } from "@/lib/utils";

const switcherButtonClass =
  "min-w-[2.25rem] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-300";

const locales: AdminLocale[] = ["tr", "en"];

type AdminLanguageSwitcherProps = {
  className?: string;
};

export function AdminLanguageSwitcher({ className }: AdminLanguageSwitcherProps) {
  const { locale, setLocale } = useAdminLocale();

  return (
    <div
      className={cn(
        "flex items-center gap-1 border border-border px-1 py-0.5",
        className,
      )}
      role="group"
      aria-label="Admin language"
    >
      {locales.map((code) => {
        const isActive = code === locale;
        const label = code.toUpperCase();

        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-current={isActive ? "true" : undefined}
            aria-label={isActive ? `${label} (current)` : label}
            className={cn(
              switcherButtonClass,
              isActive
                ? "bg-accent text-background"
                : "text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
