'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { City, Category } from '@/lib/types';

interface FilterPanelProps {
  cities: City[];
  categories: Category[];
  locale: string;
}

export default function FilterPanel({ cities, categories, locale }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRtl = locale === 'ar';

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  const handleFilter = useCallback(() => {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (category) params.append('category', category);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);

    router.push(`${pathname}?${params.toString()}`);
  }, [city, category, minPrice, maxPrice, pathname, router]);

  const handleReset = () => {
    setCity('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  };

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-md mb-8 ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <h3 className="text-xl font-bold mb-4">
        {locale === 'ar' ? 'البحث والتصفية' : locale === 'en' ? 'Search & Filter' : 'Поиск и фильтр'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'المدينة' : locale === 'en' ? 'City' : 'Город'}
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {locale === 'ar' ? 'جميع المدن' : locale === 'en' ? 'All Cities' : 'Все города'}
            </option>
            {cities.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'النوع' : locale === 'en' ? 'Type' : 'Тип'}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {locale === 'ar' ? 'جميع الأنواع' : locale === 'en' ? 'All Types' : 'Все типы'}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'السعر من' : locale === 'en' ? 'Min Price' : 'Мин. цена'}
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'ar' ? 'السعر إلى' : locale === 'en' ? 'Max Price' : 'Макс. цена'}
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="999999"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleFilter}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {locale === 'ar' ? 'بحث' : locale === 'en' ? 'Search' : 'Поиск'}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
        >
          {locale === 'ar' ? 'إعادة تعيين' : locale === 'en' ? 'Reset' : 'Сброс'}
        </button>
      </div>
    </div>
  );
}
