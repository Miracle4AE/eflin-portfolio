import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";

interface LegacyCaseStudyProps {
  params: Promise<{ slug: string }>;
}

export default async function LegacyCaseStudyPage({ params }: LegacyCaseStudyProps) {
  const { slug } = await params;
  redirect(localizedPath(defaultLocale, `/work/${slug}`));
}
