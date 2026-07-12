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
  getHomepagePortrait,
  getHomepageProjects,
  getHomepageShowcaseProject,
  getHomepageWorkCollections,
} from "@/lib/content/homepage";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const [projects, collections, showcase, portraitSrc, websiteSchema] = await Promise.all([
    getHomepageProjects(locale),
    getHomepageWorkCollections(locale),
    getHomepageShowcaseProject(locale),
    getHomepagePortrait(),
    buildWebsiteSchema(locale),
  ]);

  if (!showcase) {
    throw new Error("Showcase project not found");
  }

  return (
    <>
      <JsonLd data={websiteSchema} />
      <Hero portraitSrc={portraitSrc} />
      <FeaturedWorks projects={projects} collections={collections} />
      <About />
      <Services />
      <ProjectShowcase project={showcase} />
      <Contact />
    </>
  );
}
