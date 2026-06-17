import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import FilterPanel from '@/components/FilterPanel';
import { Suspense } from 'react';
import type { Metadata } from 'next';

const labels: Record<string, Record<string, string>> = {
  ar: { properties: 'العقارات', noResults: 'لم يتم العثور على عقارات', loading: 'جاري التحميل...', showing: 'عرض', property: 'عقار' },
  en: { properties: 'Properties', noResults: 'No properties found', loading: 'Loading...', showing: 'Showing', property: 'properties' },
  ru: { properties: 'Недвижимость', noResults: 'Объекты не найдены', loading: 'Загрузка...', showing: 'Показано', property: 'объектов' },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const titles = {
    ar: 'العقارات - عقارات إسطنبول',
    en: 'Properties - Akarat Istanbul',
    ru: 'Недвижимость - Акарат Стамбул',
  };
  const descriptions = {
    ar: 'اكتشف أفضل العقارات في إسطنبول مع خيارات متنوعة من الشقق والفلل والمزيد',
    en: 'Discover the best properties in Istanbul with diverse options including apartments, villas, and more',
    ru: 'Откройте лучшую недвижимость в Стамбуле с разнообразными вариантами квартир, вилл и многого другого',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const isRtl = locale === 'ar';
  const t = labels[locale as keyof typeof labels] || labels.en;

  const queryParams: Record<string, string | number> = {};
  if (search.city) queryParams.city = String(search.city);
  if (search.category) queryParams.category = String(search.category);
  if (search.min_price) queryParams.min_price = Number(search.min_price);
  if (search.max_price) queryParams.max_price = Number(search.max_price);
  queryParams.limit = 12;

  try {
    const [propertiesData, cities, categories] = await Promise.all([
      api.getProperties(queryParams),
      api.getCities(),
      api.getCategories(),
    ]);

    const properties = propertiesData.properties.data || [];

    return (
      <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <section className="bg-blue-600 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{t.properties}</h1>
            <p className="opacity-90">
              {t.showing} {properties.length} {t.property}
            </p>
          </div>
        </section>

        {/* Filters & Results */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <FilterPanel cities={cities} categories={categories} locale={locale} />

          {/* Properties Grid */}
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t.noResults}</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to load properties:', error);
    return (
      <div className={`py-12 px-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">
            {locale === 'ar'
              ? 'فشل تحميل البيانات'
              : locale === 'en'
                ? 'Failed to load data'
                : 'Ошибка загрузки данных'}
          </p>
        </div>
      </div>
    );
  }
}
