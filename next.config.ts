import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.akaratistanbul.net",
      },
    ],
  },
  async redirects() {
    return [
      // Redirect old single-language URLs to new locale URLs
      {
        source: "/properties/:slug",
        destination: "/ar/properties/:slug",
        permanent: true,
      },
      {
        source: "/property/:slug",
        destination: "/ar/properties/:slug",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/ar/about",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/ar/contact",
        permanent: true,
      },
      {
        source: "/offers",
        destination: "/ar/offers",
        permanent: true,
      },
      {
        source: "/blogs/:slug",
        destination: "/ar/blogs/:slug",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
