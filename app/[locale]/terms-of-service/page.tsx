import type { Metadata } from 'next';

type Params = { params: Promise<{ locale: string }> };

const content = {
  ar: {
    title: 'شروط الخدمة - عقارات إسطنبول',
    heading: 'شروط الخدمة',
    body: 'باستخدامك لموقع عقارات إسطنبول، فإنك توافق على الالتزام بهذه الشروط والأحكام. نحتفظ بالحق في تعديل هذه الشروط في أي وقت.',
  },
  en: {
    title: 'Terms of Service - Akarat Istanbul',
    heading: 'Terms of Service',
    body: 'By using the Akarat Istanbul website, you agree to be bound by these terms and conditions. We reserve the right to modify these terms at any time.',
  },
  ru: {
    title: 'Условия использования - Акарат Стамбул',
    heading: 'Условия использования',
    body: 'Используя веб-сайт Акарат Стамбул, вы соглашаетесь соблюдать настоящие условия. Мы оставляем за собой право изменять эти условия в любое время.',
  },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const c = content[locale as keyof typeof content] ?? content.en;
  const canonical = locale === 'ar' ? '/terms-of-service' : `/${locale}/terms-of-service`;
  return {
    title: c.title,
    alternates: { canonical },
  };
}

export default async function TermsOfServicePage({ params }: Params) {
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
