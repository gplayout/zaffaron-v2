import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Search, ChefHat } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://zaffaron.com"),
  title: {
    default: "Zaffaron — Authentic Persian & World Recipes",
    template: "%s — Zaffaron",
  },
  description:
    "Discover authentic, verified Persian recipes and world cuisine. Every recipe tested, every detail perfected.",
  openGraph: {
    title: "Zaffaron — Authentic Persian & World Recipes",
    description: "Verified recipes from the heart of Persian cuisine and beyond.",
    type: "website",
    siteName: "Zaffaron",
    locale: "en_US",
    images: [{ url: "https://zaffaron.com/og-default.jpg", width: 1200, height: 630, alt: "Zaffaron — Authentic Persian Recipes" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900 antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-stone-900 focus:shadow-md"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <ChefHat className="h-6 w-6 text-amber-600" />
              <span className="text-xl font-bold text-amber-600">Zaffaron</span>
            </Link>
            <Link
              href="/search"
              className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Search recipes"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </header>
        <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-stone-200 py-8">
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-500">
              <Link href="/about" className="hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:rounded">About</Link>
              <Link href="/editorial-policy" className="hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:rounded">Editorial Policy</Link>
              <Link href="/privacy" className="hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:rounded">Privacy</Link>
              <Link href="/terms" className="hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:rounded">Terms</Link>
            </div>
            <p className="mt-3 text-center text-sm text-stone-500">
              © {new Date().getFullYear()} Zaffaron. All rights reserved. Every recipe tested. Every detail perfected.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
