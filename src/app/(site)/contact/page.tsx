import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";
import { localizedPath } from "@/i18n/navigation";

export default function LegacyContactPage() {
  redirect(localizedPath(defaultLocale, "/contact"));
}
