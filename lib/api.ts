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
};
