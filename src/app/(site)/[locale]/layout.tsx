import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/locale-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { buildRootMetadata } from "@/lib/seo";
import { getMergedDictionary, getMergedSiteConfig } from "@/lib/content";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return await buildRootMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const [dictionary, siteConfig] = await Promise.all([
    getMergedDictionary(locale),
    getMergedSiteConfig(locale),
  ]);

  return (
    <LocaleProvider
      key={locale}
      locale={locale}
      dictionary={dictionary}
      siteConfig={siteConfig}
    >
      <Header locale={locale} />
      <main>{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
