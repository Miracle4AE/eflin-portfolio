"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import type { ContentCollection, ContentProject } from "@/lib/content/types";
import type { DeleteCollectionStrategy } from "@/lib/admin/collections";
import {
  adminInputClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-styles";
import { pickLocale } from "@/lib/content/locale-field";
import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";

type DeleteCollectionDialogProps = {
  open: boolean;
  collection: ContentCollection | null;
  collections: ContentCollection[];
  projects: ContentProject[];
  onClose: () => void;
  onConfirm: (strategy: DeleteCollectionStrategy) => void;
};

export function DeleteCollectionDialog({
  open,
  collection,
  collections,
  projects,
  onClose,
  onConfirm,
}: DeleteCollectionDialogProps) {
  const { locale, t } = useAdminI18n();
  const [mounted, setMounted] = useState(false);
  const [strategy, setStrategy] = useState<DeleteCollectionStrategy["type"]>("delete-empty");
  const remainingCollections = useMemo(
    () => collections.filter((item) => item.id !== collection?.id),
    [collection?.id, collections],
  );
  const [targetCollectionId, setTargetCollectionId] = useState("");
  const projectCount = collection
    ? projects.filter((project) => project.collectionId === collection.id).length
    : 0;
  const isLastCollection = collections.length <= 1;
  const canMoveToOther = collection?.id !== "other";
  const wouldLeaveNoCollection = isLastCollection && (projectCount === 0 || !canMoveToOther);
  const canConfirm =
    !wouldLeaveNoCollection &&
    (projectCount === 0 ||
      (strategy === "move-to-other" && canMoveToOther) ||
      (strategy === "move-to-collection" && Boolean(targetCollectionId)));

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    setStrategy(projectCount > 0 ? (canMoveToOther ? "move-to-other" : "move-to-collection") : "delete-empty");
    setTargetCollectionId("");
  }, [canMoveToOther, open, projectCount]);

  function handleDelete() {
    if (!collection) return;
    if (!canConfirm) return;
    if (projectCount === 0) {
      onConfirm({ type: "delete-empty" });
      return;
    }
    if (strategy === "move-to-collection") {
      if (!targetCollectionId) return;
      onConfirm({ type: "move-to-collection", targetCollectionId });
      return;
    }
    onConfirm({ type: "move-to-other" });
  }

  if (!open || !mounted || !collection) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm lg:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={t.collections.deleteTitle}
      onClick={() => onClose()}
    >
      <div
        className="w-full max-w-xl rounded-[1.5rem] border border-border-soft bg-surface p-6 shadow-[0_30px_100px_rgba(61,56,52,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[10px] uppercase tracking-[0.24em] text-accent">
          {t.collections.dangerZone}
        </p>
        <h2 className="mt-3 font-display text-3xl font-light text-foreground">
          {t.collections.deleteTitle}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">{t.collections.deleteDescription}</p>
        <p className="mt-3 text-sm leading-7 text-muted">
          {t.collections.deleteProjectCount.replace("{count}", String(projectCount))}
        </p>
        {wouldLeaveNoCollection ? (
          <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {t.collections.atLeastOneCollection}
          </div>
        ) : null}

        {projectCount > 0 && !wouldLeaveNoCollection ? (
          <div className="mt-6 space-y-3">
            <label className="flex gap-3 rounded-2xl border border-border-soft bg-background/45 p-4 text-sm">
              <input
                type="radio"
                checked={strategy === "move-to-other"}
                onChange={() => setStrategy("move-to-other")}
                disabled={!canMoveToOther}
              />
              <span>
                <span className="block text-foreground">{t.collections.moveToOther}</span>
                <span className="text-xs text-muted">
                  {canMoveToOther ? t.collections.moveToOtherHint : t.collections.noTargetCollection}
                </span>
              </span>
            </label>

            <label className="rounded-2xl border border-border-soft bg-background/45 p-4 text-sm">
              <span className="flex gap-3">
                <input
                  type="radio"
                  checked={strategy === "move-to-collection"}
                  onChange={() => setStrategy("move-to-collection")}
                  disabled={remainingCollections.length === 0}
                />
                <span className="text-foreground">{t.collections.moveToSelected}</span>
              </span>
              <select
                value={targetCollectionId}
                onChange={(event) => setTargetCollectionId(event.target.value)}
                disabled={strategy !== "move-to-collection"}
                className={`${adminInputClass()} mt-3`}
              >
                <option value="">{t.collections.selectTargetCollection}</option>
                {remainingCollections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {pickLocale(item.title, locale)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => onClose()} className={adminSecondaryButtonClass()}>
            {t.common.discard}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canConfirm}
            className="rounded-lg border border-red-300/25 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-400/35 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t.collections.confirmDelete}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
