"use client";

import { useMemo, useState } from "react";
import type { ContentCollection } from "@/lib/content/types";
import { useAdminContent } from "@/components/admin/AdminContentContext";
import { AdminImagePreview } from "@/components/admin/media/AdminImagePreview";
import { CollectionModal } from "@/components/admin/collections/CollectionModal";
import { DeleteCollectionDialog } from "@/components/admin/collections/DeleteCollectionDialog";
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from "@/components/admin/admin-styles";
import {
  deleteCollectionAndReassignProjects,
  reorderCollections,
  type DeleteCollectionStrategy,
} from "@/lib/admin/collections";
import { pickLocale } from "@/lib/content/locale-field";
import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";
import { cn } from "@/lib/utils";

function formatDate(value: string, locale: "tr" | "en"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function completionBadge(collection: ContentCollection): "complete" | "partial" {
  return collection.title.en.trim() &&
    collection.title.tr.trim() &&
    collection.description.en.trim() &&
    collection.description.tr.trim() &&
    collection.slug.en.trim() &&
    collection.slug.tr.trim()
    ? "complete"
    : "partial";
}

export function AdminCollectionsSection() {
  const { locale, t } = useAdminI18n();
  const { content, setContent } = useAdminContent();
  const [editingCollection, setEditingCollection] = useState<ContentCollection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<ContentCollection | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const sortedCollections = useMemo(
    () => [...content.collections].sort((a, b) => a.order - b.order),
    [content.collections],
  );
  const projectCounts = useMemo(() => {
    const map = new Map<string, number>();
    content.projects.forEach((project) => {
      if (!project.collectionId) return;
      map.set(project.collectionId, (map.get(project.collectionId) ?? 0) + 1);
    });
    return map;
  }, [content.projects]);

  function upsertCollection(collection: ContentCollection) {
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

  function openCreate() {
    setEditingCollection(null);
    setModalOpen(true);
  }

  function openEdit(collection: ContentCollection) {
    setEditingCollection(collection);
    setModalOpen(true);
  }

  function handleDelete(strategy: DeleteCollectionStrategy) {
    if (!deletingCollection) return;
    deleteCollection(deletingCollection, strategy);
    setDeletingCollection(null);
  }

  function deleteCollection(collection: ContentCollection, strategy: DeleteCollectionStrategy) {
    setContent((current) => ({
      ...current,
      ...deleteCollectionAndReassignProjects({
        collections: current.collections,
        projects: current.projects,
        collectionId: collection.id,
        strategy,
      }),
    }));
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null) return;
    setContent((current) => ({
      ...current,
      collections: reorderCollections(current.collections, dragIndex, dropIndex),
    }));
    setDragIndex(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-accent">
            {t.collections.cmsEyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-light">{t.collections.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t.collections.subtitle}
          </p>
        </div>
        <button type="button" onClick={openCreate} className={adminPrimaryButtonClass()}>
          {t.collections.newCollection}
        </button>
      </div>

      <div className="grid gap-4">
        {sortedCollections.map((collection, index) => {
          const count = projectCounts.get(collection.id) ?? 0;
          const completed = completionBadge(collection) === "complete";
          return (
            <article
              key={collection.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={cn(
                "group grid gap-4 rounded-[1.5rem] border border-border-soft bg-surface/85 p-4 shadow-[0_18px_60px_rgba(81,57,45,0.06)] transition-all duration-300 md:grid-cols-[180px_1fr_auto]",
                dragIndex === index && "border-accent/40 opacity-60",
              )}
            >
              <AdminImagePreview
                src={collection.coverImage}
                alt={pickLocale(collection.title, locale)}
                className="h-36 rounded-[1.1rem]"
                placeholderLabel={t.collections.noCover}
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-2xl font-light text-foreground">
                    {pickLocale(collection.title, locale) || t.collections.untitled}
                  </h3>
                  {collection.featured ? (
                    <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-accent">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                  Slug: {pickLocale(collection.slug, locale)}
                </p>
                <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-muted">
                  {pickLocale(collection.description, locale) ||
                    t.collections.descriptionPlaceholder}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border-soft bg-background/60 px-3 py-1 text-xs text-muted">
                    {count} {t.collections.projects}
                  </span>
                  <span className="rounded-full border border-border-soft bg-background/60 px-3 py-1 text-xs text-muted">
                    {t.collections.updated}: {formatDate(collection.updatedAt, locale)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      completed
                        ? "border-green-400/25 bg-green-400/10 text-green-700"
                        : "border-amber-400/30 bg-amber-400/10 text-amber-700",
                    )}
                  >
                    {completed ? t.collections.localeComplete : t.collections.localePartial}
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs",
                      collection.coverImage
                        ? "border-green-400/25 bg-green-400/10 text-green-700"
                        : "border-border-soft bg-background/60 text-muted",
                    )}
                  >
                    {collection.coverImage ? t.collections.coverReady : t.collections.coverMissing}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-stretch">
                <button
                  type="button"
                  onClick={() => openEdit(collection)}
                  className={adminSecondaryButtonClass()}
                >
                  {t.collections.edit}
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingCollection(collection)}
                  className="rounded-lg border border-red-300/25 px-3 py-2 text-sm text-red-500 transition hover:bg-red-400/10"
                >
                  {t.collections.delete}
                </button>
                <span className="cursor-grab rounded-lg border border-border-soft px-3 py-2 text-center text-sm text-muted active:cursor-grabbing">
                  ≡≡ {t.collections.drag}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <CollectionModal
        open={modalOpen}
        collections={content.collections}
        collection={editingCollection}
        projects={content.projects}
        onClose={() => setModalOpen(false)}
        onSave={upsertCollection}
        onDelete={deleteCollection}
      />
      <DeleteCollectionDialog
        open={Boolean(deletingCollection)}
        collection={deletingCollection}
        collections={content.collections}
        projects={content.projects}
        onClose={() => setDeletingCollection(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
