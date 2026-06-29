"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { AdminContentProvider } from "@/components/admin/AdminContentContext";
import { MediaPickerProvider } from "@/components/admin/media/MediaPickerContext";
import { useAdminContentLoader } from "@/components/admin/useAdminContentLoader";
import { VisualEditorToolbar } from "@/components/admin/visual/VisualEditorToolbar";
import { VisualPageRenderer } from "@/components/admin/visual/VisualPageRenderer";
import type { VisualPageId } from "@/components/admin/visual/VisualEditContext";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function VisualEditorApp() {
  const t = useAdminT();
  const {
    initialContent,
    canWrite,
    saveMode,
    loading,
    loadError,
    handleSave,
    handleLogout,
  } = useAdminContentLoader();
  const [page, setPage] = useState<VisualPageId>("homepage");
  const [projectSlug, setProjectSlug] = useState("");
  const [editLocale, setEditLocale] = useState<Locale>("tr");

  useEffect(() => {
    if (initialContent && !projectSlug) {
      setProjectSlug(initialContent.projects[0]?.slug ?? "");
    }
  }, [initialContent, projectSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        <p>{t.app.loadingEditor}</p>
      </div>
    );
  }

  if (!initialContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-error">
        {loadError || t.toasts.contentUnavailable}
      </div>
    );
  }

  return (
    <MediaPickerProvider>
      <AdminContentProvider
        initialContent={initialContent}
        canWrite={canWrite}
        saveMode={saveMode}
        onSave={handleSave}
      >
        <div className="min-h-screen bg-background">
          <VisualEditorToolbar
            page={page}
            projectSlug={projectSlug}
            projectSlugs={initialContent.projects.map((p) => p.slug)}
            editLocale={editLocale}
            onPageChange={(nextPage, slug) => {
              setPage(nextPage);
              if (slug) setProjectSlug(slug);
            }}
            onLocaleChange={setEditLocale}
            onLogout={() => void handleLogout()}
          />

          <div className="hidden lg:block">
            <VisualPageRenderer
              page={page}
              editLocale={editLocale}
              projectSlug={projectSlug}
            />
          </div>

          <div className="border-t border-border-soft px-6 py-16 text-center lg:hidden">
            <p className="font-display text-2xl font-light text-foreground">
              {t.visualEditor.mobileTitle}
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted">
              {t.visualEditor.mobileHint}
            </p>
            <Link
              href="/admin/structured"
              className="mt-6 inline-block rounded-lg bg-accent px-4 py-2 text-sm text-background"
            >
              {t.visualEditor.openStructured}
            </Link>
          </div>
        </div>
      </AdminContentProvider>
    </MediaPickerProvider>
  );
}
