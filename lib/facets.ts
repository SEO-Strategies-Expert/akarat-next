import { City } from './types';

// Controlled vocabularies — authoritative from URL inventory doc
export const TYPES = new Set([
  'apartments', 'farms', 'hotel-residences', 'offices', 'pent-houses', 'shops', 'villas',
]);

export const FEATURES = new Set([
  'cheap', 'government-guarantee', 'hotel', 'installment', 'luxury',
  'on-the-bosphorus', 'sea-view',
]);

export const CITIES = new Set([
  'arnavutkoy', 'atasehir', 'avcilar', 'bagcilar', 'bahcelievler', 'bakirkoy',
  'basaksehir', 'bayrampasa', 'besiktas', 'beykoz', 'beylikduzu', 'beyoglu',
  'buyukcekmece', 'cekmekoy', 'esenyurt', 'eyupsultan', 'gaziosmanpasa',
  'kagithane', 'kartal', 'kucukcekmece', 'maltepe', 'pendik', 'sancaktepe',
  'sariyer', 'sile', 'silivri', 'sisli', 'umraniye', 'zeytinburnu',
]);

export interface ParsedFacets {
  type: string | null;
  city: string | null;
  feature: string | null;
  valid: boolean;
}

// Parse ordered segments: TYPE? CITY? FEATURE? (order enforced)
// CITY segments are only valid when hasIstanbul=true
export function parseFacets(segments: string[], hasIstanbul: boolean): ParsedFacets {
  let type: string | null = null;
  let city: string | null = null;
  let feature: string | null = null;

  for (const seg of segments) {
    if (type === null && TYPES.has(seg)) {
      type = seg;
    } else if (city === null && feature === null && hasIstanbul && CITIES.has(seg)) {
      // CITY must precede FEATURE in the ordering TYPE→CITY→FEATURE
      city = seg;
    } else if (feature === null && FEATURES.has(seg)) {
      feature = seg;
    } else {
      // Unknown segment or ordering violation → invalid URL
      return { type, city, feature, valid: false };
    }
  }

  if (segments.length === 0) return { type, city, feature, valid: hasIstanbul };

  return { type, city, feature, valid: true };
}

// Normalize city name to URL slug (handles Turkish characters)
function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/İ/g, 'i')
    .replace(/ş/g, 's').replace(/Ş/g, 's')
    .replace(/ç/g, 'c').replace(/Ç/g, 'c')
    .replace(/ğ/g, 'g').replace(/Ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/Ü/g, 'u')
    .replace(/ö/g, 'o').replace(/Ö/g, 'o')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Find city ID from URL slug by matching against name_en
export function resolveCityId(citySlug: string, cities: City[]): string | null {
  for (const c of cities) {
    if (slugifyName(c.name_en) === citySlug) return String(c.id);
  }
  // Fallback: try name_ar slugified or partial match
  for (const c of cities) {
    if (slugifyName(c.name || '').includes(citySlug)) return String(c.id);
  }
  return null;
}

// Feature slug → partial name for client-side matching against Feature.name_en
const FEATURE_KEYWORDS: Record<string, string> = {
  'cheap':                'cheap',
  'luxury':               'luxury',
  'installment':          'installment',
  'sea-view':             'sea',
  'on-the-bosphorus':     'bosphorus',
  'hotel':                'hotel',
  'government-guarantee': 'government',
};

export function featureKeyword(slug: string): string {
  return FEATURE_KEYWORDS[slug] ?? slug;
}

// Labels for faceted listing page headings
type LocaleKey = 'ar' | 'en' | 'ru';

const TYPE_LABELS: Record<string, Record<LocaleKey, string>> = {
  apartments:        { ar: 'الشقق',              en: 'Apartments',       ru: 'Апартаменты' },
  villas:            { ar: 'الفلل',              en: 'Villas',           ru: 'Виллы' },
  farms:             { ar: 'المزارع',            en: 'Farms',            ru: 'Фермы' },
  'hotel-residences':{ ar: 'الشقق الفندقية',     en: 'Hotel Residences', ru: 'Апарт-отели' },
  offices:           { ar: 'المكاتب',            en: 'Offices',          ru: 'Офисы' },
  shops:             { ar: 'المحلات التجارية',   en: 'Shops',            ru: 'Магазины' },
};

const FEATURE_LABELS: Record<string, Record<LocaleKey, string>> = {
  cheap:                  { ar: 'رخيصة',            en: 'Affordable',           ru: 'Доступные' },
  luxury:                 { ar: 'فاخرة',             en: 'Luxury',               ru: 'Люкс' },
  installment:            { ar: 'بالتقسيط',          en: 'Installment',          ru: 'В рассрочку' },
  'sea-view':             { ar: 'إطلالة بحرية',      en: 'Sea View',             ru: 'Вид на море' },
  'on-the-bosphorus':     { ar: 'على البوسفور',      en: 'On the Bosphorus',     ru: 'На Босфоре' },
  hotel:                  { ar: 'فندقية',            en: 'Hotel',                ru: 'Отель' },
  'government-guarantee': { ar: 'ضمان حكومي',        en: 'Government Guarantee', ru: 'Гос. гарантия' },
};

export function buildPageTitle(
  parsed: ParsedFacets,
  hasIstanbul: boolean,
  locale: string,
): string {
  const l = (locale as LocaleKey) in TYPE_LABELS.apartments ? (locale as LocaleKey) : 'en';
  const parts: string[] = [];

  if (parsed.type) parts.push(TYPE_LABELS[parsed.type]?.[l] ?? parsed.type);
  if (parsed.city) parts.push(parsed.city.charAt(0).toUpperCase() + parsed.city.slice(1));
  if (parsed.feature) parts.push(FEATURE_LABELS[parsed.feature]?.[l] ?? parsed.feature);
  if (hasIstanbul && !parsed.city) {
    parts.push(locale === 'ar' ? 'إسطنبول' : locale === 'ru' ? 'Стамбул' : 'Istanbul');
  }

  const suffix = locale === 'ar' ? 'عقارات إسطنبول' : locale === 'ru' ? 'Акарат Стамбул' : 'Akarat Istanbul';
  return parts.length ? `${parts.join(' · ')} - ${suffix}` : suffix;
}
