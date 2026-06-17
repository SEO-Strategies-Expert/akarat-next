export const siteConfig = {
  name: 'Akarat Istanbul',
  description: 'Real estate platform in Istanbul offering apartments, villas, offices, and more',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://akaratistanbul.net',
  ogImage: 'https://admin.akaratistanbul.net/storage/site/logo.png',
};

export const generateHreflang = (path: string, locales: string[] = ['ar', 'en', 'ru']) => {
  return locales.map((locale) => ({
    hrefLang: locale,
    href: locale === 'ar' ? `${siteConfig.url}${path}` : `${siteConfig.url}/${locale}${path}`,
  }));
};

export const generateJsonLd = (type: string, data: Record<string, any>) => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };
  return baseSchema;
};

export const organizationSchema = () =>
  generateJsonLd('Organization', {
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
  });

export const propertySchema = (property: any) =>
  generateJsonLd('Product', {
    name: property.name,
    description: property.description?.replace(/<[^>]*>/g, '') || property.short,
    image: property.image,
    price: property.price,
    priceCurrency: 'USD',
    location: {
      '@type': 'Place',
      name: property.location,
    },
  });

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) =>
  generateJsonLd('BreadcrumbList', {
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
