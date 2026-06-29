"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, defaultViewport } from "@/lib/motion";

interface MotionRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
}: MotionRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={variants}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
