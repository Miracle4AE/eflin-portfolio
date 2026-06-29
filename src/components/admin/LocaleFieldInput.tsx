"use client";

import type { LocaleField } from "@/lib/content/types";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

type LocaleFieldInputProps = {
  label: string;
  value: LocaleField;
  onChange: (value: LocaleField) => void;
  multiline?: boolean;
};

export function LocaleFieldInput({
  label,
  value,
  onChange,
  multiline = false,
}: LocaleFieldInputProps) {
  const t = useAdminT();
  const Input = multiline ? "textarea" : "input";

  const localeLabels = {
    en: t.common.englishContent,
    tr: t.common.turkishContent,
  } as const;

  return (
    <div className="space-y-3">
      <p className={adminLabelClass()}>{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(["en", "tr"] as const).map((locale) => (
          <label key={locale} className="block text-sm text-muted">
            {localeLabels[locale]}
            <Input
              value={value[locale]}
              onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
              rows={multiline ? 4 : undefined}
              className={`${adminInputClass()} ${multiline ? "min-h-24 resize-y" : ""}`}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
