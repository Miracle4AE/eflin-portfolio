import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import type { SiteContent } from "@/lib/content/types";

const STATIC_PATHS = ["", "/work", "/contact"] as const;

export async function revalidateSiteContent(content: SiteContent): Promise<void> {
  for (const locale of locales) {
    for (const route of STATIC_PATHS) {
      revalidatePath(route ? `/${locale}${route}` : `/${locale}`);
    }
  }

  const slugs = content.projects.map((project) => project.slug);
  for (const locale of locales) {
    for (const slug of slugs) {
      revalidatePath(`/${locale}/work/${slug}`);
    }
  }

  revalidatePath("/sitemap.xml");
}
