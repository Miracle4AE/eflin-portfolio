"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { fadeUp, defaultViewport } from "@/lib/motion";

interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={fadeUp}
      className={cn(
        "mb-16 md:mb-24",
        align === "center" && "text-center",
        className,
      )}
    >
      <MaskReveal className="mb-4">
        <span className="block text-xs font-medium uppercase tracking-[0.3em] text-accent">
          {label}
        </span>
      </MaskReveal>
      <TextReveal
        as="h2"
        text={title}
        className="font-display text-4xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl"
      />
      {description && (
        <TextReveal
          as="p"
          text={description}
          delay={0.15}
          className={cn(
            "mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg",
            align === "center" && "mx-auto",
          )}
        />
      )}
    </motion.div>
  );
}
