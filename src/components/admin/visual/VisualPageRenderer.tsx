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
import { CollectionProjectsIndex } from "@/components/work/CollectionProjectsIndex";
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
import type { ContentCollection, ContentProject } from "@/lib/content/types";
import { getProjectsForCollection } from "@/lib/content/collections";
import { AddProjectCard } from "@/components/admin/visual/AddProjectCard";
import { AddCollectionCard } from "@/components/admin/visual/AddCollectionCard";
import { CreateProjectModal } from "@/components/admin/visual/CreateProjectModal";
import { CollectionModal } from "@/components/admin/collections/CollectionModal";
import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";

type VisualPageRendererProps = {
  page: VisualPageId;
  editLocale: Locale;
  projectSlug: string;
  selectedCollectionId?: string;
  onProjectCreated?: (slug: string) => void;
  onProjectOpen?: (slug: string) => void;
  onCollectionOpen?: (collectionId: string) => void;
  onBackToCollections?: () => void;
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
  selectedCollectionId,
  onProjectCreated,
  onProjectOpen,
  onCollectionOpen,
  onBackToCollections,
}: VisualPageRendererProps) {
  const { content, setContent } = useAdminContent();
  const { t: adminT } = useAdminI18n();
  const { files } = useMediaPicker();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ContentCollection | null>(null);
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
  const selectedCollection = selectedCollectionId
    ? preview.collections.find((collection) => collection.id === selectedCollectionId)
    : undefined;
  const selectedCollectionProjects = selectedCollection
    ? getProjectsForCollection(preview.projects, content.collections, selectedCollection.id)
    : [];
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

  function handleSaveCollection(collection: ContentCollection) {
    setContent((current) => {
      const exists = current.collections.some((item) => item.id === collection.id);
      return {
        ...current,
        collections: exists
          ? current.collections.map((item) => (item.id === collection.id ? collection : item))
          : [...current.collections, collection],
      };
    });
  }

  function openCollectionCreate() {
    setEditingCollection(null);
    setCollectionModalOpen(true);
  }

  function openCollectionEdit(collectionId: string) {
    setEditingCollection(content.collections.find((item) => item.id === collectionId) ?? null);
    setCollectionModalOpen(true);
  }

  return (
    <VisualEditProvider page={page} projectSlug={project?.slug} editLocale={editLocale}>
      <LocaleProvider
        locale={editLocale}
        dictionary={preview.dictionary}
        siteConfig={preview.siteConfig}
      >
        <div className="visual-editor-canvas bg-background pt-28">
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
              {selectedCollection ? (
                <CollectionProjectsIndex
                  collection={selectedCollection}
                  projects={selectedCollectionProjects}
                  workPath={`/${editLocale}/work`}
                  onBackToCollections={onBackToCollections}
                  onProjectOpen={onProjectOpen}
                  afterGridItems={
                    <AddProjectCard onClick={() => setCreateProjectOpen(true)} />
                  }
                />
              ) : (
                <WorkIndex
                  projects={preview.projects}
                  collections={preview.collections}
                  collectionEditLabel={adminT.collections.editCollectionBadge}
                  onCollectionEdit={openCollectionEdit}
                  onCollectionOpen={onCollectionOpen}
                  afterGridItems={
                    <>
                      <AddCollectionCard onClick={openCollectionCreate} />
                      <AddProjectCard onClick={() => setCreateProjectOpen(true)} />
                    </>
                  }
                />
              )}
              <CollectionModal
                open={collectionModalOpen}
                collections={content.collections}
                collection={editingCollection}
                projects={content.projects}
                onClose={() => setCollectionModalOpen(false)}
                onSave={handleSaveCollection}
              />
              <CreateProjectModal
                open={createProjectOpen}
                existingSlugs={content.projects.map((item) => item.slug)}
                collections={content.collections}
                defaultCollectionId={selectedCollection?.id}
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
