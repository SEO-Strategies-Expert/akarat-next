# برومبت الانطلاق لـ Claude Code

> الصق هذا النص كأول رسالة في Claude Code بعد ما تكون داخل مجلد `akarat-next/` وفيه ملفات `CLAUDE.md` و `akaratistanbul-tech-analysis.md`.

---

أنت تعيد بناء واجهة موقع عقارات (akaratistanbul.net) بـ Next.js (App Router + TypeScript + Tailwind). اقرأ أولاً ملف `CLAUDE.md` وملف `akaratistanbul-tech-analysis.md` في جذر المشروع — فيهما كل سياق المشروع، عقد الـ API، نموذج البيانات، وبنية الروابط الواجب الحفاظ عليها.

اشتغل على شكل مراحل منفصلة. **بعد كل مرحلة قف، شغّل `npm run dev`، أصلح الأخطاء، واعرض لي ملخص ما عملته قبل الانتقال للمرحلة التالية.** لا تنتقل تلقائياً.

قواعد ثابتة:
- 3 لغات: ar (افتراضية RTL)، en، ru — عبر next-intl وكل المسارات تحت `app/[locale]/`.
- استهلك الـ API الموجود على `NEXT_PUBLIC_API_BASE` فقط، لا تنشئ باك إند جديد.
- قبل كتابة أي نوع TypeScript، اعمل fetch فعلي للـ endpoint وافحص شكل الـ JSON الحقيقي.
- لا تسرّب أبداً localhost/127.0.0.1 في الـ SEO؛ استخدم `NEXT_PUBLIC_SITE_URL`.
- حافظ على بنية الروابط حرفياً كما في التحليل.

ابدأ الآن بـ **المرحلة A فقط** ثم قف:

**المرحلة A — الأساس و i18n**
1. ثبّت وهيّئ next-intl للغات ar/en/ru مع بادئات المسار (العربية على الجذر بلا بادئة + hreflang/x-default).
2. أنشئ `app/[locale]/layout.tsx` يضبط `<html lang dir>` (rtl للعربية).
3. أنشئ ملفات الرسائل `i18n/messages/{ar,en,ru}.json` بمفاتيح مبدئية للهيدر/الفوتر.
4. مكوّن `LangSwitcher` + Header + Footer أوّلية بـ Tailwind.
5. اضبط `next.config.js`: `images.remotePatterns` لـ `admin.akaratistanbul.net`.
6. شغّل `npm run dev`، تأكد أن `/`، `/en`، `/ru` تفتح والعربية RTL، ثم قف واعرض الملخص.

بعد موافقتي، ننتقل للمراحل: B (طبقة API + types)، C (الرئيسية)، D (قائمة العقارات + الفلاتر)، E (تفاصيل العقار)، F (عروض/مدونة/تواصل/من نحن/FAQ)، G (SEO + sitemap + robots + JSON-LD)، H (301 redirects). نفّذها واحدة تلو الأخرى بنفس الأسلوب.
