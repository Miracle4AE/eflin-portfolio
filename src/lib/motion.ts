import type { Variants, Transition } from "framer-motion";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.4,
  base: 0.7,
  slow: 0.9,
  page: 0.85,
  reveal: 1.0,
} as const;

export const transitionBase: Transition = {
  duration: DURATION.base,
  ease: easeOutExpo,
};

export const transitionSlow: Transition = {
  duration: DURATION.slow,
  ease: easeOutExpo,
};

export const transitionPage: Transition = {
  duration: DURATION.page,
  ease: easeOutExpo,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionSlow,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.reveal, ease: easeOutExpo },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

export const staggerText: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const textWord: Variants = {
  hidden: { opacity: 0, y: "110%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionSlow,
  },
};

export const lineReveal: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: DURATION.reveal, ease: easeOutExpo },
  },
};

export const maskReveal: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: { duration: DURATION.reveal, ease: easeOutExpo },
  },
};

export const imageReveal: Variants = {
  hidden: { scale: 1.08, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: DURATION.reveal, ease: easeOutExpo },
  },
};

export const defaultViewport = { once: true, margin: "-80px" as const };

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionPage,
  },
};

export const pageOverlay: Variants = {
  hidden: { opacity: 0.4 },
  visible: {
    opacity: 0,
    transition: { duration: DURATION.page, ease: easeOutExpo },
  },
};

export const filterItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitionBase,
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.98,
    transition: { duration: DURATION.fast, ease: easeOutExpo },
  },
};

/** @deprecated Use pageEnter via PageTransition template instead */
export const pageReveal: Variants = pageEnter;

/** @deprecated Use fadeUp or textWord instead */
export const pageRevealChild: Variants = fadeUp;
