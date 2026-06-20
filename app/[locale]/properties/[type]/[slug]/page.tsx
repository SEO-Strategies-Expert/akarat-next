import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';

export const revalidate = 3600;
export const dynamicParams = true;

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
  const canonical = locale === 'ar'
    ? `${siteConfig.url}/properties/${type}/${slug}`
    : `${siteConfig.url}/${locale}/properties/${type}/${slug}`;

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

  let property: any = null;
  let similarProperties: any[] = [];
  let categories: any[] = [];
  let relatedPosts: any[] = [];

  try {
    [property, categories] = await Promise.all([
      api.getPropertyDetailsLocale(slug, locale),
      api.getCategories(),
    ]);
  } catch {
    property = null;
  }

  if (!property) {
    return (
      <div className={isRtl ? 'rtl' : 'ltr'} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
          <p>{locale === 'ar' ? 'جارٍ تحديث معلومات العقار…' : locale === 'ru' ? 'Информация обновляется…' : 'Property details coming soon.'}</p>
        </div>
      </div>
    );
  }

  // Fetch similar properties (same type) and related blog posts in parallel
  try {
    const [simRes, postsRes] = await Promise.all([
      api.getPropertiesLocale(locale, { category: type, limit: 4, per_page: 4 }),
      api.getBlogPosts(locale),
    ]);
    similarProperties = (simRes.properties?.data ?? []).filter((p: any) => p.slug !== slug).slice(0, 3);
    relatedPosts = (postsRes ?? []).slice(0, 3);
  } catch { /* non-critical */ }

  const propertiesHref = locale === 'ar' ? '/properties' : `/${locale}/properties`;
  const formatter = new Intl.NumberFormat(
    locale === 'ar' ? 'ar-SA' : locale === 'ru' ? 'ru-RU' : 'en-US',
    { style: 'currency', currency: 'USD', minimumFractionDigits: 0 },
  );
  const galleryImages: any[] = property.images ?? [];
  const addons: any[] = property.addons ?? [];
  const TYPES_LABEL: Record<string, Record<string, string>> = {
    ar: { apartments: 'الشقق', villas: 'الفلل', farms: 'المزارع', offices: 'المكاتب', shops: 'المحلات', 'hotel-residences': 'الشقق الفندقية', 'pent-houses': 'بنتهاوس' },
    en: { apartments: 'Apartments', villas: 'Villas', farms: 'Farms', offices: 'Offices', shops: 'Shops', 'hotel-residences': 'Hotel Residences', 'pent-houses': 'Pent Houses' },
    ru: { apartments: 'Апартаменты', villas: 'Виллы', farms: 'Фермы', offices: 'Офисы', shops: 'Магазины', 'hotel-residences': 'Апарт-отели', 'pent-houses': 'Пентхаусы' },
  };
  const typeLabels = TYPES_LABEL[locale] ?? TYPES_LABEL.en;

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
            {/* Image gallery thumbnails */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {galleryImages.slice(0, 8).map((img: any) => (
                  <div key={img.id} className="relative h-20 rounded overflow-hidden bg-gray-100">
                    <Image src={img.image} alt={property.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-4">{property.name}</h1>
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-600 text-sm">{t.price}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {property.price_short
                    ? `From ${formatter.format(property.price)}`
                    : formatter.format(property.price)}
                </p>
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
              {/* Location addons (highway, metro, etc.) */}
              {addons.length > 0 && (
                <div className="flex flex-col gap-1">
                  {addons.map((a: any) => (
                    <span key={a.id} className="text-sm text-gray-600 flex items-center gap-2">
                      <i className={a.icon} aria-hidden="true" />
                      {a.addon_name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <a
              href={`https://wa.me/905458551690?text=${encodeURIComponent(property.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition text-center"
            >
              {t.contact}
            </a>
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
                  {property.features_data.map((f: any) => (
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
                  {property.amenities_data.map((a: any) => (
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

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-t">
          <h2 className="text-2xl font-bold mb-6">
            {locale === 'ar' ? 'عقارات مشابهة' : locale === 'ru' ? 'Похожие объекты' : 'Similar Properties'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarProperties.map((p: any) => {
              const pType = p.category?.[0]?.slug ?? type;
              const href = locale === 'ar' ? `/properties/${pType}/${p.slug}` : `/${locale}/properties/${pType}/${p.slug}`;
              return (
                <Link key={p.id} href={href} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                  <div className="relative h-40 bg-gray-200">
                    {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 truncate">{p.name}</h3>
                    <p className="text-blue-600 font-semibold mt-1">{formatter.format(p.price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-t">
          <h2 className="text-2xl font-bold mb-6">
            {locale === 'ar' ? 'مقالات تساعدك في القرار' : locale === 'ru' ? 'Полезные статьи' : 'Articles to Help You Decide'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((post: any) => {
              const href = locale === 'ar' ? `/blogs/${post.slug}` : `/${locale}/blogs/${post.slug}`;
              return (
                <Link key={post.id} href={href} className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                  {post.image && (
                    <div className="relative h-36 bg-gray-200">
                      <Image src={post.image} alt={post.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm">{post.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Browse by type */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 border-t">
          <h2 className="text-xl font-bold mb-4">
            {locale === 'ar' ? 'تصفّح حسب نوع العقار' : locale === 'ru' ? 'Обзор по типу недвижимости' : 'Browse by Property Type'}
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.filter((c: any) => c.properties_count > 0).map((c: any) => {
              const href = locale === 'ar' ? `/properties/for-sale/${c.slug}` : `/${locale}/properties/for-sale/${c.slug}`;
              return (
                <Link
                  key={c.id}
                  href={href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${c.slug === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`}
                >
                  {typeLabels[c.slug] ?? c.name} ({c.properties_count})
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
