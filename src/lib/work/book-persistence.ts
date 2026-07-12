export type BookPersistedState = {
  isOpen: boolean;
  spreadIndex: number;
  pageIndex: number;
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
  pageMax: number,
): BookPersistedState {
  return {
    isOpen: Boolean(state?.isOpen),
    spreadIndex: clampIndex(state?.spreadIndex ?? 0, spreadMax),
    pageIndex: clampIndex(state?.pageIndex ?? 0, pageMax),
  };
}

export function readBookState(collectionId: string): BookPersistedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(getBookStorageKey(collectionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BookPersistedState>;
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      isOpen: Boolean(parsed.isOpen),
      spreadIndex: typeof parsed.spreadIndex === "number" ? parsed.spreadIndex : 0,
      pageIndex: typeof parsed.pageIndex === "number" ? parsed.pageIndex : 0,
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
  if (!spread && !page && open !== "open") return null;
  return {
    isOpen: open === "open",
    spreadIndex: spread ? Number(spread) : undefined,
    pageIndex: page ? Number(page) : undefined,
  };
}

export function writeBookStateToUrl(state: BookPersistedState): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (state.isOpen) {
    url.searchParams.set("book", "open");
    url.searchParams.set("spread", String(state.spreadIndex));
    url.searchParams.set("page", String(state.pageIndex));
  } else {
    url.searchParams.delete("book");
    url.searchParams.delete("spread");
    url.searchParams.delete("page");
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
