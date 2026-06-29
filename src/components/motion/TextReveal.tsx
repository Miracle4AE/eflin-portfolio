"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  staggerText,
  textWord,
  defaultViewport,
  DURATION,
  easeOutExpo,
} from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

type TextRevealElement = "h1" | "h2" | "h3" | "p" | "span";

interface TextRevealProps {
  text: string;
  as?: TextRevealElement;
  className?: string;
  delay?: number;
  once?: boolean;
  ariaLabel?: string;
}

export function TextReveal({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  once = true,
  ariaLabel,
}: TextRevealProps) {
  const reducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (reducedMotion) {
    return (
      <Tag className={className} aria-label={ariaLabel}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      className={cn("overflow-hidden", className)}
      aria-label={ariaLabel ?? text}
    >
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ ...defaultViewport, once }}
        variants={staggerText}
        transition={{ delayChildren: delay }}
        className="inline"
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden">
            <motion.span variants={textWord} className="inline-block">
              {word}
              {index < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

interface TextRevealInstantProps {
  text: string;
  as?: TextRevealElement;
  className?: string;
  delay?: number;
  ariaLabel?: string;
}

/** Mount-time text reveal for hero sections (no viewport trigger) */
export function TextRevealInstant({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  ariaLabel,
}: TextRevealInstantProps) {
  const reducedMotion = useReducedMotion();
  const words = text.split(" ");

  if (reducedMotion) {
    return (
      <Tag className={className} aria-label={ariaLabel}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={cn("overflow-hidden", className)} aria-label={ariaLabel ?? text}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={staggerText}
        transition={{ delayChildren: delay }}
        className="inline"
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block overflow-hidden">
            <motion.span variants={textWord} className="inline-block">
              {word}
              {index < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

export function LineReveal({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={cn("h-px bg-accent/60", className)} aria-hidden="true" />;
  }

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={defaultViewport}
      transition={{ duration: DURATION.reveal, delay, ease: easeOutExpo }}
      className={cn("h-px origin-left bg-accent/60", className)}
      aria-hidden="true"
    />
  );
}
