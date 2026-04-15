"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchRecipes } from "@/app/search/actions";
import RecipeCard from "@/components/RecipeCard";
import type { RecipeSummary } from "@/types";

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-search if URL has ?q= parameter
  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function doSearch(term: string) {
    if (!term.trim()) return;
    setQuery(term);
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      const data = await searchRecipes(term);
      setResults(data);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // Update URL with search query
    router.push(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
    await doSearch(query);
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative mx-auto max-w-lg">
          <label htmlFor="recipe-search" className="sr-only">
            Search recipes
          </label>
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-600 transition" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <input
            id="recipe-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes, cuisines, categories…"
            className="w-full rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 py-3 pl-10 pr-4 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </div>
      </form>

      <div aria-live="polite" aria-busy={loading}>
        {loading && <p className="text-center text-stone-500">Searching…</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {searched && !loading && !error && results.length === 0 && (
          <p className="text-center text-stone-500">No recipes found for &quot;{query}&quot;</p>
        )}
      </div>

      {/* Initial state: search suggestions */}
      {!searched && !loading && (
        <div className="mx-auto max-w-lg text-center">
          <p className="text-lg font-medium text-stone-700 dark:text-stone-300 mb-4">What are you craving?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Kebab", "Rice", "Soup", "Biryani", "Hummus", "Baklava", "Dolma", "Stew", "Salad", "Bread"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => doSearch(term)}
                className="rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-1.5 text-sm text-stone-600 dark:text-stone-400 transition hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950"
              >
                {term}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-stone-400 dark:text-stone-500">Search across 1,800+ recipes from Persian, Turkish, Afghan, Lebanese, Azerbaijani, Indian, Moroccan, and Greek cuisines</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-stone-500">Loading search...</div>}>
      <SearchPageInner />
    </Suspense>
  );
}
