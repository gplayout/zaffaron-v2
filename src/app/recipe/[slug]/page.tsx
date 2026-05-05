import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getRecipeBySlug } from "@/lib/get-recipe";
import { getRecipeReviews } from "@/components/recipe/reviews-actions";
import {
  RecipeHero,
  RecipeQuickCard,
  RecipeIngredients,
  RecipeInstructions,
  RecipeNutrition,
  RecipeTips,
  RecipeJsonLd,
  BreadcrumbJsonLd,
  RelatedRecipes,
  RecipeReviews,
  ShareButtons,
  RecipeProvenance,
  RecipeFAQ,
  RecipeVariations,
  RecipeInternalLinks,
  UnitSystemProvider,
} from "@/components/recipe";
import { headers } from "next/headers";
import { VaultCTA } from "@/components/recipe/VaultCTA";
import { ViewTracker } from "@/components/recipe/ViewTracker";
import type { Metadata } from "next";
import { getRecipeFaq } from "@/lib/seo/recipe-faq";
import { getRecipeVariations } from "@/lib/seo/recipe-variations";
import { SITE_URL } from '@/lib/config';

export const revalidate = 3600;

export async function generateStaticParams() {
  // Paginate to get ALL published recipes (Supabase default limit = 1000)
  const allSlugs: { slug: string }[] = [];
  let page = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabaseServer
      .from("recipes_v2")
      .select("slug")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) {
      console.error("generateStaticParams (recipe) failed:", error);
      break;
    }
    if (!data || data.length === 0) break;
    allSlugs.push(...data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }
  return allSlugs.map((r) => ({ slug: r.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe not found" };

  const url = `${SITE_URL}/recipe/${recipe.slug}`;
  const ogImage = recipe.image_url || `${SITE_URL}/og-default.jpg`;
  const seoTitle = recipe.seo_title || recipe.title;
  const seoDesc = recipe.seo_description || recipe.description?.substring(0, 160);

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: seoTitle,
      description: seoDesc,
      type: "article",
      siteName: "Zaffaron",
      publishedTime: recipe.published_at ?? undefined,
      modifiedTime: recipe.updated_at,
      images: [{ url: ogImage, alt: recipe.image_alt || recipe.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: [ogImage],
    },
  };
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  // Fetch reviews server-side
  const reviewsResult = await getRecipeReviews(recipe.id);
  const reviews = reviewsResult.ok ? reviewsResult.reviews : [];

  const ratingCount = reviews.length;
  const ratingValue = ratingCount
    ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingCount) * 10) / 10
    : undefined;

  // Phase 6.6 γ (2026-05-05): default unit system based on user geo + cookie pref.
  // Priority: cookie zaff_unit_pref > Vercel header x-vercel-ip-country (US-style countries) > metric.
  // Note: revalidate=3600 means this server-rendered default is cached per route, NOT per request.
  // Client-side hydration via UnitSystemProvider reads cookie + overrides (so individual users still get their pref).
  const hdrs = await headers();
  const cookieStr = hdrs.get("cookie") || "";
  const cookieMatch = cookieStr.match(/zaff_unit_pref=(metric|imperial)/);
  const country = (hdrs.get("x-vercel-ip-country") || "").toUpperCase();
  const initialUnit: "metric" | "imperial" =
    cookieMatch ? (cookieMatch[1] as "metric" | "imperial") :
    (country === "US" || country === "LR" || country === "MM") ? "imperial" :
    "metric";

  return (
    <>
      <RecipeJsonLd recipe={recipe} ratingCount={ratingCount} ratingValue={ratingValue} />
      <BreadcrumbJsonLd recipe={recipe} />
      <UnitSystemProvider initial={initialUnit}>
      <article className="mx-auto max-w-3xl">
        {/* Phase 1b: anonymous view tracking (5s settle + visibility gate) */}
        <ViewTracker recipeId={recipe.id} />
        <RecipeHero recipe={recipe} />

        <RecipeQuickCard recipe={recipe} />

        <div data-print="hide">
          <RecipeTips recipe={recipe} />
        </div>

        <div data-print="hide">
          <RecipeFAQ items={getRecipeFaq(recipe.slug)} />
        </div>

        <div id="recipe-ingredients" className="grid gap-8 md:grid-cols-[1fr_2fr] mt-8">
          <RecipeIngredients
            ingredients={recipe.ingredients}
            substitutions={recipe.substitutions}
          />
          <RecipeInstructions instructions={recipe.instructions} />
        </div>

        <div data-print="hide">
          <RecipeVariations sections={getRecipeVariations(recipe.slug)} />

          <RecipeProvenance
            cuisineSlug={recipe.cuisine_slug}
            culturalSignificance={recipe.cultural_significance}
            regionalVariations={recipe.regional_variations}
            author={recipe.author}
            publishedAt={recipe.published_at}
          />

          <ShareButtons
            title={recipe.title}
            url={`${SITE_URL}/recipe/${recipe.slug}`}
          />

          <RecipeNutrition
            nutrition={recipe.nutrition_per_serving}
            calories={recipe.calories_per_serving}
          />

          <RecipeInternalLinks recipe={recipe} />

          <VaultCTA
            recipeTitle={recipe.title}
            recipeSlug={recipe.slug}
            cuisine={recipe.cuisine}
          />

          <RelatedRecipes
            currentSlug={recipe.slug}
            cuisineSlug={recipe.cuisine_slug || recipe.cuisine.toLowerCase()}
            categorySlug={recipe.category_slug || recipe.category.toLowerCase()}
          />

          <RecipeReviews reviews={reviews} recipeId={recipe.id} recipeSlug={recipe.slug} />
        </div>
      </article>
      </UnitSystemProvider>
    </>
  );
}
