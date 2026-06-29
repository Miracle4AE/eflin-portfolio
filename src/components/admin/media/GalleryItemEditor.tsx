"use client";

import type { ContentGalleryItem, ContentProject } from "@/lib/content/types";
import { LocaleFieldInput } from "@/components/admin/LocaleFieldInput";
import { ImagePathField, imageFilter } from "@/components/admin/media/ImagePathField";
import { ls } from "@/lib/content/locale-field";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

type GalleryItemEditorProps = {
  project: ContentProject;
  item: ContentGalleryItem;
  index: number;
  total: number;
  onChange: (galleryItems: ContentGalleryItem[]) => void;
};

export function GalleryItemEditor({
  project,
  item,
  index,
  total,
  onChange,
}: GalleryItemEditorProps) {
  const t = useAdminT();
  const galleryItems = project.galleryItems;

  function updateItem(patch: Partial<ContentGalleryItem>) {
    onChange(galleryItems.map((g) => (g.id === item.id ? { ...g, ...patch } : g)));
  }

  function removeItem() {
    onChange(galleryItems.filter((g) => g.id !== item.id));
  }

  function moveItem(direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= total) return;
    const next = [...galleryItems];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="rounded-xl border border-border-soft p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {t.projects.galleryItem} {index + 1}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => moveItem(-1)}
            className="rounded border px-2 py-1 text-xs"
            aria-label={t.projects.moveUp}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveItem(1)}
            className="rounded border px-2 py-1 text-xs"
            aria-label={t.projects.moveDown}
          >
            ↓
          </button>
          <button type="button" onClick={removeItem} className="text-xs text-red-300">
            {t.common.remove}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <ImagePathField
          label={t.projects.image}
          value={item.imagePath ?? ""}
          onChange={(imagePath) => updateItem({ imagePath })}
          pickerFilter={imageFilter("gallery", project.slug)}
        />
      </div>

      <div className="mt-3">
        <LocaleFieldInput
          label={t.projects.caption}
          value={item.caption}
          onChange={(caption) => updateItem({ caption })}
        />
      </div>

      <div className="mt-3">
        <LocaleFieldInput
          label={t.projects.altText}
          value={item.alt}
          onChange={(alt) => updateItem({ alt })}
        />
      </div>
    </div>
  );
}

export function createGalleryItem(project: ContentProject): ContentGalleryItem {
  const nextIndex = project.galleryItems.length + 1;
  return {
    id: `g${nextIndex}`,
    imagePath: "",
    gradient: project.gradient,
    aspectRatio: "landscape",
    caption: ls("", ""),
    alt: ls("", ""),
  };
}
