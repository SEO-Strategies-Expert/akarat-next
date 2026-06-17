import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import FilterPanel from '@/components/FilterPanel';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;

  const siteNames = {
    ar: 'عقارات إسطنبول',
    en: 'Akarat Istanbul',
    ru: 'Акарат Стамбул',
  };

  const siteName = siteNames[locale as keyof typeof siteNames] || siteNames.en;

  try {
    // Try to fetch property details for metadata
    const property = await api.getPropertyDetails(slug).catch(() => null);

    if (property) {
      const priceFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : locale === 'ru' ? 'ru-RU' : 'en-US', {
        style: 'currency',
        currency: 'USD',
      });

      const locationText = locale === 'ar' ? `في ${property.location}` : locale === 'ru' ? `в ${property.location}` : `in ${property.location}`;

      return {
        title: `${property.name} - ${siteName}`,
        description: `${property.name} ${locationText} - ${priceFormatter.format(property.price)}`,
      };
    }

    // Fallback for category pages
    const categories = await api.getCategories();
    const category = categories.find((c) => c.slug === slug);

    if (category) {
      return {
        title: `${category.name} - ${siteName}`,
        description: category.short || (locale === 'ar' ? `تصفح جميع ${category.name}` : locale === 'ru' ? `Просмотрите все ${category.name}` : `Browse all ${category.name}`),
      };
    }

    // Default metadata
    return {
      title: `${slug} - ${siteName}`,
    };
  } catch (error) {
    return {
      title: `${slug} - ${siteName}`,
    };
  }
}

const labels: Record<string, Record<string, string>> = {
  ar: {
    price: 'السعر',
    location: 'الموقع',
    status: 'الحالة',
    features: 'المميزات',
    amenities: 'الخدمات',
    details: 'التفاصيل',
    contact: 'تواصل معنا',
    back: 'العودة',
    properties: 'العقارات',
    showing: 'عرض',
    property: 'عقار',
  },
  en: {
    price: 'Price',
    location: 'Location',
    status: 'Status',
    features: 'Features',
    amenities: 'Amenities',
    details: 'Details',
    contact: 'Contact Us',
    back: 'Back',
    showing: 'Showing',
    property: 'properties',
  },
  ru: {
    price: 'Цена',
    location: 'Расположение',
    status: 'Статус',
    features: 'Особенности',
    amenities: 'Услуги',
    details: 'Детали',
    contact: 'Связаться с нами',
    back: 'Назад',
    showing: 'Показано',
    property: 'объектов',
  },
};

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isRtl = locale === 'ar';
  const t = labels[locale as keyof typeof labels] || labels.en;

  try {
    // Try to fetch as property first
    const property = await api.getPropertyDetails(slug).catch(() => null);

    if (property) {
      // It's a property detail page - render property view

    const priceFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : locale === 'ru' ? 'ru-RU' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });

    return (
      <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href={locale === 'ar' ? '/properties' : `/${locale}/properties`}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← {t.back}
          </Link>
        </div>

        {/* Property Hero */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-200">
                {property.image && (
                  <Image
                    src={property.image}
                    alt={property.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h1 className="text-3xl font-bold mb-4">{property.name}</h1>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">{t.price}</p>
                  <p className="text-3xl font-bold text-blue-600">{priceFormatter.format(property.price)}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">{t.location}</p>
                  <p className="font-semibold">{property.location}</p>
                </div>

                {property.status_name && (
                  <div>
                    <p className="text-gray-600 text-sm">{t.status}</p>
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {property.status_name}
                    </span>
                  </div>
                )}
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mb-2">
                {t.contact}
              </button>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">{t.details}</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: property.description }} />
          </div>
        </section>

        {/* Features & Amenities */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Features */}
            {property.features_data && property.features_data.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">{t.features}</h3>
                <div className="space-y-2">
                  {property.features_data.map((feature) => (
                    <div key={feature.id} className="flex items-center bg-blue-50 p-3 rounded">
                      <span className="text-blue-600 mr-3">✓</span>
                      <span className="font-semibold">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities_data && property.amenities_data.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">{t.amenities}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities_data.map((amenity) => (
                    <div key={amenity.id} className="bg-gray-50 p-3 rounded text-center">
                      <p className="font-semibold text-sm">{amenity.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      );
    }

    // Not a property, try as category listing
    const [propertiesData, cities, categories] = await Promise.all([
      api.getPropertiesBySlug(slug, { limit: 12 }),
      api.getCities(),
      api.getCategories(),
    ]);

    const properties = propertiesData.properties.data || [];
    const category = categories.find((c) => c.slug === slug);

    return (
      <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <section className="bg-blue-600 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{category?.name || slug}</h1>
            <p className="opacity-90">
              {category?.short || `${t.showing} ${properties.length} ${t.property}`}
            </p>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <FilterPanel cities={cities} categories={categories} locale={locale} />
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {locale === 'ar'
                  ? 'لم يتم العثور على عقارات'
                  : locale === 'en'
                    ? 'No properties found'
                    : 'Недвижимость не найдена'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to load:', error);
    notFound();
  }
}
