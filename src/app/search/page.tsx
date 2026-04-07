"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { searchRecipes } from "@/app/search/actions";
import RecipeCard from "@/components/RecipeCard";
import type { RecipeSummary } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
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
          <p className="text-lg font-medium text-stone-700 mb-4">What are you craving?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Kebab", "Rice", "Soup", "Biryani", "Hummus", "Baklava", "Dolma", "Stew", "Salad", "Bread"].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => doSearch(term)}
                className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm text-stone-600 transition hover:border-amber-300 hover:bg-amber-50"
              >
                {term}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-stone-400">Search across 1,700+ recipes from Persian, Turkish, Afghan, Lebanese, Azerbaijani, Indian, Moroccan, and Greek cuisines</p>
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
