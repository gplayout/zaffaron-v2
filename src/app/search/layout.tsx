import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Recipes",
  description: "Search our collection of 1,500+ authentic recipes from Persian, Turkish, Indian, Moroccan, Greek, and world cuisines.",
  alternates: { canonical: "https://zaffaron.com/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
