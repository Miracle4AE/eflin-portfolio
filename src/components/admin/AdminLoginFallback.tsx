"use client";

import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminLoginFallback() {
  const t = useAdminT();
  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <p className="text-[10px] uppercase tracking-[0.24em] text-accent">{t.common.brand}</p>
        <p className="mt-3 text-sm text-muted">{t.login.loadingEditor}</p>
      </div>
    </div>
  );
}
