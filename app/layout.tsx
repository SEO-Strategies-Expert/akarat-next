import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: "index, follow",
  title: "Akarat Istanbul",
  description: "Real estate platform in Istanbul",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
