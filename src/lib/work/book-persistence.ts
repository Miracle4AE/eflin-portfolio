export type BookPersistedState = {
  isOpen: boolean;
  spreadIndex: number;
  mobilePageSide: 0 | 1;
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
  const side = state?.mobilePageSide === 1 ? 1 : 0;
  return {
    isOpen: Boolean(state?.isOpen),
    spreadIndex: clampIndex(state?.spreadIndex ?? 0, spreadMax),
    mobilePageSide: side,
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
      spreadIndex,
      mobilePageSide: parsed.mobilePageSide === 1 ? 1 : 0,
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

  const spreadIndex = spread ? Number(spread) : page ? Math.floor(Number(page) / 2) : undefined;
  const mobilePageSide =
    page && Number.isFinite(Number(page)) ? (Number(page) % 2 === 1 ? 1 : 0) : undefined;

  return {
    isOpen: open === "open",
    spreadIndex,
    mobilePageSide: mobilePageSide === 1 ? 1 : mobilePageSide === 0 ? 0 : undefined,
  };
}

function getUrlSnapshot(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return [
    params.get("book") ?? "",
    params.get("spread") ?? "",
    params.get("page") ?? "",
  ].join("|");
}

export function persistBookState(collectionId: string, state: BookPersistedState): void {
  writeBookState(collectionId, state);

  if (typeof window === "undefined") return;

  const flatPage = state.spreadIndex * 2 + state.mobilePageSide;
  const nextSnapshot = state.isOpen
    ? `open|${state.spreadIndex}|${flatPage}`
    : `||`;

  const currentSnapshot = getUrlSnapshot();
  if (currentSnapshot === nextSnapshot) return;

  const url = new URL(window.location.href);
  if (state.isOpen) {
    url.searchParams.set("book", "open");
    url.searchParams.set("spread", String(state.spreadIndex));
    url.searchParams.set("page", String(flatPage));
  } else {
    url.searchParams.delete("book");
    url.searchParams.delete("spread");
    url.searchParams.delete("page");
  }

  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function restoreBookState(
  collectionId: string,
  spreadMax: number,
): BookPersistedState | null {
  const urlState = readBookStateFromUrl();
  const stored = readBookState(collectionId);
  const raw = urlState ?? stored;
  if (!raw) return null;
  return clampBookState(raw, spreadMax);
}
