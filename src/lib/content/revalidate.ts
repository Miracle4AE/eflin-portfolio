import { revalidatePath, revalidateTag } from "next/cache";
import { locales } from "@/i18n/config";
import type { SiteContent } from "@/lib/content/types";

export const SITE_CONTENT_TAG = "site-content";

const STATIC_PATHS = ["", "/work", "/contact"] as const;

export async function revalidateSiteContent(content: SiteContent): Promise<void> {
  revalidateTag(SITE_CONTENT_TAG);

  for (const locale of locales) {
    for (const route of STATIC_PATHS) {
      const path = route ? `/${locale}${route}` : `/${locale}`;
      revalidatePath(path, "page");
      revalidatePath(path, "layout");
    }
  }

  const slugs = content.projects.map((project) => project.slug);
  for (const locale of locales) {
    for (const slug of slugs) {
      const path = `/${locale}/work/${slug}`;
      revalidatePath(path, "page");
      revalidatePath(path, "layout");
    }
  }

  revalidatePath("/sitemap.xml");
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/contact");
}
