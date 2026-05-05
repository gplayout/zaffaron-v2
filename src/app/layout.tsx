import { SITE_URL } from '@/lib/config';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import PinterestTag from "@/components/PinterestTag";
import { AuthProvider } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import NewsletterForm from "@/components/NewsletterForm";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "6ulA9oxsqC_SdVSnIQEoZxuW0zD03ZeicET7ZEyT2ro",
  },
  other: {
    "p:domain_verify": "4aa10e92db8123019b525ed841c3d9f5",
  },
  title: {
    default: "Zaffaron — Authentic Recipes from Every Kitchen",
    template: "%s — Zaffaron",
  },
  // Keep description under ~155 chars to reduce Google truncation.
  description:
    "Authentic recipes from Persian, Turkish, Afghan, Lebanese, Indian, Moroccan, Greek, Azerbaijani, and world cuisines. Researched, drafted, and cross-checked.",
  openGraph: {
    title: "Zaffaron — Authentic Recipes from Every Kitchen",
    description: "Authentic recipes from Persian, Turkish, Afghan, Lebanese, Azerbaijani, Indian, Moroccan, Greek, and world cuisines.",
    type: "website",
    siteName: "Zaffaron",
    locale: "en_US",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Zaffaron — Authentic Recipes from Every Kitchen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [`${SITE_URL}/og-default.jpg`],
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('zaffaron-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body className={`${inter.className} bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 antialiased`}>
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white dark:focus:bg-stone-800 focus:px-4 focus:py-2 focus:text-stone-900 dark:focus:text-stone-100 focus:shadow-md"
          >
            Skip to content
          </a>
          <Navigation />
          <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 py-12">
            <div className="mx-auto max-w-5xl px-4">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* About Section */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    About
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/about" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        About Zaffaron
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/editorial-policy" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Editorial Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* For Cooks Section — Marketplace Coming Soon */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    For Cooks
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/cook/apply" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Apply to Cook
                      </Link>
                    </li>
                    <li>
                      <span className="text-sm text-stone-400 dark:text-stone-500">
                        Marketplace — Coming Soon
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Support Section */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    Support
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Support
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Feedback
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Legal Section */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    Legal
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/privacy" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link href="/editorial-policy" className="text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 transition">
                        Editorial Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-8 flex justify-center" data-print="hide">
                <NewsletterForm />
              </div>

              {/* Social Media & Copyright */}
              <div className="mt-10 border-t border-stone-200 dark:border-stone-700 pt-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  {/* Social Links */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-stone-500 dark:text-stone-400">Follow us:</span>
                    <div className="flex gap-3">
                      {/* Social placeholders (Instagram/Twitter/Facebook/YouTube) hidden until accounts live — see P0.4 2026-04-24 */}
                      <a
                        href="https://pinterest.com/mehdi6995/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-stone-100 dark:bg-stone-700 p-2 text-stone-600 dark:text-stone-400 transition hover:bg-amber-100 hover:text-amber-600"
                        aria-label="Pinterest"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Copyright */}
                  <p className="text-center text-sm text-stone-500 dark:text-stone-400 sm:text-right">
                    © {new Date().getFullYear()} Zaffaron. All rights reserved.
                  </p>
                </div>
                <p className="mt-4 text-center text-xs text-stone-400 dark:text-stone-500">
                  Crafted with care. Rooted in tradition.
                </p>
              </div>
            </div>
          </footer>
          <Analytics />
            <SpeedInsights />
            <PinterestTag />
        </AuthProvider>
      </body>
    </html>
  );
}
