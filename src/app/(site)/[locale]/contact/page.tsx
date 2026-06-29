import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";
import { ContactSection } from "@/components/sections/ContactSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildContactMetadata } from "@/lib/seo";
import { buildContactPageSchema } from "@/lib/schema";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};
  return await buildContactMetadata(localeParam);
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const contactSchema = await buildContactPageSchema(locale);

  return (
    <div className="pt-24 md:pt-32">
      <JsonLd data={contactSchema} />
      <ContactSection
        sourcePage={localizedPath(locale, "/contact")}
        showSocial
      />
    </div>
  );
}
