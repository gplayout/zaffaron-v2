import type { Recipe, Ingredient, Instruction } from "@/types";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";
import { humanize } from "@/lib/formatting";
import { SITE_URL, SITE_NAME } from "@/lib/config";

interface RecipeJsonLdProps {
  recipe: Recipe;
  ratingValue?: number;
  ratingCount?: number;
}

export function RecipeJsonLd({ recipe, ratingValue, ratingCount }: RecipeJsonLdProps) {
  const url = `${SITE_URL}/recipe/${recipe.slug}`;
  const nutrition = recipe.nutrition_per_serving;

  // Cap prep time for JSON-LD: Google expects "active hands-on time", not soaking/marinating.
  // Recipes with 8-13h "prep" are really 20-45min active + overnight soak.
  // Cap at 120 min (2 hours) — no recipe requires more active prep than that.
  const activePrepMinutes = Math.min(recipe.prep_time_minutes, 120);
  const totalMinutes = activePrepMinutes + recipe.cook_time_minutes;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${url}#recipe`,
    url,
    mainEntityOfPage: url,
    name: recipe.title,
    description: recipe.seo_description || recipe.description,
    inLanguage: "en",
    isAccessibleForFree: true,
    datePublished: recipe.published_at ?? recipe.created_at,
    dateModified: recipe.updated_at,
    image: recipe.image_url
      ? {
          "@type": "ImageObject",
          url: recipe.image_url,
          caption: recipe.image_alt || recipe.title,
        }
      : undefined,
    prepTime: `PT${activePrepMinutes}M`,
    cookTime: `PT${recipe.cook_time_minutes}M`,
    totalTime: `PT${totalMinutes}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    keywords: recipe.tags?.join(", ") || undefined,
    ...(ratingCount && ratingCount > 0 && ratingValue && ratingValue > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue,
            ratingCount,
          },
        }
      : {}),
    recipeIngredient: (recipe.ingredients || []).map(
      (i: Ingredient) =>
        `${i.amount} ${i.unit} ${i.item}${i.note ? ` (${i.note})` : ""}`.trim()
    ),
    recipeInstructions: (recipe.instructions || []).map((s: Instruction) => ({
      "@type": "HowToStep",
      name: `Step ${s.step}`,
      text: s.text,
      url: `${url}#step-${s.step}`,
    })),
    author: {
      "@type": "Organization",
      name: "Zaffaron Kitchen",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
    },
    publisher: {
      "@type": "Organization",
      name: "Zaffaron",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon-512.png` },
    },
    ...(() => {
      if (!recipe.dietary_info) return {};
      const diets = [
        ...(recipe.dietary_info.vegetarian ? ["https://schema.org/VegetarianDiet"] : []),
        ...(recipe.dietary_info.vegan ? ["https://schema.org/VeganDiet"] : []),
        ...(recipe.dietary_info.gluten_free ? ["https://schema.org/GlutenFreeDiet"] : []),
        ...(recipe.dietary_info.dairy_free ? ["https://schema.org/DairyFreeDiet"] : []),
      ].filter(Boolean);
      return diets.length > 0 ? { suitableForDiet: diets } : {};
    })(),
    ...(nutrition && (nutrition.calories || nutrition.protein_g || nutrition.carbs_g || nutrition.fat_g)
      ? {
          nutrition: {
            "@type": "NutritionInformation",
            calories: nutrition.calories ? `${nutrition.calories} calories` : undefined,
            fatContent: nutrition.fat_g ? `${nutrition.fat_g} g` : undefined,
            saturatedFatContent: nutrition.saturated_fat_g ? `${nutrition.saturated_fat_g} g` : undefined,
            carbohydrateContent: nutrition.carbs_g ? `${nutrition.carbs_g} g` : undefined,
            proteinContent: nutrition.protein_g ? `${nutrition.protein_g} g` : undefined,
            fiberContent: nutrition.fiber_g ? `${nutrition.fiber_g} g` : undefined,
            sugarContent: nutrition.sugar_g ? `${nutrition.sugar_g} g` : undefined,
            sodiumContent: nutrition.sodium_mg ? `${nutrition.sodium_mg} mg` : undefined,
          },
        }
      : recipe.calories_per_serving
        ? {
            nutrition: {
              "@type": "NutritionInformation",
              calories: `${recipe.calories_per_serving} calories`,
            },
          }
        : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  );
}

// Use shared humanize() from formatting.ts — single source of truth for label mapping

interface BreadcrumbJsonLdProps {
  recipe: Recipe;
}

export function BreadcrumbJsonLd({ recipe }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: humanize(recipe.cuisine || 'General'),
        item: `${SITE_URL}/cuisine/${recipe.cuisine_slug || recipe.cuisine?.toLowerCase().replace(/\s+/g, '-') || 'general'}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: humanize(recipe.category || 'Recipes'),
        item: `${SITE_URL}/category/${recipe.category_slug || recipe.category?.toLowerCase().replace(/\s+/g, '-') || 'recipes'}`,
      },
      { "@type": "ListItem", position: 4, name: recipe.title, item: `${SITE_URL}/recipe/${recipe.slug}` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  );
}
