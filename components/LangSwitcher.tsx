'use client';

import { useRouter, usePathname } from 'next/navigation';

interface LangSwitcherProps {
  locale: string;
}

export default function LangSwitcher({ locale }: LangSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, newLocale === 'ar' ? '' : `/${newLocale}`);
    router.push(newPathname || (newLocale === 'ar' ? '/' : `/${newLocale}`));
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleChange('ar')}
        className={`px-3 py-1 rounded ${locale === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        العربية
      </button>
      <button
        onClick={() => handleChange('en')}
        className={`px-3 py-1 rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
      <button
        onClick={() => handleChange('ru')}
        className={`px-3 py-1 rounded ${locale === 'ru' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        Русский
      </button>
    </div>
  );
}
