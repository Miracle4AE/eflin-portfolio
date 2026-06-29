"use client";

import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import type { ValidationReport } from "@/lib/admin/validation-report";
import { formatValidationIssue } from "@/lib/admin/validation-report";
import { interpolate } from "@/i18n/admin/storage";

export function ValidationPanel({ report }: { report: ValidationReport }) {
  const t = useAdminT();

  if (report.total === 0) {
    return (
      <section className="rounded-2xl border border-taupe/25 bg-linen p-6">
        <h2 className="text-lg font-light text-foreground">{t.health.contentHealth}</h2>
        <p className="mt-2 text-sm text-muted">{t.health.allGood}</p>
      </section>
    );
  }

  const groups = [
    { label: t.health.errors, items: report.errors, color: "text-error" },
    { label: t.health.warnings, items: report.warnings, color: "text-taupe" },
    { label: t.health.suggestions, items: report.suggestions, color: "text-muted" },
  ].filter((g) => g.items.length > 0);

  return (
    <section className="rounded-2xl border border-border-soft bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-light text-foreground">{t.health.contentHealth}</h2>
          <p className="mt-1 text-sm text-muted">
            {interpolate(t.health.issueCount, {
              errors: report.errors.length,
              warnings: report.warnings.length,
              suggestions: report.suggestions.length,
            })}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <h3 className={`text-xs uppercase tracking-[0.16em] ${group.color}`}>{group.label}</h3>
            <ul className="mt-2 space-y-2">
              {group.items.map((item) => {
                const formatted = formatValidationIssue(item, t.validation);
                return (
                  <li key={item.id} className="rounded-lg bg-background px-3 py-2 text-sm text-foreground">
                    {formatted.section ? (
                      <span className="text-muted">{formatted.section}: </span>
                    ) : null}
                    {formatted.message}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
