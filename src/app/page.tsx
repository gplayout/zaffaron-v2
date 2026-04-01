import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { getLatestRecipes, getPopularRecipes, getRecipeCount } from "@/lib/api/recipes";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: {
    canonical: "https://zaffaron.com",
  },
};

export default async function Home() {
  const [latestItems, popularItems, totalCount] = await Promise.all([
    getLatestRecipes(18),
    getPopularRecipes(6),
    getRecipeCount(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Authentic Persian <span className="text-amber-600">Recipes</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-stone-500">
          Every recipe tested. Every measurement exact. Every step clear.
          From the heart of Persian cuisine to your kitchen.
        </p>
        {/* Hero Search CTA */}
        <Link
          href="/search"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-stone-500 shadow-sm transition hover:border-amber-300 hover:shadow-md"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          What do you want to cook today?
        </Link>
      </section>

      {/* Category Quick Links */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {[
          { label: "🍲 Stews", href: "/category/stew" },
          { label: "🍚 Rice", href: "/category/rice" },
          { label: "🍢 Kebabs", href: "/category/kebab" },
          { label: "🥗 Appetizers", href: "/category/appetizer" },
          { label: "🍮 Desserts", href: "/category/dessert" },
          { label: "🥣 Soups", href: "/category/soup" },
          { label: "🥛 Drinks", href: "/category/drink" },
        ].map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Popular Recipes */}
      {popularItems.length > 0 && (
        <section className="mb-12" aria-labelledby="popular-recipes">
          <h2 id="popular-recipes" className="mb-4 text-2xl font-bold text-stone-800">
            🔥 Most Popular
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularItems.map((recipe, i) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} priority={i < 3} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Latest Recipes */}
      <section aria-labelledby="latest-recipes">
        <h2 id="latest-recipes" className="mb-4 text-2xl font-bold text-stone-800">
          🆕 Latest Recipes
        </h2>
        {latestItems.length === 0 ? (
          <p className="text-center text-stone-500">Recipes coming soon…</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestItems.map((recipe, i) => (
              <li key={recipe.id}>
                <RecipeCard recipe={recipe} priority={i < 3} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* View All CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-amber-700"
        >
          View All {totalCount} Recipes →
        </Link>
      </div>

      {/* Newsletter CTA */}
      <section className="mt-16 rounded-2xl bg-amber-50 border border-amber-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-stone-800">🌿 Get Persian Recipes Weekly</h2>
        <p className="mt-2 text-stone-600">Join our newsletter for authentic recipes delivered to your inbox every Friday.</p>
        <p className="mt-4 text-sm text-stone-500">Coming soon — stay tuned!</p>
      </section>
    </>
  );
}
