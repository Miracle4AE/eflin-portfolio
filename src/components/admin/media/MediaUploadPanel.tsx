"use client";

import { useRef, useState } from "react";
import type { UploadDestination } from "@/lib/admin/media.constants";
import { AdminImagePreview } from "@/components/admin/media/AdminImagePreview";
import { useMediaPicker } from "@/components/admin/media/MediaPickerContext";
import { adminInputClass, adminLabelClass, adminSectionClass } from "@/components/admin/admin-styles";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";
import { interpolate } from "@/i18n/admin/storage";

type MediaUploadPanelProps = {
  projectSlugs: string[];
  defaultProjectSlug?: string;
  onUploaded?: (publicPath: string) => void;
  compact?: boolean;
};

export function MediaUploadPanel({
  projectSlugs,
  defaultProjectSlug,
  onUploaded,
  compact = false,
}: MediaUploadPanelProps) {
  const t = useAdminT();
  const { uploadEnabled, refreshMedia } = useMediaPicker();
  const inputRef = useRef<HTMLInputElement>(null);
  const [destination, setDestination] = useState<UploadDestination>("gallery");
  const [projectSlug, setProjectSlug] = useState(defaultProjectSlug ?? projectSlugs[0] ?? "");
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastUploadPath, setLastUploadPath] = useState("");

  const needsProject = destination !== "portrait" && destination !== "general";

  async function uploadFile(file: File, overwrite = false) {
    setUploading(true);
    setError("");
    setMessage("");
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("destination", destination);
    if (needsProject) formData.append("projectSlug", projectSlug);
    if (overwrite) formData.append("overwrite", "true");

    try {
      setProgress(40);
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setProgress(100);

      if (!response.ok) {
        if (
          !overwrite &&
          typeof data.error === "string" &&
          data.error.includes("Confirm overwrite")
        ) {
          const confirmed = window.confirm(t.media.overwriteConfirm);
          if (confirmed) {
            setUploading(false);
            setProgress(0);
            await uploadFile(file, true);
            return;
          }
          setError(data.error);
          return;
        }
        setError(data.error || t.media.uploadFailed);
        return;
      }

      setLastUploadPath(data.publicPath);
      setMessage(interpolate(t.media.uploadedTo, { path: data.publicPath }));
      await refreshMedia();
      onUploaded?.(data.publicPath);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 400);
    }
  }

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (file) void uploadFile(file);
  }

  if (!uploadEnabled) {
    return (
      <div className={`${adminSectionClass()} text-sm text-muted`}>
        {t.media.prodUploadDisabled}
      </div>
    );
  }

  const destinationLabels: Record<UploadDestination, string> = {
    portrait: t.media.portrait,
    cover: t.media.projectCover,
    hero: t.media.projectHero,
    gallery: t.media.projectGallery,
    general: t.media.general,
  };

  return (
    <section className={adminSectionClass()}>
      <h3 className="text-lg font-light text-foreground">
        {compact ? t.media.uploadImage : t.media.uploadTitle}
      </h3>
      {!compact ? <p className="mt-2 text-sm text-muted">{t.media.uploadDesc}</p> : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className={adminLabelClass()}>
          {t.media.destination}
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value as UploadDestination)}
            className={adminInputClass()}
          >
            {(Object.keys(destinationLabels) as UploadDestination[]).map((key) => (
              <option key={key} value={key}>
                {destinationLabels[key]}
              </option>
            ))}
          </select>
        </label>
        {needsProject ? (
          <label className={adminLabelClass()}>
            {t.media.projectSlug}
            <select
              value={projectSlug}
              onChange={(e) => setProjectSlug(e.target.value)}
              className={adminInputClass()}
            >
              {projectSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div
        className={`mt-4 rounded-xl border border-dashed px-6 py-10 text-center ${
          dragging ? "border-accent bg-accent/5" : "border-border"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <p className="text-sm text-muted">{t.media.dropFiles}</p>
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {uploading ? t.media.uploading : t.media.uploadImage}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploading || progress > 0 ? (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {lastUploadPath ? (
        <div className="mt-4 flex flex-wrap items-start gap-4 rounded-xl border border-border-soft bg-background p-4">
          <AdminImagePreview src={lastUploadPath} className="h-24 w-32" />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate text-sm text-foreground">{lastUploadPath}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(lastUploadPath)}
                className="rounded border border-border px-2 py-1 text-xs text-accent"
              >
                {t.media.copyPath}
              </button>
              {onUploaded ? (
                <button
                  type="button"
                  onClick={() => onUploaded(lastUploadPath)}
                  className="rounded bg-accent px-2 py-1 text-xs text-background"
                >
                  {t.media.useThisImage}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-taupe">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </section>
  );
}
