"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function GradientAtmosphere() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -left-1/4 -top-1/4 h-[80vh] w-[80vh] rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vh] rounded-full opacity-20 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, var(--color-foreground) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-40 mix-blend-overlay" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-1/4 -top-1/4 h-[80vh] w-[80vh] rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
        }}
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, 60, -30, 0],
                y: [0, -40, 30, 0],
                scale: [1, 1.1, 0.95, 1],
              }
        }
        transition={{
          duration: 20,
          repeat: reducedMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vh] rounded-full opacity-20 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-foreground) 0%, transparent 70%)",
        }}
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, -50, 40, 0],
                y: [0, 30, -20, 0],
              }
        }
        transition={{
          duration: 25,
          repeat: reducedMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.03%22/%3E%3C/svg%3E')] opacity-40 mix-blend-overlay" />
    </div>
  );
}
