import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://zaffaron.com"),
  verification: {
    google: "6ulA9oxsqC_SdVSnIQEoZxuW0zD03ZeicET7ZEyT2ro",
  },
  title: {
    default: "Zaffaron — Authentic Recipes from Every Kitchen",
    template: "%s — Zaffaron",
  },
  description:
    "Discover authentic, verified recipes from Persian, Turkish, Afghan, Lebanese, Azerbaijani, Indian, Moroccan, Greek, and world cuisines. Every recipe tested, every detail perfected.",
  openGraph: {
    title: "Zaffaron — Authentic Recipes from Every Kitchen",
    description: "Verified recipes from Persian, Turkish, Afghan, Lebanese, Azerbaijani, Indian, Moroccan, Greek, and world cuisines. Every detail perfected.",
    type: "website",
    siteName: "Zaffaron",
    locale: "en_US",
    images: [{ url: "https://zaffaron.com/og-default.jpg", width: 1200, height: 630, alt: "Zaffaron — Authentic Recipes from Every Kitchen" }],
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
        <AuthProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-stone-900 focus:shadow-md"
          >
            Skip to content
          </a>
          <Navigation />
          <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="border-t border-stone-200 bg-white py-12">
            <div className="mx-auto max-w-5xl px-4">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* About Section */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900">
                    About
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/about" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        About Zaffaron
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/editorial-policy" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Editorial Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* For Cooks Section */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900">
                    For Cooks
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/cook/apply" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Become a Cook
                      </Link>
                    </li>
                    <li>
                      <Link href="/cook/dashboard" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Cook Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/cooks" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Browse Cooks
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Support Section */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900">
                    Support
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Support
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Feedback
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Legal Section */}
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-900">
                    Legal
                  </p>
                  <ul className="space-y-3">
                    <li>
                      <Link href="/privacy" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link href="/editorial-policy" className="text-sm text-stone-600 hover:text-amber-600 transition">
                        Editorial Policy
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Social Media & Copyright */}
              <div className="mt-10 border-t border-stone-200 pt-8">
                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                  {/* Social Links */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-stone-500">Follow us:</span>
                    <div className="flex gap-3">
                      <a
                        href="https://instagram.com/zaffaron"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-amber-100 hover:text-amber-600"
                        aria-label="Instagram"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a
                        href="https://twitter.com/zaffaron"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-amber-100 hover:text-amber-600"
                        aria-label="Twitter"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                      <a
                        href="https://facebook.com/zaffaron"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-amber-100 hover:text-amber-600"
                        aria-label="Facebook"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                      <a
                        href="https://youtube.com/zaffaron"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-amber-100 hover:text-amber-600"
                        aria-label="YouTube"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Copyright */}
                  <p className="text-center text-sm text-stone-500 sm:text-right">
                    © {new Date().getFullYear()} Zaffaron. All rights reserved.
                  </p>
                </div>
                <p className="mt-4 text-center text-xs text-stone-400">
                  Every recipe tested. Every detail perfected.
                </p>
              </div>
            </div>
          </footer>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
