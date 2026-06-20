'use client';

const year = new Date().getFullYear();

const labels: Record<string, Record<string, string>> = {
  ar: { copyright: `جميع الحقوق محفوظة © ${year} عقارات اسطنبول`, followUs: 'تابعنا' },
  en: { copyright: `All rights reserved © ${year} Akarat Istanbul`, followUs: 'Follow Us' },
  ru: { copyright: `Все права защищены © ${year} Акарат Стамбул`, followUs: 'Следите за нами' },
};

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const isRtl = locale === 'ar';
  const t = labels[locale as keyof typeof labels] || labels.en;

  return (
    <footer className={`bg-gray-800 text-white py-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>{t.copyright}</p>
        <p className="text-sm text-gray-400 mt-2">{t.followUs}</p>
      </div>
    </footer>
  );
}
