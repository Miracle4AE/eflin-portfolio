"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/content/types";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import { getErrorMessage } from "@/lib/errors";

export type AdminSavePhase = "saving" | "verifying" | "waiting" | "revalidating" | "saved";

type SaveVerificationDebug = {
  attempts: number;
  lastSeenRevisionId: string | null;
  expectedRevisionId: string;
  verified: boolean;
  elapsedMs: number;
};

export type AdminSaveResult = {
  ok: boolean;
  message?: string;
  error?: string;
  revisionId?: string;
  updatedAt?: string;
  verified?: boolean;
  saveMode?: "local" | "blob";
  content?: SiteContent;
  debug?: SaveVerificationDebug;
};

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
    try {
      const contentRes = await fetch("/api/admin/content?fresh=1");

      if (!contentRes.ok) {
        setLoadError(t.toasts.loadFailed);
        setLoading(false);
        return;
      }

      const data = await contentRes.json();
      setInitialContent(data.content);
      setCanWrite(Boolean(data.canWrite));
      setSaveMode(data.saveMode);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [t.toasts.loadFailed]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const handleSave = useCallback(
    async (content: SiteContent, onPhase?: (phase: AdminSavePhase) => void): Promise<AdminSaveResult> => {
      onPhase?.("saving");
      const phaseTimers = [
        window.setTimeout(() => onPhase?.("verifying"), 250),
        window.setTimeout(() => onPhase?.("waiting"), 1500),
        window.setTimeout(() => onPhase?.("revalidating"), 4500),
      ];

      let response: Response;
      let data: {
        error?: unknown;
        details?: unknown;
        message?: unknown;
        verified?: boolean;
        revisionId?: string;
        updatedAt?: string;
        saveMode?: "local" | "blob";
        content?: SiteContent;
        debug?: SaveVerificationDebug;
      };

      try {
        response = await fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        data = await response.json();
      } finally {
        phaseTimers.forEach((timer) => window.clearTimeout(timer));
      }

      if (!response.ok) {
        return {
          ok: false,
          error:
            typeof data.error === "string"
              ? data.error
              : Array.isArray(data.details)
                ? data.details.join(", ")
                : t.toasts.saveFailed,
          debug: data.debug,
        };
      }

      if (!data.verified) {
        return {
          ok: false,
          error: typeof data.error === "string" ? data.error : t.toasts.verificationFailed,
          debug: data.debug,
        };
      }

      if (data.content?.meta?.revisionId === data.revisionId) {
        onPhase?.("saved");
        return {
          ok: true,
          message: typeof data.message === "string" ? data.message : t.toasts.savedVerified,
          revisionId: data.revisionId,
          updatedAt: data.updatedAt,
          verified: true,
          saveMode: data.saveMode,
          content: data.content,
          debug: data.debug,
        };
      }

      onPhase?.("verifying");
      const verifyRes = await fetch("/api/admin/content?fresh=1");
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        return {
          ok: false,
          error: t.toasts.verifyReadFailed,
          debug: data.debug,
        };
      }

      if (verifyData.content?.meta?.revisionId !== data.revisionId) {
        return {
          ok: false,
          error: t.toasts.verificationFailed,
          debug: data.debug,
        };
      }

      onPhase?.("saved");
      return {
        ok: true,
        message: typeof data.message === "string" ? data.message : t.toasts.savedVerified,
        revisionId: data.revisionId,
        updatedAt: data.updatedAt,
        verified: true,
        saveMode: data.saveMode,
        content: verifyData.content,
        debug: data.debug,
      };
    },
    [t.toasts.saveFailed, t.toasts.savedVerified, t.toasts.verificationFailed, t.toasts.verifyReadFailed],
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
