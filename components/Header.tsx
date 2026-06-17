'use client';

import Link from 'next/link';
import LangSwitcher from './LangSwitcher';

const labels: Record<string, Record<string, string>> = {
  ar: { home: 'الرئيسية', properties: 'العقارات', offers: 'العروض', blogs: 'المدونة', about: 'من نحن', contact: 'تواصل' },
  en: { home: 'Home', properties: 'Properties', offers: 'Offers', blogs: 'Blog', about: 'About', contact: 'Contact' },
  ru: { home: 'Главная', properties: 'Недвижимость', offers: 'Предложения', blogs: 'Блог', about: 'О нас', contact: 'Контакты' },
};

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  const isRtl = locale === 'ar';
  const t = labels[locale as keyof typeof labels] || labels.en;

  return (
    <header className={`bg-white shadow ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">Akarat Istanbul</div>
        <div className="flex gap-6">
          <Link href={locale === 'ar' ? '/' : `/${locale}`} className="hover:text-blue-600">
            {t.home}
          </Link>
          <Link href={locale === 'ar' ? '/properties' : `/${locale}/properties`} className="hover:text-blue-600">
            {t.properties}
          </Link>
          <Link href={locale === 'ar' ? '/offers' : `/${locale}/offers`} className="hover:text-blue-600">
            {t.offers}
          </Link>
          <Link href={locale === 'ar' ? '/blogs' : `/${locale}/blogs`} className="hover:text-blue-600">
            {t.blogs}
          </Link>
          <Link href={locale === 'ar' ? '/about' : `/${locale}/about`} className="hover:text-blue-600">
            {t.about}
          </Link>
          <Link href={locale === 'ar' ? '/contact' : `/${locale}/contact`} className="hover:text-blue-600">
            {t.contact}
          </Link>
        </div>
        <LangSwitcher locale={locale} />
      </nav>
    </header>
  );
}
