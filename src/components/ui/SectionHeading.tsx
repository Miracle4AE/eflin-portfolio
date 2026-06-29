"use client";

import { motion } from "framer-motion";
import { TextReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { fadeUp, defaultViewport } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  editPaths?: {
    label?: string;
    title?: string;
    description?: string;
  };
}

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className,
  editPaths,
}: SectionHeadingProps) {
  const visualEdit = useVisualEditOptional();

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
          {visualEdit && editPaths?.label ? (
            <VisualField fieldPath={editPaths.label} value={label} label="Section label" />
          ) : (
            label
          )}
        </span>
      </MaskReveal>
      {visualEdit && editPaths?.title ? (
        <h2 className="font-display text-4xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
          <VisualField fieldPath={editPaths.title} value={title} label="Section title" />
        </h2>
      ) : (
        <TextReveal
          as="h2"
          text={title}
          className="font-display text-4xl font-light leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl"
        />
      )}
      {description &&
        (visualEdit && editPaths?.description ? (
          <p
            className={cn(
              "mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg",
              align === "center" && "mx-auto",
            )}
          >
            <VisualField
              fieldPath={editPaths.description}
              value={description}
              label="Section description"
              multiline
            />
          </p>
        ) : (
          <TextReveal
            as="p"
            text={description}
            delay={0.15}
            className={cn(
              "mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg",
              align === "center" && "mx-auto",
            )}
          />
        ))}
    </motion.div>
  );
}
