import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import { getRecipes } from "@/lib/api/recipes";
import type { Metadata } from "next";

export const revalidate = 3600;

const PAGE_SIZE = 24;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const canonical = page > 1 ? `https://zaffaron.com/recipes?page=${page}` : "https://zaffaron.com/recipes";

  return {
    title: "All Recipes",
    description: "Browse all 1,500+ authentic recipes on Zaffaron — Persian, Turkish, Indian, Moroccan, Greek, and more. Every recipe tested, every detail perfected.",
    alternates: { canonical },
  };
}

export default async function AllRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const { recipes: items, count: totalCount } = await getRecipes(page, PAGE_SIZE);
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
