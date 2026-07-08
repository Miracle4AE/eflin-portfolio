"use client";

import { useAdminI18n } from "@/i18n/admin/AdminI18nProvider";

const CARD_HEIGHT_CLASS = "h-[520px] min-h-[520px]";

type AddProjectCardProps = {
  onClick: () => void;
};

export function AddProjectCard({ onClick }: AddProjectCardProps) {
  const { t } = useAdminI18n();
  const copy = t.visualProjectCreator;

  return (
    <article className={`group relative ${CARD_HEIGHT_CLASS}`}>
      <button
        type="button"
        onClick={() => onClick()}
        className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed border-accent/25 bg-surface/35 px-6 text-center transition-[transform,border-color,box-shadow,background-color] duration-500 hover:-translate-y-1 hover:border-accent/55 hover:bg-accent/5 hover:shadow-[0_30px_90px_rgba(121,91,76,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/20 bg-background/70 font-display text-6xl font-light leading-none text-accent/70 transition duration-500 group-hover:border-accent/40 group-hover:text-accent"
          aria-hidden="true"
        >
          +
        </span>
        <span className="mt-8 block font-display text-3xl font-light leading-tight text-foreground">
          {copy.cardTitle}
        </span>
        <span className="mt-4 block max-w-xs text-sm leading-relaxed text-muted">
          {copy.cardDescription}
        </span>
        <span className="mt-8 inline-flex rounded-full border border-accent/25 px-5 py-2 text-[10px] font-medium uppercase tracking-[0.2em] text-accent transition duration-300 group-hover:border-accent/50 group-hover:bg-accent/10">
          {copy.cardButton}
        </span>
      </button>
    </article>
  );
}
