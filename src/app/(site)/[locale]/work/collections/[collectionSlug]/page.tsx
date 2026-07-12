import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";
import { CollectionExperience } from "@/components/work/CollectionExperience";
import { buildServerBookExperienceData } from "@/lib/work/book-pages.server";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getCollectionSlug,
  resolveWorkCollection,
} from "@/lib/content/collections";
import { loadSiteContent } from "@/lib/content/loader";
import {
  getProjectsForWorkCollection,
  getWorkCollectionBySlug,
} from "@/lib/projects";
import { buildWorkCollectionMetadata } from "@/lib/seo";
import { buildCollectionPageSchema } from "@/lib/schema";

interface CollectionPageProps {
  params: Promise<{ locale: string; collectionSlug: string }>;
}

export async function generateStaticParams() {
  const content = await loadSiteContent();
  return locales.flatMap((locale) =>
    content.collections.map((collection) => ({
      locale,
      collectionSlug: getCollectionSlug(collection, locale),
    })),
  );
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { locale: localeParam, collectionSlug } = await params;
  if (!isLocale(localeParam)) return {};
  const collection = await getWorkCollectionBySlug(collectionSlug, localeParam);
  if (!collection) return {};
  return buildWorkCollectionMetadata(collection, localeParam);
}

export default async function WorkCollectionPage({ params }: CollectionPageProps) {
  const { locale: localeParam, collectionSlug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const collection = await getWorkCollectionBySlug(collectionSlug, locale);
  if (!collection) notFound();

  const resolvedCollection = resolveWorkCollection(collection, locale);
  const projects = await getProjectsForWorkCollection(collection.id, locale);
  const bookData =
    resolvedCollection.presentationMode === "book"
      ? buildServerBookExperienceData(resolvedCollection, projects, locale)
      : undefined;
  const schema = await buildCollectionPageSchema(projects, locale, {
    title: resolvedCollection.title,
    path: `/work/collections/${resolvedCollection.slug}`,
  });

  return (
    <>
      <JsonLd data={schema} />
      <CollectionExperience
        collection={resolvedCollection}
        projects={projects}
        workPath={localizedPath(locale, "/work")}
        bookData={bookData}
      />
    </>
  );
}
