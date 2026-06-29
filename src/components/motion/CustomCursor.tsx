"use client";

import { useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { usePointerFine } from "@/lib/hooks/usePointerFine";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale } from "@/i18n/config";

export type CursorVariant = "default" | "view" | "open" | "contact";

const INTERACTIVE_VARIANTS: CursorVariant[] = ["view", "open", "contact"];

function resolveCursorVariant(target: EventTarget | null): CursorVariant {
  if (!(target instanceof Element)) return "default";

  const interactive = target.closest("[data-cursor]");
  if (interactive instanceof HTMLElement && interactive.dataset.cursor) {
    const value = interactive.dataset.cursor as CursorVariant;
    if (value in CURSOR_LABEL_KEYS) return value;
  }

  if (target.closest("a, button, [role='button']")) return "view";

  return "default";
}

const CURSOR_LABEL_KEYS: Record<CursorVariant, keyof ReturnType<typeof getDictionary>["cursor"] | null> = {
  default: null,
  view: "view",
  open: "open",
  contact: "contact",
};

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

function CursorArrow({ className }: { className?: string }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.5 4.5V22.5L10.5 18.5H14.5L17.5 25.5L19.5 24.5L16.5 17.5H21.5L6.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const pathname = usePathname();

  const labels = useMemo(() => {
    const segment = pathname.split("/")[1];
    const locale = isLocale(segment) ? segment : defaultLocale;
    return getDictionary(locale).cursor;
  }, [pathname]);

  const rootRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const posRef = useRef({ x: -100, y: -100 });
  const dotPosRef = useRef({ x: -100, y: -100 });
  const trailPosRef = useRef({ x: -100, y: -100 });
  const lastPosRef = useRef({ x: -100, y: -100 });
  const variantRef = useRef<CursorVariant>("default");
  const movingRef = useRef(false);
  const visibleRef = useRef(false);
  const pressedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const moveStopTimerRef = useRef<number | null>(null);

  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  const enabled = pointerFine;
  const animateMotion = enabled && !reducedMotion;

  useEffect(() => {
    const siteShell = document.querySelector(".site-shell");

    if (!enabled || !siteShell) {
      siteShell?.classList.remove("custom-cursor-active");
      return;
    }

    siteShell.classList.add("custom-cursor-active");

    const applyVariant = (variant: CursorVariant) => {
      variantRef.current = variant;
      const root = rootRef.current;
      const label = labelRef.current;
      const ring = ringRef.current;
      if (!root) return;

      const isInteractive = INTERACTIVE_VARIANTS.includes(variant);
      root.classList.toggle("custom-cursor--interactive", isInteractive);

      if (label) {
        const key = CURSOR_LABEL_KEYS[variant];
        label.textContent = key ? labelsRef.current[key] : "";
      }

      if (ring) {
        ring.classList.toggle("custom-cursor__ring--visible", isInteractive);
      }
    };

    const tick = () => {
      const { x, y } = posRef.current;
      const arrow = arrowRef.current;
      const trail = trailRef.current;
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;

      if (arrow) {
        arrow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      if (ring) {
        ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      if (label) {
        label.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      if (animateMotion) {
        const dotTargetX = x - 5;
        const dotTargetY = y + 11;
        dotPosRef.current.x = lerp(dotPosRef.current.x, dotTargetX, 0.14);
        dotPosRef.current.y = lerp(dotPosRef.current.y, dotTargetY, 0.14);

        trailPosRef.current.x = lerp(trailPosRef.current.x, x - 3, 0.09);
        trailPosRef.current.y = lerp(trailPosRef.current.y, y + 5, 0.09);

        const dx = x - lastPosRef.current.x;
        const dy = y - lastPosRef.current.y;
        const speed = Math.hypot(dx, dy);

        if (speed > 0.8) {
          movingRef.current = true;
          if (moveStopTimerRef.current !== null) {
            window.clearTimeout(moveStopTimerRef.current);
          }
          moveStopTimerRef.current = window.setTimeout(() => {
            movingRef.current = false;
            if (trail) trail.style.opacity = "0";
            if (rootRef.current) {
              rootRef.current.classList.remove("custom-cursor--moving");
            }
          }, 100);
        }

        if (trail) {
          const trailOpacity = movingRef.current
            ? Math.min(speed * 0.035, 0.26)
            : 0;
          trail.style.opacity = String(trailOpacity);
          trail.style.transform = `translate3d(${trailPosRef.current.x}px, ${trailPosRef.current.y}px, 0)`;
        }

        if (rootRef.current) {
          rootRef.current.classList.toggle(
            "custom-cursor--moving",
            movingRef.current,
          );
        }

        lastPosRef.current = { x, y };
      } else {
        dotPosRef.current = { x: x - 5, y: y + 11 };
        if (trail) trail.style.opacity = "0";
      }

      if (dot) {
        dot.style.transform = `translate3d(${dotPosRef.current.x}px, ${dotPosRef.current.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const onMouseMove = (event: MouseEvent) => {
      posRef.current = { x: event.clientX, y: event.clientY };
      applyVariant(resolveCursorVariant(event.target));

      if (!visibleRef.current) {
        visibleRef.current = true;
        if (rootRef.current) {
          rootRef.current.classList.add("custom-cursor--visible");
        }
      }
    };

    const onMouseLeave = () => {
      visibleRef.current = false;
      if (rootRef.current) {
        rootRef.current.classList.remove("custom-cursor--visible");
      }
    };

    const onMouseDown = () => {
      pressedRef.current = true;
      if (dotRef.current) {
        dotRef.current.classList.add("custom-cursor__dot--pressed");
      }
    };

    const onMouseUp = () => {
      pressedRef.current = false;
      if (dotRef.current) {
        dotRef.current.classList.remove("custom-cursor__dot--pressed");
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      siteShell.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (moveStopTimerRef.current !== null) {
        window.clearTimeout(moveStopTimerRef.current);
      }
    };
  }, [enabled, animateMotion]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      className="custom-cursor"
      aria-hidden="true"
    >
      <div ref={trailRef} className="custom-cursor__trail">
        <CursorArrow />
      </div>

      <div ref={arrowRef} className="custom-cursor__arrow">
        <CursorArrow />
      </div>

      <div ref={dotRef} className="custom-cursor__dot" />

      <div ref={ringRef} className="custom-cursor__ring" />

      <span ref={labelRef} className="custom-cursor__label" />
    </div>
  );
}
