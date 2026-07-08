"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useVisualEdit, useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";

type EditTextModalProps = {
  open: boolean;
  label: string;
  value: string;
  multiline?: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
};

export function EditTextModal({
  open,
  label,
  value,
  multiline = false,
  onClose,
  onSave,
}: EditTextModalProps) {
  const [draft, setDraft] = useState(value);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-background/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={() => onClose()}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-editorial)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.18em] text-accent">{label}</p>
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            className="mt-3 min-h-40 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25"
          />
        )}
        <p className="mt-2 text-[10px] tabular-nums text-muted">{draft.length} chars</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onClose()}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "div", "blockquote"]);

type EditableTextProps = {
  fieldPath: string;
  value: string;
  label: string;
  multiline?: boolean;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div" | "blockquote";
};

export function EditableText({
  fieldPath,
  value,
  label,
  multiline = false,
  className,
  as: Tag = "span",
}: EditableTextProps) {
  const { updateField } = useVisualEdit();
  const [open, setOpen] = useState(false);
  const display = value.trim() || "—";
  const isBlockTag = BLOCK_TAGS.has(Tag);

  const editButton = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="visual-edit-badge"
      aria-label={`Edit ${label}`}
    >
      Edit
    </button>
  );

  const modal = (
    <EditTextModal
      open={open}
      label={label}
      value={value}
      multiline={multiline}
      onClose={() => setOpen(false)}
      onSave={(next) => updateField(fieldPath, next)}
    />
  );

  if (isBlockTag) {
    return (
      <>
        <Tag className={cn("group/visual-edit relative max-w-full whitespace-pre-wrap", className)}>
          {display}
          {editButton}
        </Tag>
        {modal}
      </>
    );
  }

  return (
    <>
      <span className="group/visual-edit relative inline-block max-w-full align-baseline">
        <Tag className={cn(className, "whitespace-pre-wrap")}>{display}</Tag>
        {editButton}
      </span>
      {modal}
    </>
  );
}

export function VisualField({
  fieldPath,
  value,
  label,
  multiline,
  className,
  as,
  children,
}: EditableTextProps & { children?: React.ReactNode }) {
  const edit = useVisualEditOptional();
  if (!edit) {
    if (children !== undefined) return <>{children}</>;
    if (as) {
      const Tag = as;
      return <Tag className={className}>{value}</Tag>;
    }
    return <>{value}</>;
  }
  return (
    <EditableText
      fieldPath={fieldPath}
      value={value}
      label={label}
      multiline={multiline}
      className={className}
      as={as}
    />
  );
}

