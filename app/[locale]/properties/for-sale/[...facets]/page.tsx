import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { parseFacets, resolveCityId, featureKeyword, buildPageTitle } from '@/lib/facets';

type Params = { params: Promise<{ locale: string; facets: string[] }> };

// Fetch for-sale (non-istanbul) paths from old types sitemap at build time
async function fetchForSalePaths(): Promise<string[][]> {
  try {
    const res = await fetch('https://akaratistanbul.net/sitemap/types', {
      next: { revalidate: 86400 },
    });
    const xml = await res.text();
    const paths: string[][] = [];
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = match[1];
      // Match /properties/for-sale/... but NOT /istanbul/
      const m = url.match(/\/properties\/for-sale\/(.+)$/);
      if (m && !url.includes('/istanbul/')) {
        paths.push(m[1].split('/'));
      }
    }
    // Deduplicate
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
  const facetPaths = await fetchForSalePaths();
  const locales = ['ar', 'en', 'ru'];
  return locales.flatMap((locale) => facetPaths.map((facets) => ({ locale, facets })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, facets } = await params;
  const parsed = parseFacets(facets, false);
  if (!parsed.valid) return { title: 'Not Found' };

  const title = buildPageTitle(parsed, false, locale);
  const canonical = locale === 'ar'
    ? `/properties/for-sale/${facets.join('/')}`
    : `/${locale}/properties/for-sale/${facets.join('/')}`;

  return {
    title,
    alternates: { canonical },
    openGraph: { title, url: canonical, type: 'website' },
  };
}

export default async function ForSaleFacetPage({ params }: Params) {
  const { locale, facets } = await params;
  const parsed = parseFacets(facets, false);

  if (!parsed.valid) notFound();

  const isRtl = locale === 'ar';

  const queryParams: Record<string, string | number> = { limit: 24 };
  if (parsed.type) queryParams.category = parsed.type;
  // Cities not valid without istanbul segment — skip

  let properties: Awaited<ReturnType<typeof api.getProperties>>['properties']['data'] = [];

  try {
    const [propertiesData, cities, categories] = await Promise.all([
      api.getProperties(queryParams),
      api.getCities(),
      api.getCategories(),
    ]);

    properties = propertiesData.properties.data ?? [];

    // Apply feature filter client-side (server-rendered)
    if (parsed.feature) {
      const keyword = featureKeyword(parsed.feature).toLowerCase();
      properties = properties.filter((p) =>
        p.features_data?.some((f) => f.name_en?.toLowerCase().includes(keyword))
      );
    }
  } catch (err) {
    console.error('Faceted listing error:', err);
  }

  const heading = buildPageTitle(parsed, false, locale);
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
