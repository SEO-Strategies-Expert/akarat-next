import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LOCALES = ["ar", "en", "ru"] as const;
type Locale = typeof LOCALES[number];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Header locale={locale} />
      <main className="flex-grow">{children}</main>
      <Footer locale={locale} />
    </NextIntlClientProvider>
  );
}
