import type { Metadata } from "next";
import { Oswald, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Accent font for the About-page manifesto. Loaded via next/font (self-hosted,
// preloaded, no layout shift) instead of a render-blocking CSS @import.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Science Club | Innovate, Discover, Create",
  description: "Official website of the Science Club. Join us for events, workshops, and cutting-edge projects.",
};

import { SiteChrome } from "@/components/SiteChrome";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans overflow-x-hidden" suppressHydrationWarning>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
