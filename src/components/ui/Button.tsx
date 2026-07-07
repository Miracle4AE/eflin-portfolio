"use client";



import { motion } from "framer-motion";

import { Magnetic } from "@/components/motion/Magnetic";

import type { CursorVariant } from "@/components/motion/CustomCursor";

import { cn } from "@/lib/utils";

import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

import { DURATION, easeOutExpo } from "@/lib/motion";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";



interface ButtonProps {

  children: React.ReactNode;

  variant?: "primary" | "secondary" | "ghost";

  onClick?: () => void;

  href?: string;

  className?: string;

  ariaLabel?: string;

  magnetic?: boolean;

  cursor?: CursorVariant;

}



function resolveCursor(href?: string, cursor?: CursorVariant): CursorVariant | undefined {

  if (cursor) return cursor;

  if (href?.startsWith("mailto:")) return "contact";

  if (href) return "view";

  return undefined;

}



export function Button({

  children,

  variant = "primary",

  onClick,

  href,

  className,

  ariaLabel,

  magnetic = true,

  cursor,

}: ButtonProps) {

  const reducedMotion = useReducedMotion();

  const cursorVariant = resolveCursor(href, cursor);
  const cursorProps = useMountedCursor(cursorVariant ?? (href ? undefined : "default"));



  const baseStyles =

    "group relative inline-flex items-center justify-center overflow-hidden px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";



  const variants = {

    primary:

      "border border-accent bg-accent text-background hover:bg-accent-hover hover:border-accent-hover",

    secondary:

      "border border-foreground/25 bg-transparent text-foreground hover:bg-linen hover:border-foreground/30",

    ghost:

      "border-none bg-transparent text-muted hover:bg-linen/70 hover:text-foreground px-4 py-2",

  };



  const content = (

    <>

      <span className="relative z-10">{children}</span>

      {variant !== "ghost" && !reducedMotion && variant === "secondary" && (

        <motion.span

          className="absolute inset-0 bg-linen/80"

          initial={{ x: "-100%" }}

          whileHover={{ x: 0 }}

          transition={{ duration: DURATION.base, ease: easeOutExpo }}

        />

      )}

    </>

  );



  const element = href ? (

    <a

      href={href}

      aria-label={ariaLabel}

      {...cursorProps}

      className={cn(baseStyles, variants[variant], className)}

    >

      {content}

    </a>

  ) : (

    <button

      type="button"

      onClick={onClick}

      aria-label={ariaLabel}

      {...cursorProps}

      className={cn(baseStyles, variants[variant], className)}

    >

      {content}

    </button>

  );



  if (magnetic && !reducedMotion) {

    return (

      <Magnetic strength={0.2} className={variant === "ghost" ? undefined : "inline-block"}>

        {element}

      </Magnetic>

    );

  }



  return element;

}


