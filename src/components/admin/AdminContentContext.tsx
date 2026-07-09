"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SiteContent } from "@/lib/content/types";
import {
  buildValidationReport,
  type ValidationReport,
} from "@/lib/admin/validation-report";
import {
  clearDraft,
  contentEquals,
  loadDraft,
  loadDraftMeta,
  saveDraft,
  type DraftMeta,
} from "@/lib/admin/draft";
import type { AdminSavePhase, AdminSaveResult } from "@/components/admin/useAdminContentLoader";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import { getErrorMessage } from "@/lib/errors";

export type Toast = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

type SaveMeta = {
  revisionId: string;
  updatedAt: string;
  verified: boolean;
};

type AdminContentContextValue = {
  content: SiteContent;
  savedContent: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  isDirty: boolean;
  lastSavedAt: Date | null;
  canWrite: boolean;
  saveMode: "local" | "blob" | "unconfigured";
  saving: boolean;
  savePhase: "idle" | AdminSavePhase;
  saveMeta: SaveMeta | null;
  save: () => Promise<void>;
  resetChanges: () => void;
  validation: ValidationReport;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  showDraftPrompt: boolean;
  draftMeta: DraftMeta | null;
  restoreDraft: () => void;
  discardDraft: () => void;
};

const AdminContentContext = createContext<AdminContentContextValue | null>(null);

const AUTOSAVE_MS = 12_000;

export function AdminContentProvider({
  children,
  initialContent,
  canWrite,
  saveMode,
  onSave,
}: {
  children: React.ReactNode;
  initialContent: SiteContent;
  canWrite: boolean;
  saveMode: "local" | "blob" | "unconfigured";
  onSave: (
    content: SiteContent,
    onPhase?: (phase: AdminSavePhase) => void,
  ) => Promise<AdminSaveResult>;
}) {
  const t = useAdminT();
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initialContent.meta?.updatedAt ? new Date(initialContent.meta.updatedAt) : new Date(),
  );
  const [saveMeta, setSaveMeta] = useState<SaveMeta | null>(
    initialContent.meta?.revisionId && initialContent.meta.updatedAt
      ? {
          revisionId: initialContent.meta.revisionId,
          updatedAt: initialContent.meta.updatedAt,
          verified: true,
        }
      : null,
  );
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [savePhase, setSavePhase] = useState<"idle" | AdminSavePhase>("idle");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftMeta, setDraftMeta] = useState<DraftMeta | null>(null);

  const isDirty = useMemo(
    () => !contentEquals(content, savedContent),
    [content, savedContent],
  );

  const validation = useMemo(() => buildValidationReport(content), [content]);

  const addToast = useCallback((type: Toast["type"], message: unknown) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message: getErrorMessage(message) }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const draft = loadDraft();
    const meta = loadDraftMeta();
    if (draft && meta && !contentEquals(draft, initialContent)) {
      setDraftMeta(meta);
      setShowDraftPrompt(true);
    }
  }, [initialContent]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = window.setInterval(() => {
      saveDraft(content);
    }, AUTOSAVE_MS);
    return () => window.clearInterval(timer);
  }, [content, isDirty]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const save = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSavePhase("saving");
    try {
      const result = await onSave(content, (phase) => setSavePhase(phase));

      if (result.ok && result.verified && result.content) {
        setContent(result.content);
        setSavedContent(result.content);
        setLastSavedAt(result.updatedAt ? new Date(result.updatedAt) : new Date());
        if (result.revisionId && result.updatedAt) {
          setSaveMeta({
            revisionId: result.revisionId,
            updatedAt: result.updatedAt,
            verified: true,
          });
        }
        clearDraft();
        addToast("success", result.message ?? t.toasts.savedVerified);
        return;
      }

      if (result.ok && !result.verified) {
        addToast("error", t.toasts.verificationFailed);
        return;
      }

      addToast("error", result.error ?? t.toasts.saveFailed);
    } catch (error) {
      addToast("error", getErrorMessage(error));
    } finally {
      savingRef.current = false;
      setSaving(false);
      setSavePhase("idle");
    }
  }, [content, onSave, addToast, t.toasts.savedVerified, t.toasts.verificationFailed, t.toasts.saveFailed]);

  const resetChanges = useCallback(() => {
    setContent(savedContent);
    clearDraft();
    addToast("info", t.toasts.changesReset);
  }, [savedContent, addToast, t.toasts.changesReset]);

  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      setContent(draft);
      addToast("info", t.toasts.draftRestored);
    }
    setShowDraftPrompt(false);
  }, [addToast, t.toasts.draftRestored]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setShowDraftPrompt(false);
    addToast("info", t.toasts.draftDiscarded);
  }, [addToast, t.toasts.draftDiscarded]);

  const value = useMemo(
    () => ({
      content,
      savedContent,
      setContent,
      isDirty,
      lastSavedAt,
      canWrite,
      saveMode,
      saving,
      savePhase,
      saveMeta,
      save,
      resetChanges,
      validation,
      toasts,
      dismissToast,
      showDraftPrompt,
      draftMeta,
      restoreDraft,
      discardDraft,
    }),
    [
      content,
      savedContent,
      isDirty,
      lastSavedAt,
      canWrite,
      saveMode,
      saving,
      savePhase,
      saveMeta,
      save,
      resetChanges,
      validation,
      toasts,
      dismissToast,
      showDraftPrompt,
      draftMeta,
      restoreDraft,
      discardDraft,
    ],
  );

  return (
    <AdminContentContext.Provider value={value}>
      {children}
    </AdminContentContext.Provider>
  );
}

export function useAdminContent() {
  const ctx = useContext(AdminContentContext);
  if (!ctx) throw new Error("useAdminContent must be used within AdminContentProvider");
  return ctx;
}
