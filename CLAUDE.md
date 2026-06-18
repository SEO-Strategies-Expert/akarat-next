# CLAUDE.md — مشروع إعادة بناء "عقارات اسطنبول" بـ Next.js

ضع هذا الملف في جذر مشروع `akarat-next/`. Claude Code يقرأه تلقائياً كسياق دائم.

## نظرة عامة
نعيد بناء واجهة موقع عقارات (akaratistanbul.net) بـ **Next.js (App Router)**. النسخة القديمة كانت React+Vite SPA فوق طبقة SSR يدوية بـ PHP (`type.php-v3`) + Laravel backend منفصل — بنية هشّة نستبدلها كلياً.
الخلفية **تبقى كما هي**: Laravel 12 API على `admin.akaratistanbul.net/api`. نحن نبني الواجهة فقط (Headless).

## القواعد الأساسية
- **Next.js App Router + TypeScript + Tailwind CSS** حصراً. لا jQuery، لا أي طبقة PHP.
- **SSR/ISR أصلي** من Next.js. لا تكرار لمنطق العرض.
- **i18n عبر next-intl**: 3 لغات — `ar` (افتراضية، RTL)، `en`، `ru`. كل المسارات تحت `app/[locale]/`.
- لا تخزّن أسرار في الكود. استخدم `process.env.NEXT_PUBLIC_*`.
- اكتب أنواع TypeScript لكل استجابات الـ API.
- بعد كل ميزة: شغّل `npm run dev` وأصلح الأخطاء قبل المتابعة.

## متغيرات البيئة (.env.local)
```
NEXT_PUBLIC_API_BASE=https://admin.akaratistanbul.net/api
NEXT_PUBLIC_SITE_URL=https://akaratistanbul.net
NEXT_PUBLIC_MEDIA_BASE=https://admin.akaratistanbul.net
```

## عقد الـ API (Laravel — موجود مسبقاً)
كل النقاط تحت `/api` وتقبل اللغة عبر middleware (مرّر `Accept-Language` أو باراميتر locale):
- `GET /categories` — أنواع العقارات (التصنيفات)
- `GET /index` — بيانات الصفحة الرئيسية
- `GET /cities` — المدن
- `GET /properties` — قائمة العقارات (تقبل باراميترات فلترة: category, city, district, feature, status, price…)
- `GET /properties/{slug}` — عقارات حسب التصنيف
- `GET /property/{slug}` — تفاصيل عقار/مشروع
- `GET /offers` — العروض
- `GET /settings` — إعدادات عامة (لوجو، تواصل، سوشيال…)
- `GET /faqs` — الأسئلة الشائعة
- `filter_posts` / `filters` — صفحات الفلاتر/الهبوط الخاصة بالـ SEO وتعريفات الفلاتر
> تحقّق من الشكل الفعلي لكل استجابة قبل كتابة الأنواع (اعمل fetch فعلي وافحص JSON).

## نموذج البيانات (مرجع من الباك إند)
Property (+ PropertyImage, PropertyPrice, PropertyStatus, PropertyAddon, Addon, Amenity, Feature)، Category، Country/City/District، FilterPost، Offer، Page، Slider، Post/PostFaq/BlogCat/BlogFaq/Faq، Owner، Inquiry/Contact، Setting.

## بنية الروابط (يجب الحفاظ عليها حرفياً للحفاظ على SEO)
صفحات القوائس/الفلاتر:
```
/properties/{city}/{intent}
/properties/{city}/{intent}/{type}
/properties/{city}/{intent}/{type}/{feature}
/properties/{city}/{intent}/{district}
```
صفحات المشاريع/التفاصيل:
```
/properties/{type}/{slug}
```
أقسام: `/about`, `/offers`, `/blogs`, `/contact`. واللغات ببادئة: `/en/...`, `/ru/...` (العربية بلا بادئة على الجذر، مع hreflang و x-default).

## البنية المقترحة
```
src/
  app/
    [locale]/
      layout.tsx              # html lang/dir + Providers + GTM
      page.tsx                # الرئيسية
      about/page.tsx
      offers/page.tsx
      blogs/page.tsx  blogs/[slug]/page.tsx
      contact/page.tsx
      properties/
        [city]/[intent]/page.tsx
        [city]/[intent]/[type]/page.tsx
        [city]/[intent]/[type]/[feature]/page.tsx
        [type]/[slug]/page.tsx
    sitemap.ts                # 3 لغات
    robots.ts
  components/                 # Header, Footer, PropertyCard, Filters, LangSwitcher
  lib/
    api.ts                    # عميل الـ API + caching (revalidate)
    types.ts                  # أنواع الاستجابات
    seo.ts                    # مولّدات JSON-LD + hreflang
  i18n/                       # إعداد next-intl + رسائل ar/en/ru
```

## SEO (إلزامي لكل صفحة)
- `generateMetadata` لكل route: title, description, canonical, OpenGraph, Twitter, **hreflang** (ar/en/ru/x-default).
- JSON-LD: `RealEstateAgent`, `Organization`, `WebSite`, `BreadcrumbList`، و`Product`/`Residence` لصفحة العقار.
- `app/sitemap.ts` يولّد روابط اللغات الثلاث ديناميكياً من الـ API.
- `app/robots.ts`.
- **ممنوع** تسريب `localhost`/`127.0.0.1` في أي سكيما (خطأ موجود في النسخة القديمة — لا تكرّره). استخدم `NEXT_PUBLIC_SITE_URL` دائماً.

## الصور
`next/image` مع `images.remotePatterns` يسمح بـ `admin.akaratistanbul.net`.

## التحليلات
Google Tag Manager عبر `@next/third-parties` (نفس GTM الحالي).

## معايير القبول
- `npm run build` ينجح بلا أخطاء.
- اللغات الثلاث تعمل، العربية RTL.
- كل روابط الإنتاج القديمة لها مقابل (أو 301).
- نتيجة Lighthouse للـ SEO والأداء جيدة.

## Akarat migration — automated review loop

HANDOFF BUS (shared with the Cowork live reviewer):
`E:\شركة وصال تك\الشركات\akaratistanbul-auto\ملفات شهر يونيو 2026\akarat-review-loop\loop`

### After EVERY code change touching routing/locale/sitemaps
Invoke the reviewer before moving on:
> @parity-reviewer review the change I just made.
Address PASS/ISSUES before continuing.

### After EVERY deployment (preview or production)
Write two files to the HANDOFF BUS so the Cowork live reviewer can pick it up automatically:
1. `deploy-url.txt` — the deployment URL ONLY (single line, no extra text). Overwrite each time.
2. `cc-status.md` — a short status: what changed this cycle, the deploy URL, Vercel deployment state (must be Ready + Production/Preview), and any open issues. Overwrite each time, and put the current UTC timestamp on the first line as `updated: <ISO8601>`.

Then continue working. The Cowork reviewer polls the bus, runs a live browser parity sweep against `deploy-url.txt`, and writes its findings to `review-latest.md` in the same folder. Read `review-latest.md` at the start of your next cycle and resolve anything it flags.

Never promote to the real domain akaratistanbul.net until a Cowork review reports full parity. Keep akarat-next.vercel.app on noindex.
