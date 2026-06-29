"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface ParallaxBlockProps {
  children: ReactNode;
  className?: string;
  offset?: number;
  scale?: boolean;
}

export function ParallaxBlock({
  children,
  className,
  offset = 40,
  scale = false,
}: ParallaxBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1, 1.02]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={{
          y,
          ...(scale ? { scale: scaleValue } : {}),
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
