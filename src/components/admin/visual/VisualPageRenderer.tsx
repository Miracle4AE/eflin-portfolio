"use client";

import { useMemo, useState } from "react";
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
import { useMediaPicker } from "@/components/admin/media/MediaPickerContext";
import { buildVisualPreviewData, getVisualProjectGallery } from "@/lib/content/visual-preview";
import { useDictionary } from "@/i18n/locale-context";
import type { ResolvedGalleryItem } from "@/types";
import type { ContentProject } from "@/lib/content/types";
import { AddProjectCard } from "@/components/admin/visual/AddProjectCard";
import { CreateProjectModal } from "@/components/admin/visual/CreateProjectModal";

type VisualPageRendererProps = {
  page: VisualPageId;
  editLocale: Locale;
  projectSlug: string;
  onProjectCreated?: (slug: string) => void;
  onProjectOpen?: (slug: string) => void;
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
  onProjectCreated,
  onProjectOpen,
}: VisualPageRendererProps) {
  const { content, setContent } = useAdminContent();
  const { files } = useMediaPicker();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const knownMediaPaths = useMemo(
    () => new Set(files.map((file) => file.path)),
    [files],
  );

  const preview = useMemo(
    () => buildVisualPreviewData(content, editLocale, knownMediaPaths),
    [content, editLocale, knownMediaPaths],
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
    return getVisualProjectGallery(content, project.slug, editLocale, knownMediaPaths).map((item) => ({
      id: item.id,
      file: item.imagePath?.split("/").pop(),
      imagePath: item.imagePath,
      gradient: item.gradient,
      aspectRatio: item.aspectRatio,
      caption: item.caption,
      alt: item.alt,
      src: item.src,
    }));
  }, [content, editLocale, knownMediaPaths, project]);

  function handleCreateProject(projectDraft: ContentProject) {
    setContent((current) => ({
      ...current,
      projects: [...current.projects, projectDraft],
    }));
    onProjectCreated?.(projectDraft.slug);
  }

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
          {page === "work" ? (
            <>
              <WorkIndex
                projects={preview.projects}
                onVisualProjectOpen={onProjectOpen}
                afterGridItems={<AddProjectCard onClick={() => setCreateProjectOpen(true)} />}
              />
              <CreateProjectModal
                open={createProjectOpen}
                existingSlugs={content.projects.map((item) => item.slug)}
                onClose={() => setCreateProjectOpen(false)}
                onCreate={handleCreateProject}
              />
            </>
          ) : null}
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
