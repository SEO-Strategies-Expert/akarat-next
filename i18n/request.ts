import { getRequestConfig } from 'next-intl/server';

const LOCALES = ['ar', 'en', 'ru'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !LOCALES.includes(locale as any)) {
    locale = 'en';
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
