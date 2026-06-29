import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { FeaturedWorks } from "@/components/sections/FeaturedWorks";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { Contact } from "@/components/sections/Contact";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebsiteSchema } from "@/lib/schema";
import {
  getHomepageFeaturedProjects,
  getHomepagePortrait,
  getHomepageShowcaseProject,
} from "@/lib/content/homepage";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const [featured, showcase, portraitSrc] = await Promise.all([
    getHomepageFeaturedProjects(locale),
    getHomepageShowcaseProject(locale),
    getHomepagePortrait(),
  ]);

  if (!showcase) {
    throw new Error("Showcase project not found");
  }

  return (
    <>
      <JsonLd data={buildWebsiteSchema(locale)} />
      <Hero portraitSrc={portraitSrc} />
      <FeaturedWorks projects={featured} />
      <About />
      <Services />
      <ProjectShowcase project={showcase} />
      <Contact />
    </>
  );
}
