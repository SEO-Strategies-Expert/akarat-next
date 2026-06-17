'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LocaleHydrator() {
  const pathname = usePathname();

  useEffect(() => {
    // Detect locale from pathname
    let locale = 'ar';
    if (pathname.startsWith('/en')) {
      locale = 'en';
    } else if (pathname.startsWith('/ru')) {
      locale = 'ru';
    }

    // Update HTML attributes
    const html = document.documentElement;
    html.lang = locale;
    html.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [pathname]);

  return null;
}
