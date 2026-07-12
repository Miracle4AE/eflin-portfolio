import type { CollectionBookSettings } from "@/lib/content/types";

export const BOOK_PAPER_CLASSES: Record<
  NonNullable<CollectionBookSettings["paperStyle"]>,
  string
> = {
  ivory: "bg-[#f7f1e7]",
  linen: "bg-[#f2ebe2]",
  "warm-white": "bg-[#faf6f0]",
};

export const BOOK_TEXTURE_CLASS =
  "bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.5),transparent_42%),radial-gradient(circle_at_82%_6%,rgba(108,82,66,0.04),transparent_36%)]";

export const BOOK_PAGE_HEIGHT = "min-h-[clamp(420px,58vh,560px)]";

export const BOOK_STAGE_CLASS =
  "relative mx-auto w-full max-w-[min(1180px,88vw)] [perspective:2400px]";

export const BOOK_SHELL_CLASS =
  "relative rounded-[1.1rem] border border-[#ddd0c3]/70 bg-[#ebe2d7] p-[10px] shadow-[0_34px_90px_rgba(52,36,28,0.18),0_8px_24px_rgba(52,36,28,0.08)]";

export const BOOK_BODY_CLASS =
  "relative grid w-full grid-cols-[1fr_24px_1fr] [transform-style:preserve-3d]";

export const BOOK_GUTTER_CLASS =
  "relative z-20 hidden h-full w-full md:block";

export const BOOK_SHADOW_CLASS =
  "pointer-events-none absolute inset-x-[10%] -bottom-10 h-16 rounded-[50%] bg-[rgba(48,34,26,0.16)] blur-3xl";

export function bookPageSideClass(side: "left" | "right"): string {
  return side === "left"
    ? "rounded-l-[0.75rem] rounded-r-[0.15rem]"
    : "rounded-r-[0.75rem] rounded-l-[0.15rem]";
}

export function bookPageEdgeShadow(side: "left" | "right"): string {
  return side === "left"
    ? "shadow-[inset_-12px_0_24px_rgba(72,54,42,0.05),4px_0_16px_rgba(72,54,42,0.06)]"
    : "shadow-[inset_12px_0_24px_rgba(72,54,42,0.05),-4px_0_16px_rgba(72,54,42,0.06)]";
}
