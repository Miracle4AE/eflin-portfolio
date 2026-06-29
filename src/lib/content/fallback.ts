import { projects as rawProjects } from "@/data/projects";
import { projectTranslationsTr } from "@/data/projects-i18n-tr";
import { siteConfig } from "@/data/site";
import { dictionaryEn } from "@/i18n/dictionaries/en";
import { dictionaryTr } from "@/i18n/dictionaries/tr";
import { ls } from "@/lib/content/locale-field";
import type { ContentProject, SiteContent } from "@/lib/content/types";

function projectToContent(project: (typeof rawProjects)[number]): ContentProject {
  const tr = projectTranslationsTr[project.slug];

  return {
    slug: project.slug,
    title: ls(project.title, tr?.title ?? project.title),
    category: ls(project.category, tr?.category ?? project.category),
    filterCategory: project.filterCategory,
    year: project.year,
    role: ls(project.role, tr?.role ?? project.role),
    client: ls(project.client, tr?.client ?? project.client),
    summary: ls(project.summary, tr?.summary ?? project.summary),
    description: ls(project.description, tr?.description ?? project.description),
    concept: ls(project.concept, tr?.concept ?? project.concept),
    challenge: ls(project.challenge, tr?.challenge ?? project.challenge),
    solution: ls(project.solution, tr?.solution ?? project.solution),
    visualDirection: ls(
      project.visualDirection,
      tr?.visualDirection ?? project.visualDirection,
    ),
    typography: ls(project.typography, tr?.typography ?? project.typography),
    tags: {
      en: project.tags,
      tr: tr?.tags ?? project.tags,
    },
    palette: project.palette.map((color, index) => ({
      hex: color.hex,
      name: ls(color.name, tr?.paletteNames[index] ?? color.name),
    })),
    galleryItems: project.galleryItems.map((item) => ({
      id: item.id,
      imagePath: item.file
        ? `/images/projects/${project.slug}/${item.file}`
        : undefined,
      gradient: item.gradient,
      aspectRatio: item.aspectRatio,
      caption: ls(item.caption ?? "", tr?.gallery[item.id]?.caption ?? item.caption ?? ""),
      alt: ls(item.alt ?? "", tr?.gallery[item.id]?.alt ?? item.alt ?? ""),
    })),
    gradient: project.gradient,
    aspectRatio: project.aspectRatio,
    featured: project.featured,
    seoTitle: project.seoTitle ? ls(project.seoTitle, project.seoTitle) : undefined,
    seoDescription: project.seoDescription
      ? ls(project.seoDescription, project.seoDescription)
      : undefined,
    coverImagePath: `/images/projects/${project.slug}/cover.jpg`,
    heroImagePath: `/images/projects/${project.slug}/hero.jpg`,
    imageAlt: ls(project.images.imageAlt, tr?.imageAlt ?? project.images.imageAlt),
  };
}

export function buildFallbackSiteContent(): SiteContent {
  const en = dictionaryEn;
  const tr = dictionaryTr;

  const serviceItems = Object.entries(en.services.items).map(([id, item]) => ({
    id,
    index: item.index,
    title: ls(item.title, tr.services.items[id as keyof typeof tr.services.items]?.title ?? item.title),
    description: ls(
      item.description,
      tr.services.items[id as keyof typeof tr.services.items]?.description ?? item.description,
    ),
  }));

  return {
    version: 1,
    site: {
      name: siteConfig.name,
      email: siteConfig.email,
      phone: siteConfig.phone,
      location: ls(siteConfig.location, tr.about.location),
      availability: siteConfig.availability
        ? ls(siteConfig.availability, tr.about.location)
        : ls(siteConfig.location, tr.about.location),
      social: siteConfig.social,
    },
    homepage: {
      designerName: siteConfig.name,
      portraitImagePath: "/images/portrait.jpg",
      featuredProjectSlugs: rawProjects.filter((p) => p.featured).map((p) => p.slug),
      showcaseProjectSlug: "nocturne",
      hero: {
        role: ls(en.hero.role, tr.hero.role),
        headline: ls(en.hero.headline, tr.hero.headline),
        subtitle: ls(en.hero.subtitle, tr.hero.subtitle),
        description: ls(en.hero.description, tr.hero.description),
        viewWork: ls(en.hero.viewWork, tr.hero.viewWork),
        contact: ls(en.hero.contact, tr.hero.contact),
      },
      about: {
        label: ls(en.about.label, tr.about.label),
        title: ls(en.about.title, tr.about.title),
        bio: ls(en.about.bio, tr.about.bio),
        philosophy: ls(en.about.philosophy, tr.about.philosophy),
        portraitAlt: ls(en.about.portraitAlt, tr.about.portraitAlt),
      },
      services: {
        label: ls(en.services.label, tr.services.label),
        title: ls(en.services.title, tr.services.title),
        description: ls(en.services.description, tr.services.description),
        items: serviceItems,
      },
      work: {
        featuredLabel: ls(en.work.featuredLabel, tr.work.featuredLabel),
        featuredTitle: ls(en.work.featuredTitle, tr.work.featuredTitle),
        featuredDescription: ls(en.work.featuredDescription, tr.work.featuredDescription),
        indexLabel: ls(en.work.indexLabel, tr.work.indexLabel),
        indexTitle: ls(en.work.indexTitle, tr.work.indexTitle),
        indexDescription: ls(en.work.indexDescription, tr.work.indexDescription),
      },
    },
    contact: {
      label: ls(en.contact.label, tr.contact.label),
      title: ls(en.contact.title, tr.contact.title),
      description: ls(en.contact.description, tr.contact.description),
    },
    footer: {
      headline: ls(en.footer.headline, tr.footer.headline),
      intro: ls(en.footer.intro, tr.footer.intro),
      tagline: ls(en.footer.tagline, tr.footer.tagline),
      copyright: ls(en.footer.copyright, tr.footer.copyright),
    },
    seo: {
      siteTitle: ls(en.meta.siteTitle, tr.meta.siteTitle),
      siteDescription: ls(en.meta.siteDescription, tr.meta.siteDescription),
      portfolioTitle: ls(en.meta.portfolioTitle, tr.meta.portfolioTitle),
      workTitle: ls(en.meta.workTitle, tr.meta.workTitle),
      workDescription: ls(en.meta.workDescription, tr.meta.workDescription),
      contactTitle: ls(en.meta.contactTitle, tr.meta.contactTitle),
      contactDescription: ls(en.meta.contactDescription, tr.meta.contactDescription),
      ogImagePath: "/images/portrait.jpg",
    },
    projects: rawProjects.map((p) => projectToContent(p)),
  };
}
