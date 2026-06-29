"use client";

import { useAdminContent } from "@/components/admin/AdminContentContext";
import { ValidationPanel } from "@/components/admin/ui/ValidationPanel";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminValidationSection() {
  const t = useAdminT();
  const { validation } = useAdminContent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light">{t.health.title}</h2>
        <p className="mt-1 text-sm text-muted">{t.health.subtitle}</p>
      </div>
      <ValidationPanel report={validation} />
    </div>
  );
}
