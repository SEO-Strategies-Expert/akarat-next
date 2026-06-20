import {
  ApiResponse,
  CategoriesData,
  CitiesData,
  PropertiesData,
  Property,
  OffersData,
  FAQsData,
  IndexData,
  Settings,
  BlogPost,
  BlogPostsData,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://admin.akaratistanbul.net/api';

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & { revalidate?: number } = {}
): Promise<ApiResponse<T>> {
  const { revalidate = 3600, ...fetchOptions } = options;

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ar',
        ...fetchOptions.headers,
      },
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Categories
  getCategories: async () => {
    const res = await fetchAPI<CategoriesData>('/categories', { revalidate: 86400 });
    return res.data.category;
  },

  // Cities
  getCities: async () => {
    const res = await fetchAPI<CitiesData>('/cities', { revalidate: 86400 });
    return res.data.cities;
  },

  // Properties List
  getProperties: async (params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const res = await fetchAPI<PropertiesData>(
      `/properties${query ? '?' + query : ''}`,
      { revalidate: 3600 }
    );
    return res.data;
  },

  // Property by Slug (Category)
  getPropertiesBySlug: async (slug: string, params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const res = await fetchAPI<PropertiesData>(
      `/properties/${slug}${query ? '?' + query : ''}`,
      { revalidate: 3600 }
    );
    return res.data;
  },

  // Property Details
  getPropertyDetails: async (slug: string) => {
    const res = await fetchAPI<{ property: Property }>(`/property/${slug}`, { revalidate: 3600 });
    return res.data.property;
  },

  // Offers
  getOffers: async () => {
    const res = await fetchAPI<OffersData>('/offers', { revalidate: 86400 });
    return res.data.offers;
  },

  // Settings
  getSettings: async () => {
    const res = await fetchAPI<Settings>('/settings', { revalidate: 86400 });
    return res.data;
  },

  // FAQs
  getFAQs: async () => {
    const res = await fetchAPI<FAQsData>('/faqs', { revalidate: 86400 });
    return res.data.faqs;
  },

  // Index Page Data
  getIndexData: async () => {
    const res = await fetchAPI<IndexData>('/index', { revalidate: 3600 });
    return res.data;
  },

  // Blog Posts — real endpoint is /blog (not /blogs)
  getBlogPosts: async (locale?: string) => {
    const res = await fetchAPI<BlogPostsData>('/blog', {
      revalidate: 3600,
      headers: locale ? { 'Accept-Language': locale } : {},
    });
    return res.data.posts.data;
  },

  // Single Blog Post — no single-post endpoint; filter from full list
  getBlogPost: async (slug: string, locale?: string) => {
    const res = await fetchAPI<BlogPostsData>('/blog?per_page=200', {
      revalidate: 3600,
      headers: locale ? { 'Accept-Language': locale } : {},
    });
    const post = res.data.posts.data.find((p) => p.slug === slug) ?? null;
    if (post) {
      // Normalise: callers may use .title or .name, .content or .description
      post.title = post.title ?? post.name;
      post.content = post.content ?? post.description;
    }
    return post;
  },

  // Properties with locale-aware names
  getPropertiesLocale: async (locale: string, params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    if (params) Object.entries(params).forEach(([k, v]) => searchParams.append(k, String(v)));
    const query = searchParams.toString();
    const res = await fetchAPI<PropertiesData>(
      `/properties${query ? '?' + query : ''}`,
      { revalidate: 3600, headers: { 'Accept-Language': locale } },
    );
    return res.data;
  },

  // Property detail with locale
  getPropertyDetailsLocale: async (slug: string, locale: string) => {
    const res = await fetchAPI<{ property: Property }>(`/property/${slug}`, {
      revalidate: 3600,
      headers: { 'Accept-Language': locale },
    });
    return res.data.property;
  },
};
