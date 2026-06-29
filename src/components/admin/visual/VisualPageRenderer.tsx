"use client";

import { useMemo } from "react";
import type { Locale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/locale-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { FeaturedWorks } from "@/components/sections/FeaturedWorks";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { Contact } from "@/components/sections/Contact";
import { WorkIndex } from "@/components/work/WorkIndex";
import { ContactSection } from "@/components/sections/ContactSection";
import { CaseStudyHero } from "@/components/case-study/CaseStudyHero";
import { CaseStudyMeta } from "@/components/case-study/CaseStudyMeta";
import { CaseStudyNarrative } from "@/components/case-study/CaseStudyNarrative";
import { CaseStudyGallery } from "@/components/case-study/CaseStudyGallery";
import { CaseStudyVisualSystem } from "@/components/case-study/CaseStudyVisualSystem";
import { CaseStudyNavigation } from "@/components/case-study/CaseStudyNavigation";
import { VisualEditProvider, type VisualPageId, useVisualEdit } from "@/components/admin/visual/VisualEditContext";
import { pickLocale } from "@/lib/content/locale-field";
import { useAdminContent } from "@/components/admin/AdminContentContext";
import { buildVisualPreviewData, getVisualProjectGallery } from "@/lib/content/visual-preview";
import { useDictionary } from "@/i18n/locale-context";
import type { ResolvedGalleryItem } from "@/types";

type VisualPageRendererProps = {
  page: VisualPageId;
  editLocale: Locale;
  projectSlug: string;
};

function ProjectNarrativeSections({ slug }: { slug: string }) {
  const dict = useDictionary();
  const { content } = useAdminContent();
  const { editLocale } = useVisualEdit();
  const project = content.projects.find((p) => p.slug === slug);
  if (!project) return null;

  const sections = [
    {
      label: dict.caseStudy.processBrief,
      contentPath: `projects.${slug}.concept`,
      content: pickLocale(project.concept, editLocale),
    },
    {
      label: dict.caseStudy.processContext,
      contentPath: `projects.${slug}.challenge`,
      content: pickLocale(project.challenge, editLocale),
    },
    {
      label: dict.caseStudy.processResponse,
      contentPath: `projects.${slug}.solution`,
      content: pickLocale(project.solution, editLocale),
    },
  ];

  return <CaseStudyNarrative sections={sections} />;
}

export function VisualPageRenderer({
  page,
  editLocale,
  projectSlug,
}: VisualPageRendererProps) {
  const { content } = useAdminContent();

  const preview = useMemo(
    () => buildVisualPreviewData(content, editLocale),
    [content, editLocale],
  );

  const project =
    preview.projects.find((p) => p.slug === projectSlug) ?? preview.projects[0];
  const nextProject =
    preview.projects[
      (preview.projects.findIndex((p) => p.slug === project?.slug) + 1) %
        Math.max(preview.projects.length, 1)
    ] ?? project;

  const galleryItems: ResolvedGalleryItem[] = useMemo(() => {
    if (!project) return [];
    return getVisualProjectGallery(content, project.slug, editLocale).map((item) => ({
      id: item.id,
      file: item.imagePath?.split("/").pop(),
      imagePath: item.imagePath,
      gradient: item.gradient,
      aspectRatio: item.aspectRatio,
      caption: item.caption,
      alt: item.alt,
      src: item.src,
    }));
  }, [content, editLocale, project]);

  return (
    <VisualEditProvider page={page} projectSlug={project?.slug} editLocale={editLocale}>
      <LocaleProvider
        locale={editLocale}
        dictionary={preview.dictionary}
        siteConfig={preview.siteConfig}
      >
        <div className="visual-editor-canvas bg-background pt-16">
          <Header locale={editLocale} previewMode />
          {page === "homepage" ? (
            <>
              <Hero portraitSrc={preview.portraitSrc} />
              <FeaturedWorks projects={preview.featuredProjects} />
              <About />
              <Services />
              {preview.showcaseProject ? (
                <ProjectShowcase project={preview.showcaseProject} />
              ) : null}
              <Contact />
            </>
          ) : null}
          {page === "work" ? <WorkIndex projects={preview.projects} /> : null}
          {page === "contact" ? (
            <ContactSection sourcePage={`/${editLocale}/contact`} showSocial />
          ) : null}
          {page === "project" && project ? (
            <article>
              <CaseStudyHero project={project} />
              <CaseStudyMeta project={project} />
              <ProjectNarrativeSections slug={project.slug} />
              <CaseStudyGallery
                items={galleryItems}
                imageAlt={project.images.imageAlt}
                blurDataURL={project.images.blurDataURL}
              />
              <CaseStudyVisualSystem project={project} />
              {nextProject ? <CaseStudyNavigation nextProject={nextProject} /> : null}
            </article>
          ) : null}
          <Footer />
        </div>
      </LocaleProvider>
    </VisualEditProvider>
  );
}
