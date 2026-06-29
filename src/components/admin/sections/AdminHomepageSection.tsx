"use client";

import { useAdminContent } from "@/components/admin/AdminContentContext";
import { LocaleFieldInput } from "@/components/admin/LocaleFieldInput";
import { ImagePathField, imageFilter } from "@/components/admin/media/ImagePathField";
import { CollapsibleSection } from "@/components/admin/ui/CollapsibleSection";
import { FieldHint, useContentHints } from "@/components/admin/ui/FieldHint";
import { PreviewLinks } from "@/components/admin/ui/PreviewLinks";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminHomepageSection() {
  const t = useAdminT();
  const hints = useContentHints();
  const { content, setContent } = useAdminContent();

  const updateHomepage = (patch: Partial<typeof content.homepage>) => {
    setContent({ ...content, homepage: { ...content.homepage, ...patch } });
  };

  const updateSite = (patch: Partial<typeof content.site>) => {
    setContent({ ...content, site: { ...content.site, ...patch } });
  };

  const updateContact = (patch: Partial<typeof content.contact>) => {
    setContent({ ...content, contact: { ...content.contact, ...patch } });
  };

  const updateFooter = (patch: Partial<typeof content.footer>) => {
    setContent({ ...content, footer: { ...content.footer, ...patch } });
  };

  const updateSeo = (patch: Partial<typeof content.seo>) => {
    setContent({ ...content, seo: { ...content.seo, ...patch } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light">{t.homepage.title}</h2>
        <p className="mt-1 text-sm text-muted">{t.homepage.subtitle}</p>
        <PreviewLinks homepage work />
      </div>

      <CollapsibleSection title={t.homepage.identity} description={t.homepage.identityDesc}>
        <div className="grid gap-6 md:grid-cols-2">
          <label className={adminLabelClass()}>
            {t.homepage.designerName}
            <input
              value={content.homepage.designerName}
              onChange={(e) => updateHomepage({ designerName: e.target.value })}
              className={adminInputClass()}
            />
          </label>
          <ImagePathField
            label={t.homepage.portrait}
            value={content.homepage.portraitImagePath}
            onChange={(portraitImagePath) => updateHomepage({ portraitImagePath })}
            pickerFilter={imageFilter("portrait")}
            helpText={t.homepage.portraitHelp}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t.homepage.hero} description={t.homepage.heroDesc}>
        <div className="space-y-5">
          <LocaleFieldInput
            label={t.homepage.role}
            value={content.homepage.hero.role}
            onChange={(role) => updateHomepage({ hero: { ...content.homepage.hero, role } })}
          />
          <LocaleFieldInput
            label={t.homepage.headline}
            value={content.homepage.hero.headline}
            onChange={(headline) => updateHomepage({ hero: { ...content.homepage.hero, headline } })}
          />
          <LocaleFieldInput
            label={t.homepage.subtitleField}
            value={content.homepage.hero.subtitle}
            onChange={(subtitle) => updateHomepage({ hero: { ...content.homepage.hero, subtitle } })}
          />
          <LocaleFieldInput
            label={t.homepage.description}
            value={content.homepage.hero.description}
            onChange={(description) =>
              updateHomepage({ hero: { ...content.homepage.hero, description } })
            }
            multiline
          />
          <LocaleFieldInput
            label={t.homepage.viewWorkButton}
            value={content.homepage.hero.viewWork}
            onChange={(viewWork) => updateHomepage({ hero: { ...content.homepage.hero, viewWork } })}
          />
          <LocaleFieldInput
            label={t.homepage.contactButton}
            value={content.homepage.hero.contact}
            onChange={(contact) => updateHomepage({ hero: { ...content.homepage.hero, contact } })}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t.homepage.about} description={t.homepage.aboutDesc}>
        <div className="space-y-5">
          <LocaleFieldInput
            label={t.homepage.bio}
            value={content.homepage.about.bio}
            onChange={(bio) => updateHomepage({ about: { ...content.homepage.about, bio } })}
            multiline
          />
          <FieldHint>{hints.description}</FieldHint>
          <LocaleFieldInput
            label={t.homepage.philosophy}
            value={content.homepage.about.philosophy}
            onChange={(philosophy) =>
              updateHomepage({ about: { ...content.homepage.about, philosophy } })
            }
            multiline
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t.homepage.services} description={t.homepage.servicesDesc}>
        <div className="space-y-5">
          <LocaleFieldInput
            label={t.homepage.sectionLabel}
            value={content.homepage.services.label}
            onChange={(label) =>
              updateHomepage({ services: { ...content.homepage.services, label } })
            }
          />
          <LocaleFieldInput
            label={t.homepage.sectionTitle}
            value={content.homepage.services.title}
            onChange={(title) =>
              updateHomepage({ services: { ...content.homepage.services, title } })
            }
          />
          <LocaleFieldInput
            label={t.homepage.sectionDescription}
            value={content.homepage.services.description}
            onChange={(description) =>
              updateHomepage({ services: { ...content.homepage.services, description } })
            }
            multiline
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t.homepage.showcase} description={t.homepage.showcaseDesc}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={adminLabelClass()}>
            {t.homepage.featuredSlugs}
            <input
              value={content.homepage.featuredProjectSlugs.join(", ")}
              onChange={(e) =>
                updateHomepage({
                  featuredProjectSlugs: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className={adminInputClass()}
            />
            <FieldHint>{t.homepage.featuredSlugsHint}</FieldHint>
          </label>
          <label className={adminLabelClass()}>
            {t.homepage.showcaseSlug}
            <input
              value={content.homepage.showcaseProjectSlug}
              onChange={(e) => updateHomepage({ showcaseProjectSlug: e.target.value })}
              className={adminInputClass()}
            />
          </label>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t.homepage.contactPage}
        description={t.homepage.contactPageDesc}
        defaultOpen={false}
      >
        <div className="space-y-5">
          <LocaleFieldInput
            label={t.homepage.contactLabel}
            value={content.contact.label}
            onChange={(label) => updateContact({ label })}
          />
          <LocaleFieldInput
            label={t.homepage.contactTitle}
            value={content.contact.title}
            onChange={(title) => updateContact({ title })}
          />
          <LocaleFieldInput
            label={t.homepage.contactDescription}
            value={content.contact.description}
            onChange={(description) => updateContact({ description })}
            multiline
          />
          <PreviewLinks homepage={false} work={false} />
          <a
            href="/en/contact"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-sm text-accent"
          >
            {t.preview.contactPage}
          </a>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t.homepage.footer}
        description={t.homepage.footerDesc}
        defaultOpen={false}
      >
        <div className="space-y-5">
          <LocaleFieldInput
            label={t.homepage.footerHeadline}
            value={content.footer.headline}
            onChange={(headline) => updateFooter({ headline })}
          />
          <LocaleFieldInput
            label={t.homepage.footerIntro}
            value={content.footer.intro}
            onChange={(intro) => updateFooter({ intro })}
            multiline
          />
          <LocaleFieldInput
            label={t.homepage.footerTagline}
            value={content.footer.tagline}
            onChange={(tagline) => updateFooter({ tagline })}
          />
          <LocaleFieldInput
            label={t.homepage.copyright}
            value={content.footer.copyright}
            onChange={(copyright) => updateFooter({ copyright })}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t.homepage.socialLinks}
        description={t.homepage.socialLinksDesc}
        defaultOpen={false}
      >
        <div className="space-y-3">
          {content.site.social.map((link, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-2">
              <input
                value={link.label}
                onChange={(e) => {
                  const social = [...content.site.social];
                  social[index] = { ...social[index], label: e.target.value };
                  updateSite({ social });
                }}
                className={adminInputClass()}
                placeholder={t.common.label}
              />
              <input
                value={link.href}
                onChange={(e) => {
                  const social = [...content.site.social];
                  social[index] = { ...social[index], href: e.target.value };
                  updateSite({ social });
                }}
                className={adminInputClass()}
                placeholder="https://"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateSite({ social: [...content.site.social, { label: "New", href: "https://" }] })
            }
            className="text-sm text-accent"
          >
            {t.homepage.addLink}
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={t.homepage.seoDefaults}
        description={t.homepage.seoDefaultsDesc}
        defaultOpen={false}
      >
        <div className="space-y-5">
          <LocaleFieldInput
            label={t.homepage.siteTitle}
            value={content.seo.siteTitle}
            onChange={(siteTitle) => updateSeo({ siteTitle })}
          />
          <LocaleFieldInput
            label={t.homepage.siteDescription}
            value={content.seo.siteDescription}
            onChange={(siteDescription) => updateSeo({ siteDescription })}
            multiline
          />
          <FieldHint>{hints.seoDescription}</FieldHint>
          <ImagePathField
            label={t.homepage.ogImage}
            value={content.seo.ogImagePath ?? ""}
            onChange={(ogImagePath) => updateSeo({ ogImagePath })}
            pickerFilter={imageFilter("all")}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}
