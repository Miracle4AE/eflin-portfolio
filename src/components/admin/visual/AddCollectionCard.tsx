"use client";

import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";

type AddCollectionCardProps = {
  onClick: () => void;
};

export function AddCollectionCard({ onClick }: AddCollectionCardProps) {
  const { t } = useAdminI18n();

  return (
    <article className="h-[520px] min-h-[520px]">
      <button
        type="button"
        onClick={() => onClick()}
        className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-accent/25 bg-[linear-gradient(145deg,rgba(255,250,244,0.72),rgba(244,232,224,0.48))] px-6 text-center transition-[transform,border-color,box-shadow,background-color] duration-500 hover:-translate-y-1 hover:border-accent/55 hover:bg-accent/5 hover:shadow-[0_30px_90px_rgba(121,91,76,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/20 bg-background/70 font-display text-5xl font-light leading-none text-accent/70 transition duration-500"
          aria-hidden="true"
        >
          +
        </span>
        <span className="mt-8 block font-display text-3xl font-light leading-tight text-foreground">
          {t.collections.newCollection}
        </span>
        <span className="mt-4 block max-w-xs text-sm leading-relaxed text-muted">
          {t.collections.subtitle}
        </span>
      </button>
    </article>
  );
}
