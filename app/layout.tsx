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

const RTL = ["ar"];

export const metadata: Metadata = {
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Extract locale from URL path (middleware should have set this in a header)
  // Fallback: check pathname from headers
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "/";

  let locale = "ar"; // default
  if (pathname.startsWith("/en")) {
    locale = "en";
  } else if (pathname.startsWith("/ru")) {
    locale = "ru";
  }

  const isRtl = RTL.includes(locale);

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
