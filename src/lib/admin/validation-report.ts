import type { AdminDictionary } from "@/i18n/admin/types";
import { interpolate } from "@/i18n/admin/storage";
import type { LocaleField } from "@/lib/content/types";
import type { ContentProject, SiteContent } from "@/lib/content/types";

export type ValidationSeverity = "error" | "warning" | "suggestion";

export type ValidationMessageKey = keyof AdminDictionary["validation"];

export type ValidationIssue = {
  id: string;
  severity: ValidationSeverity;
  messageKey: ValidationMessageKey;
  messageParams?: Record<string, string | number>;
  sectionKey?: ValidationMessageKey;
  sectionParams?: Record<string, string | number>;
};

export type ValidationReport = {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  suggestions: ValidationIssue[];
  total: number;
};

function issue(
  severity: ValidationSeverity,
  id: string,
  messageKey: ValidationMessageKey,
  sectionKey?: ValidationMessageKey,
  messageParams?: Record<string, string | number>,
  sectionParams?: Record<string, string | number>,
): ValidationIssue {
  return { id, severity, messageKey, sectionKey, messageParams, sectionParams };
}

function isEmpty(field: LocaleField | undefined): boolean {
  return !field?.en.trim() && !field?.tr.trim();
}

function enMissing(field: LocaleField | undefined): boolean {
  return !field?.en.trim();
}

function trMissing(field: LocaleField | undefined): boolean {
  return !field?.tr.trim();
}

function seoLength(text: string): "ok" | "short" | "long" {
  const len = text.trim().length;
  if (len === 0) return "ok";
  if (len < 50) return "short";
  if (len > 160) return "long";
  return "ok";
}

function projectSectionKey(slug: string): ValidationMessageKey {
  return slug.trim() ? "sectionProject" : "sectionProjectUntitled";
}

export function buildValidationReport(content: SiteContent): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const suggestions: ValidationIssue[] = [];

  if (!content.site.email.includes("@")) {
    errors.push(
      issue("error", "site-email", "siteEmailInvalid", "sectionSettings"),
    );
  }

  if (!content.homepage.designerName.trim()) {
    warnings.push(
      issue("warning", "designer-name", "designerNameEmpty", "sectionHomepage"),
    );
  }

  if (!content.homepage.portraitImagePath.trim()) {
    warnings.push(
      issue("warning", "portrait-path", "portraitPathMissing", "sectionHomepage"),
    );
  }

  const slugs = new Set<string>();
  for (const project of content.projects) {
    const secKey = projectSectionKey(project.slug);
    const secParams = project.slug.trim()
      ? { slug: project.slug }
      : undefined;

    if (!project.slug.trim()) {
      errors.push(
        issue(
          "error",
          `slug-empty-${project.slug}`,
          "projectSlugRequired",
          secKey,
          undefined,
          secParams,
        ),
      );
    } else if (!/^[a-z0-9-]+$/.test(project.slug)) {
      errors.push(
        issue(
          "error",
          `slug-invalid-${project.slug}`,
          "projectSlugInvalid",
          secKey,
          undefined,
          secParams,
        ),
      );
    } else if (slugs.has(project.slug)) {
      errors.push(
        issue(
          "error",
          `slug-dup-${project.slug}`,
          "projectSlugDuplicate",
          secKey,
          { slug: project.slug },
          secParams,
        ),
      );
    }
    slugs.add(project.slug);

    if (isEmpty(project.title)) {
      errors.push(
        issue(
          "error",
          `title-${project.slug}`,
          "projectTitleRequired",
          secKey,
          undefined,
          secParams,
        ),
      );
    }
    if (isEmpty(project.summary)) {
      errors.push(
        issue(
          "error",
          `summary-${project.slug}`,
          "projectSummaryRequired",
          secKey,
          undefined,
          secParams,
        ),
      );
    }
    if (enMissing(project.summary)) {
      warnings.push(
        issue(
          "warning",
          `summary-en-${project.slug}`,
          "englishSummaryMissing",
          secKey,
          undefined,
          secParams,
        ),
      );
    }
    if (trMissing(project.summary)) {
      suggestions.push(
        issue(
          "suggestion",
          `summary-tr-${project.slug}`,
          "turkishSummaryFallback",
          secKey,
          undefined,
          secParams,
        ),
      );
    }

    if (!project.coverImagePath?.trim()) {
      warnings.push(
        issue(
          "warning",
          `cover-${project.slug}`,
          "coverPathMissing",
          secKey,
          undefined,
          secParams,
        ),
      );
    }
    if (!project.heroImagePath?.trim()) {
      warnings.push(
        issue(
          "warning",
          `hero-${project.slug}`,
          "heroPathMissing",
          secKey,
          undefined,
          secParams,
        ),
      );
    }

    if (
      project.featured &&
      (!project.coverImagePath?.trim() || !project.heroImagePath?.trim())
    ) {
      warnings.push(
        issue(
          "warning",
          `featured-images-${project.slug}`,
          "featuredMissingImages",
          secKey,
          undefined,
          secParams,
        ),
      );
    }

    if (project.galleryItems.length === 0) {
      suggestions.push(
        issue(
          "suggestion",
          `gallery-count-${project.slug}`,
          "galleryAddImages",
          secKey,
          undefined,
          secParams,
        ),
      );
    } else if (project.galleryItems.length > 8) {
      suggestions.push(
        issue(
          "suggestion",
          `gallery-many-${project.slug}`,
          "galleryTooMany",
          secKey,
          undefined,
          secParams,
        ),
      );
    }

    project.galleryItems.forEach((item, index) => {
      if (!item.imagePath?.trim()) {
        warnings.push(
          issue(
            "warning",
            `gallery-path-${project.slug}-${index}`,
            "galleryItemNoImage",
            secKey,
            { index: index + 1 },
            secParams,
          ),
        );
      }
      if (item.imagePath?.trim() && isEmpty(item.alt)) {
        warnings.push(
          issue(
            "warning",
            `gallery-alt-${project.slug}-${index}`,
            "galleryItemMissingAlt",
            secKey,
            { index: index + 1 },
            secParams,
          ),
        );
      }
    });

    const seoDesc = project.seoDescription?.en ?? "";
    const seoLen = seoLength(seoDesc);
    if (seoLen === "short" && seoDesc) {
      suggestions.push(
        issue(
          "suggestion",
          `seo-short-${project.slug}`,
          "seoDescriptionShort",
          secKey,
          undefined,
          secParams,
        ),
      );
    }
    if (seoLen === "long") {
      warnings.push(
        issue(
          "warning",
          `seo-long-${project.slug}`,
          "seoDescriptionLong",
          secKey,
          undefined,
          secParams,
        ),
      );
    }
  }

  const siteSeoLen = seoLength(content.seo.siteDescription.en);
  if (siteSeoLen === "long") {
    warnings.push(
      issue(
        "warning",
        "site-seo-long",
        "siteSeoDescriptionLong",
        "sectionSeo",
      ),
    );
  }

  if (!content.homepage.showcaseProjectSlug.trim()) {
    errors.push(
      issue(
        "error",
        "showcase-slug",
        "showcaseSlugRequired",
        "sectionHomepage",
      ),
    );
  } else if (!slugs.has(content.homepage.showcaseProjectSlug)) {
    warnings.push(
      issue(
        "warning",
        "showcase-missing",
        "showcaseSlugNotFound",
        "sectionHomepage",
      ),
    );
  }

  return {
    errors,
    warnings,
    suggestions,
    total: errors.length + warnings.length + suggestions.length,
  };
}

export function formatValidationIssue(
  issueItem: ValidationIssue,
  messages: AdminDictionary["validation"],
): { message: string; section?: string } {
  const message = interpolate(
    messages[issueItem.messageKey],
    issueItem.messageParams ?? {},
  );
  const section = issueItem.sectionKey
    ? interpolate(
        messages[issueItem.sectionKey],
        issueItem.sectionParams ?? {},
      )
    : undefined;
  return { message, section };
}

export type ProjectCompletion = {
  content: number;
  images: number;
  seo: number;
  overall: number;
};

export function getProjectCompletion(project: ContentProject): ProjectCompletion {
  const contentFields = [
    project.title,
    project.summary,
    project.description,
    project.concept,
    project.challenge,
    project.solution,
  ];
  const contentFilled =
    contentFields.filter((f) => f.en.trim()).length / contentFields.length;

  const imageFields = [project.coverImagePath, project.heroImagePath];
  const galleryFilled = project.galleryItems.filter((g) =>
    g.imagePath?.trim(),
  ).length;
  const imagesScore =
    (imageFields.filter(Boolean).length / 2) * 0.6 +
    Math.min(galleryFilled / 4, 1) * 0.4;

  const seoScore =
    (project.seoTitle?.en.trim() ? 0.5 : 0) +
    (project.seoDescription?.en.trim() ? 0.5 : 0);

  const overall = Math.round(((contentFilled + imagesScore + seoScore) / 3) * 100);

  return {
    content: Math.round(contentFilled * 100),
    images: Math.round(imagesScore * 100),
    seo: Math.round(seoScore * 100),
    overall,
  };
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
