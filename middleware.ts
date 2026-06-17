import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const handleI18nRouting = createIntlMiddleware({
  locales: ['ar', 'en', 'ru'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  // Extract locale from pathname
  const pathname = request.nextUrl.pathname;
  let locale = 'ar';
  if (pathname.startsWith('/en')) {
    locale = 'en';
  } else if (pathname.startsWith('/ru')) {
    locale = 'ru';
  }

  // Set locale cookie
  response.cookies.set('NEXT_LOCALE_DETECTED', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  return response;
}

export const config = {
  matcher: ['/', '/(en|ru)/:path*'],
};
