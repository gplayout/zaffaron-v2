import RecipeCard from "@/components/RecipeCard";
import SeasonalSpotlight from "@/components/SeasonalSpotlight";
import Link from "next/link";
import { getLatestRecipes, getPopularRecipes, getRecipeCount, getFeaturedByCuisine } from "@/lib/api/recipes";
import { getActiveCuisines } from "@/lib/cuisines";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";
import type { Metadata } from "next";
import type { RecipeSummary } from "@/types";

export const revalidate = 60;

function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Zaffaron',
    url: 'https://zaffaron.com',
    description: 'Authentic, verified recipes from Persian, Turkish, Lebanese, Afghan, Azerbaijani, and world cuisines.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://zaffaron.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zaffaron',
    url: 'https://zaffaron.com',
    logo: 'https://zaffaron.com/icon.svg',
    sameAs: [],
  };
}

function buildItemListSchema(recipes: RecipeSummary[], listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: recipes.length,
    itemListElement: recipes.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://zaffaron.com/recipe/${r.slug}`,
      name: r.title,
    })),
  };
}

export const metadata: Metadata = {
  alternates: {
    canonical: "https://zaffaron.com",
  },
  openGraph: {
    url: "https://zaffaron.com",
    type: "website",
  },
};

export default async function Home() {
  const activeCuisines = getActiveCuisines();
  const cuisineSlugs = activeCuisines.map((c) => c.slug);

  // Step 1: Fetch editor's picks and total count (independent)
  const [popularItems, totalCount] = await Promise.all([
    getPopularRecipes(6),
    getRecipeCount(),
  ]);

  // Step 2: Fetch cuisine showcases, excluding editor's picks
  const picksIds = popularItems.map(r => r.id);
  // Fetch 6 per cuisine to have enough after excluding editor's picks (which may overlap)
  const featuredByCuisine = await getFeaturedByCuisine(cuisineSlugs, 6, picksIds);

  // Step 3: Fetch latest recipes, excluding both picks and cuisine showcases
  const showcaseIds = Object.values(featuredByCuisine).flat().map(r => r.id);
  const allExcludeIds = [...picksIds, ...showcaseIds];
  const latestItems = await getLatestRecipes(12, allExcludeIds);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildWebSiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(buildOrganizationSchema()) }}
      />
      {popularItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(buildItemListSchema(popularItems, "Editor's Picks")) }}
        />
      )}

      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Authentic Recipes from <span className="text-amber-600">Every Kitchen</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-stone-500">
          Crafted with care. Rooted in tradition. Made for your kitchen.
          From Persian saffron rice to Turkish kebabs and Lebanese mezze.
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

      {/* Seasonal Spotlight — powered by Calendar Brain */}
      <SeasonalSpotlight />

      {/* Cuisine Navigation */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {activeCuisines.map((c) => (
          <Link
            key={c.slug}
            href={`/cuisine/${c.slug}`}
            className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            {c.emoji} {c.name}
          </Link>
        ))}
        {/* Category links */}
        <Link href="/category/kebab" className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">🍢 Kebabs</Link>
        <Link href="/category/soup" className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">🥣 Soups</Link>
        <Link href="/category/rice" className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">🍚 Rice</Link>
        <Link href="/category/dessert" className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">🍮 Desserts</Link>
      </div>

      {/* Editor's Picks (mixed cuisines) */}
      {popularItems.length > 0 && (
        <section className="mb-12" aria-labelledby="editors-picks">
          <h2 id="editors-picks" className="mb-4 text-2xl font-bold text-stone-800">
            ✨ Editor&apos;s Picks
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

      {/* Cuisine Showcases */}
      {activeCuisines.map((cuisine) => {
        const allRecipes = featuredByCuisine[cuisine.slug] || [];
        const recipes = allRecipes.slice(0, 3); // Show max 3, but we fetched 6 to ensure enough after exclusions
        if (recipes.length < 2) return null; // Hide section if fewer than 2 recipes (avoids lonely cards in grid)
        return (
          <section key={cuisine.slug} className="mb-12" aria-labelledby={`cuisine-${cuisine.slug}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 id={`cuisine-${cuisine.slug}`} className="text-2xl font-bold text-stone-800">
                {cuisine.emoji} {cuisine.name} Recipes
              </h2>
              <Link
                href={`/cuisine/${cuisine.slug}`}
                className="text-sm font-medium text-amber-600 transition hover:text-amber-700"
              >
                View all →
              </Link>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe, i) => (
                <li key={recipe.id}>
                  <RecipeCard recipe={recipe} priority={i < 1} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

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

    </>
  );
}
