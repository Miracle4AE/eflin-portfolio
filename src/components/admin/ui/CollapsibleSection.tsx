"use client";

import { useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
};

export function CollapsibleSection({
  title,
  description,
  defaultOpen = true,
  badge,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-border-soft bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-6 py-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-light text-foreground">{title}</h3>
            {badge ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
                {badge}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <span className="text-sm text-muted">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="border-t border-border-soft px-6 py-5">{children}</div> : null}
    </section>
  );
}
