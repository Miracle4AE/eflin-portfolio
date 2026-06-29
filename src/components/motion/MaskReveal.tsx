"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { maskReveal, imageReveal, defaultViewport } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface MaskRevealProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}

export function MaskReveal({
  children,
  className,
  once = true,
}: MaskRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ ...defaultViewport, once }}
      variants={maskReveal}
      className={cn("overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}

export function ImageReveal({
  children,
  className,
  once = true,
}: ImageRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ ...defaultViewport, once }}
      variants={imageReveal}
      className={cn("overflow-hidden", className)}
    >
      {children}
    </motion.div>
  );
}
