import createIntlMiddleware from 'next-intl/middleware';

const handleI18nRouting = createIntlMiddleware({
  locales: ['ar', 'en', 'ru'],
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

export default handleI18nRouting;

export const config = {
  matcher: ['/', '/(en|ru)/:path*'],
};
