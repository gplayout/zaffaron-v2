"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { searchRecipes } from "@/app/search/actions";
import RecipeCard from "@/components/RecipeCard";
import type { Recipe } from "@/types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      const data = await searchRecipes(query);
      setResults(data);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative mx-auto max-w-lg">
          <label htmlFor="recipe-search" className="sr-only">
            Search recipes
          </label>
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
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

      <div aria-live="polite">
        {loading && <p className="text-center text-stone-400">Searching…</p>}

        {error && <p className="text-center text-red-500">{error}</p>}

        {searched && !loading && !error && results.length === 0 && (
          <p className="text-center text-stone-400">No recipes found for &quot;{query}&quot;</p>
        )}
      </div>

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
