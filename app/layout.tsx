import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
