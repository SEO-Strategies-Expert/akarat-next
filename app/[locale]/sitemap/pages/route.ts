import { localePrefix, SITE_URL, urlSetXml, xmlResponse } from '@/lib/sitemap-utils';

export const revalidate = 86400;

// The 6 static indexed pages per locale (hardcoded — they are definitionally stable)
const STATIC_PAGES = [
  '/about',
  '/blogs',
  '/offers',
  '/privacy-policy',
  '/terms-of-service',
  '/terms-of-use',
];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const prefix = localePrefix(locale);
  const locs = STATIC_PAGES.map(p => `${SITE_URL}${prefix}${p}`);
  return xmlResponse(urlSetXml(locs));
}
