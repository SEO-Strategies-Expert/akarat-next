import { sitemapIndexXml, xmlResponse } from '@/lib/sitemap-utils';

export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  return xmlResponse(sitemapIndexXml(locale));
}
