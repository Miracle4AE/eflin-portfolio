"use client";

import { motion } from "framer-motion";
import { pageEnter } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageEnter}
      className="will-change-[opacity,transform]"
    >
      {children}
    </motion.div>
  );
}
