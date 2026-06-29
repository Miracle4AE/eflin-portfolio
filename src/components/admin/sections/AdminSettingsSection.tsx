"use client";

import { useAdminContent } from "@/components/admin/AdminContentContext";
import { LocaleFieldInput } from "@/components/admin/LocaleFieldInput";
import { CollapsibleSection } from "@/components/admin/ui/CollapsibleSection";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminSettingsSection() {
  const t = useAdminT();
  const { content, setContent } = useAdminContent();

  const updateSite = (patch: Partial<typeof content.site>) => {
    setContent({ ...content, site: { ...content.site, ...patch } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light">{t.settings.title}</h2>
        <p className="mt-1 text-sm text-muted">{t.settings.subtitle}</p>
      </div>

      <CollapsibleSection title={t.settings.contactDetails} description={t.settings.contactDetailsDesc}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={adminLabelClass()}>
            {t.settings.siteName}
            <input
              value={content.site.name}
              onChange={(e) => updateSite({ name: e.target.value })}
              className={adminInputClass()}
            />
          </label>
          <label className={adminLabelClass()}>
            {t.settings.email}
            <input
              value={content.site.email}
              onChange={(e) => updateSite({ email: e.target.value })}
              className={adminInputClass()}
            />
          </label>
          <label className={adminLabelClass()}>
            {t.settings.phone}
            <input
              value={content.site.phone ?? ""}
              onChange={(e) => updateSite({ phone: e.target.value })}
              className={adminInputClass()}
            />
          </label>
        </div>
        <div className="mt-5 space-y-5">
          <LocaleFieldInput
            label={t.settings.location}
            value={content.site.location}
            onChange={(location) => updateSite({ location })}
          />
          <LocaleFieldInput
            label={t.settings.availability}
            value={content.site.availability ?? { en: "", tr: "" }}
            onChange={(availability) => updateSite({ availability })}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
