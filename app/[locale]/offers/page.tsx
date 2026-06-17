import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const titles = {
    ar: 'العروض - عقارات إسطنبول',
    en: 'Offers - Akarat Istanbul',
    ru: 'Предложения - Акарат Стамбул',
  };
  const descriptions = {
    ar: 'اكتشف العروض الحصرية والخاصة على العقارات المختارة',
    en: 'Discover exclusive and special offers on selected properties',
    ru: 'Откройте эксклюзивные и специальные предложения на выбранную недвижимость',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  const messages = {
    ar: {
      title: 'العروض',
      coming: 'العروض الحصرية قريباً',
      description: 'نحن نعمل على تجهيز عروض حصرية ومميزة لعملائنا الكرام. يرجى العودة قريباً.',
    },
    en: {
      title: 'Offers',
      coming: 'Exclusive Offers Coming Soon',
      description: 'We are preparing exclusive and special offers for our valued clients. Please check back soon.',
    },
    ru: {
      title: 'Предложения',
      coming: 'Эксклюзивные предложения скоро',
      description: 'Мы готовим эксклюзивные и специальные предложения для наших уважаемых клиентов. Пожалуйста, проверьте позже.',
    },
  };

  const t = messages[locale as keyof typeof messages] || messages.en;

  return (
    <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
        <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">{t.coming}</h2>
          <p className="text-blue-800 text-lg">{t.description}</p>
        </div>
      </div>
    </div>
  );
}
