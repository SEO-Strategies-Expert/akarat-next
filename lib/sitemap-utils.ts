const OLD_SITE = 'https://akaratistanbul.net';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || OLD_SITE;

export function localePrefix(locale: string): string {
  return locale === 'ar' ? '' : `/${locale}`;
}

// Fetch <loc> paths from an old-site sitemap; returns pathname strings
export async function fetchOldSitemapPaths(oldPath: string): Promise<string[]> {
  try {
    const res = await fetch(`${OLD_SITE}${oldPath}`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const paths: string[] = [];
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        paths.push(new URL(m[1]).pathname);
      } catch {
        paths.push(m[1]);
      }
    }
    return paths;
  } catch {
    return [];
  }
}

export function sitemapIndexXml(locale: string): string {
  const p = localePrefix(locale);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <sitemap><loc>${SITE_URL}${p}/sitemap/blogs</loc></sitemap>`,
    `  <sitemap><loc>${SITE_URL}${p}/sitemap/types</loc></sitemap>`,
    `  <sitemap><loc>${SITE_URL}${p}/sitemap/projects</loc></sitemap>`,
    `  <sitemap><loc>${SITE_URL}${p}/sitemap/pages</loc></sitemap>`,
    '</sitemapindex>',
  ].join('\n');
}

export function urlSetXml(locs: string[]): string {
  const urls = locs.map(l => `  <url><loc>${l}</loc></url>`).join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...(urls ? [urls] : []),
    '</urlset>',
  ].join('\n');
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
