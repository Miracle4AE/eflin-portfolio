"use client";

import { motion } from "framer-motion";
import type { ResolvedProject } from "@/types";
import { Container } from "@/components/ui/Container";
import { ProjectImage } from "@/components/work/ProjectImage";
import { VideoHero } from "@/components/case-study/VideoHero";
import { ImageReveal, MaskReveal } from "@/components/motion/MaskReveal";
import { ParallaxBlock } from "@/components/motion/ParallaxBlock";
import { IMAGE_SIZES } from "@/lib/images";
import { pickPrimaryProjectImage } from "@/lib/images.utils";
import { useDictionary } from "@/i18n/locale-context";
import { fadeUp, defaultViewport } from "@/lib/motion";

interface CaseStudyMetaProps {
  project: ResolvedProject;
}

const metaItems = (
  project: ResolvedProject,
  labels: {
    client: string;
    year: string;
    role: string;
    category: string;
  },
) => [
  { label: labels.client, value: project.client },
  { label: labels.year, value: project.year },
  { label: labels.role, value: project.role },
  { label: labels.category, value: project.category },
];

export function CaseStudyMeta({ project }: CaseStudyMetaProps) {
  const dict = useDictionary();
  const metaSrc = pickPrimaryProjectImage(project.images);
  const heroVideo = project.images.videoPlaceholder;

  return (
    <section className="border-t border-border-soft py-16 md:py-24" aria-label="Project overview">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUp}
          className="mb-12 md:mb-16"
        >
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-accent">
            {dict.caseStudy.projectOverview}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            className="lg:col-span-4"
          >
            <dl className="space-y-8">
              {metaItems(project, dict.caseStudy).map((item) => (
                <div key={item.label} className="border-b border-border-soft pb-6">
                  <dt className="mb-2 text-[10px] uppercase tracking-[0.25em] text-accent/80">
                    {item.label}
                  </dt>
                  <dd className="text-sm leading-relaxed text-foreground md:text-base">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-foreground/10 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={fadeUp}
            className="lg:col-span-8"
          >
            <ParallaxBlock offset={20}>
              <MaskReveal>
                <ImageReveal>
                  {heroVideo ? (
                    <div className="editorial-frame relative mx-auto aspect-[16/9] max-h-[680px] min-h-[240px] w-full max-w-[1100px] overflow-hidden bg-surface">
                      <VideoHero
                        src={heroVideo}
                        poster={metaSrc}
                        gradient={project.gradient}
                        ariaLabel={project.images.imageAlt}
                      />
                    </div>
                  ) : (
                    <ProjectImage
                      src={metaSrc}
                      alt={project.images.imageAlt}
                      gradient={project.gradient}
                      blurDataURL={project.images.blurDataURL}
                      aspectRatio="wide"
                      mode="editorial"
                      sizes={IMAGE_SIZES.meta}
                      framed
                      interactive={false}
                      className="w-full"
                    />
                  )}
                </ImageReveal>
              </MaskReveal>
            </ParallaxBlock>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
