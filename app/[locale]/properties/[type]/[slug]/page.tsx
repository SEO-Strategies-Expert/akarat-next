import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Params = { params: Promise<{ locale: string; type: string; slug: string }> };

const SITE_NAMES = {
  ar: 'عقارات إسطنبول',
  en: 'Akarat Istanbul',
  ru: 'Акарат Стамбул',
} as const;

const LABELS = {
  ar: { price: 'السعر', location: 'الموقع', status: 'الحالة', features: 'المميزات', amenities: 'الخدمات', details: 'التفاصيل', contact: 'تواصل معنا', back: 'العودة' },
  en: { price: 'Price', location: 'Location', status: 'Status', features: 'Features', amenities: 'Amenities', details: 'Details', contact: 'Contact Us', back: 'Back' },
  ru: { price: 'Цена', location: 'Расположение', status: 'Статус', features: 'Особенности', amenities: 'Услуги', details: 'Детали', contact: 'Связаться с нами', back: 'Назад' },
} as const;

// Fetch slug→type pairs from old projects sitemap at build time
async function fetchPropertySitemapPaths(): Promise<Array<{ type: string; slug: string }>> {
  try {
    const res = await fetch('https://akaratistanbul.net/sitemap/projects', {
      next: { revalidate: 86400 },
    });
    const xml = await res.text();
    const paths: Array<{ type: string; slug: string }> = [];
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const m = match[1].match(/\/properties\/([^/]+)\/([^/?]+)/);
      if (m) paths.push({ type: m[1], slug: m[2] });
    }
    return paths;
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const paths = await fetchPropertySitemapPaths();
  const locales = ['ar', 'en', 'ru'];
  return locales.flatMap((locale) => paths.map(({ type, slug }) => ({ locale, type, slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, type, slug } = await params;
  const siteName = SITE_NAMES[locale as keyof typeof SITE_NAMES] ?? SITE_NAMES.en;
  const canonical = locale === 'ar' ? `/properties/${type}/${slug}` : `/${locale}/properties/${type}/${slug}`;

  try {
    const property = await api.getPropertyDetails(slug);
    if (!property) return { title: `${slug} - ${siteName}` };

    const formatter = new Intl.NumberFormat(
      locale === 'ar' ? 'ar-SA' : locale === 'ru' ? 'ru-RU' : 'en-US',
      { style: 'currency', currency: 'USD', minimumFractionDigits: 0 },
    );
    const locText = locale === 'ar' ? `في ${property.location}` : locale === 'ru' ? `в ${property.location}` : `in ${property.location}`;
    const title = `${property.name} - ${siteName}`;
    const description = `${property.name} ${locText} - ${formatter.format(property.price)}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'website',
        locale: locale === 'ar' ? 'ar_SA' : locale === 'ru' ? 'ru_RU' : 'en_US',
        images: property.image ? [{ url: property.image, width: 1200, height: 630 }] : undefined,
      },
      alternates: { canonical },
    };
  } catch {
    return { title: `${slug} - ${siteName}`, alternates: { canonical } };
  }
}

export default async function PropertyDetailPage({ params }: Params) {
  const { locale, type, slug } = await params;
  const isRtl = locale === 'ar';
  const t = LABELS[locale as keyof typeof LABELS] ?? LABELS.en;

  let property;
  try {
    property = await api.getPropertyDetails(slug);
  } catch {
    notFound();
  }

  if (!property) notFound();

  const propertiesHref = locale === 'ar' ? '/properties' : `/${locale}/properties`;
  const formatter = new Intl.NumberFormat(
    locale === 'ar' ? 'ar-SA' : locale === 'ru' ? 'ru-RU' : 'en-US',
    { style: 'currency', currency: 'USD', minimumFractionDigits: 0 },
  );

  return (
    <div className={isRtl ? 'rtl' : 'ltr'} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link href={propertiesHref} className="text-blue-600 hover:text-blue-800 font-semibold">
          ← {t.back}
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative h-96 w-full rounded-lg overflow-hidden bg-gray-200">
              {property.image && (
                <Image src={property.image} alt={property.name} fill className="object-cover" priority />
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">{t.price}</p>
                <p className="text-3xl font-bold text-blue-600">{formatter.format(property.price)}</p>
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
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
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
      {(property.features_data?.length > 0 || property.amenities_data?.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {property.features_data?.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">{t.features}</h3>
                <div className="space-y-2">
                  {property.features_data.map((f) => (
                    <div key={f.id} className="flex items-center bg-blue-50 p-3 rounded">
                      <span className="text-blue-600 mr-3">✓</span>
                      <span className="font-semibold">{f.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {property.amenities_data?.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">{t.amenities}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities_data.map((a) => (
                    <div key={a.id} className="bg-gray-50 p-3 rounded text-center">
                      <p className="font-semibold text-sm">{a.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
