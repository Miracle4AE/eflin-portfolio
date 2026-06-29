"use client";

import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

type PreviewLinksProps = {
  homepage?: boolean;
  work?: boolean;
  projectSlug?: string;
  compact?: boolean;
};

export function PreviewLinks({
  homepage = false,
  work = false,
  projectSlug,
  compact = false,
}: PreviewLinksProps) {
  const t = useAdminT();
  const links: { href: string; label: string }[] = [];

  if (homepage) {
    links.push({ href: "/en", label: t.preview.homepageEn });
    links.push({ href: "/tr", label: t.preview.homepageTr });
  }
  if (work) {
    links.push({ href: "/en/work", label: t.preview.workEn });
    links.push({ href: "/tr/work", label: t.preview.workTr });
  }
  if (projectSlug) {
    links.push({ href: `/en/work/${projectSlug}`, label: t.preview.projectEn });
    links.push({ href: `/tr/work/${projectSlug}`, label: t.preview.projectTr });
  }

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-3"}`}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-accent hover:border-accent"
        >
          {t.preview.preview} {link.label} ↗
        </a>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-8 py-12 text-center">
      <h3 className="text-lg font-light text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
