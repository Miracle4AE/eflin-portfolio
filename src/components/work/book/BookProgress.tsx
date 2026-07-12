"use client";

type BookProgressProps = {
  current: number;
  total: number;
  projectTitle?: string;
};

export function BookProgress({ current, total, projectTitle }: BookProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const currentLabel = String(current).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <div className="mx-auto w-full max-w-[min(1180px,88vw)]">
      <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.24em] text-muted">
        <span className="tabular-nums text-foreground/75">
          {currentLabel} — {totalLabel}
        </span>
        {projectTitle ? (
          <span className="truncate text-right text-muted/90">{projectTitle}</span>
        ) : null}
      </div>
      <div className="mt-3 h-px overflow-hidden bg-border-soft/80">
        <div
          className="h-full bg-accent/55 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
