"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import type { ContentCollection, ContentProject } from "@/lib/content/types";
import { AdminImagePreview } from "@/components/admin/media/AdminImagePreview";
import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";
import { useMediaPicker } from "@/components/admin/media/MediaPickerContext";
import { DeleteCollectionDialog } from "@/components/admin/collections/DeleteCollectionDialog";
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import {
  collectionFromForm,
  getCollectionFormValues,
  getCollectionValidationErrors,
  slugifyCollectionValue,
  type CollectionFormValues,
  type DeleteCollectionStrategy,
} from "@/lib/admin/collections";
import { resolveWorkCollection } from "@/lib/content/collections";
import { pickLocale } from "@/lib/content/locale-field";
import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";

type CollectionModalProps = {
  open: boolean;
  collections: ContentCollection[];
  collection?: ContentCollection | null;
  projects?: ContentProject[];
  onClose: () => void;
  onSave: (collection: ContentCollection) => void;
  onDelete?: (collection: ContentCollection, strategy: DeleteCollectionStrategy) => void;
};

function PreviewCard({
  values,
  collections,
  collection,
  projectCount,
}: {
  values: CollectionFormValues;
  collections: ContentCollection[];
  collection?: ContentCollection | null;
  projectCount: number;
}) {
  const { locale, t } = useAdminI18n();
  const preview = resolveWorkCollection(
    collectionFromForm(values, collections, collection ?? undefined),
    locale,
  );

  return (
    <div className="sticky top-6 rounded-[1.75rem] border border-border-soft bg-background/55 p-4 shadow-[0_24px_80px_rgba(81,57,45,0.08)]">
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-accent">
        {t.collections.preview}
      </p>
      <div className="overflow-hidden rounded-[1.4rem] border border-border-soft bg-surface">
        <AdminImagePreview
          src={values.coverImage}
          alt={preview.title}
          className="h-48 rounded-none border-0"
          placeholderLabel="Gradient"
        />
        <div className="p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-accent">
            {projectCount} {t.collections.projects}
          </p>
          <h3 className="mt-4 font-display text-3xl font-light leading-tight text-foreground">
            {preview.title || t.collections.untitled}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
            {preview.description || t.collections.descriptionPlaceholder}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CollectionModal({
  open,
  collections,
  collection,
  projects = [],
  onClose,
  onSave,
  onDelete,
}: CollectionModalProps) {
  const { t, locale } = useAdminI18n();
  const { openPicker, projectSlugs } = useMediaPicker();
  const [mounted, setMounted] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState({ en: false, tr: false });
  const [values, setValues] = useState<CollectionFormValues>(() =>
    getCollectionFormValues(collection ?? undefined),
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setValues(getCollectionFormValues(collection ?? undefined));
    setSlugTouched({ en: Boolean(collection), tr: Boolean(collection) });
    setShowUpload(false);
    setDeleteOpen(false);
  }, [collection, open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const errors = useMemo(
    () => getCollectionValidationErrors(values, collections, collection?.id),
    [collection?.id, collections, values],
  );
  const projectCount = collection
    ? projects.filter((project) => project.collectionId === collection.id).length
    : 0;

  function updateTitle(field: "titleEn" | "titleTr", value: string) {
    setValues((current) => {
      const next: CollectionFormValues = { ...current, [field]: value };
      if (field === "titleEn" && !slugTouched.en) {
        next.slugEn = slugifyCollectionValue(value);
      }
      if (field === "titleTr" && !slugTouched.tr) {
        next.slugTr = slugifyCollectionValue(value);
      }
      return next;
    });
  }

  function handleSave() {
    if (errors.length > 0) return;
    onSave(collectionFromForm(values, collections, collection ?? undefined));
    onClose();
  }

  function handleDelete(strategy: DeleteCollectionStrategy) {
    if (!collection || !onDelete) return;
    onDelete(collection, strategy);
    setDeleteOpen(false);
    onClose();
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[240] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm lg:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={collection ? t.collections.editCollection : t.collections.newCollection}
      onClick={() => onClose()}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.75rem] border border-border-soft bg-surface shadow-[0_30px_100px_rgba(61,56,52,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-border-soft px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-accent">
              {t.collections.cmsEyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-light text-foreground">
              {collection ? t.collections.editCollection : t.collections.newCollection}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {t.collections.modalDescription}
            </p>
          </div>
          <button type="button" onClick={() => onClose()} className={adminSecondaryButtonClass()}>
            {t.common.close}
          </button>
        </div>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_360px]">
          <div className="space-y-7 px-6 py-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className={adminLabelClass()}>
                {t.collections.titleTr}
                <input
                  value={values.titleTr}
                  onChange={(event) => updateTitle("titleTr", event.target.value)}
                  className={adminInputClass()}
                />
              </label>
              <label className={adminLabelClass()}>
                {t.collections.titleEn}
                <input
                  value={values.titleEn}
                  onChange={(event) => updateTitle("titleEn", event.target.value)}
                  className={adminInputClass()}
                />
              </label>
              <label className={adminLabelClass()}>
                {t.collections.slugTr}
                <input
                  value={values.slugTr}
                  onChange={(event) => {
                    setSlugTouched((current) => ({ ...current, tr: true }));
                    setValues((current) => ({
                      ...current,
                      slugTr: slugifyCollectionValue(event.target.value),
                    }));
                  }}
                  className={adminInputClass()}
                />
              </label>
              <label className={adminLabelClass()}>
                {t.collections.slugEn}
                <input
                  value={values.slugEn}
                  onChange={(event) => {
                    setSlugTouched((current) => ({ ...current, en: true }));
                    setValues((current) => ({
                      ...current,
                      slugEn: slugifyCollectionValue(event.target.value),
                    }));
                  }}
                  className={adminInputClass()}
                />
              </label>
              <label className={`${adminLabelClass()} md:col-span-2`}>
                {t.collections.descriptionTr}
                <textarea
                  value={values.descriptionTr}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, descriptionTr: event.target.value }))
                  }
                  rows={3}
                  className={`${adminInputClass()} resize-y`}
                />
              </label>
              <label className={`${adminLabelClass()} md:col-span-2`}>
                {t.collections.descriptionEn}
                <textarea
                  value={values.descriptionEn}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, descriptionEn: event.target.value }))
                  }
                  rows={3}
                  className={`${adminInputClass()} resize-y`}
                />
              </label>
            </div>

            <section className="rounded-2xl border border-border-soft bg-background/45 p-4">
              <p className={adminLabelClass()}>{t.collections.coverImage}</p>
              <div className="mt-3 flex gap-4">
                <AdminImagePreview
                  src={values.coverImage}
                  className="h-28 w-40 shrink-0"
                  placeholderLabel={t.collections.noCover}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    value={values.coverImage ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, coverImage: event.target.value }))
                    }
                    className={adminInputClass()}
                    placeholder="/images/... or /media/..."
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openPicker({
                          filter: { type: "all", projectSlug: "all" },
                          onSelect: (path) =>
                            setValues((current) => ({ ...current, coverImage: path })),
                        })
                      }
                      className={adminSecondaryButtonClass()}
                    >
                      {t.collections.chooseImage}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpload((current) => !current)}
                      className={adminSecondaryButtonClass()}
                    >
                      {showUpload ? t.media.hideUpload : t.collections.uploadImage}
                    </button>
                    {values.coverImage ? (
                      <button
                        type="button"
                        onClick={() => setValues((current) => ({ ...current, coverImage: "" }))}
                        className={adminSecondaryButtonClass()}
                      >
                        {t.collections.removeImage}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              {showUpload ? (
                <div className="mt-4">
                  <MediaUploadPanel
                    compact
                    projectSlugs={projectSlugs}
                    defaultDestination="general"
                    onUploaded={(path) =>
                      setValues((current) => ({ ...current, coverImage: path }))
                    }
                  />
                </div>
              ) : null}
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              <label className={adminLabelClass()}>
                {t.collections.seoTitleTr}
                <input
                  value={values.seoTitleTr}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, seoTitleTr: event.target.value }))
                  }
                  className={adminInputClass()}
                />
              </label>
              <label className={adminLabelClass()}>
                {t.collections.seoTitleEn}
                <input
                  value={values.seoTitleEn}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, seoTitleEn: event.target.value }))
                  }
                  className={adminInputClass()}
                />
              </label>
              <label className={`${adminLabelClass()} md:col-span-2`}>
                {t.collections.seoDescriptionTr}
                <textarea
                  value={values.seoDescriptionTr}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      seoDescriptionTr: event.target.value,
                    }))
                  }
                  rows={2}
                  className={`${adminInputClass()} resize-y`}
                />
              </label>
              <label className={`${adminLabelClass()} md:col-span-2`}>
                {t.collections.seoDescriptionEn}
                <textarea
                  value={values.seoDescriptionEn}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      seoDescriptionEn: event.target.value,
                    }))
                  }
                  rows={2}
                  className={`${adminInputClass()} resize-y`}
                />
              </label>
            </div>

            <label className="flex items-center gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(event) =>
                  setValues((current) => ({ ...current, featured: event.target.checked }))
                }
              />
              {t.collections.featured}
            </label>

            {errors.length > 0 ? (
              <div className="rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {errors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="border-t border-border-soft bg-linen/35 px-6 py-6 lg:border-l lg:border-t-0">
            <PreviewCard
              values={values}
              collections={collections}
              collection={collection}
              projectCount={projectCount}
            />
            <div className="mt-5 rounded-2xl border border-border-soft bg-background/60 p-4 text-xs leading-6 text-muted">
              <p>
                <span className="text-foreground">{t.collections.previewSlugTr}:</span>{" "}
                /tr/work/collections/{slugifyCollectionValue(values.slugTr)}
              </p>
              <p>
                <span className="text-foreground">{t.collections.previewSlugEn}:</span>{" "}
                /en/work/collections/{slugifyCollectionValue(values.slugEn)}
              </p>
              <p className="mt-2">
                {t.collections.seoFallback}:{" "}
                {pickLocale(
                  {
                    en: values.seoTitleEn || values.titleEn,
                    tr: values.seoTitleTr || values.titleTr,
                  },
                  locale,
                )}
              </p>
            </div>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-soft px-6 py-4">
          <div>
            {collection && onDelete ? (
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="rounded-lg border border-red-300/25 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-400/35 hover:bg-red-400/15"
              >
                {t.collections.deleteCollection}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => onClose()} className={adminSecondaryButtonClass()}>
              {t.common.discard}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={errors.length > 0}
              className={adminPrimaryButtonClass()}
            >
              {collection ? t.collections.saveChanges : t.collections.create}
            </button>
          </div>
        </div>
      </div>
      <DeleteCollectionDialog
        open={deleteOpen}
        collection={collection ?? null}
        collections={collections}
        projects={projects}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>,
    document.body,
  );
}
