import type { NextConfig } from "next";

function getProductionHost(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    const host = new URL(raw).hostname;
    if (host === "localhost" || host.endsWith(".local")) return undefined;
    return host;
  } catch {
    return undefined;
  }
}

const productionHost = getProductionHost();

const nextConfig: NextConfig = {
  async redirects() {
    if (!productionHost) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${productionHost}` }],
        destination: `https://${productionHost}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
