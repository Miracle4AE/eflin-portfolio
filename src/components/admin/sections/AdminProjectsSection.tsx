"use client";

import { useMemo, useState } from "react";
import type { ContentProject } from "@/lib/content/types";
import { useAdminContent } from "@/components/admin/AdminContentContext";
import { LocaleFieldInput } from "@/components/admin/LocaleFieldInput";
import { ImagePathField, imageFilter } from "@/components/admin/media/ImagePathField";
import { GalleryItemEditor, createGalleryItem } from "@/components/admin/media/GalleryItemEditor";
import { CollapsibleSection } from "@/components/admin/ui/CollapsibleSection";
import { FieldHint, useContentHints, RequiredMark } from "@/components/admin/ui/FieldHint";
import { PreviewLinks, EmptyState } from "@/components/admin/ui/PreviewLinks";
import {
  getProjectCompletion,
  slugifyTitle,
} from "@/lib/admin/validation-report";
import { ls } from "@/lib/content/locale-field";
import { adminInputClass, adminLabelClass } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import { interpolate } from "@/i18n/admin/storage";

const CATEGORIES = ["branding", "editorial", "identity", "digital", "art-direction"] as const;

function emptyProject(slug: string): ContentProject {
  return {
    slug,
    title: ls("New Project", "Yeni Proje"),
    category: ls("Category", "Kategori"),
    filterCategory: "branding",
    year: new Date().getFullYear().toString(),
    role: ls("", ""),
    client: ls("", ""),
    summary: ls("", ""),
    description: ls("", ""),
    concept: ls("", ""),
    challenge: ls("", ""),
    solution: ls("", ""),
    visualDirection: ls("", ""),
    typography: ls("", ""),
    tags: { en: [], tr: [] },
    palette: [{ name: ls("Black", "Siyah"), hex: "#0a0a0a" }],
    galleryItems: [],
    gradient: "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
    aspectRatio: "portrait",
    featured: false,
    coverImagePath: `/images/projects/${slug}/cover.jpg`,
    heroImagePath: `/images/projects/${slug}/hero.jpg`,
    imageAlt: ls("", ""),
  };
}

function CompletionBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-greige">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function AdminProjectsSection() {
  const t = useAdminT();
  const hints = useContentHints();
  const { content, setContent } = useAdminContent();
  const [selectedSlug, setSelectedSlug] = useState(content.projects[0]?.slug ?? "");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const selected = content.projects.find((p) => p.slug === selectedSlug);
  const slugCounts = useMemo(() => {
    const map = new Map<string, number>();
    content.projects.forEach((p) => map.set(p.slug, (map.get(p.slug) ?? 0) + 1));
    return map;
  }, [content.projects]);

  const filteredList = useMemo(() => {
    return content.projects.filter((project) => {
      if (featuredOnly && !project.featured) return false;
      if (categoryFilter !== "all" && project.filterCategory !== categoryFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        project.slug.includes(q) ||
        project.title.en.toLowerCase().includes(q) ||
        project.title.tr.toLowerCase().includes(q) ||
        project.client.en.toLowerCase().includes(q)
      );
    });
  }, [content.projects, search, categoryFilter, featuredOnly]);

  function updateProjects(projects: ContentProject[]) {
    setContent({ ...content, projects });
  }

  function updateProject(updated: ContentProject) {
    updateProjects(content.projects.map((p) => (p.slug === updated.slug ? updated : p)));
  }

  function addProject() {
    const base = `project-${content.projects.length + 1}`;
    updateProjects([...content.projects, emptyProject(base)]);
    setSelectedSlug(base);
  }

  function duplicateProject(project: ContentProject) {
    let newSlug = `${project.slug}-copy`;
    let n = 2;
    while (content.projects.some((p) => p.slug === newSlug)) {
      newSlug = `${project.slug}-copy-${n}`;
      n += 1;
    }
    const copy: ContentProject = {
      ...project,
      slug: newSlug,
      title: ls(`${project.title.en} (Copy)`, `${project.title.tr || project.title.en} (Kopya)`),
      featured: false,
      galleryItems: project.galleryItems.map((item) => ({
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
      })),
    };
    updateProjects([...content.projects, copy]);
    setSelectedSlug(newSlug);
  }

  function deleteProject(slug: string) {
    const project = content.projects.find((p) => p.slug === slug);
    if (!project) return;
    const name = project.title.en || slug;
    if (!window.confirm(interpolate(t.projects.deleteConfirm, { name }))) return;
    const next = content.projects.filter((p) => p.slug !== slug);
    updateProjects(next);
    setSelectedSlug(next[0]?.slug ?? "");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-light">{t.projects.title}</h2>
        <p className="mt-1 text-sm text-muted">{t.projects.subtitle}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-border-soft bg-surface p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-[0.14em] text-muted">{t.projects.allProjects}</h3>
            <button type="button" onClick={addProject} className="text-sm text-accent">
              {t.projects.addProject}
            </button>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.projects.searchPlaceholder}
            className={adminInputClass()}
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
            >
              <option value="all">{t.projects.allCategories}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
              />
              {t.projects.featuredOnly}
            </label>
          </div>
          <ul className="max-h-[420px] space-y-1 overflow-y-auto">
            {filteredList.map((project) => {
              const completion = getProjectCompletion(project);
              return (
                <li key={project.slug}>
                  <button
                    type="button"
                    onClick={() => setSelectedSlug(project.slug)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm ${
                      selectedSlug === project.slug
                        ? "bg-background text-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{project.title.en || project.slug}</span>
                      {project.featured ? <span className="text-accent">★</span> : null}
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {completion.overall}% {t.projects.complete}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {selected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border-soft bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-light">
                    {selected.title.en || t.projects.untitledProject}
                  </h3>
                  <PreviewLinks projectSlug={selected.slug} compact />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => duplicateProject(selected)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:border-accent"
                    >
                      {t.projects.duplicate}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProject(selected.slug)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-error hover:border-red-400/50"
                    >
                      {t.projects.delete}
                    </button>
                  </div>
                </div>
                <div className="grid w-full max-w-xs gap-2">
                  <CompletionBar
                    label={t.projects.completionContent}
                    value={getProjectCompletion(selected).content}
                  />
                  <CompletionBar
                    label={t.projects.completionImages}
                    value={getProjectCompletion(selected).images}
                  />
                  <CompletionBar
                    label={t.projects.completionSeo}
                    value={getProjectCompletion(selected).seo}
                  />
                </div>
              </div>
            </div>

            <CollapsibleSection title={t.projects.basics} description={t.projects.basicsDesc} defaultOpen>
              <div className="grid gap-4 md:grid-cols-2">
                <label className={adminLabelClass()}>
                  {t.projects.titleEn}
                  <RequiredMark />
                  <input
                    value={selected.title.en}
                    onChange={(e) => {
                      const title = { ...selected.title, en: e.target.value };
                      const autoSlug = slugifyTitle(e.target.value);
                      updateProject({
                        ...selected,
                        title,
                        slug:
                          selected.slug.startsWith("project-") && autoSlug
                            ? autoSlug
                            : selected.slug,
                      });
                      if (selected.slug.startsWith("project-") && autoSlug) setSelectedSlug(autoSlug);
                    }}
                    className={adminInputClass()}
                  />
                </label>
                <label className={adminLabelClass()}>
                  {t.projects.slug}
                  <RequiredMark />
                  <input
                    value={selected.slug}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                      updateProjects(
                        content.projects.map((p) =>
                          p.slug === selected.slug ? { ...selected, slug } : p,
                        ),
                      );
                      setSelectedSlug(slug);
                    }}
                    className={adminInputClass()}
                  />
                  {(slugCounts.get(selected.slug) ?? 0) > 1 ? (
                    <FieldHint>{t.projects.slugDuplicated}</FieldHint>
                  ) : null}
                </label>
                <label className={adminLabelClass()}>
                  {t.projects.category}
                  <select
                    value={selected.filterCategory}
                    onChange={(e) =>
                      updateProject({
                        ...selected,
                        filterCategory: e.target.value as ContentProject["filterCategory"],
                      })
                    }
                    className={adminInputClass()}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={adminLabelClass()}>
                  {t.projects.year}
                  <input
                    value={selected.year}
                    onChange={(e) => updateProject({ ...selected, year: e.target.value })}
                    className={adminInputClass()}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={Boolean(selected.featured)}
                    onChange={(e) => updateProject({ ...selected, featured: e.target.checked })}
                  />
                  {t.projects.featuredOnHomepage}
                </label>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title={t.projects.englishContent}
              description={t.projects.englishContentDesc}
            >
              <div className="space-y-5">
                <LocaleFieldInput
                  label={t.projects.summaryEn}
                  value={selected.summary}
                  onChange={(summary) => updateProject({ ...selected, summary })}
                  multiline
                />
                <FieldHint>{hints.summary}</FieldHint>
                <LocaleFieldInput
                  label={t.projects.descriptionEn}
                  value={selected.description}
                  onChange={(description) => updateProject({ ...selected, description })}
                  multiline
                />
                <LocaleFieldInput
                  label={t.projects.conceptEn}
                  value={selected.concept}
                  onChange={(concept) => updateProject({ ...selected, concept })}
                  multiline
                />
                <LocaleFieldInput
                  label={t.projects.challengeEn}
                  value={selected.challenge}
                  onChange={(challenge) => updateProject({ ...selected, challenge })}
                  multiline
                />
                <LocaleFieldInput
                  label={t.projects.solutionEn}
                  value={selected.solution}
                  onChange={(solution) => updateProject({ ...selected, solution })}
                  multiline
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title={t.projects.turkishContent}
              description={t.projects.turkishContentDesc}
              defaultOpen={false}
            >
              <div className="space-y-5">
                <LocaleFieldInput
                  label={t.projects.summaryTr}
                  value={selected.summary}
                  onChange={(summary) => updateProject({ ...selected, summary })}
                  multiline
                />
                <LocaleFieldInput
                  label={t.projects.descriptionTr}
                  value={selected.description}
                  onChange={(description) => updateProject({ ...selected, description })}
                  multiline
                />
                <LocaleFieldInput
                  label={t.projects.conceptTr}
                  value={selected.concept}
                  onChange={(concept) => updateProject({ ...selected, concept })}
                  multiline
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title={t.projects.media} description={t.projects.mediaDesc}>
              <div className="space-y-5">
                <ImagePathField
                  label={t.projects.coverImage}
                  value={selected.coverImagePath ?? ""}
                  onChange={(coverImagePath) => updateProject({ ...selected, coverImagePath })}
                  pickerFilter={imageFilter("cover", selected.slug)}
                  helpText={hints.cover}
                />
                <ImagePathField
                  label={t.projects.heroImage}
                  value={selected.heroImagePath ?? ""}
                  onChange={(heroImagePath) => updateProject({ ...selected, heroImagePath })}
                  pickerFilter={imageFilter("hero", selected.slug)}
                  helpText={hints.hero}
                />
                <FieldHint>{hints.galleryCount}</FieldHint>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm text-foreground">{t.projects.gallery}</h4>
                  <button
                    type="button"
                    onClick={() =>
                      updateProject({
                        ...selected,
                        galleryItems: [...selected.galleryItems, createGalleryItem(selected)],
                      })
                    }
                    className="text-sm text-accent"
                  >
                    {t.projects.addImage}
                  </button>
                </div>
                <div className="space-y-4">
                  {selected.galleryItems.map((item, index) => (
                    <GalleryItemEditor
                      key={item.id}
                      project={selected}
                      item={item}
                      index={index}
                      total={selected.galleryItems.length}
                      onChange={(galleryItems) => updateProject({ ...selected, galleryItems })}
                    />
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title={t.projects.seo}
              description={t.projects.seoDesc}
              defaultOpen={false}
            >
              <div className="space-y-5">
                <LocaleFieldInput
                  label={t.projects.seoTitle}
                  value={selected.seoTitle ?? ls("", "")}
                  onChange={(seoTitle) => updateProject({ ...selected, seoTitle })}
                />
                <LocaleFieldInput
                  label={t.projects.seoDescription}
                  value={selected.seoDescription ?? ls("", "")}
                  onChange={(seoDescription) => updateProject({ ...selected, seoDescription })}
                  multiline
                />
                <FieldHint>{hints.seoDescription}</FieldHint>
              </div>
            </CollapsibleSection>
          </div>
        ) : (
          <EmptyState
            title={t.projects.noProjectSelected}
            description={t.projects.noProjectSelectedDesc}
            action={
              <button
                type="button"
                onClick={addProject}
                className="rounded-lg bg-accent px-4 py-2 text-sm text-background"
              >
                {t.projects.addFirstProject}
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
