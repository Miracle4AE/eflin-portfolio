"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export type Toast = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

type AdminContentContextValue = {
  content: SiteContent;
  savedContent: SiteContent;
  setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
  isDirty: boolean;
  lastSavedAt: Date | null;
  canWrite: boolean;
  saveMode: "file-write" | "export-only";
  saving: boolean;
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
  saveMode: "file-write" | "export-only";
  onSave: (content: SiteContent) => Promise<{ ok: boolean; message?: string; error?: string }>;
}) {
  const t = useAdminT();
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftMeta, setDraftMeta] = useState<DraftMeta | null>(null);

  const isDirty = useMemo(
    () => !contentEquals(content, savedContent),
    [content, savedContent],
  );

  const validation = useMemo(() => buildValidationReport(content), [content]);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
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
    setSaving(true);
    const result = await onSave(content);
    setSaving(false);
    if (result.ok) {
      setSavedContent(content);
      setLastSavedAt(new Date());
      clearDraft();
      addToast("success", result.message ?? t.toasts.saved);
    } else {
      addToast("error", result.error ?? t.toasts.saveFailed);
    }
  }, [content, onSave, addToast, t.toasts.saved, t.toasts.saveFailed]);

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
