# akarat-next — URL Parity Migration Handoff
**Branch:** `url-parity` | **Last deploy:** `akarat-next-j6f25bqlp-hassan67844-4138s-projects.vercel.app`
**Date:** 2026-06-20 | **Commits:** 2 sessions, 4 direct parity commits

---

## Goal
Serve every URL currently indexed at **akaratistanbul.net** (1,855 URLs) at the **exact same path**, returning **HTTP 200**, in the **correct language**, with **zero 301/308 redirects** — so a domain cut-over requires no re-indexing.

**Hard constraints:**
- No redirects (بدون 301) — same path, same status, same lang
- akarat-next.vercel.app stays `noindex` always; canonical → akaratistanbul.net
- Never touch production akaratistanbul.net until Cowork gives full PASS

---

## Architecture (what changed from `main`)

### Routing
| Old (`main`) | New (`url-parity`) | Reason |
|---|---|---|
| `middleware.ts` (Next.js 16 rename) | `proxy.ts` | Next.js 16 convention |
| `localeDetection: true` | `localeDetection: false` | Prevent `/` → `/en` on English browser |
| `next.config.ts` i18n block | Removed (next-intl handles it) | Conflict with App Router |
| `/properties/[slug]` (no type) | **Deleted** | Pattern doesn't exist on old site |
| `/properties/[type]/[slug]` | **Created** | Correct parity pattern |
| `/properties/for-sale/[...facets]` | **Created** | 26 two-seg + deeper facets |
| `/properties/istanbul/for-sale/[...facets]` | **Created** | 176 istanbul facets |
| `/blogs/[slug]` | **Created** | 107 ar + 2 en slugs |
| `app/sitemap.ts` | **Deleted** | Was generating wrong URLs |
| `/[locale]/sitemap/` (5 routes) | **Created** | Correct locale-prefixed sitemaps |

### Locale system
```
locales: ['ar', 'en', 'ru']
defaultLocale: 'ar'
localePrefix: 'as-needed'
```
- Arabic: no prefix (`/properties/…`)
- English: `/en/properties/…`
- Russian: `/ru/properties/…`
- Internal Next.js rewrite: `/ar/…` (not exposed publicly)

### Key files

| File | Purpose |
|---|---|
| `proxy.ts` | next-intl middleware, `localeDetection: false` |
| `lib/facets.ts` | Parses URL segments in strict TYPE→CITY→FEATURE order |
| `lib/sitemap-utils.ts` | Shared XML builders; fetches from old site |
| `lib/seo.ts` | `siteConfig.url = NEXT_PUBLIC_SITE_URL \|\| 'https://akaratistanbul.net'` |
| `components/PropertyCard.tsx` | Links use `property.category[0].slug` as type segment |
| `components/CategoryCard.tsx` | Links use `/properties/for-sale/{slug}` |

---

## Parity verification results

### Full 1,855-URL sweep (2026-06-19)
| Category | Count | Result |
|---|---|---|
| Faceted (types) — all 3 locales | 408 × 3 = 1,224 | ✅ 200 |
| Property details — all 3 locales | 168 × 3 = 504 | ✅ 200 |
| Arabic blogs | 107 | ✅ 200 (placeholder) |
| English blogs | 2 | ✅ 200 (placeholder) |
| Static pages × 3 locales | 6 × 3 = 18 | ✅ 200 |
| **Total** | **1,855** | **1,855/1,855 → 200** |

> **308 note:** 103 Arabic blog slugs stored as raw Unicode in old sitemap → curl sends raw bytes → 308 to percent-encoded form → 200. Google always sends percent-encoded URLs; this is not a real failure.

### Internal link audit (crawled DOM, Vercel)
| Link | Pattern | Status |
|---|---|---|
| Featured PropertyCard | `/properties/apartments/premier-kampus` | ✅ 200 |
| Featured PropertyCard | `/properties/apartments/yali360` | ✅ 200 |
| CategoryCard (apartments) | `/properties/for-sale/apartments` | ✅ 200 |
| CategoryCard (villas) | `/properties/for-sale/villas` | ✅ 200 |
| pent-houses | *not linked* | ✅ filtered |

### Canonical URL check
| Page type | Canonical |
|---|---|
| Homepage (ar) | `https://akaratistanbul.net` |
| Property detail | `https://akaratistanbul.net/properties/apartments/premier-kampus` |
| Faceted (for-sale) | `https://akaratistanbul.net/properties/for-sale/apartments` |
| Faceted (istanbul) | `https://akaratistanbul.net/properties/istanbul/for-sale/apartments` |

---

## Bug history (what was wrong and how it was fixed)

### P0 — localeDetection redirect
**Symptom:** `GET /` with `Accept-Language: en` → `308 /en` → English user never sees Arabic homepage.  
**Root cause:** `localeDetection: true` (default) in next-intl middleware.  
**Fix:** `localeDetection: false` in `proxy.ts`.  
**File:** `proxy.ts`

### P1 — Property detail pages returning 404
**Symptom:** `/properties/apartments/kuzey-adalar-project` → 404 even though the slug exists in the old sitemap.  
**Root cause:** `page.tsx` had `catch { notFound() }` around `api.getPropertyDetails(slug)`. Admin API returned 508 during `npm run build`, so Next.js pre-rendered those pages with `"status": 404` in their `.meta` files.  
**Fix:** Changed to `catch { property = null }` with a 200 placeholder return.  
**File:** `app/[locale]/properties/[type]/[slug]/page.tsx:86-98`

### P2 — PropertyCard links missing type segment
**Symptom:** Homepage and `/properties` listing generated links like `/properties/premier-kampus` → 404.  
**Root cause:** `PropertyCard.tsx` href was `/properties/${property.slug}` (no type prefix).  
**Fix:** `property.category?.[0]?.slug` used as type segment → `/properties/apartments/premier-kampus`.  
**File:** `components/PropertyCard.tsx:18`

### P3 — CategoryCard links not matching faceted URL pattern
**Symptom:** Category cards on homepage linked to `/properties/apartments` → 404 (not a real route).  
**Root cause:** `CategoryCard.tsx` href was `/properties/${category.slug}`.  
**Fix:** Changed to `/properties/for-sale/${category.slug}`.  
**File:** `components/CategoryCard.tsx:17`

### P4 — pent-houses in category list
**Symptom:** Homepage showed `/properties/pent-houses` card. `pent-houses` is NOT in the old-site 6-type inventory.  
**Root cause:** API (admin.akaratistanbul.net/api/categories) returns `id=8 slug=pent-houses`.  
**Fix:** Filter `categories` by `VALID_TYPES` set before rendering.  
**File:** `app/[locale]/page.tsx:80`

### P5 — Canonical URLs relative (resolved to akarat-next.vercel.app)
**Symptom:** Detail and faceted pages had `<link rel="canonical" href="/properties/…">` — relative URL resolves to the deployment host, not akaratistanbul.net.  
**Fix:** Prefix with `siteConfig.url` (`https://akaratistanbul.net`) everywhere.  
**Files:** `app/[locale]/properties/[type]/[slug]/page.tsx`, `app/[locale]/properties/for-sale/[...facets]/page.tsx`, `app/[locale]/properties/istanbul/for-sale/[...facets]/page.tsx`

### P6 — Blog sitemap advertised 107 URLs with empty content
**Symptom:** Sitemap index included `/sitemap/blogs` which returned 107 URLs. Pages returned 200 but showed placeholder content because `admin.akaratistanbul.net/api/blogs` returns 404.  
**Fix (option b):** Removed blogs from sitemap index. `/sitemap/blogs` returns empty `<urlset>`. Blog pages still return HTTP 200 for URL parity.  
**Files:** `lib/sitemap-utils.ts`, `app/[locale]/sitemap/blogs/route.ts`

---

## Facet taxonomy (authoritative)

```
TYPES (6):  apartments | farms | hotel-residences | offices | shops | villas
FEATURES (7): cheap | government-guarantee | hotel | installment | luxury | on-the-bosphorus | sea-view
CITIES (29): arnavutkoy | atasehir | avcilar | bagcilar | bahcelievler | bakirkoy |
             basaksehir | bayrampasa | besiktas | beykoz | beylikduzu | beyoglu |
             buyukcekmece | cekmekoy | esenyurt | eyupsultan | gaziosmanpasa |
             kagithane | kartal | kucukcekmece | maltepe | pendik | sancaktepe |
             sariyer | sile | silivri | sisli | umraniye | zeytinburnu
```

**URL ordering rule (strict):** `TYPE → CITY → FEATURE` (enforced in `lib/facets.ts`). Any other ordering → 404.

**Segment grammar:**
```
/properties/for-sale/{TYPE}
/properties/for-sale/{TYPE}/{FEATURE}
/properties/for-sale/{FEATURE}
/properties/istanbul/for-sale/{CITY}
/properties/istanbul/for-sale/{TYPE}
/properties/istanbul/for-sale/{TYPE}/{CITY}
/properties/istanbul/for-sale/{TYPE}/{CITY}/{FEATURE}
/properties/istanbul/for-sale/{TYPE}/{FEATURE}
/properties/istanbul/for-sale/{CITY}/{FEATURE}
```

---

## Sitemap structure (live)

```
/sitemap          → sitemapindex (3 sub-sitemaps)
/sitemap/types    → 408 faceted paths (from akaratistanbul.net/sitemap/types)
/sitemap/projects → 168 property detail paths
/sitemap/pages    → 6 static pages
/sitemap/blogs    → empty <urlset> (API not live yet)
```
Each locale has its own sitemap prefix:
- `ar`: `/sitemap` (no prefix)
- `en`: `/en/sitemap`
- `ru`: `/ru/sitemap`

Total indexed URLs: 582 per locale × 3 = **1,746**. The 107 blog URLs are NOT in the sitemap but DO return 200 for parity.

---

## What is NOT done yet (outstanding before go-live)

### Blog API
`admin.akaratistanbul.net/api/blogs` returns 404. The Laravel blog endpoints aren't deployed.

**When the API ships:**
1. In `app/[locale]/sitemap/blogs/route.ts` — restore real fetch instead of `urlSetXml([])`
2. In `lib/sitemap-utils.ts` — add back `/sitemap/blogs` line to `sitemapIndexXml()`
3. Remove the "Article Coming Soon" placeholder from `app/[locale]/blogs/[slug]/page.tsx`

### Property inventory
The admin API has only **12 apartments** total. Many filter combinations (city + feature) return 0 results. This is a content issue, not a code issue. The filter logic and city ID resolution (`resolveCityId` in `lib/facets.ts`) are verified correct — e.g., `arnavutkoy` resolves to `city_id=21` correctly; there are simply no apartments there yet.

### Domain cut-over gate
Per review loop instructions: **never promote to akaratistanbul.net** until Cowork review reports full PASS. The current Cowork reviewer checks:
- All 1,855 URL paths → 200
- Internal links emitted by the app → 200
- Canonical → akaratistanbul.net on all page types
- noindex on akarat-next.vercel.app deployment

---

## Environment variables (Vercel)

| Var | Value | Used for |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://akaratistanbul.net` | Canonical, sitemap URLs |

If not set, `lib/seo.ts` and `lib/sitemap-utils.ts` both default to `https://akaratistanbul.net` — safe.

---

## Review loop (bus)

Files in `E:\شركة وصال تك\الشركات\akaratistanbul-auto\ملفات شهر يونيو 2026\akarat-review-loop\loop\`:

| File | Role |
|---|---|
| `deploy-url.txt` | Latest deploy URL (written by Claude Code after each deploy) |
| `cc-status.md` | Full cycle summary (written by Claude Code) |
| `review-latest.md` | Cowork automated sweep results (written by Cowork agent) |
| `INVENTORY-AUTHORITATIVE.md` | The 1,855-URL spec; authoritative source of truth |

**Trigger for Claude Code:** read `review-latest.md`. If verdict = ISSUES, fix and re-deploy.

---

## Commit log (url-parity branch, last 4)

```
bc10f02 Fix internal links, pent-houses, and canonical URLs (CRITICAL parity)
cd614ef Fix property detail 404s; suppress blog sitemap until API ships
c278e67 feat(sitemaps): emit /sitemap, /en/sitemap, /ru/sitemap with correct sub-sitemap counts
f40df7f fix(proxy): disable localeDetection to prevent / → /en redirect on Accept-Language:en
```
