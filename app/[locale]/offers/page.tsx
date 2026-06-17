import { api } from '@/lib/api';

export default async function OffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

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
    return <div className="text-center py-12">Error loading offers</div>;
  }
}
