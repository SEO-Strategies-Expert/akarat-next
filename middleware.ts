import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const handleI18nRouting = createIntlMiddleware({
  locales: ['ar', 'en', 'ru'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  // Detect locale from pathname and set header
  const pathname = request.nextUrl.pathname;
  let locale = 'ar';

  if (pathname.startsWith('/en')) {
    locale = 'en';
  } else if (pathname.startsWith('/ru')) {
    locale = 'ru';
  }

  // Set header for root layout to read
  response.headers.set('x-locale', locale);

  return response;
}

export const config = {
  matcher: ['/', '/(en|ru)/:path*'],
};
