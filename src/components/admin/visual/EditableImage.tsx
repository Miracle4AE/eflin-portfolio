"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { UploadDestination } from "@/lib/admin/media.constants";
import type { MediaFileType } from "@/lib/admin/media.constants";
import { imageFilter } from "@/components/admin/media/ImagePathField";
import { useMediaPicker } from "@/components/admin/media/MediaPickerContext";
import { useVisualEdit, useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { cn } from "@/lib/utils";

type ImageEditPopoverProps = {
  open: boolean;
  label: string;
  onClose: () => void;
  onPick: () => void;
  onRemove: () => void;
  onUploaded: (path: string) => void;
  pickerType: MediaFileType | "all";
  projectSlug?: string;
};

function ImageEditPopover({
  open,
  label,
  anchorRef,
  onClose,
  onPick,
  onRemove,
  onUploaded,
  pickerType,
  projectSlug,
}: ImageEditPopoverProps & { anchorRef: React.RefObject<HTMLButtonElement | null> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadEnabled, refreshMedia } = useMediaPicker();
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({ top: rect.top + 8, left: rect.left + 8 });
  }, [open, anchorRef]);

  if (!open || !mounted) return null;

  async function uploadFile(file: File) {
    setUploading(true);
    const destination: UploadDestination =
      pickerType === "portrait"
        ? "portrait"
        : pickerType === "cover"
          ? "cover"
          : pickerType === "hero"
            ? "hero"
            : pickerType === "gallery"
              ? "gallery"
              : "general";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("destination", destination);
    if (projectSlug && destination !== "portrait" && destination !== "general") {
      formData.append("projectSlug", projectSlug);
    }

    try {
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.publicPath) {
        await refreshMedia();
        onUploaded(data.publicPath);
        onClose();
      }
    } finally {
      setUploading(false);
    }
  }

  return createPortal(
    <div
      className="fixed z-[200] min-w-[180px] rounded-xl border border-border-soft bg-surface/95 p-3 shadow-[var(--shadow-editorial)] backdrop-blur"
      style={{ top: position.top, left: position.left }}
      onClick={(event) => event.stopPropagation()}
    >
      <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-accent">{label}</p>
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onPick}
          className="rounded-lg border border-border px-3 py-1.5 text-left text-xs hover:border-accent"
        >
          Change image
        </button>
        {uploadEnabled ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-border px-3 py-1.5 text-left text-xs hover:border-accent disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload new"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadFile(file);
                e.target.value = "";
              }}
            />
          </>
        ) : null}
        <button
          type="button"
          onClick={() => {
            onRemove();
            onClose();
          }}
          className="rounded-lg border border-border px-3 py-1.5 text-left text-xs text-error hover:border-red-300/40"
        >
          Remove image
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-left text-xs text-muted"
        >
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}

type EditableImageProps = {
  src?: string | null;
  alt: string;
  label: string;
  fieldPath: string;
  pickerType?: MediaFileType | "all";
  projectSlug?: string;
  allowRemove?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function EditableImage({
  src,
  alt,
  label,
  fieldPath,
  pickerType = "all",
  projectSlug,
  allowRemove = true,
  className,
  children,
}: EditableImageProps) {
  const { updateImage } = useVisualEdit();
  const { openPicker } = useMediaPicker();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={cn("group/visual-image relative", className)}>
      {children}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="visual-edit-image-trigger"
        aria-label={`Edit ${label}`}
      >
        Change image
      </button>
      <ImageEditPopover
        open={open}
        anchorRef={triggerRef}
        label={label}
        onClose={() => setOpen(false)}
        onPick={() =>
          openPicker({
            filter: imageFilter(pickerType, projectSlug),
            onSelect: (path) => {
              updateImage(fieldPath, path);
              setOpen(false);
            },
          })
        }
        onRemove={() => {
          if (allowRemove) updateImage(fieldPath, null);
        }}
        onUploaded={(path) => updateImage(fieldPath, path)}
        pickerType={pickerType}
        projectSlug={projectSlug}
      />
      {!src ? (
        <span className="sr-only">{alt}</span>
      ) : null}
    </div>
  );
}

export function VisualImage({
  fieldPath,
  src,
  alt,
  label,
  pickerType,
  projectSlug,
  allowRemove,
  className,
  children,
}: EditableImageProps) {
  const edit = useVisualEditOptional();
  if (!edit) return <>{children}</>;
  return (
    <EditableImage
      fieldPath={fieldPath}
      src={src}
      alt={alt}
      label={label}
      pickerType={pickerType}
      projectSlug={projectSlug}
      allowRemove={allowRemove}
      className={className}
    >
      {children}
    </EditableImage>
  );
}
