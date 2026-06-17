'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Property } from '@/lib/types';

interface PropertyCardProps {
  property: Property;
  locale: string;
}

export default function PropertyCard({ property, locale }: PropertyCardProps) {
  const t = useTranslations();
  const isRtl = locale === 'ar';
  const href = locale === 'ar' ? `/properties/${property.slug}` : `/${locale}/properties/${property.slug}`;

  const priceFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : locale === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });

  // Translate status tag from API (e.g., "جاهزة" → "Ready" in English)
  const getTranslatedStatus = (statusName: string | undefined) => {
    if (!statusName) return null;
    const statusMap: { [key: string]: string } = {
      'جاهزة': 'ready',
      'قيد الانشاء': 'under_construction',
      'رخيصة': 'cheap',
      'فاخرة': 'luxury',
      'بالتقسيط': 'installment',
      'إطلالة بحرية': 'sea_view',
    };
    const statusKey = statusMap[statusName] || statusName.toLowerCase().replace(/\s+/g, '_');
    return t(`statusTags.${statusKey}`);
  };

  return (
    <Link href={href}>
      <div className={`bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          {property.image && (
            <Image
              src={property.image}
              alt={property.name}
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 truncate mb-2">{property.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{property.location}</p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xl font-bold text-blue-600">{priceFormatter.format(property.price)}</span>
            {property.status_name && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{getTranslatedStatus(property.status_name)}</span>
            )}
          </div>
          {property.features_data && property.features_data.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {property.features_data.slice(0, 3).map((feature) => (
                <span key={feature.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {feature.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
