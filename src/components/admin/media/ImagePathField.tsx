"use client";

import type { MediaFileType } from "@/lib/admin/media.constants";
import {
  useMediaPicker,
  type MediaPickerFilter,
} from "@/components/admin/media/MediaPickerContext";
import { AdminImagePreview } from "@/components/admin/media/AdminImagePreview";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

type ImagePathFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  pickerFilter?: MediaPickerFilter;
  helpText?: string;
};

export function ImagePathField({
  label,
  value,
  onChange,
  pickerFilter,
  helpText,
}: ImagePathFieldProps) {
  const t = useAdminT();
  const { openPicker } = useMediaPicker();

  async function copyPath() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="space-y-2">
      <p className={adminLabelClass()}>{label}</p>
      <div className="flex gap-3">
        {value ? (
          <AdminImagePreview
            src={value}
            className="h-20 w-28 shrink-0"
            placeholderLabel="Missing"
          />
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={adminInputClass()}
            placeholder="/images/... or /media/..."
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                openPicker({
                  filter: pickerFilter,
                  onSelect: onChange,
                })
              }
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:border-accent"
            >
              {t.media.chooseFromLibrary}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => void copyPath()}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted"
              >
                {t.media.copyPath}
              </button>
            ) : null}
          </div>
          {helpText ? <p className="text-xs text-muted">{helpText}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function imageFilter(
  type: MediaFileType | "all",
  projectSlug?: string,
): MediaPickerFilter {
  return {
    type,
    projectSlug: projectSlug ?? "all",
  };
}
