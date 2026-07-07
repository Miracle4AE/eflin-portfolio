"use client";

import { motion } from "framer-motion";
import { useDictionary, useSiteConfig } from "@/i18n/locale-context";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { TextReveal } from "@/components/motion/TextReveal";
import { MaskReveal } from "@/components/motion/MaskReveal";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { fadeUp, staggerContainer, defaultViewport } from "@/lib/motion";
import { useMountedCursor } from "@/lib/hooks/useMountedCursor";

interface ContactSectionProps {
  sourcePage?: string;
  showSocial?: boolean;
}

export function ContactSection({
  sourcePage = "/",
  showSocial = true,
}: ContactSectionProps) {
  const dict = useDictionary();
  const siteConfig = useSiteConfig();
  const visualEdit = useVisualEditOptional();
  const viewCursor = useMountedCursor("view");

  return (
    <section
      id="contact"
      className="border-t border-border-soft bg-section py-24 md:py-32 lg:py-40"
      aria-labelledby="contact-heading"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-16 text-center md:mb-20">
            <motion.div variants={fadeUp}>
              <MaskReveal className="mb-6">
                <span className="block text-xs font-medium uppercase tracking-[0.3em] text-accent">
                  {visualEdit ? (
                    <VisualField fieldPath="contact.label" value={dict.contact.label} label="Contact label" />
                  ) : (
                    dict.contact.label
                  )}
                </span>
              </MaskReveal>
            </motion.div>

            {visualEdit ? (
              <motion.h2
                variants={fadeUp}
                id="contact-heading"
                className="font-display text-4xl font-light leading-tight text-foreground md:text-6xl lg:text-7xl"
              >
                <VisualField fieldPath="contact.title" value={dict.contact.title} label="Contact title" />
              </motion.h2>
            ) : (
              <motion.h2
                variants={fadeUp}
                id="contact-heading"
                className="font-display text-4xl font-light leading-tight text-foreground md:text-6xl lg:text-7xl"
              >
                <TextReveal as="span" text={dict.contact.title} />
              </motion.h2>
            )}

            <motion.div variants={fadeUp}>
              {visualEdit ? (
                <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted md:text-lg">
                  <VisualField
                    fieldPath="contact.description"
                    value={dict.contact.description}
                    label="Contact description"
                    multiline
                  />
                </p>
              ) : (
                <TextReveal
                  as="p"
                  text={dict.contact.description}
                  delay={0.1}
                  className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-muted md:text-lg"
                />
              )}
            </motion.div>
          </div>

          <motion.div variants={fadeUp}>
            {visualEdit ? null : <ContactForm sourcePage={sourcePage} />}
          </motion.div>

          {showSocial && (
            <motion.div
              variants={fadeUp}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 md:mt-20 md:gap-12"
            >
              {siteConfig.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...viewCursor}
                  className="text-xs font-medium uppercase tracking-[0.2em] text-muted transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {link.label}
                </a>
              ))}
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
