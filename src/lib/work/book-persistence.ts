export type BookViewMode = "collection" | "project-detail";

export type BookPersistedState = {
  isOpen: boolean;
  viewMode: BookViewMode;
  spreadIndex: number;
  mobilePageSide: 0 | 1;
  activeProjectSlug: string | null;
  collectionSpreadIndex: number;
  collectionMobilePageSide: 0 | 1;
};

export function getBookStorageKey(collectionId: string): string {
  return `eflin-book-state-${collectionId}`;
}

export function clampIndex(value: number, max: number): number {
  if (!Number.isFinite(value) || max < 0) return 0;
  return Math.min(Math.max(0, Math.floor(value)), max);
}

export function clampBookState(
  state: Partial<BookPersistedState> | null,
  spreadMax: number,
): BookPersistedState {
  const viewMode = state?.viewMode === "project-detail" ? "project-detail" : "collection";
  return {
    isOpen: Boolean(state?.isOpen),
    viewMode,
    spreadIndex: clampIndex(state?.spreadIndex ?? 0, spreadMax),
    mobilePageSide: state?.mobilePageSide === 1 ? 1 : 0,
    activeProjectSlug: state?.activeProjectSlug ?? null,
    collectionSpreadIndex: clampIndex(state?.collectionSpreadIndex ?? 0, spreadMax),
    collectionMobilePageSide: state?.collectionMobilePageSide === 1 ? 1 : 0,
  };
}

function sanitizeRestoredState(raw: Partial<BookPersistedState>): BookPersistedState {
  const spreadIndex =
    typeof raw.spreadIndex === "number" && Number.isFinite(raw.spreadIndex)
      ? Math.max(0, Math.floor(raw.spreadIndex))
      : 0;

  return {
    isOpen: Boolean(raw.isOpen),
    viewMode: raw.viewMode === "project-detail" ? "project-detail" : "collection",
    spreadIndex,
    mobilePageSide: raw.mobilePageSide === 1 ? 1 : 0,
    activeProjectSlug: raw.activeProjectSlug ?? null,
    collectionSpreadIndex:
      typeof raw.collectionSpreadIndex === "number" && Number.isFinite(raw.collectionSpreadIndex)
        ? Math.max(0, Math.floor(raw.collectionSpreadIndex))
        : spreadIndex,
    collectionMobilePageSide: raw.collectionMobilePageSide === 1 ? 1 : 0,
  };
}

export function readBookState(collectionId: string): BookPersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(getBookStorageKey(collectionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BookPersistedState> & { pageIndex?: number };
    if (typeof parsed !== "object" || parsed === null) return null;

    const spreadIndex =
      typeof parsed.spreadIndex === "number"
        ? parsed.spreadIndex
        : typeof parsed.pageIndex === "number"
          ? Math.floor(parsed.pageIndex / 2)
          : 0;

    return {
      isOpen: Boolean(parsed.isOpen),
      viewMode: parsed.viewMode === "project-detail" ? "project-detail" : "collection",
      spreadIndex,
      mobilePageSide: parsed.mobilePageSide === 1 ? 1 : 0,
      activeProjectSlug: parsed.activeProjectSlug ?? null,
      collectionSpreadIndex:
        typeof parsed.collectionSpreadIndex === "number" ? parsed.collectionSpreadIndex : spreadIndex,
      collectionMobilePageSide: parsed.collectionMobilePageSide === 1 ? 1 : 0,
    };
  } catch {
    return null;
  }
}

export function writeBookState(collectionId: string, state: BookPersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(getBookStorageKey(collectionId), JSON.stringify(state));
  } catch {
    // Ignore quota or privacy errors.
  }
}

export function readBookStateFromUrl(): Partial<BookPersistedState> | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const spread = params.get("spread");
  const page = params.get("page");
  const open = params.get("book");
  const mode = params.get("mode");
  const project = params.get("project");

  if (!spread && !page && open !== "open" && !mode && !project) return null;

  const spreadIndex = spread ? Number(spread) : page ? Math.floor(Number(page) / 2) : undefined;
  const mobilePageSide =
    page && Number.isFinite(Number(page)) ? (Number(page) % 2 === 1 ? 1 : 0) : undefined;

  return {
    isOpen: open === "open",
    viewMode: mode === "detail" ? "project-detail" : mode === "collection" ? "collection" : undefined,
    spreadIndex,
    mobilePageSide: mobilePageSide === 1 ? 1 : mobilePageSide === 0 ? 0 : undefined,
    activeProjectSlug: project ?? undefined,
  };
}

function getUrlSnapshot(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return [
    params.get("book") ?? "",
    params.get("mode") ?? "",
    params.get("project") ?? "",
    params.get("spread") ?? "",
    params.get("page") ?? "",
  ].join("|");
}

export function persistBookState(collectionId: string, state: BookPersistedState): void {
  writeBookState(collectionId, state);

  if (typeof window === "undefined") return;

  const flatPage = state.spreadIndex * 2 + state.mobilePageSide;
  const nextSnapshot = state.isOpen
    ? `open|${state.viewMode === "project-detail" ? "detail" : "collection"}|${state.activeProjectSlug ?? ""}|${state.spreadIndex}|${flatPage}`
    : `||||`;

  const currentSnapshot = getUrlSnapshot();
  if (currentSnapshot === nextSnapshot) return;

  const url = new URL(window.location.href);
  if (state.isOpen) {
    url.searchParams.set("book", "open");
    url.searchParams.set("mode", state.viewMode === "project-detail" ? "detail" : "collection");
    url.searchParams.set("spread", String(state.spreadIndex));
    url.searchParams.set("page", String(flatPage));
    if (state.viewMode === "project-detail" && state.activeProjectSlug) {
      url.searchParams.set("project", state.activeProjectSlug);
    } else {
      url.searchParams.delete("project");
    }
  } else {
    url.searchParams.delete("book");
    url.searchParams.delete("mode");
    url.searchParams.delete("project");
    url.searchParams.delete("spread");
    url.searchParams.delete("page");
  }

  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function restoreBookState(collectionId: string): BookPersistedState | null {
  const urlState = readBookStateFromUrl();
  const stored = readBookState(collectionId);
  const raw = urlState ?? stored;
  if (!raw) return null;
  return sanitizeRestoredState(raw);
}
