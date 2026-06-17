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
