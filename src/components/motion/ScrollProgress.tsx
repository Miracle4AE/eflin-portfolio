"use client";

import { useScroll, useSpring, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function ScrollProgress() {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  if (reducedMotion) {
    return (
      <div
        className="pointer-events-none fixed left-0 top-0 z-[60] h-px w-full origin-left bg-accent/80 opacity-0"
        aria-hidden="true"
      />
    );
  }

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[60] h-px w-full origin-left bg-accent/80"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
