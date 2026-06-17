import { api } from '@/lib/api';
import PropertyCard from '@/components/PropertyCard';
import CategoryCard from '@/components/CategoryCard';
import Link from 'next/link';

const labels: Record<string, Record<string, string>> = {
  ar: {
    featured: 'العقارات المميزة',
    categories: 'أنواع العقارات',
    viewAll: 'عرض الكل',
    exploreProperties: 'استكشف العقارات',
    featured_desc: 'اختر من مجموعة منتقاة من أفضل العقارات',
  },
  en: {
    featured: 'Featured Properties',
    categories: 'Property Types',
    viewAll: 'View All',
    exploreProperties: 'Explore Properties',
    featured_desc: 'Choose from a curated selection of the best properties',
  },
  ru: {
    featured: 'Избранные объекты',
    categories: 'Типы недвижимости',
    viewAll: 'Показать все',
    exploreProperties: 'Просмотр объектов',
    featured_desc: 'Выберите из подборки лучших объектов недвижимости',
  },
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  const t = labels[locale as keyof typeof labels] || labels.en;

  try {
    const [propertiesData, categories] = await Promise.all([
      api.getProperties({ limit: 6 }),
      api.getCategories(),
    ]);

    const featured = propertiesData.properties.data?.slice(0, 6) || [];

    return (
      <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Akarat Istanbul</h1>
            <p className="text-xl opacity-90 mb-8">
              {locale === 'ar'
                ? 'اعثر على عقارك المثالي في اسطنبول'
                : locale === 'en'
                  ? 'Find your perfect property in Istanbul'
                  : 'Найдите идеальное свойство в Стамбуле'}
            </p>
            <Link
              href={locale === 'ar' ? '/properties' : `/${locale}/properties`}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              {t.exploreProperties}
            </Link>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">{t.categories}</h2>
              <Link
                href={locale === 'ar' ? '/properties' : `/${locale}/properties`}
                className="text-blue-600 font-semibold hover:text-blue-800"
              >
                {t.viewAll} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} locale={locale} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Properties Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.featured}</h2>
              <p className="text-gray-600">{t.featured_desc}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} locale={locale} />
              ))}
            </div>
            {featured.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href={locale === 'ar' ? '/properties' : `/${locale}/properties`}
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  {t.viewAll}
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error('Failed to load homepage data:', error);
    return (
      <div className={`py-12 px-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">Failed to load content. Please try again later.</p>
        </div>
      </div>
    );
  }
}
