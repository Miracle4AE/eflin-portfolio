import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { WorkIndex } from "@/components/work/WorkIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllProjects } from "@/lib/projects";
import { buildWorkMetadata } from "@/lib/seo";
import { buildCollectionPageSchema } from "@/lib/schema";

interface WorkPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: WorkPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};
  return await buildWorkMetadata(localeParam);
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const projects = await getAllProjects(locale);
  const collectionSchema = await buildCollectionPageSchema(projects, locale);

  return (
    <>
      <JsonLd data={collectionSchema} />
      <WorkIndex projects={projects} />
    </>
  );
}
