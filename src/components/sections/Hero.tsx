"use client";

import { motion } from "framer-motion";
import { useDictionary, useLocale, useSiteConfig } from "@/i18n/locale-context";
import { localizedPath } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GradientAtmosphere } from "@/components/ui/GradientAtmosphere";
import { ProjectImage } from "@/components/work/ProjectImage";
import { TextRevealInstant, LineReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { VisualField } from "@/components/admin/visual/EditableText";
import { VisualImage } from "@/components/admin/visual/EditableImage";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { IMAGE_SIZES } from "@/lib/images";
import { easeOutExpo, DURATION } from "@/lib/motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const nameVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 80, rotateX: -40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: DURATION.reveal, ease: easeOutExpo },
  },
};

interface HeroProps {
  portraitSrc: string | null;
}

export function Hero({ portraitSrc }: HeroProps) {
  const dict = useDictionary();
  const { locale } = useLocale();
  const siteConfig = useSiteConfig();
  const visualEdit = useVisualEditOptional();
  const displayName = dict.hero.headline.trim() || siteConfig.name;
  const heroLine = dict.hero.role.trim() || dict.hero.subtitle.trim();
  const heroDescription =
    dict.hero.description.trim() || dict.meta.siteDescription;
  const reducedMotion = useReducedMotion();

  if (visualEdit) {
    return (
      <section id="hero" className="relative min-h-screen overflow-hidden" aria-label="Introduction">
        <GradientAtmosphere />
        <Container className="relative z-10 flex min-h-screen flex-col justify-center py-32 lg:py-40">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <VisualField
                as="p"
                className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-accent"
                fieldPath="homepage.hero.role"
                value={dict.hero.role}
                label="Hero role"
              />
              <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.9] tracking-tight text-foreground">
                <VisualField
                  fieldPath="homepage.hero.headline"
                  value={displayName}
                  label="Hero headline"
                />
              </h1>
              <div className="my-10 h-px w-24 bg-foreground/10" />
              <VisualField
                as="p"
                className="max-w-lg text-lg leading-relaxed text-muted md:text-xl"
                fieldPath="homepage.hero.description"
                value={heroDescription}
                label="Hero description"
                multiline
              />
              <div className="mt-12 flex flex-wrap gap-4">
                <span className="rounded-full border border-border px-5 py-2 text-sm">
                  <VisualField
                    fieldPath="homepage.hero.viewWork"
                    value={dict.hero.viewWork}
                    label="View work button"
                  />
                </span>
                <span className="rounded-full border border-border px-5 py-2 text-sm">
                  <VisualField
                    fieldPath="homepage.hero.contact"
                    value={dict.hero.contact}
                    label="Contact button"
                  />
                </span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <VisualImage
                fieldPath="homepage.portraitImagePath"
                src={portraitSrc}
                alt={dict.about.portraitAlt}
                label="Portrait"
                pickerType="portrait"
              >
                <ProjectImage
                  src={portraitSrc}
                  alt={dict.about.portraitAlt}
                  gradient="from-[#EDE7DD] via-[#F0EBE3] to-[#E8E2D9]"
                  aspectRatio="portrait"
                  sizes={IMAGE_SIZES.portrait}
                  priority
                  framed
                  overlay
                  className="mx-auto max-w-md lg:max-w-none"
                />
              </VisualImage>
              <VisualField
                as="p"
                className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-muted lg:text-right"
                fieldPath="site.location"
                value={dict.about.location}
                label="Location"
              />
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      aria-label="Introduction"
    >
      <GradientAtmosphere />

      <Container className="relative z-10 flex min-h-screen flex-col justify-center py-32 lg:py-40">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, delay: 0.1, ease: easeOutExpo }}
              className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-accent"
            >
              {heroLine}
            </motion.p>

            {reducedMotion ? (
              <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.9] tracking-tight text-foreground">
                {displayName}
              </h1>
            ) : (
              <motion.h1
                variants={nameVariants}
                initial="hidden"
                animate="visible"
                className="font-display text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.9] tracking-tight text-foreground"
                aria-label={displayName}
              >
                {displayName.split("").map((char, i) => (
                  <motion.span
                    key={`${char}-${i}`}
                    variants={letterVariants}
                    className="inline-block"
                    style={{ perspective: "600px" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.h1>
            )}

            <LineReveal className="my-10 w-24" delay={0.8} />

            <TextRevealInstant
              as="p"
              text={heroDescription}
              delay={1}
              className="max-w-lg text-lg leading-relaxed text-muted md:text-xl"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, delay: 1.3, ease: easeOutExpo }}
              className="mt-12 flex flex-wrap gap-4"
            >
              <Button href={localizedPath(locale, "/work")} cursor="view">
                {dict.hero.viewWork}
              </Button>
              <Button
                variant="secondary"
                href={localizedPath(locale, "/contact")}
                cursor="contact"
              >
                {dict.hero.contact}
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DURATION.reveal, delay: 0.6, ease: easeOutExpo }}
            className="lg:col-span-5"
          >
            <MaskReveal>
              <ProjectImage
                src={portraitSrc}
                alt={dict.about.portraitAlt}
                gradient="from-[#EDE7DD] via-[#F0EBE3] to-[#E8E2D9]"
                aspectRatio="portrait"
                sizes={IMAGE_SIZES.portrait}
                priority
                framed
                overlay
                className="mx-auto max-w-md lg:max-w-none"
              />
            </MaskReveal>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-muted lg:text-right">
              {dict.about.location}
            </p>
          </motion.div>
        </div>

        {!reducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-12 left-6 md:left-10 lg:left-16"
            aria-hidden="true"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted">
                {dict.hero.scroll}
              </span>
              <div className="h-12 w-px bg-accent/30" />
            </motion.div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
