import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const titles = {
    ar: 'المدونة - عقارات إسطنبول',
    en: 'Blog - Akarat Istanbul',
    ru: 'Блог - Акарат Стамбул',
  };
  const descriptions = {
    ar: 'اقرأ أحدث المقالات والنصائح العقارية',
    en: 'Read the latest articles and real estate tips',
    ru: 'Прочитайте последние статьи и советы по недвижимости',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

export default async function BlogsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  return (
    <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">
          {locale === 'ar' ? 'المدونة' : locale === 'en' ? 'Blog' : 'Блог'}
        </h1>
        <p className="text-gray-600">
          {locale === 'ar'
            ? 'مدونتنا قريباً'
            : locale === 'en'
              ? 'Our blog coming soon'
              : 'Наш блог скоро'}
        </p>
      </div>
    </div>
  );
}
