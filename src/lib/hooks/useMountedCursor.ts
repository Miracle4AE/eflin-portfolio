"use client";

import { useCallback, useEffect, useRef } from "react";
import type { CursorVariant } from "@/components/motion/CustomCursor";

type CursorAttribute<T extends HTMLElement = HTMLElement> = {
  ref?: (node: T | null) => void;
};

export function useMountedCursor<T extends HTMLElement = HTMLElement>(
  variant?: CursorVariant | null,
): CursorAttribute<T> {
  const nodeRef = useRef<T | null>(null);

  const ref = useCallback((node: T | null) => {
    if (nodeRef.current && nodeRef.current !== node) {
      nodeRef.current.removeAttribute("data-cursor");
    }
    nodeRef.current = node;
  }, []);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || !variant) return;

    node.setAttribute("data-cursor", variant);
    return () => {
      node.removeAttribute("data-cursor");
    };
  }, [variant]);

  return variant ? { ref } : {};
}
