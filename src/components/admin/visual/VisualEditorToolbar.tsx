"use client";

import Link from "next/link";
import { useAdminContent } from "@/components/admin/AdminContentContext";
import { AdminToasts } from "@/components/admin/ui/AdminToasts";
import { downloadJson, timestampFilename } from "@/lib/admin/draft";
import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";
import type { Locale } from "@/i18n/config";
import type { VisualPageId } from "@/components/admin/visual/VisualEditContext";

type VisualEditorToolbarProps = {
  page: VisualPageId;
  projectSlug: string;
  projectSlugs: string[];
  editLocale: Locale;
  onPageChange: (page: VisualPageId, projectSlug?: string) => void;
  onLocaleChange: (locale: Locale) => void;
  onLogout: () => void;
};

export function VisualEditorToolbar({
  page,
  projectSlug,
  projectSlugs,
  editLocale,
  onPageChange,
  onLocaleChange,
  onLogout,
}: VisualEditorToolbarProps) {
  const { t } = useAdminI18n();
  const {
    isDirty,
    canWrite,
    saving,
    savePhase,
    saveMeta,
    save,
    resetChanges,
    toasts,
    dismissToast,
    content,
    showDraftPrompt,
    draftMeta,
    restoreDraft,
    discardDraft,
  } = useAdminContent();

  return (
    <>
      <header className="visual-editor-toolbar">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
              {t.visualEditor.brand}
            </p>
            <p className="truncate text-sm text-muted">{t.visualEditor.subtitle}</p>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted">
            <span>{t.visualEditor.page}</span>
            <select
              value={page === "project" ? `project:${projectSlug}` : page}
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith("project:")) {
                  onPageChange("project", value.replace("project:", ""));
                } else {
                  onPageChange(value as VisualPageId);
                }
              }}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-foreground"
            >
              <option value="homepage">{t.visualEditor.pages.homepage}</option>
              <option value="work">{t.visualEditor.pages.work}</option>
              <option value="contact">{t.visualEditor.pages.contact}</option>
              {projectSlugs.map((slug) => (
                <option key={slug} value={`project:${slug}`}>
                  {t.visualEditor.pages.project}: {slug}
                </option>
              ))}
            </select>
          </label>

          <div className="flex rounded-lg border border-border p-0.5">
            {(["tr", "en"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onLocaleChange(item)}
                className={`rounded-md px-3 py-1 text-xs uppercase tracking-[0.14em] ${
                  editLocale === item
                    ? "bg-accent text-background"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">
            {isDirty ? t.header.unsavedChanges : t.header.allChangesSaved}
            {saveMeta ? (
              <>
                {" · "}
                {t.header.lastRevision}: {saveMeta.revisionId.slice(0, 8)}
              </>
            ) : null}
          </span>
          {isDirty ? (
            <button
              type="button"
              onClick={resetChanges}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
            >
              {t.header.reset}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => downloadJson(content, timestampFilename("site-content-backup"))}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
          >
            {t.header.backup}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !canWrite || !isDirty}
            className="rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-background disabled:opacity-50"
          >
            {saving
              ? savePhase === "verifying"
                ? t.header.verifying
                : t.header.saving
              : t.header.saveChanges}
          </button>
          <Link
            href="/admin/structured"
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:border-accent"
          >
            {t.visualEditor.structuredEditor}
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
          >
            {t.visualEditor.exit}
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            {t.nav.logout}
          </button>
        </div>
      </header>

      {showDraftPrompt && draftMeta ? (
        <div className="border-b border-accent/20 bg-accent/10 px-4 py-3 text-sm">
          <p>{t.header.draftFound.replace("{date}", new Date(draftMeta.savedAt).toLocaleString())}</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-lg bg-accent px-3 py-1 text-xs text-background"
            >
              {t.header.restoreDraft}
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-lg border border-border px-3 py-1 text-xs"
            >
              {t.common.discard}
            </button>
          </div>
        </div>
      ) : null}

      <AdminToasts toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
