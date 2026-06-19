import { urlSetXml, xmlResponse } from '@/lib/sitemap-utils';

export const revalidate = 86400;

// Blog API (admin.akaratistanbul.net/api/blogs) returns 404.
// Return empty urlset for all locales until the API ships.
// /blogs/{slug} pages still serve HTTP 200 placeholders (URL parity preserved).
export async function GET() {
  return xmlResponse(urlSetXml([]));
}
