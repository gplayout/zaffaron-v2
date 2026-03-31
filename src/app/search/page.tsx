"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import RecipeCard from "@/components/RecipeCard";
import type { Recipe } from "@/types";

// Metadata must be in a separate layout for client components — handled via layout.tsx

// Sanitize input for PostgREST filter safety
function sanitizeQuery(input: string): string {
  return input.replace(/[%_\\(),."']/g, "").trim().slice(0, 100);
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const clean = sanitizeQuery(query);
    if (!clean) return;

    setLoading(true);
    setSearched(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("recipes_v2")
      .select("id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at")
      .eq("published", true)
      .or(`title.ilike.%${clean}%,cuisine.ilike.%${clean}%,category.ilike.%${clean}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (fetchError) {
      setError("Search failed. Please try again.");
      setResults([]);
    } else {
      setResults((data as Recipe[]) || []);
    }
    setLoading(false);
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
