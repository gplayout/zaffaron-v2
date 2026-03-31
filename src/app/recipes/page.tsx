import { supabaseServer } from "@/lib/supabase-server";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import type { Recipe } from "@/types";
import type { Metadata } from "next";

export const revalidate = 3600;

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "All Recipes",
  description: "Browse all authentic Persian and world recipes on Zaffaron. Every recipe tested, every detail perfected.",
  alternates: { canonical: "https://zaffaron.com/recipes" },
};

export default async function AllRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: recipes, count } = await supabaseServer
    .from("recipes_v2")
    .select("id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at", { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  const items = (recipes as Recipe[]) || [];
  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <div className="mb-8">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-1.5 text-stone-300">›</span>
          <span className="text-stone-700 font-medium">All Recipes</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All Recipes</h1>
        <p className="mt-2 text-stone-500">{totalCount} authentic recipes from our kitchen to yours.</p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((recipe, i) => (
          <li key={recipe.id}>
            <RecipeCard recipe={recipe} priority={i < 6} />
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/recipes?page=${page - 1}`}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100"
            >
              ← Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-stone-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/recipes?page=${page + 1}`}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 transition hover:bg-stone-100"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
