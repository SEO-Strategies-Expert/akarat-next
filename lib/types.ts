// API Response Wrapper
export interface ApiResponse<T> {
  status: boolean;
  errNum: string;
  msg: string;
  data: T;
}

// Categories
export interface Category {
  id: number;
  slug: string;
  created_at: string;
  updated_at: string;
  icon: string;
  status: number;
  name: string;
  short: string;
  details: string;
  meta_title: string;
  meta_description: string;
  meta_tags: string;
  properties_count: number;
}

export interface CategoriesData {
  category: Category[];
}

// Cities
export interface City {
  id: number;
  name_ar: string;
  name_en: string;
  name_ru: string;
  image: string;
  created_at: string;
  updated_at: string;
  name: string;
  properties_count: number;
}

export interface CitiesData {
  cities: City[];
}

// Amenities
export interface Amenity {
  id: number;
  icon: string;
  created_at: string;
  updated_at: string;
  name: string;
}

// Features
export interface Feature {
  id: number;
  name_en: string;
  created_at: string;
  updated_at: string;
  name: string;
}

// Properties
export interface Property {
  id: number;
  slug: string;
  location: string;
  city_id: number;
  views: number;
  installment_start_percent: number;
  installment_end_percent: number;
  price: number;
  owner_id: number;
  amenties: string[];
  image: string;
  status: number;
  created_at: string;
  updated_at: string;
  features: string[];
  video: string | null;
  status_id: number;
  country_id: number;
  district_id: number;
  name: string;
  installment_start_text: string;
  installment_end_text: string;
  description: string;
  price_short: string;
  meta_title: string;
  meta_description: string;
  meta_tags: string;
  amenities_data: Amenity[];
  features_data: Feature[];
  country_name: string;
  district_name: string;
  status_name: string;
  category: Category[];
  country?: {
    id: number;
    created_at: string | null;
  };
}

export interface PropertiesData {
  overview: string;
  properties: {
    current_page: number;
    data: Property[];
    first_page_url?: string;
    from?: number;
    last_page?: number;
    last_page_url?: string;
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number;
    total?: number;
  };
}

// Settings
export interface Settings {
  logo: string;
  email: string;
  phone: string;
  address: string;
  facebook: string;
  twitter: string;
  instagram: string;
  [key: string]: any;
}

// FAQs
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface FAQsData {
  faqs: FAQ[];
}

// Index Page Data
export interface IndexData {
  overview?: string;
  sliders?: Array<any>;
  featured_properties?: Property[];
  [key: string]: any;
}

// Blog
export interface BlogPost {
  id: number;
  slug: string;
  language: string;
  name: string;       // actual title field from API
  title?: string;     // alias kept for compatibility
  description: string; // full HTML body
  content?: string;   // alias kept for compatibility
  excerpt?: string;
  image?: string;
  meta_title?: string;
  meta_description?: string;
  faq_title?: string | null;
  faq_title_1?: string | null;
  faq_short?: string | null;
  category?: any;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface BlogPostsData {
  posts: {
    current_page: number;
    data: BlogPost[];
    total: number;
    last_page: number;
    [key: string]: any;
  };
  cats: any[];
}

// Property detail extras
export interface PropertyAddon {
  id: number;
  addon_name: string;
  icon: string;
}

export interface PropertyImage {
  id: number;
  property_id: number;
  image: string;
  name: string | null;
}

// Offers
export interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface OffersData {
  offers: Offer[];
}
