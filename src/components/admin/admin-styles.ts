export function adminInputClass() {
  return "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25";
}

export function adminLabelClass() {
  return "block text-xs uppercase tracking-[0.12em] text-muted";
}

export function adminSectionClass() {
  return "rounded-2xl border border-border-soft bg-surface p-6 shadow-[var(--shadow-editorial)]";
}

export function adminCardTitle() {
  return "text-lg font-light text-foreground";
}

export function adminHelpText() {
  return "text-xs text-muted";
}

export function adminPrimaryButtonClass() {
  return "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50";
}

export function adminSecondaryButtonClass() {
  return "rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-muted transition hover:border-foreground/20 hover:bg-linen hover:text-foreground";
}

export const IMAGE_PATH_HELP =
  "Put files under public/images/... then enter the path here (e.g. /images/projects/nocturne/cover.jpg).";
