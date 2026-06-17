import { MetadataRoute } from 'next';
import { api } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://akaratistanbul.net';
  const locales = ['ar', 'en', 'ru'];

  try {
    const categories = await api.getCategories();

    const staticPages = ['/', '/about', '/contact', '/offers', '/blogs'];
    const urls: MetadataRoute.Sitemap = [];

    // Add static pages for all locales
    staticPages.forEach((path) => {
      locales.forEach((locale) => {
        const url = locale === 'ar' ? `${baseUrl}${path}` : `${baseUrl}/${locale}${path}`;
        urls.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: path === '/' ? 1 : 0.8,
        });
      });
    });

    // Add category pages
    categories.forEach((category) => {
      locales.forEach((locale) => {
        const url = locale === 'ar' ? `${baseUrl}/properties/${category.slug}` : `${baseUrl}/${locale}/properties/${category.slug}`;
        urls.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'daily',
          priority: 0.7,
        });
      });
    });

    return urls;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [];
  }
}
