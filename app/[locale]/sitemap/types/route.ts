import { fetchOldSitemapPaths, localePrefix, SITE_URL, urlSetXml, xmlResponse } from '@/lib/sitemap-utils';

export const revalidate = 86400;

// 408 faceted paths — locale-invariant (slugs identical, only prefix differs)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const paths = await fetchOldSitemapPaths('/sitemap/types');
  const prefix = localePrefix(locale);
  const locs = paths.map(p => `${SITE_URL}${prefix}${p}`);
  return xmlResponse(urlSetXml(locs));
}
