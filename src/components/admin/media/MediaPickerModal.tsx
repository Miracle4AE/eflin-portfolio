"use client";

import { useEffect, useState } from "react";
import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";
import type { MediaFileType } from "@/lib/admin/media.constants";
import type { MediaPickerFilter } from "@/components/admin/media/MediaPickerContext";
import type { MediaFile } from "@/lib/admin/media.types";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

type TypeFilter = MediaFileType | "all";

type MediaPickerModalProps = {
  open: boolean;
  filter: MediaPickerFilter;
  files: MediaFile[];
  projectSlugs: string[];
  onClose: () => void;
  onSelect: (path: string) => void;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPickerModal({
  open,
  filter,
  files,
  projectSlugs,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const t = useAdminT();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(filter.type ?? "all");
  const [projectFilter, setProjectFilter] = useState(filter.projectSlug ?? "all");
  const [query, setQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (open) {
      setTypeFilter(filter.type ?? "all");
      setProjectFilter(filter.projectSlug ?? "all");
      setQuery("");
      setShowUpload(false);
    }
  }, [open, filter]);

  const typeLabels: Record<MediaFileType | "all", string> = {
    all: t.media.allTypes,
    portrait: t.media.portrait,
    cover: t.media.cover,
    hero: t.media.hero,
    gallery: t.media.gallery,
    other: t.media.other,
  };

  const filtered = files.filter((file) => {
    if (typeFilter !== "all" && file.type !== typeFilter) return false;
    if (projectFilter !== "all" && file.projectSlug !== projectFilter) return false;
    if (query && !file.path.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-border-soft bg-surface">
        <div className="flex items-center justify-between border-b border-border-soft px-6 py-4">
          <div>
            <h2 className="text-lg font-light text-foreground">{t.media.chooseFromLibrary}</h2>
            <p className="text-sm text-muted">{t.media.chooseFromLibraryDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUpload((value) => !value)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-accent"
            >
              {showUpload ? t.media.hideUpload : t.media.uploadImage}
            </button>
            <button type="button" onClick={onClose} className="text-sm text-muted hover:text-foreground">
              {t.common.close}
            </button>
          </div>
        </div>

        {showUpload ? (
          <div className="border-b border-border-soft px-6 py-4">
            <MediaUploadPanel
              compact
              projectSlugs={projectSlugs}
              defaultProjectSlug={projectFilter !== "all" ? projectFilter : undefined}
              onUploaded={(path) => {
                onSelect(path);
              }}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 border-b border-border-soft px-6 py-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {(Object.keys(typeLabels) as (MediaFileType | "all")[]).map((key) => (
              <option key={key} value={key}>
                {typeLabels[key]}
              </option>
            ))}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">{t.media.allProjects}</option>
            {projectSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.media.searchPath}
            className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted">{t.media.noImagesMatch}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => onSelect(file.path)}
                  className="overflow-hidden rounded-xl border border-border-soft bg-background text-left transition hover:border-accent"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-greige">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={file.path} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm text-foreground">{file.filename}</p>
                    <p className="truncate text-xs text-muted">{file.path}</p>
                    <p className="text-xs text-muted">
                      {formatBytes(file.size)}
                      {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
                      {" · "}
                      {file.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
