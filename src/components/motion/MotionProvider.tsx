"use client";

import { CustomCursor } from "@/components/motion/CustomCursor";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

export function MotionProvider() {
  return (
    <>
      <ScrollProgress />
      <CustomCursor />
    </>
  );
}
