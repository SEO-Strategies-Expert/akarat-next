import { fetchOldSitemapPaths, localePrefix, SITE_URL, urlSetXml, xmlResponse } from '@/lib/sitemap-utils';

export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;

  if (locale === 'ru') return xmlResponse(urlSetXml([]));

  // Fetch from the locale-specific old-site blogs sitemap (asymmetric: ar=107, en=2)
  const oldPath = locale === 'en' ? '/en/sitemap/blogs' : '/sitemap/blogs';
  const rawPaths = await fetchOldSitemapPaths(oldPath);

  // Strip any old locale prefix, then reapply the correct one
  // Old ar paths: /blogs/slug (no prefix) → keep → /blogs/slug
  // Old en paths: /en/blogs/slug → strip /en → /blogs/slug → reapply /en
  const prefix = localePrefix(locale);
  const locs = rawPaths.map(p => {
    const bare = p.replace(/^\/(en|ru)/, '');
    return `${SITE_URL}${prefix}${bare}`;
  });

  return xmlResponse(urlSetXml(locs));
}
