import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { Clock, Users, ChefHat, Heart, Share2, Lock, Globe, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import type { VaultStructuredData } from "@/lib/vault/types";
import { SITE_URL } from "@/lib/config";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";
import VaultRecipeActions from "./actions-client";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

async function getVaultRecipe(slug: string) {
  // Use service role to fetch (RLS check done manually below)
  const { data, error } = await supabaseServer
    .from("vault_recipes")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getVaultRecipe(slug);
  if (!recipe) return { title: "Recipe Not Found" };

  const title = recipe.attribution_name
    ? `${recipe.title} — ${recipe.attribution_name}'s Family Recipe`
    : `${recipe.title} — Family Recipe`;

  return {
    title,
    description: recipe.attribution_story || `A family recipe preserved on Zaffaron Vault.`,
    ...(recipe.visibility === "public"
      ? {
          openGraph: {
            title,
            description: recipe.attribution_story || "A family recipe preserved forever.",
            url: `${SITE_URL}/vault/recipe/${slug}`,
            images: [{ url: recipe.image_url || "/og-default.jpg" }],
          },
        }
      : { robots: { index: false, follow: false } }),
  };
}

export default async function VaultRecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = await getVaultRecipe(slug);
  if (!recipe) notFound();

  const currentUserId = await getCurrentUserId();
  const isOwner = currentUserId === recipe.owner_id;

  // Privacy check: private recipes only visible to owner
  if (recipe.visibility === "private" && !isOwner) {
    notFound();
  }

  const data = recipe.structured_data as VaultStructuredData;
  const totalTime = (data.prep_time_minutes || 0) + (data.cook_time_minutes || 0);

  // JSON-LD only for public recipes
  const jsonLd = recipe.visibility === "public" ? {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.attribution_story || undefined,
    ...(recipe.attribution_name ? {
      author: { "@type": "Person", name: recipe.attribution_name },
    } : {}),
    recipeIngredient: (data.ingredients || []).map(
      (i) => `${i.amount} ${i.unit} ${i.item}${i.note ? ` (${i.note})` : ""}`.trim()
    ),
    recipeInstructions: (data.instructions || []).map((s) => ({
      "@type": "HowToStep",
      name: `Step ${s.step}`,
      text: s.text,
    })),
    ...(data.prep_time_minutes ? { prepTime: `PT${data.prep_time_minutes}M` } : {}),
    ...(data.cook_time_minutes ? { cookTime: `PT${data.cook_time_minutes}M` } : {}),
    ...(totalTime ? { totalTime: `PT${totalTime}M` } : {}),
    ...(data.servings ? { recipeYield: `${data.servings} servings` } : {}),
    ...(data.cuisine ? { recipeCuisine: data.cuisine } : {}),
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/vault"
          className="inline-flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-600 transition mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vault
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {recipe.visibility === "private" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                <Lock className="h-3 w-3" /> Private
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                <Globe className="h-3 w-3" /> Shared
              </span>
            )}
            {recipe.cuisine && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                {recipe.cuisine}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
            {recipe.title}
          </h1>

          {recipe.attribution_name && (
            <p className="mt-2 text-lg text-stone-600 dark:text-stone-400">
              Recipe by <span className="font-semibold text-amber-600">{recipe.attribution_name}</span>
            </p>
          )}

          {recipe.attribution_story && (
            <blockquote className="mt-4 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-3 text-stone-600 dark:text-stone-400 italic rounded-r-lg">
              &ldquo;{recipe.attribution_story}&rdquo;
            </blockquote>
          )}
        </header>

        {/* Quick Stats */}
        {totalTime > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
            {data.prep_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Prep: {data.prep_time_minutes}min
              </span>
            )}
            {data.cook_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Cook: {data.cook_time_minutes}min
              </span>
            )}
            {data.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> Serves: {data.servings}
              </span>
            )}
            {data.difficulty && (
              <span className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" /> {data.difficulty}
              </span>
            )}
          </div>
        )}

        {/* Ingredients */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Ingredients
          </h2>
          <ul className="space-y-2">
            {(data.ingredients || []).map((ing, i) => (
              <li key={i} className="flex items-start gap-3 text-stone-700 dark:text-stone-300">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span>
                  <strong>{ing.amount} {ing.unit}</strong> {ing.item}
                  {ing.note && <span className="text-stone-400"> ({ing.note})</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Instructions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">
            Instructions
          </h2>
          <ol className="space-y-4">
            {(data.instructions || []).map((inst) => (
              <li key={inst.step} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-sm font-bold text-amber-700 dark:text-amber-400">
                  {inst.step}
                </span>
                <p className="text-stone-700 dark:text-stone-300 pt-0.5">{inst.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Owner Actions */}
        {isOwner && (
          <VaultRecipeActions
            recipeId={recipe.id}
            slug={slug}
            visibility={recipe.visibility}
          />
        )}

        {/* Viral CTA (for non-owners) */}
        {!isOwner && (
          <section className="mt-12 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-8 text-center">
            <Heart className="mx-auto h-10 w-10 text-amber-600 mb-3" />
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Does your family have a similar recipe?
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Save your family&apos;s version — with your own notes, ingredients, and the name of who taught you.
            </p>
            <Link
              href="/vault/create"
              className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
            >
              <ChefHat className="h-4 w-4" />
              Save Your Family&apos;s Version
            </Link>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-700 text-center text-xs text-stone-400">
          Preserved on{" "}
          <Link href="/" className="text-amber-600 hover:underline">
            Zaffaron Family Vault
          </Link>
        </footer>
      </div>
    </>
  );
}
