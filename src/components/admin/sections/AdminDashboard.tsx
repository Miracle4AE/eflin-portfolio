"use client";

import { useAdminContent } from "@/components/admin/AdminContentContext";
import type { AdminSectionId } from "@/components/admin/AdminShell";
import { ValidationPanel } from "@/components/admin/ui/ValidationPanel";
import { PreviewLinks } from "@/components/admin/ui/PreviewLinks";
import { adminSectionClass, adminCardTitle } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminDashboard({
  onNavigate,
}: {
  onNavigate: (section: AdminSectionId) => void;
}) {
  const t = useAdminT();
  const { content, validation, saveMode, isDirty } = useAdminContent();

  const cards = [
    { label: t.dashboard.projects, value: content.projects.length, section: "projects" as const },
    {
      label: t.dashboard.featured,
      value: content.homepage.featuredProjectSlugs.length,
      section: "projects" as const,
    },
    { label: t.dashboard.issues, value: validation.total, section: "validation" as const },
    {
      label: t.dashboard.saveMode,
      value:
        saveMode === "local"
          ? t.dashboard.local
          : saveMode === "blob"
            ? t.dashboard.blob
            : t.dashboard.unconfigured,
      section: "data" as const,
    },
  ];

  const quickActions: { id: AdminSectionId; label: string }[] = [
    { id: "homepage", label: t.dashboard.editHomepage },
    { id: "projects", label: t.dashboard.manageProjects },
    { id: "media", label: t.dashboard.mediaLibrary },
    { id: "validation", label: t.dashboard.checkHealth },
    { id: "data", label: t.dashboard.exportBackup },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light">{t.dashboard.title}</h2>
        <p className="mt-1 text-sm text-muted">
          {isDirty ? t.dashboard.hasUnsaved : t.dashboard.upToDate}
        </p>
        <PreviewLinks homepage work />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onNavigate(card.section)}
            className="rounded-2xl border border-border-soft bg-surface p-5 text-left transition hover:border-accent/40"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{card.label}</p>
            <p className="mt-2 text-2xl font-light text-foreground">{card.value}</p>
          </button>
        ))}
      </div>

      <section className={adminSectionClass()}>
        <h3 className={adminCardTitle()}>{t.dashboard.quickActions}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickActions.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:border-accent"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {validation.total > 0 ? <ValidationPanel report={validation} /> : null}
    </div>
  );
}
