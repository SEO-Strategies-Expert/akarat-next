import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import type { Metadata } from 'next';
import { buildPageTitle } from '@/lib/facets';
import { siteConfig } from '@/lib/seo';

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const title = buildPageTitle({ type: null, city: null, feature: null, valid: true }, true, locale);
  // Self-canonical — the old site uses /properties/istanbul/for-sale/ as its own canonical
  const canonical = locale === 'ar'
    ? `${siteConfig.url}/properties/istanbul/for-sale/`
    : `${siteConfig.url}/${locale}/properties/istanbul/for-sale/`;

  return {
    title,
    alternates: { canonical },
    openGraph: { title, url: canonical, type: 'website' },
  };
}

export default async function IstanbulForSaleIndexPage({ params }: Params) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  let properties: Awaited<ReturnType<typeof api.getProperties>>['properties']['data'] = [];
  try {
    const data = await api.getProperties({ limit: 24 });
    properties = data.properties.data ?? [];
  } catch (err) {
    console.error('Istanbul for-sale index error:', err);
  }

  const heading = buildPageTitle({ type: null, city: null, feature: null, valid: true }, true, locale);
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
