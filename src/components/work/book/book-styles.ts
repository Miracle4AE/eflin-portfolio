import type { CollectionBookSettings } from "@/lib/content/types";

export const BOOK_PAPER_CLASSES: Record<
  NonNullable<CollectionBookSettings["paperStyle"]>,
  string
> = {
  ivory: "bg-[#f8f2e8]",
  linen: "bg-[#f3ece3]",
  "warm-white": "bg-[#faf7f2]",
};

export const BOOK_TEXTURE_CLASS =
  "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(121,91,76,0.05),transparent_35%)]";
