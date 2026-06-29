"use client";

import { useState } from "react";
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
import { useAdminContentLoader } from "@/components/admin/useAdminContentLoader";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminApp() {
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
  const [section, setSection] = useState<AdminSectionId>("dashboard");

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
