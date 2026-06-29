"use client";

import { motion } from "framer-motion";
import { useDictionary } from "@/i18n/locale-context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { fadeUp, lineReveal, defaultViewport } from "@/lib/motion";

export function About() {
  const dict = useDictionary();
  const visualEdit = useVisualEditOptional();

  return (
    <section
      id="about"
      className="border-t border-border-soft bg-background py-24 md:py-32 lg:py-40"
      aria-labelledby="about-heading"
    >
      <Container>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <SectionHeading
              label={dict.about.label}
              title={dict.about.title}
              editPaths={
                visualEdit
                  ? {
                      label: "homepage.about.label",
                      title: "homepage.about.title",
                    }
                  : undefined
              }
            />
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              variants={fadeUp}
            >
              <p className="text-lg leading-[1.8] text-foreground md:text-xl md:leading-[1.9]">
                {visualEdit ? (
                  <VisualField
                    fieldPath="homepage.about.bio"
                    value={dict.about.bio}
                    label="Bio"
                    multiline
                  />
                ) : (
                  dict.about.bio
                )}
              </p>

              <motion.div
                variants={lineReveal}
                className="my-12 h-px w-full bg-foreground/10"
                aria-hidden="true"
              />

              <blockquote className="relative">
                <span
                  className="absolute -left-2 -top-6 font-display text-6xl leading-none text-accent/30 md:-left-4"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <p className="font-display text-2xl font-light italic leading-relaxed text-foreground/90 md:text-3xl md:leading-relaxed">
                  {visualEdit ? (
                    <VisualField
                      fieldPath="homepage.about.philosophy"
                      value={dict.about.philosophy}
                      label="Philosophy"
                      multiline
                    />
                  ) : (
                    dict.about.philosophy
                  )}
                </p>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
