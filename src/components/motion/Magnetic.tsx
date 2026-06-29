"use client";

import { useRef, useCallback, type ReactNode, type MouseEvent } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}

export function Magnetic({
  children,
  className,
  strength = 0.25,
  radius = 140,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const x = useSpring(0, { stiffness: 200, damping: 20, mass: 0.6 });
  const y = useSpring(0, { stiffness: 200, damping: 20, mass: 0.6 });

  const handleMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance > radius) {
        x.set(0);
        y.set(0);
        return;
      }

      const pull = 1 - distance / radius;
      x.set(distanceX * strength * pull);
      y.set(distanceY * strength * pull);
    },
    [reducedMotion, radius, strength, x, y],
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}
