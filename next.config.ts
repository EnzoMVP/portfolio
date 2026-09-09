import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Sanity Studio's bundle isn't meant to be pulled into the RSC graph —
  // its deps (e.g. swr) break Turbopack's "react-server" export resolution
  // when Next tries to bundle them there. Treat them as external instead.
  serverExternalPackages: ["sanity", "next-sanity", "@sanity/vision"],
};

export default withNextIntl(nextConfig);
