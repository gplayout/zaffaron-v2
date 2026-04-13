import { Suspense } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import { createServerSupabase } from "@/lib/supabase-server-auth";
import type { RecipeSummary } from "@/types";

const CARD_FIELDS = `id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at`;

export const metadata = {
  title: "Your Favorites",
  description: "Your saved recipes on Zaffaron",
};

async function getFavoriteRecipes(userId: string): Promise<RecipeSummary[]> {
  const supabase = await createServerSupabase();

  // Get favorite recipe_ids for this user
  const { data: favRows, error: favError } = await supabase
    .from("recipe_favorites")
    .select("recipe_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (favError || !favRows || favRows.length === 0) return [];

  const recipeIds = favRows.map((r) => r.recipe_id);

  // Fetch the actual recipes (using CARD_FIELDS to avoid over-fetching)
  const { data: recipes, error: recipeError } = await supabase
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .in("id", recipeIds)
    .eq("published", true);

  if (recipeError || !recipes) return [];

  // Re-sort to match favorites order (most recently favorited first)
  const idOrder = new Map(recipeIds.map((id, i) => [id, i]));
  const sorted = [...recipes].sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));
  return sorted as RecipeSummary[];
}

function FavoritesGrid({ recipes }: { recipes: RecipeSummary[] }) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <Heart className="h-8 w-8 text-stone-400" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-stone-900">No favorites yet</h2>
        <p className="mt-2 text-stone-600">
          Start saving recipes you love and they&apos;ll appear here.
        </p>
        <Link
          href="/recipes"
          className="mt-6 inline-block rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
        >
          Browse Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-stone-200 bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-stone-200" />
          <div className="p-4">
            <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
            <div className="mt-2 h-6 w-3/4 animate-pulse rounded bg-stone-200" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-stone-200" />
            <div className="mt-3 flex gap-2">
              <div className="h-3 w-16 animate-pulse rounded bg-stone-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-stone-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function FavoritesContent() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <Heart className="h-8 w-8 text-stone-400" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-stone-900">
          Sign in to see your favorites
        </h2>
        <p className="mt-2 text-stone-600">
          Save recipes you love and access them from any device.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-stone-600 transition hover:text-stone-900"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const recipes = await getFavoriteRecipes(user.id);
  return <FavoritesGrid recipes={recipes} />;
}

export default async function FavoritesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Your Favorites</h1>
        <p className="mt-2 text-stone-600">
          All the recipes you&apos;ve saved in one place.
        </p>
      </header>

      <Suspense fallback={<LoadingGrid />}>
        <FavoritesContent />
      </Suspense>
    </div>
  );
}
