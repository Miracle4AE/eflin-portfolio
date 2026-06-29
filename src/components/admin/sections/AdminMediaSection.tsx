"use client";

import { useMemo, useState } from "react";
import { useAdminContent } from "@/components/admin/AdminContentContext";
import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";
import { useMediaPicker } from "@/components/admin/media/MediaPickerContext";
import { adminSectionClass, adminCardTitle } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import type { MediaFileType } from "@/lib/admin/media.constants";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type AdminMediaSectionProps = {
  contentProjectSlugs?: string[];
};

export function AdminMediaSection({ contentProjectSlugs: slugsProp }: AdminMediaSectionProps = {}) {
  const t = useAdminT();
  const { content } = useAdminContent();
  const contentProjectSlugs = slugsProp ?? content.projects.map((p) => p.slug);
  const { files, projectSlugs, loading, refreshMedia } = useMediaPicker();
  const allProjectSlugs = [...new Set([...projectSlugs, ...contentProjectSlugs])].sort();
  const [typeFilter, setTypeFilter] = useState<MediaFileType | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const typeLabels: Record<MediaFileType | "all", string> = {
    all: t.media.allTypes,
    portrait: t.media.portrait,
    cover: t.media.cover,
    hero: t.media.hero,
    gallery: t.media.gallery,
    other: t.media.other,
  };

  const filtered = useMemo(() => {
    return files.filter((file) => {
      if (typeFilter !== "all" && file.type !== typeFilter) return false;
      if (projectFilter !== "all" && file.projectSlug !== projectFilter) return false;
      if (query && !file.path.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [files, typeFilter, projectFilter, query]);

  async function copyPath(path: string) {
    await navigator.clipboard.writeText(path);
  }

  async function deleteFile(path: string) {
    if (!window.confirm(t.media.deleteConfirm)) return;
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    const data = await response.json();
    if (!response.ok) {
      window.alert(data.error || t.media.deleteFailed);
      return;
    }
    await refreshMedia();
  }

  return (
    <div className="space-y-6">
      <MediaUploadPanel projectSlugs={allProjectSlugs} />

      <section className={adminSectionClass()}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={adminCardTitle()}>{t.media.library}</h2>
          <button type="button" onClick={() => void refreshMedia()} className="text-sm text-accent">
            {t.common.refresh}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MediaFileType | "all")}
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
            {allProjectSlugs.map((slug) => (
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

        {loading ? (
          <p className="mt-6 text-sm text-muted">{t.media.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-sm text-muted">{t.media.noImages}</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((file) => (
              <article
                key={file.path}
                className="overflow-hidden rounded-xl border border-border-soft bg-background"
              >
                <div className="aspect-[4/3] overflow-hidden bg-greige">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={file.path} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm text-foreground">{file.filename}</p>
                  <p className="truncate text-xs text-muted">{file.path}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(file.size)}
                    {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
                    {" · "}
                    {file.type}
                    {file.projectSlug ? ` · ${file.projectSlug}` : ""}
                    {" · "}
                    {file.source}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void copyPath(file.path)}
                      className="rounded border border-border px-2 py-1 text-xs text-accent"
                    >
                      {t.media.copyPath}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteFile(file.path)}
                      className="rounded border border-border px-2 py-1 text-xs text-muted"
                    >
                      {t.media.deleteImage}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
