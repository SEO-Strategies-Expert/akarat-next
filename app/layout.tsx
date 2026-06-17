import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = headers();
  const pathname = headerList.get("x-pathname") || "/";

  // Detect locale from pathname: /en, /ru are English/Russian, otherwise Arabic
  let locale = "ar";
  if (pathname.startsWith("/en")) {
    locale = "en";
  } else if (pathname.startsWith("/ru")) {
    locale = "ru";
  }

  const isRtl = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
