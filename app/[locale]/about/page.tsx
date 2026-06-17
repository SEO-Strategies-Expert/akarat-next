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
