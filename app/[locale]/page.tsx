export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  return (
    <div className={`py-12 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">
          {locale === 'ar' ? 'عقارات اسطنبول' : locale === 'en' ? 'Akarat Istanbul' : 'Акарат Стамбул'}
        </h1>
        <p className="text-lg text-gray-600">
          {locale === 'ar'
            ? 'مرحباً بك في منصة عقارات اسطنبول'
            : locale === 'en'
              ? 'Welcome to Akarat Istanbul'
              : 'Добро пожаловать в Акарат Стамбул'}
        </p>
      </div>
    </div>
  );
}
