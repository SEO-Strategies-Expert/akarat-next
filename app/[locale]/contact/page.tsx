import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const titles = {
    ar: 'تواصل معنا - عقارات إسطنبول',
    en: 'Contact Us - Akarat Istanbul',
    ru: 'Свяжитесь с нами - Акарат Стамбул',
  };
  const descriptions = {
    ar: 'تواصل مع فريقنا للاستفسار عن العقارات والحصول على المساعدة',
    en: 'Contact our team to inquire about properties and get assistance',
    ru: 'Свяжитесь с нашей командой для получения информации о недвижимости и помощи',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRtl = locale === 'ar';

  const titles = {
    ar: 'تواصل معنا',
    en: 'Contact Us',
    ru: 'Свяжитесь с нами',
  };

  const title = titles[locale as keyof typeof titles] || titles.en;

  return (
    <div className={`${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <ContactForm locale={locale} isRtl={isRtl} />
      </div>
    </div>
  );
}
