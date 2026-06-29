"use client";

import { motion } from "framer-motion";
import { useDictionary } from "@/i18n/locale-context";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VisualField } from "@/components/admin/visual/EditableText";
import { useVisualEditOptional } from "@/components/admin/visual/VisualEditContext";
import { fadeUp, staggerContainer, defaultViewport } from "@/lib/motion";

const serviceOrder = [
  "branding",
  "editorial",
  "visual-identity",
  "art-direction",
  "digital",
  "illustration",
] as const;

function ServiceItem({
  serviceId,
  service,
}: {
  serviceId: string;
  service: { index: string; title: string; description: string };
}) {
  const visualEdit = useVisualEditOptional();

  return (
    <motion.div
      variants={fadeUp}
      className="group border-t border-foreground/10 py-8 md:py-10"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
        <div className="flex items-baseline gap-6">
          <span className="text-xs font-medium tabular-nums text-accent/60">
            {service.index}
          </span>
          <h3 className="font-display text-2xl font-light text-foreground transition-colors duration-300 group-hover:text-accent md:text-3xl">
            {visualEdit ? (
              <VisualField
                fieldPath={`homepage.services.items.${serviceId}.title`}
                value={service.title}
                label={`Service title (${serviceId})`}
              />
            ) : (
              service.title
            )}
          </h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted md:text-right md:text-base">
          {visualEdit ? (
            <VisualField
              fieldPath={`homepage.services.items.${serviceId}.description`}
              value={service.description}
              label={`Service description (${serviceId})`}
              multiline
            />
          ) : (
            service.description
          )}
        </p>
      </div>
    </motion.div>
  );
}

export function Services() {
  const dict = useDictionary();
  const visualEdit = useVisualEditOptional();

  return (
    <section
      id="services"
      className="border-t border-border-soft bg-section py-24 md:py-32 lg:py-40"
      aria-labelledby="services-heading"
    >
      <Container>
        <SectionHeading
          label={dict.services.label}
          title={dict.services.title}
          description={dict.services.description}
          editPaths={
            visualEdit
              ? {
                  label: "homepage.services.label",
                  title: "homepage.services.title",
                  description: "homepage.services.description",
                }
              : undefined
          }
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainer}
          className="border-b border-foreground/10"
        >
          {serviceOrder.map((id) => (
            <ServiceItem key={id} serviceId={id} service={dict.services.items[id]} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
