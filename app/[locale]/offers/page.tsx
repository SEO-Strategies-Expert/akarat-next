import { api } from '@/lib/api';
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

  const errorMessages = {
    ar: 'فشل تحميل العروض. يرجى المحاولة لاحقاً.',
    en: 'Failed to load offers. Please try again later.',
    ru: 'Ошибка загрузки предложений. Пожалуйста, попробуйте позже.',
  };

  try {
    const offers = await api.getOffers();

    return (
      <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">
            {locale === 'ar' ? 'العروض' : locale === 'en' ? 'Offers' : 'Предложения'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer: any) => (
              <div key={offer.id} className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                <p className="text-gray-600">{offer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className={`text-center py-12 px-4 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <p className="text-red-600 text-lg">
          {errorMessages[locale as keyof typeof errorMessages] || errorMessages.en}
        </p>
      </div>
    );
  }
}
