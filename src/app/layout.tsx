import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import Script from "next/script";
import { getSiteUrl } from "@/lib/seo";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body className={`${dmSans.className} min-h-screen bg-background antialiased text-foreground`}>
        <Script id="cursor-hydration-guard" strategy="beforeInteractive">
          {`(() => {
  const cursorAttr = "data-" + "cursor";
  const cursorRefAttr = cursorAttr + "-ref";
  const selector = "[" + cursorRefAttr + "], [" + cursorAttr + "]";

  const removeCursorHydrationAttrs = (root) => {
    if (!root || root.nodeType !== 1) return;
    if (root.hasAttribute(cursorRefAttr)) {
      root.removeAttribute(cursorRefAttr);
    }
    if (root.hasAttribute(cursorAttr)) {
      root.removeAttribute(cursorAttr);
    }
    root.querySelectorAll?.(selector).forEach((node) => {
      node.removeAttribute(cursorRefAttr);
      node.removeAttribute(cursorAttr);
    });
  };

  removeCursorHydrationAttrs(document.documentElement);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        mutation.target.removeAttribute(cursorRefAttr);
        if (document.readyState === "loading") {
          mutation.target.removeAttribute(cursorAttr);
        }
      }
      mutation.addedNodes.forEach(removeCursorHydrationAttrs);
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [cursorRefAttr, cursorAttr],
  });

  window.addEventListener("load", () => {
    window.setTimeout(() => observer.disconnect(), 1000);
  }, { once: true });
})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
