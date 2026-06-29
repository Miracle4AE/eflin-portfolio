"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content/types";
import { AdminContentProvider } from "@/components/admin/AdminContentContext";
import { AdminShell, type AdminSectionId } from "@/components/admin/AdminShell";
import { AdminDashboard } from "@/components/admin/sections/AdminDashboard";
import { AdminHomepageSection } from "@/components/admin/sections/AdminHomepageSection";
import { AdminProjectsSection } from "@/components/admin/sections/AdminProjectsSection";
import { AdminSettingsSection } from "@/components/admin/sections/AdminSettingsSection";
import { AdminDataSection } from "@/components/admin/sections/AdminDataSection";
import { AdminMediaSection } from "@/components/admin/sections/AdminMediaSection";
import { AdminValidationSection } from "@/components/admin/sections/AdminValidationSection";
import { MediaPickerProvider } from "@/components/admin/media/MediaPickerContext";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminApp() {
  const t = useAdminT();
  const [initialContent, setInitialContent] = useState<SiteContent | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [saveMode, setSaveMode] = useState<"local" | "blob" | "unconfigured">("unconfigured");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [section, setSection] = useState<AdminSectionId>("dashboard");

  const loadContent = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const contentRes = await fetch("/api/admin/content");

    if (!contentRes.ok) {
      setLoadError(t.toasts.loadFailed);
      setLoading(false);
      return;
    }

    const data = await contentRes.json();
    setInitialContent(data.content);
    setCanWrite(Boolean(data.canWrite));
    setSaveMode(data.saveMode);

    setLoading(false);
  }, [t.toasts.loadFailed]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const handleSave = useCallback(
    async (content: SiteContent) => {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          ok: false,
          error: data.error || data.details?.join(", ") || t.toasts.saveFailed,
        };
      }
      return { ok: true, message: data.message || t.toasts.saved };
    },
    [t.toasts.saveFailed, t.toasts.saved],
  );

  async function handleLogout() {
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    window.location.href = "/admin/login";
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">{t.common.brand}</p>
          <p className="mt-3">{t.app.loadingEditor}</p>
        </div>
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
        <AdminShell section={section} onSectionChange={setSection} onLogout={() => void handleLogout()}>
          {section === "dashboard" ? <AdminDashboard onNavigate={setSection} /> : null}
          {section === "homepage" ? <AdminHomepageSection /> : null}
          {section === "projects" ? <AdminProjectsSection /> : null}
          {section === "media" ? <AdminMediaSection /> : null}
          {section === "validation" ? <AdminValidationSection /> : null}
          {section === "settings" ? <AdminSettingsSection /> : null}
          {section === "data" ? <AdminDataSection /> : null}
        </AdminShell>
      </AdminContentProvider>
    </MediaPickerProvider>
  );
}
