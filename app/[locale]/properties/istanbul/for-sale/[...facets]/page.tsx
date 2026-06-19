import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { parseFacets, resolveCityId, featureKeyword, buildPageTitle } from '@/lib/facets';
import { siteConfig } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; facets: string[] }> };

// Fetch istanbul/for-sale paths from old types sitemap at build time
async function fetchIstanbulPaths(): Promise<string[][]> {
  try {
    const res = await fetch('https://akaratistanbul.net/sitemap/types', {
      next: { revalidate: 86400 },
    });
    const xml = await res.text();
    const paths: string[][] = [];
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = match[1];
      const m = url.match(/\/properties\/istanbul\/for-sale\/(.+)$/);
      if (m) paths.push(m[1].split('/'));
    }
    const seen = new Set<string>();
    return paths.filter((p) => {
      const k = p.join('/');
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const facetPaths = await fetchIstanbulPaths();
  const locales = ['ar', 'en', 'ru'];
  return locales.flatMap((locale) => facetPaths.map((facets) => ({ locale, facets })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, facets } = await params;
  const parsed = parseFacets(facets, true);
  if (!parsed.valid) return { title: 'Not Found' };

  const title = buildPageTitle(parsed, true, locale);
  const canonical = locale === 'ar'
    ? `${siteConfig.url}/properties/istanbul/for-sale/${facets.join('/')}`
    : `${siteConfig.url}/${locale}/properties/istanbul/for-sale/${facets.join('/')}`;

  return {
    title,
    alternates: { canonical },
    openGraph: { title, url: canonical, type: 'website' },
  };
}

export default async function IstanbulFacetPage({ params }: Params) {
  const { locale, facets } = await params;
  const parsed = parseFacets(facets, true);

  if (!parsed.valid) notFound();

  const isRtl = locale === 'ar';

  const queryParams: Record<string, string | number> = { limit: 24 };
  if (parsed.type) queryParams.category = parsed.type;

  let properties: Awaited<ReturnType<typeof api.getProperties>>['properties']['data'] = [];

  try {
    const [propertiesData, cities] = await Promise.all([
      api.getProperties(queryParams),
      api.getCities(),
    ]);

    properties = propertiesData.properties.data ?? [];

    // Resolve city slug → city ID and filter
    if (parsed.city) {
      const cityId = resolveCityId(parsed.city, cities);
      if (cityId) {
        properties = properties.filter((p) => String(p.city_id) === cityId);
      }
    }

    // Feature filter (server-side)
    if (parsed.feature) {
      const keyword = featureKeyword(parsed.feature).toLowerCase();
      properties = properties.filter((p) =>
        p.features_data?.some((f) => f.name_en?.toLowerCase().includes(keyword))
      );
    }
  } catch (err) {
    console.error('Istanbul faceted listing error:', err);
  }

  const heading = buildPageTitle(parsed, true, locale);
  const noResults = locale === 'ar' ? 'لم يتم العثور على عقارات' : locale === 'ru' ? 'Объекты не найдены' : 'No properties found';

  return (
    <div className={isRtl ? 'rtl' : 'ltr'} dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="bg-blue-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">{heading}</h1>
          <p className="opacity-90">{properties.length} {locale === 'ar' ? 'عقار' : locale === 'ru' ? 'объектов' : 'properties'}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">{noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}
