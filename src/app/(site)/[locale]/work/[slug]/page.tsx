import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { CaseStudyMeta } from "@/components/case-study/CaseStudyMeta";
import { CaseStudyNarrative } from "@/components/case-study/CaseStudyNarrative";
import { CaseStudyGallery } from "@/components/case-study/CaseStudyGallery";
import { CaseStudyVisualSystem } from "@/components/case-study/CaseStudyVisualSystem";
import { CaseStudyNavigation } from "@/components/case-study/CaseStudyNavigation";
import {
  getAllSlugs,
  getProjectBySlug,
  getNextProject,
  getProjectGallery,
} from "@/lib/projects";
import {
  buildProjectMetadata,
  buildProjectNotFoundMetadata,
} from "@/lib/seo";
import { buildCreativeWorkSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/i18n/config";

interface CaseStudyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};
  const project = await getProjectBySlug(slug, localeParam);

  if (!project) {
    return await buildProjectNotFoundMetadata(localeParam);
  }

  return await buildProjectMetadata(project, localeParam);
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const project = await getProjectBySlug(slug, locale);

  if (!project) {
    notFound();
  }

  const dict = getDictionary(locale);
  const nextProject = await getNextProject(slug, locale);
  const galleryItems = await getProjectGallery(slug, locale);

  const narrativeSections = [
    { label: dict.caseStudy.processBrief, content: project.concept },
    { label: dict.caseStudy.processContext, content: project.challenge },
    { label: dict.caseStudy.processResponse, content: project.solution },
  ];

  return (
    <article>
      <JsonLd data={buildCreativeWorkSchema(project, locale)} />
      <CaseStudyHero project={project} />
      <CaseStudyMeta project={project} />
      <CaseStudyNarrative sections={narrativeSections} />
      <CaseStudyGallery
        items={galleryItems}
        imageAlt={project.images.imageAlt}
        blurDataURL={project.images.blurDataURL}
      />
      <CaseStudyVisualSystem project={project} />
      <CaseStudyNavigation nextProject={nextProject} />
    </article>
  );
}
