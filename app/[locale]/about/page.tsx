import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const titles = {
    ar: 'من نحن - عقارات إسطنبول',
    en: 'About Us - Akarat Istanbul',
    ru: 'О нас - Акарат Стамбул',
  };
  const descriptions = {
    ar: 'تعرف على منصة عقارات إسطنبول الرائدة وخدماتها الشاملة',
    en: 'Learn about Akarat Istanbul, a leading real estate platform with comprehensive services',
    ru: 'Узнайте о платформе Akarat Istanbul и её комплексных услугах недвижимости',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  return (
    <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">
          {locale === 'ar' ? 'من نحن' : locale === 'en' ? 'About Us' : 'О нас'}
        </h1>
        <div className="prose prose-lg max-w-none">
          <p>
            {locale === 'ar'
              ? 'نحن منصة عقارات رائدة في اسطنبول تقدم خدمات عقارية شاملة.'
              : locale === 'en'
                ? 'We are a leading real estate platform in Istanbul offering comprehensive property services.'
                : 'Мы ведущая платформа недвижимости в Стамбуле, предлагающая комплексные услуги недвижимости.'}
          </p>
        </div>
      </div>
    </div>
  );
}
