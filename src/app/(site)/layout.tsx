import { MotionProvider } from "@/components/motion/MotionProvider";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { HtmlLang } from "@/components/i18n/HtmlLang";
import { getSiteThemeStyle } from "@/lib/content/homepage";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeStyle = await getSiteThemeStyle();

  return (
    <div
      className="site-shell min-h-screen bg-background font-[family-name:var(--font-dm-sans)] text-foreground"
      style={themeStyle}
    >
      <HtmlLang />
      <MotionProvider />
      <AnalyticsProvider />
      {children}
    </div>
  );
}
