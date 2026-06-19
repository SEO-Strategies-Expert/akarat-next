import { api } from '@/lib/api';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/seo';

type Params = { params: Promise<{ locale: string; slug: string }> };

const SITE_NAMES = {
  ar: 'عقارات إسطنبول',
  en: 'Akarat Istanbul',
  ru: 'Акарат Стамبул',
} as const;

// Fetch blog slugs from the old site's blogs sitemap for this locale.
// ar=107, en=2 (one with Arabic-script slug), ru=0. Slugs are case-preserved.
async function fetchBlogSlugs(locale: string): Promise<string[]> {
  if (locale === 'ru') return [];

  const sitemapUrl =
    locale === 'en'
      ? 'https://akaratistanbul.net/en/sitemap/blogs'
      : 'https://akaratistanbul.net/sitemap/blogs';

  try {
    const res = await fetch(sitemapUrl, { cache: 'force-cache' });
    if (!res.ok) return [];
    const xml = await res.text();
    const slugs: string[] = [];
    for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const m = match[1].match(/\/blogs\/(.+)$/);
      if (m) slugs.push(decodeURIComponent(m[1]));
    }
    return slugs;
  } catch {
    return [];
  }
}

// Called once per locale — params is a plain object here (not a Promise)
export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const slugs = await fetchBlogSlugs(locale);
  return slugs.map((slug) => ({ slug }));
}

// Allow dynamic rendering for slugs not pre-generated (e.g. if build-time sitemap fetch failed)
export const dynamicParams = true;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const siteName = SITE_NAMES[locale as keyof typeof SITE_NAMES] ?? SITE_NAMES.en;
  const canonical = locale === 'ar'
    ? `${siteConfig.url}/blogs/${slug}`
    : `${siteConfig.url}/${locale}/blogs/${slug}`;

  try {
    const post = await api.getBlogPost(slug, locale);
    if (!post) return { title: siteName, alternates: { canonical } };

    const title = `${post.title} - ${siteName}`;
    return {
      title,
      description: post.excerpt ?? post.title,
      openGraph: {
        title,
        url: canonical,
        type: 'article',
        locale: locale === 'ar' ? 'ar_SA' : locale === 'ru' ? 'ru_RU' : 'en_US',
        images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : undefined,
      },
      alternates: { canonical },
    };
  } catch {
    return { title: siteName, alternates: { canonical } };
  }
}

const COMING_SOON = {
  ar: { heading: 'المقال قادم قريباً', body: 'نعمل على إضافة محتوى المدونة. يُرجى التحقق لاحقاً.' },
  en: { heading: 'Article Coming Soon', body: 'We are working on adding blog content. Please check back later.' },
  ru: { heading: 'Статья скоро появится', body: 'Мы работаем над добавлением контента. Проверьте позже.' },
} as const;

export default async function BlogPostPage({ params }: Params) {
  const { locale, slug } = await params;
  const isRtl = locale === 'ar';

  let post = null;
  try {
    post = await api.getBlogPost(slug, locale);
  } catch {
    // Blog API not yet available — fall through to placeholder below
  }

  const blogsHref = locale === 'ar' ? '/blogs' : `/${locale}/blogs`;
  const backLabel =
    locale === 'ar' ? 'العودة للمدونة' : locale === 'ru' ? 'Назад в блог' : 'Back to Blog';

  // Placeholder 200 response when API isn't available yet
  if (!post) {
    const cs = COMING_SOON[locale as keyof typeof COMING_SOON] ?? COMING_SOON.en;
    return (
      <div className={isRtl ? 'rtl' : 'ltr'} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href={blogsHref} className="text-blue-600 hover:text-blue-800 font-semibold">
            ← {backLabel}
          </Link>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{cs.heading}</h1>
          <p className="text-gray-600">{cs.body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isRtl ? 'rtl' : 'ltr'} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Link href={blogsHref} className="text-blue-600 hover:text-blue-800 font-semibold">
          ← {backLabel}
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {post.image && (
          <div className="relative h-72 w-full rounded-lg overflow-hidden bg-gray-200 mb-8">
            <Image src={post.image} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        {post.created_at && (
          <p className="text-gray-500 text-sm mb-8">
            {new Date(post.created_at).toLocaleDateString(
              locale === 'ar' ? 'ar-SA' : locale === 'ru' ? 'ru-RU' : 'en-US',
              { year: 'numeric', month: 'long', day: 'numeric' },
            )}
          </p>
        )}

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
