import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { parseFacets, resolveCityId, featureKeyword, buildPageTitle } from '@/lib/facets';
import { siteConfig } from '@/lib/seo';

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
    ? `${siteConfig.url}/properties/for-sale/${facets.join('/')}`
    : `${siteConfig.url}/${locale}/properties/for-sale/${facets.join('/')}`;

  return {
    title,
    alternates: { canonical },
    openGraph: { title, url: canonical, type: 'website' },
  };
}

const TYPE_LABELS_MAP: Record<string, Record<string, string>> = {
  ar: { all: 'الكل', apartments: 'الشقق', villas: 'الفلل', farms: 'المزارع', offices: 'المكاتب', shops: 'المحلات', 'hotel-residences': 'الشقق الفندقية', 'pent-houses': 'بنتهاوس' },
  en: { all: 'All', apartments: 'Apartments', villas: 'Villas', farms: 'Farms', offices: 'Offices', shops: 'Shops', 'hotel-residences': 'Hotel Residences', 'pent-houses': 'Pent Houses' },
  ru: { all: 'Все', apartments: 'Апартаменты', villas: 'Виллы', farms: 'Фермы', offices: 'Офисы', shops: 'Магазины', 'hotel-residences': 'Апарт-отели', 'pent-houses': 'Пентхаусы' },
};

export default async function ForSaleFacetPage({ params }: Params) {
  const { locale, facets } = await params;
  const parsed = parseFacets(facets, false);

  if (!parsed.valid) notFound();

  const isRtl = locale === 'ar';
  const typeLabels = TYPE_LABELS_MAP[locale] ?? TYPE_LABELS_MAP.en;

  const queryParams: Record<string, string | number> = { per_page: 100 };
  if (parsed.type) queryParams.category = parsed.type;

  let properties: any[] = [];
  let total = 0;
  let categories: any[] = [];

  try {
    const [propertiesData, cats] = await Promise.all([
      api.getPropertiesLocale(locale, queryParams),
      api.getCategories(),
    ]);

    properties = propertiesData.properties.data ?? [];
    total = propertiesData.properties.total ?? properties.length;
    categories = cats;

    if (parsed.feature) {
      const keyword = featureKeyword(parsed.feature).toLowerCase();
      properties = properties.filter((p) =>
        p.features_data?.some((f: any) => f.name_en?.toLowerCase().includes(keyword))
      );
      total = properties.length;
    }
  } catch (err) {
    console.error('Faceted listing error:', err);
  }

  const heading = buildPageTitle(parsed, false, locale);
  const noResults = locale === 'ar' ? 'لم يتم العثور على عقارات' : locale === 'ru' ? 'Объекты не найдены' : 'No properties found';
  const unitLabel = locale === 'ar' ? 'عقار' : locale === 'ru' ? 'объектов' : 'properties';
  const whatsappText = locale === 'ar' ? 'تواصل عبر واتساب' : locale === 'ru' ? 'WhatsApp' : 'WhatsApp';

  return (
    <div className={isRtl ? 'rtl' : 'ltr'} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <section className="bg-blue-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">{heading}</h1>
          <p className="opacity-90">{total} {unitLabel}</p>
        </div>
      </section>

      {/* Type tabs with counts */}
      {categories.length > 0 && (
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
            <div className="flex gap-1 py-2 min-w-max">
              {/* All tab */}
              <Link
                href={locale === 'ar' ? '/properties' : `/${locale}/properties`}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              >
                {typeLabels.all} ({categories.reduce((s: number, c: any) => s + (c.properties_count ?? 0), 0)})
              </Link>
              {categories.filter((c: any) => c.properties_count > 0).map((c: any) => {
                const href = locale === 'ar'
                  ? `/properties/for-sale/${c.slug}`
                  : `/${locale}/properties/for-sale/${c.slug}`;
                const active = parsed.type === c.slug;
                return (
                  <Link
                    key={c.id}
                    href={href}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
                  >
                    {typeLabels[c.slug] ?? c.name} ({c.properties_count})
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

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

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/905458551690"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={whatsappText}
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
