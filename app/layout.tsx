import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: "index, follow",  // Enabled after P0-1 (lang/dir) and P0-2 (localization) verified
  title: "Akarat Istanbul",
  description: "Real estate platform in Istanbul",
  metadataBase: new URL("https://akarat-next.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "Akarat Istanbul",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
