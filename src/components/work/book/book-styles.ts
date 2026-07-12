import type { CollectionBookSettings } from "@/lib/content/types";

export const BOOK_PAPER_CLASSES: Record<
  NonNullable<CollectionBookSettings["paperStyle"]>,
  string
> = {
  ivory: "bg-[#f7f1e7]",
  linen: "bg-[#f2ebe2]",
  "warm-white": "bg-[#faf6f0]",
};

export const BOOK_PAPER_BACK_CLASS = "bg-[#efe6db]";

export const BOOK_TEXTURE_CLASS =
  "bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.52),transparent_42%),radial-gradient(circle_at_82%_6%,rgba(108,82,66,0.05),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%)]";

export const BOOK_PAGE_HEIGHT = "min-h-[clamp(420px,58vh,560px)]";

export const BOOK_STAGE_CLASS =
  "relative mx-auto w-full max-w-[min(1180px,88vw)] [perspective:2600px]";

export const BOOK_SHELL_CLASS =
  "relative rounded-[1.15rem] border border-[#d8c9bb]/75 bg-[linear-gradient(180deg,#ebe2d7,#e3d8cb)] p-[11px] shadow-[0_38px_100px_rgba(48,34,26,0.2),0_10px_28px_rgba(48,34,26,0.1),inset_0_1px_0_rgba(255,255,255,0.35)]";

export const BOOK_BODY_CLASS =
  "relative grid w-full grid-cols-[1fr_26px_1fr] [transform-style:preserve-3d]";

export const BOOK_GUTTER_CLASS = "relative z-20 hidden h-full w-full md:block";

export const BOOK_SHADOW_CLASS =
  "pointer-events-none absolute inset-x-[8%] -bottom-12 h-[4.5rem] rounded-[50%] bg-[rgba(42,30,22,0.18)] blur-[42px]";

export function bookPageSideClass(side: "left" | "right"): string {
  return side === "left"
    ? "rounded-l-[0.8rem] rounded-r-[0.12rem]"
    : "rounded-r-[0.8rem] rounded-l-[0.12rem]";
}

export function bookPageEdgeShadow(side: "left" | "right"): string {
  return side === "left"
    ? "shadow-[inset_-14px_0_28px_rgba(72,54,42,0.06),5px_0_18px_rgba(72,54,42,0.07)]"
    : "shadow-[inset_14px_0_28px_rgba(72,54,42,0.06),-5px_0_18px_rgba(72,54,42,0.07)]";
}
