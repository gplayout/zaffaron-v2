import { SITE_URL } from '@/lib/config';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Recipes",
  description: "Search our collection of 1,700+ authentic recipes from Persian, Turkish, Indian, Moroccan, Greek, and world cuisines.",
  alternates: { canonical: `${SITE_URL}/search` },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
