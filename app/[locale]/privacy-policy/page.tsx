import type { Metadata } from 'next';

type Params = { params: Promise<{ locale: string }> };

const content = {
  ar: {
    title: 'سياسة الخصوصية - عقارات إسطنبول',
    heading: 'سياسة الخصوصية',
    body: 'نحن في عقارات إسطنبول نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لا نشارك معلوماتك مع أطراف ثالثة دون موافقتك.',
  },
  en: {
    title: 'Privacy Policy - Akarat Istanbul',
    heading: 'Privacy Policy',
    body: 'At Akarat Istanbul we respect your privacy and are committed to protecting your personal data. We do not share your information with third parties without your consent.',
  },
  ru: {
    title: 'Политика конфиденциальности - Акарат Стамбул',
    heading: 'Политика конфиденциальности',
    body: 'В Акарат Стамбул мы уважаем вашу конфиденциальность и обязуемся защищать ваши личные данные. Мы не передаём вашу информацию третьим лицам без вашего согласия.',
  },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const c = content[locale as keyof typeof content] ?? content.en;
  const canonical = locale === 'ar' ? '/privacy-policy' : `/${locale}/privacy-policy`;
  return {
    title: c.title,
    alternates: { canonical },
  };
}

export default async function PrivacyPolicyPage({ params }: Params) {
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
