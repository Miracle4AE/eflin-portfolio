"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import type { ProjectCategory } from "@/types";
import { AdminImagePreview } from "@/components/admin/media/AdminImagePreview";
import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";
import { imageFilter } from "@/components/admin/media/ImagePathField";
import { useMediaPicker } from "@/components/admin/media/MediaPickerContext";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  createProjectDraft,
  getUniqueProjectSlug,
  isValidProjectSlug,
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_LABELS,
  slugifyProjectTitle,
  type CreateProjectDraftInput,
} from "@/lib/admin/create-project";
import type { ContentProject } from "@/lib/content/types";
import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";

type CreateProjectModalProps = {
  open: boolean;
  existingSlugs: string[];
  onClose: () => void;
  onCreate: (project: ContentProject) => void;
};

type ImageField = "cover" | "hero";

function currentYear() {
  return new Date().getFullYear().toString();
}

export function CreateProjectModal({
  open,
  existingSlugs,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const { t, locale } = useAdminI18n();
  const copy = t.visualProjectCreator;
  const { openPicker, projectSlugs } = useMediaPicker();
  const [mounted, setMounted] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploadField, setUploadField] = useState<ImageField | null>(null);
  const [form, setForm] = useState<CreateProjectDraftInput>({
    titleEn: "",
    titleTr: "",
    slug: "",
    filterCategory: "branding",
    year: currentYear(),
    client: "",
    roleEn: "",
    roleTr: "",
    summaryEn: "",
    summaryTr: "",
    coverImagePath: "",
    heroImagePath: "",
    featured: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSlugTouched(false);
    setUploadField(null);
    setForm({
      titleEn: "",
      titleTr: "",
      slug: "",
      filterCategory: "branding",
      year: currentYear(),
      client: "",
      roleEn: "",
      roleTr: "",
      summaryEn: "",
      summaryTr: "",
      coverImagePath: "",
      heroImagePath: "",
      featured: false,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const normalizedSlug = slugifyProjectTitle(form.slug);
  const slugDuplicate = existingSlugs.includes(normalizedSlug);
  const titleMissing = !form.titleEn.trim() && !form.titleTr.trim();
  const slugMissing = !normalizedSlug;
  const slugInvalid = Boolean(normalizedSlug) && !isValidProjectSlug(normalizedSlug);

  const errors = [
    titleMissing ? copy.errors.titleRequired : null,
    slugMissing ? copy.errors.slugRequired : null,
    slugInvalid ? copy.errors.slugInvalid : null,
    slugDuplicate ? copy.errors.slugDuplicate : null,
  ].filter((message): message is string => Boolean(message));

  const uploadProjectSlugs = useMemo(() => {
    const unique = new Set([...projectSlugs, ...existingSlugs, normalizedSlug].filter(Boolean));
    return Array.from(unique);
  }, [existingSlugs, normalizedSlug, projectSlugs]);

  function updateTitle(field: "titleEn" | "titleTr", value: string) {
    setForm((current) => {
      const sourceTitle = field === "titleEn" ? value : current.titleEn || value;
      const nextSlug = slugTouched
        ? current.slug
        : getUniqueProjectSlug(sourceTitle, existingSlugs);
      return { ...current, [field]: value, slug: nextSlug };
    });
  }

  function updateImage(field: ImageField, value: string) {
    setForm((current) => ({
      ...current,
      [field === "cover" ? "coverImagePath" : "heroImagePath"]: value,
    }));
  }

  function chooseImage(field: ImageField) {
    openPicker({
      filter: imageFilter(field, normalizedSlug || undefined),
      onSelect: (path) => updateImage(field, path),
    });
  }

  function handleCreate(asDraft: boolean) {
    if (errors.length > 0) return;
    const project = createProjectDraft({
      ...form,
      slug: normalizedSlug,
      featured: asDraft ? false : form.featured,
    });
    onCreate(project);
    onClose();
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[230] flex items-end justify-center bg-background/75 p-4 backdrop-blur-sm lg:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={copy.modalTitle}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-border-soft bg-surface shadow-[0_30px_100px_rgba(61,56,52,0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-border-soft px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-accent">
              {copy.modalEyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-light text-foreground">
              {copy.modalTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {copy.modalDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-foreground"
          >
            {t.common.close}
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className={adminLabelClass()}>
              {copy.fields.titleTr}
              <input
                value={form.titleTr}
                onChange={(event) => updateTitle("titleTr", event.target.value)}
                className={adminInputClass()}
              />
            </label>
            <label className={adminLabelClass()}>
              {copy.fields.titleEn}
              <input
                value={form.titleEn}
                onChange={(event) => updateTitle("titleEn", event.target.value)}
                className={adminInputClass()}
              />
            </label>
            <label className={adminLabelClass()}>
              {copy.fields.slug}
              <input
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((current) => ({
                    ...current,
                    slug: slugifyProjectTitle(event.target.value),
                  }));
                }}
                className={adminInputClass()}
              />
            </label>
            <label className={adminLabelClass()}>
              {copy.fields.category}
              <select
                value={form.filterCategory}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    filterCategory: event.target.value as ProjectCategory,
                  }))
                }
                className={adminInputClass()}
              >
                {PROJECT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {PROJECT_CATEGORY_LABELS[category][locale]}
                  </option>
                ))}
              </select>
            </label>
            <label className={adminLabelClass()}>
              {copy.fields.year}
              <input
                value={form.year}
                onChange={(event) =>
                  setForm((current) => ({ ...current, year: event.target.value }))
                }
                className={adminInputClass()}
              />
            </label>
            <label className={adminLabelClass()}>
              {copy.fields.client}
              <input
                value={form.client}
                onChange={(event) =>
                  setForm((current) => ({ ...current, client: event.target.value }))
                }
                className={adminInputClass()}
              />
            </label>
            <label className={adminLabelClass()}>
              {copy.fields.roleTr}
              <input
                value={form.roleTr}
                onChange={(event) =>
                  setForm((current) => ({ ...current, roleTr: event.target.value }))
                }
                className={adminInputClass()}
              />
            </label>
            <label className={adminLabelClass()}>
              {copy.fields.roleEn}
              <input
                value={form.roleEn}
                onChange={(event) =>
                  setForm((current) => ({ ...current, roleEn: event.target.value }))
                }
                className={adminInputClass()}
              />
            </label>
            <label className={`${adminLabelClass()} lg:col-span-2`}>
              {copy.fields.summaryTr}
              <textarea
                value={form.summaryTr}
                onChange={(event) =>
                  setForm((current) => ({ ...current, summaryTr: event.target.value }))
                }
                rows={3}
                className={`${adminInputClass()} resize-y`}
              />
            </label>
            <label className={`${adminLabelClass()} lg:col-span-2`}>
              {copy.fields.summaryEn}
              <textarea
                value={form.summaryEn}
                onChange={(event) =>
                  setForm((current) => ({ ...current, summaryEn: event.target.value }))
                }
                rows={3}
                className={`${adminInputClass()} resize-y`}
              />
            </label>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {(["cover", "hero"] as const).map((field) => {
              const value = field === "cover" ? form.coverImagePath : form.heroImagePath;
              return (
                <section
                  key={field}
                  className="rounded-2xl border border-border-soft bg-background/45 p-4"
                >
                  <p className={adminLabelClass()}>
                    {field === "cover" ? copy.fields.coverImage : copy.fields.heroImage}
                  </p>
                  <div className="mt-3 flex gap-4">
                    {value ? (
                      <AdminImagePreview src={value} className="h-24 w-32 shrink-0" />
                    ) : (
                      <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-soft text-xs text-muted">
                        {copy.noImage}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        value={value}
                        onChange={(event) => updateImage(field, event.target.value)}
                        className={adminInputClass()}
                        placeholder="/images/... or /media/..."
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => chooseImage(field)}
                          className={adminSecondaryButtonClass()}
                        >
                          {copy.chooseFromLibrary}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setUploadField((current) => (current === field ? null : field))
                          }
                          className={adminSecondaryButtonClass()}
                        >
                          {uploadField === field ? copy.hideUpload : copy.uploadNew}
                        </button>
                      </div>
                    </div>
                  </div>
                  {uploadField === field ? (
                    <div className="mt-4">
                      <MediaUploadPanel
                        compact
                        projectSlugs={uploadProjectSlugs}
                        defaultProjectSlug={normalizedSlug}
                        defaultDestination={field}
                        onUploaded={(path) => updateImage(field, path)}
                      />
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>

          <label className="mt-6 flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(form.featured)}
              onChange={(event) =>
                setForm((current) => ({ ...current, featured: event.target.checked }))
              }
            />
            {copy.fields.featured}
          </label>

          {errors.length > 0 ? (
            <div className="mt-5 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-border-soft px-6 py-4">
          <button type="button" onClick={onClose} className={adminSecondaryButtonClass()}>
            {t.common.discard}
          </button>
          <button
            type="button"
            onClick={() => handleCreate(true)}
            disabled={errors.length > 0}
            className={adminSecondaryButtonClass()}
          >
            {copy.createDraft}
          </button>
          <button
            type="button"
            onClick={() => handleCreate(false)}
            disabled={errors.length > 0}
            className={adminPrimaryButtonClass()}
          >
            {copy.create}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
