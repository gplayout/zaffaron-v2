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
} from "@/components/recipe";
import type { Metadata } from "next";
import { getRecipeFaq } from "@/lib/seo/recipe-faq";
import { getRecipeVariations } from "@/lib/seo/recipe-variations";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select("slug")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(500);
  if (error) {
    console.error("generateStaticParams (recipe) failed:", error);
    return [];
  }
  return (data || []).map((r) => ({ slug: r.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe not found" };

  const url = `https://zaffaron.com/recipe/${recipe.slug}`;
  const ogImage = recipe.image_url || "https://zaffaron.com/og-default.jpg";
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

  return (
    <>
      <RecipeJsonLd recipe={recipe} />
      <BreadcrumbJsonLd recipe={recipe} />
      <article className="mx-auto max-w-3xl">
        <RecipeHero recipe={recipe} />

        <RecipeQuickCard recipe={recipe} />

        <RecipeTips recipe={recipe} />

        <RecipeFAQ items={getRecipeFaq(recipe.slug)} />

        <div id="recipe-ingredients" className="grid gap-8 md:grid-cols-[1fr_2fr] mt-8">
          <RecipeIngredients
            ingredients={recipe.ingredients}
            substitutions={recipe.substitutions}
          />
          <RecipeInstructions instructions={recipe.instructions} />
        </div>

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
          url={`https://zaffaron.com/recipe/${recipe.slug}`}
        />

        <RecipeNutrition
          nutrition={recipe.nutrition_per_serving}
          calories={recipe.calories_per_serving}
        />

        <RelatedRecipes
          currentSlug={recipe.slug}
          cuisineSlug={recipe.cuisine_slug || recipe.cuisine.toLowerCase()}
          categorySlug={recipe.category_slug || recipe.category.toLowerCase()}
        />

        <RecipeReviews reviews={reviews} recipeId={recipe.id} />
      </article>
    </>
  );
}
