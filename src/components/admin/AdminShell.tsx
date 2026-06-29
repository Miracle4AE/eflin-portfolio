"use client";

import { useAdminContent } from "@/components/admin/AdminContentContext";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import { AdminToasts } from "@/components/admin/ui/AdminToasts";
import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";
import { interpolate } from "@/i18n/admin/storage";
import { downloadJson, timestampFilename } from "@/lib/admin/draft";

export type AdminSectionId =
  | "dashboard"
  | "homepage"
  | "projects"
  | "media"
  | "validation"
  | "settings"
  | "data";

type AdminShellProps = {
  section: AdminSectionId;
  onSectionChange: (section: AdminSectionId) => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export function AdminShell({
  section,
  onSectionChange,
  onLogout,
  children,
}: AdminShellProps) {
  const { locale, t } = useAdminI18n();
  const {
    isDirty,
    lastSavedAt,
    canWrite,
    saveMode,
    saving,
    save,
    resetChanges,
    toasts,
    dismissToast,
    showDraftPrompt,
    draftMeta,
    restoreDraft,
    discardDraft,
    content,
  } = useAdminContent();

  const sections: { id: AdminSectionId; label: string; icon: string }[] = [
    { id: "dashboard", label: t.nav.dashboard, icon: "◆" },
    { id: "homepage", label: t.nav.homepage, icon: "⌂" },
    { id: "projects", label: t.nav.projects, icon: "▦" },
    { id: "media", label: t.nav.media, icon: "▣" },
    { id: "validation", label: t.nav.health, icon: "✓" },
    { id: "settings", label: t.nav.settings, icon: "⚙" },
    { id: "data", label: t.nav.export, icon: "↓" },
  ];

  function formatSavedAt(date: Date | null): string {
    if (!date) return t.common.notSavedYet;
    return date.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="border-b border-border-soft lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="px-5 py-6">
          <p className="text-[10px] uppercase tracking-[0.24em] text-accent">{t.common.brand}</p>
          <h1 className="mt-2 text-xl font-light">{t.common.portfolioEditor}</h1>
          <p className="mt-1 text-xs text-muted">{t.nav.manageWithoutCode}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm transition lg:w-full ${
                section === item.id
                  ? "bg-surface text-foreground"
                  : "text-muted hover:bg-linen hover:text-foreground"
              }`}
            >
              <span className="mr-2 opacity-60">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="hidden border-t border-border-soft p-4 lg:block">
          <a
            href="/en"
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg px-3 py-2 text-sm text-accent hover:bg-surface"
          >
            {t.nav.viewLiveSite}
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-surface"
          >
            {t.nav.logout}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-border-soft bg-background/95 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <div>
              <p className="text-sm text-muted">
                {isDirty ? (
                  <span className="text-taupe">{t.header.unsavedChanges}</span>
                ) : (
                  <span className="text-taupe">{t.header.allChangesSaved}</span>
                )}
                {" · "}
                {t.header.lastSaved} {formatSavedAt(lastSavedAt)}
              </p>
              <p className="text-xs text-muted">
                {saveMode === "local"
                  ? t.header.localSaveEnabled
                  : saveMode === "blob"
                    ? t.header.blobSaveEnabled
                    : t.header.storageRequiredHint}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminLanguageSwitcher />
              {isDirty ? (
                <button
                  type="button"
                  onClick={resetChanges}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
                >
                  {t.header.reset}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => downloadJson(content, timestampFilename("site-content-backup"))}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
              >
                {t.header.backup}
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || !canWrite || !isDirty}
                title={!canWrite ? t.header.storageRequiredForSaving : undefined}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? t.header.saving
                  : canWrite
                    ? t.header.saveChanges
                    : t.header.storageRequiredForSaving}
              </button>
            </div>
          </div>
        </header>

        <main className="space-y-4 px-4 py-6 sm:px-6 lg:px-8">
          {showDraftPrompt && draftMeta ? (
            <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
              <p className="text-sm text-foreground">
                {interpolate(t.header.draftFound, {
                  date: new Date(draftMeta.savedAt).toLocaleString(
                    locale === "tr" ? "tr-TR" : "en-US",
                  ),
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={restoreDraft}
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm text-background"
                >
                  {t.header.restoreDraft}
                </button>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm"
                >
                  {t.common.discard}
                </button>
              </div>
            </div>
          ) : null}

          {!canWrite ? (
            <div className="rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-muted">
              {t.header.storageNotConfigured}
            </div>
          ) : null}

          {children}
        </main>
      </div>

      <AdminToasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
