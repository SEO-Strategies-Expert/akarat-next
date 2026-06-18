'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Category } from '@/lib/types';

interface CategoryCardProps {
  category: Category;
  locale: string;
}

export default function CategoryCard({ category, locale }: CategoryCardProps) {
  const tTypes = useTranslations('propertyTypes');
  const tCommon = useTranslations('common');
  const isRtl = locale === 'ar';
  const href = locale === 'ar' ? `/properties/${category.slug}` : `/${locale}/properties/${category.slug}`;

  return (
    <Link href={href}>
      <div className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all text-center ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="relative h-32 w-full overflow-hidden bg-gray-100">
          {category.icon && (
            <Image
              src={category.icon}
              alt={category.name}
              fill
              className="object-contain p-4"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-1">{tTypes(category.slug)}</h3>
          <p className="text-xs text-gray-600 line-clamp-2">{category.short}</p>
          <p className="text-sm text-blue-600 font-semibold mt-2">
            {category.properties_count} {tCommon('properties')}
          </p>
        </div>
      </div>
    </Link>
  );
}
