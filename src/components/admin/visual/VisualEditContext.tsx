"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import { useAdminContent } from "@/components/admin/AdminContentContext";
import { setImagePathByPath, setValueByPath } from "@/lib/admin/content-paths";

export type VisualPageId = "homepage" | "work" | "contact" | "project";

type VisualEditContextValue = {
  isEditing: true;
  editLocale: Locale;
  setEditLocale: (locale: Locale) => void;
  page: VisualPageId;
  projectSlug?: string;
  updateField: (path: string, value: string) => void;
  updateImage: (path: string, value: string | null) => void;
};

const VisualEditContext = createContext<VisualEditContextValue | null>(null);

export function VisualEditProvider({
  page,
  projectSlug,
  editLocale: initialLocale,
  children,
}: {
  page: VisualPageId;
  projectSlug?: string;
  editLocale: Locale;
  children: React.ReactNode;
}) {
  const { setContent } = useAdminContent();
  const [editLocale, setEditLocale] = useState<Locale>(initialLocale);

  const updateField = useCallback(
    (path: string, value: string) => {
      setContent((current) => setValueByPath(current, path, value, editLocale));
    },
    [editLocale, setContent],
  );

  const updateImage = useCallback(
    (path: string, value: string | null) => {
      setContent((current) => setImagePathByPath(current, path, value));
    },
    [setContent],
  );

  const value = useMemo(
    () => ({
      isEditing: true as const,
      editLocale,
      setEditLocale,
      page,
      projectSlug,
      updateField,
      updateImage,
    }),
    [editLocale, page, projectSlug, updateField, updateImage],
  );

  return (
    <VisualEditContext.Provider value={value}>{children}</VisualEditContext.Provider>
  );
}

export function useVisualEdit() {
  const ctx = useContext(VisualEditContext);
  if (!ctx) {
    throw new Error("useVisualEdit must be used within VisualEditProvider");
  }
  return ctx;
}

export function useVisualEditOptional() {
  return useContext(VisualEditContext);
}
