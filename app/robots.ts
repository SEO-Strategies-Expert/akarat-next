import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://akaratistanbul.net';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/.well-known'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
