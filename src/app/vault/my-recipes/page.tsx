import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server-auth";
import { Plus, Lock, Globe, ChefHat, Clock } from "lucide-react";
import type { Metadata } from "next";
import type { VaultStructuredData } from "@/lib/vault/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Recipe Vault",
  robots: { index: false, follow: false },
};

export default async function MyRecipesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/vault/my-recipes");
  }

  const { data: recipes, error } = await supabase
    .from("vault_recipes")
    .select("id, title, share_slug, attribution_name, visibility, cuisine, structured_data, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-red-500">Failed to load recipes. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            My Recipe Vault
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {recipes?.length || 0} recipes preserved
          </p>
        </div>
        <Link
          href="/vault/create"
          className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          Add Recipe
        </Link>
      </div>

      {(!recipes || recipes.length === 0) ? (
        <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 p-12 text-center">
          <ChefHat className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600 mb-4" />
          <h2 className="text-xl font-bold text-stone-700 dark:text-stone-300 mb-2">
            Your vault is empty
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Start preserving your family&apos;s recipes before they&apos;re lost.
          </p>
          <Link
            href="/vault/create"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Preserve Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => {
            const data = recipe.structured_data as VaultStructuredData;
            const totalTime = (data?.prep_time_minutes || 0) + (data?.cook_time_minutes || 0);

            return (
              <Link
                key={recipe.id}
                href={`/vault/recipe/${recipe.share_slug}`}
                className="group flex items-center gap-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 transition hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 truncate">
                    {recipe.title}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    {recipe.attribution_name && (
                      <span>by {recipe.attribution_name}</span>
                    )}
                    {recipe.cuisine && (
                      <span className="rounded-full bg-stone-100 dark:bg-stone-700 px-2 py-0.5">
                        {recipe.cuisine}
                      </span>
                    )}
                    {totalTime > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {totalTime}min
                      </span>
                    )}
                    <span className="text-stone-300 dark:text-stone-600">•</span>
                    <time>
                      {new Date(recipe.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>

                {recipe.visibility === "private" ? (
                  <Lock className="h-4 w-4 text-stone-400 shrink-0" />
                ) : (
                  <Globe className="h-4 w-4 text-green-500 shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
