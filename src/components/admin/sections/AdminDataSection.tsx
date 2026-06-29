"use client";

import { useState } from "react";
import { useAdminContent } from "@/components/admin/AdminContentContext";
import { validateSiteContent } from "@/lib/content/validate";
import {
  downloadJson,
  summarizeContentDiff,
  timestampFilename,
} from "@/lib/admin/draft";
import { adminInputClass, adminSectionClass, adminCardTitle } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import { interpolate } from "@/i18n/admin/storage";

export function AdminDataSection() {
  const t = useAdminT();
  const { content, setContent, canWrite } = useAdminContent();
  const [importText, setImportText] = useState("");
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [diffSummary, setDiffSummary] = useState<string>("");
  const [pendingImport, setPendingImport] = useState<typeof content | null>(null);

  function exportCurrent() {
    downloadJson(content, "site-content.json");
  }

  function exportBackup() {
    downloadJson(content, timestampFilename("site-content-backup"));
  }

  function validateImport() {
    setError("");
    setPreview("");
    setDiffSummary("");
    setPendingImport(null);

    const validation = validateSiteContent(importText);
    if (!validation.ok) {
      setError(validation.errors.join(", "));
      return;
    }

    const diff = summarizeContentDiff(content, validation.data);
    setPendingImport(validation.data);
    setPreview(
      interpolate(t.export.validJson, { count: validation.data.projects.length }),
    );
    setDiffSummary(
      interpolate(t.export.diffSummary, {
        added: diff.projectsAdded,
        removed: diff.projectsRemoved,
        changed: diff.projectsChanged,
      }),
    );
  }

  function applyImport() {
    if (!pendingImport) return;
    if (!window.confirm(t.export.replaceConfirm)) {
      return;
    }
    setContent(pendingImport);
    setPreview(t.export.importedNotice);
    setPendingImport(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light">{t.export.title}</h2>
        <p className="mt-1 text-sm text-muted">{t.export.subtitle}</p>
      </div>

      <section className={adminSectionClass()}>
        <h3 className={adminCardTitle()}>{t.export.exportSection}</h3>
        <p className="mt-2 text-sm text-muted">
          {canWrite ? t.export.exportDevHint : t.export.exportProdHint}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCurrent}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background"
          >
            {t.export.downloadJson}
          </button>
          <button
            type="button"
            onClick={exportBackup}
            className="rounded-lg border border-border px-4 py-2 text-sm"
          >
            {t.export.downloadBackup}
          </button>
        </div>
      </section>

      <section className={adminSectionClass()}>
        <h3 className={adminCardTitle()}>{t.export.importSection}</h3>
        <p className="mt-2 text-sm text-muted">{t.export.importHint}</p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={12}
          className={`${adminInputClass()} mt-4 min-h-48 resize-y font-mono`}
          placeholder='{ "version": 1, ... }'
        />
        <p className="mt-1 text-[10px] tabular-nums text-muted/80">
          {interpolate(t.common.characterCount, { count: importText.length })}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={validateImport}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            {t.export.validatePreview}
          </button>
          <button
            type="button"
            onClick={applyImport}
            disabled={!pendingImport}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
          >
            {t.export.applyToEditor}
          </button>
        </div>
        {preview ? <p className="mt-3 text-sm text-taupe">{preview}</p> : null}
        {diffSummary ? <p className="mt-1 text-sm text-muted">{diffSummary}</p> : null}
        {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
      </section>
    </div>
  );
}
