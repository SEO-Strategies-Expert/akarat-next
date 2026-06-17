import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const effectiveLocale = locale || 'ar';
  console.log(`[i18n/request.ts] locale param="${locale}", effective="${effectiveLocale}"`);
  const messages = (await import(`./messages/${effectiveLocale}.json`)).default;
  console.log(`[i18n/request.ts] loaded messages, propertyTypes.apartments="${messages.propertyTypes?.apartments}"`);
  return {
    locale: effectiveLocale,
    messages,
  };
});
