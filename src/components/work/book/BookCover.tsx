"use client";

import { motion } from "framer-motion";
import { ProjectImage } from "@/components/work/ProjectImage";
import { cn } from "@/lib/utils";
import { BOOK_TEXTURE_CLASS } from "@/components/work/book/book-styles";

type BookCoverProps = {
  title: string;
  subtitle?: string;
  description?: string;
  projectCount: number;
  projectsLabel: string;
  coverImage?: string | null;
  coverGradient: string;
  openLabel: string;
  paperClass: string;
  onOpen: () => void;
};

export function BookCover({
  title,
  subtitle,
  description,
  projectCount,
  projectsLabel,
  coverImage,
  coverGradient,
  openLabel,
  paperClass,
  onOpen,
}: BookCoverProps) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mx-auto block w-full max-w-[420px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label={openLabel}
    >
      <div className="absolute inset-x-8 -bottom-5 h-10 rounded-[50%] bg-[rgba(81,57,45,0.14)] blur-2xl transition group-hover:bg-[rgba(81,57,45,0.2)]" />
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.35rem] border border-[#e0d2c6] shadow-[0_28px_90px_rgba(81,57,45,0.16)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_36px_110px_rgba(81,57,45,0.2)]",
          paperClass,
          BOOK_TEXTURE_CLASS,
        )}
      >
        <div className="relative aspect-[3/4] overflow-hidden border-b border-[#e8ddd2]/80">
          <ProjectImage
            src={coverImage}
            alt={title}
            gradient={coverGradient}
            mode="cover"
            className="h-full"
            imageClassName="brightness-[0.96]"
            sizes="(min-width: 768px) 420px, 88vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f2e8]/92 via-[#f8f2e8]/20 to-transparent" />
        </div>
        <div className="px-7 py-8 text-left">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-accent/85">
            {projectCount} {projectsLabel}
          </p>
          <h2 className="mt-4 font-display text-4xl font-light leading-[1.02] tracking-[-0.035em] text-foreground">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">{subtitle}</p>
          ) : null}
          <p className="mt-5 line-clamp-3 text-sm leading-7 text-muted">{description}</p>
          <span className="mt-8 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.24em] text-accent transition group-hover:text-foreground">
            {openLabel}
            <span aria-hidden="true">↗</span>
          </span>
        </div>
      </div>
    </motion.button>
  );
}
