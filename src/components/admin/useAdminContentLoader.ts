"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content/types";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function useAdminContentLoader() {
  const t = useAdminT();
  const [initialContent, setInitialContent] = useState<SiteContent | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [saveMode, setSaveMode] = useState<"local" | "blob" | "unconfigured">("unconfigured");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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

  return {
    initialContent,
    canWrite,
    saveMode,
    loading,
    loadError,
    handleSave,
    handleLogout,
  };
}
