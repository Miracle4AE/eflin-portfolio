"use client";

import type { Toast } from "@/components/admin/AdminContentContext";

export function AdminToasts({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 text-sm shadow-xl ${
            toast.type === "success"
              ? "border-taupe/30 bg-linen text-foreground"
              : toast.type === "error"
                ? "border-error/30 bg-accent/5 text-error"
                : "border-border bg-surface text-foreground"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-muted hover:text-foreground"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
