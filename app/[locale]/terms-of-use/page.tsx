import type { Metadata } from 'next';

type Params = { params: Promise<{ locale: string }> };

const content = {
  ar: {
    title: 'شروط الاستخدام - عقارات إسطنبول',
    heading: 'شروط الاستخدام',
    body: 'يُرجى قراءة هذه الشروط بعناية قبل استخدام موقع عقارات إسطنبول. استخدامك للموقع يعني قبولك الكامل لهذه الشروط.',
  },
  en: {
    title: 'Terms of Use - Akarat Istanbul',
    heading: 'Terms of Use',
    body: 'Please read these terms carefully before using the Akarat Istanbul website. Your use of this site constitutes your full acceptance of these terms.',
  },
  ru: {
    title: 'Пользовательское соглашение - Акарат Стамбул',
    heading: 'Пользовательское соглашение',
    body: 'Пожалуйста, внимательно ознакомьтесь с настоящими условиями перед использованием веб-сайта Акарат Стамбул. Ваше использование сайта означает полное принятие этих условий.',
  },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const c = content[locale as keyof typeof content] ?? content.en;
  const canonical = locale === 'ar' ? '/terms-of-use' : `/${locale}/terms-of-use`;
  return {
    title: c.title,
    alternates: { canonical },
  };
}

export default async function TermsOfUsePage({ params }: Params) {
  const { locale } = await params;
  const c = content[locale as keyof typeof content] ?? content.en;
  const isRtl = locale === 'ar';

  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-4xl font-bold mb-8">{c.heading}</h1>
      <p className="text-gray-700 leading-relaxed">{c.body}</p>
    </div>
  );
}
