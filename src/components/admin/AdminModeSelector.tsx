"use client";

import Link from "next/link";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminModeSelector() {
  const t = useAdminT();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.24em] text-accent">{t.common.brand}</p>
        <h1 className="mt-3 font-display text-4xl font-light text-foreground md:text-5xl">
          {t.modeSelector.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted">{t.modeSelector.subtitle}</p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href="/admin/visual"
            className="group rounded-2xl border border-border-soft bg-surface p-6 transition hover:border-accent/40"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-accent">
              {t.modeSelector.recommended}
            </p>
            <h2 className="mt-3 text-xl font-light text-foreground">{t.modeSelector.visualTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.modeSelector.visualDesc}</p>
          </Link>

          <Link
            href="/admin/structured"
            className="group rounded-2xl border border-border-soft bg-surface p-6 transition hover:border-accent/40"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              {t.modeSelector.advanced}
            </p>
            <h2 className="mt-3 text-xl font-light text-foreground">
              {t.modeSelector.structuredTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t.modeSelector.structuredDesc}</p>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <a href="/tr" target="_blank" rel="noreferrer" className="text-accent">
            {t.nav.viewLiveSite}
          </a>
          <Link href="/admin/login" className="text-muted">
            {t.nav.logout}
          </Link>
        </div>
      </div>
    </div>
  );
}
