"use client";

import { useEffect, useRef } from "react";
import type { LocaleField } from "@/lib/content/types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import { interpolate } from "@/i18n/admin/storage";

type LocaleFieldInputProps = {
  label: string;
  value: LocaleField;
  onChange: (value: LocaleField) => void;
  multiline?: boolean;
  /** Informational character count — never blocks input */
  showCharCount?: boolean;
};

function resizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

export function LocaleFieldInput({
  label,
  value,
  onChange,
  multiline = false,
  showCharCount,
}: LocaleFieldInputProps) {
  const t = useAdminT();
  const enTextareaRef = useRef<HTMLTextAreaElement>(null);
  const trTextareaRef = useRef<HTMLTextAreaElement>(null);
  const showCount = showCharCount ?? multiline;

  const localeLabels = {
    en: t.common.englishContent,
    tr: t.common.turkishContent,
  } as const;

  useEffect(() => {
    if (!multiline) return;
    resizeTextarea(enTextareaRef.current);
    resizeTextarea(trTextareaRef.current);
  }, [multiline, value.en, value.tr]);

  return (
    <div className="space-y-3">
      <p className={adminLabelClass()}>{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(["en", "tr"] as const).map((locale) => (
          <label key={locale} className="block text-sm text-muted">
            {localeLabels[locale]}
            {multiline ? (
              <textarea
                ref={locale === "en" ? enTextareaRef : trTextareaRef}
                value={value[locale]}
                onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
                onInput={(e) => resizeTextarea(e.currentTarget)}
                rows={4}
                className={`${adminInputClass()} min-h-24 resize-y overflow-hidden`}
              />
            ) : (
              <input
                value={value[locale]}
                onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
                className={adminInputClass()}
              />
            )}
            {showCount ? (
              <span className="mt-1 block text-[10px] tabular-nums text-muted/80">
                {interpolate(t.common.characterCount, { count: value[locale].length })}
              </span>
            ) : null}
          </label>
        ))}
      </div>
    </div>
  );
}
