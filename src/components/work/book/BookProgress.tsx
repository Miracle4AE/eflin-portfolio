"use client";

type BookProgressProps = {
  current: number;
  total: number;
  projectTitle?: string;
  label: string;
};

export function BookProgress({ current, total, projectTitle, label }: BookProgressProps) {
  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-muted">
        <span>
          {label} {current} / {total}
        </span>
        {projectTitle ? <span className="truncate text-right text-foreground/80">{projectTitle}</span> : null}
      </div>
      <div className="mt-3 h-px overflow-hidden rounded-full bg-border-soft">
        <div
          className="h-full bg-accent/70 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
