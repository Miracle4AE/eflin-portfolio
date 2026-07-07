"use client";

import { useEffect, useState } from "react";
import type { CursorVariant } from "@/components/motion/CustomCursor";

type CursorAttribute = { "data-cursor"?: CursorVariant };

export function useMountedCursor(variant?: CursorVariant | null): CursorAttribute {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && variant ? { "data-cursor": variant } : {};
}
