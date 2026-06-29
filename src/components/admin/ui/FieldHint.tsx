"use client";

import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>;
}

export function useContentHints() {
  const t = useAdminT();
  return t.contentHints;
}

export function RequiredMark() {
  return <span className="ml-1 text-accent">*</span>;
}
