import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Recipes",
  description: "Search our collection of authentic Persian and world recipes by name, cuisine, or category.",
  alternates: { canonical: "https://zaffaron.com/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
