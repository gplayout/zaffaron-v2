import type { Recipe, Ingredient, Instruction } from "@/types";

interface RecipeJsonLdProps {
  recipe: Recipe;
}

export function RecipeJsonLd({ recipe }: RecipeJsonLdProps) {
  const totalMinutes = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const url = `https://zaffaron.com/recipe/${recipe.slug}`;
  const nutrition = recipe.nutrition_per_serving;

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
    prepTime: `PT${recipe.prep_time_minutes}M`,
    cookTime: `PT${recipe.cook_time_minutes}M`,
    totalTime: `PT${totalMinutes}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    keywords: recipe.tags?.join(", ") || undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 5,
      ratingCount: 1,
    },
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
      url: "https://zaffaron.com",
      logo: { "@type": "ImageObject", url: "https://zaffaron.com/icon-512.png" },
    },
    publisher: {
      "@type": "Organization",
      name: "Zaffaron",
      url: "https://zaffaron.com",
      logo: { "@type": "ImageObject", url: "https://zaffaron.com/icon-512.png" },
    },
    ...(recipe.dietary_info
      ? {
          suitableForDiet: [
            ...(recipe.dietary_info.vegetarian ? ["https://schema.org/VegetarianDiet"] : []),
            ...(recipe.dietary_info.vegan ? ["https://schema.org/VeganDiet"] : []),
            ...(recipe.dietary_info.gluten_free ? ["https://schema.org/GlutenFreeDiet"] : []),
            ...(recipe.dietary_info.dairy_free ? ["https://schema.org/DairyFreeDiet"] : []),
          ].filter(Boolean),
        }
      : {}),
    ...(nutrition
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
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

const labelMap: Record<string, string> = {
  persian: "Persian",
  indian: "Indian",
  "middle-eastern": "Middle Eastern",
  stew: "Stews",
  rice: "Rice Dishes",
  kebab: "Kebabs",
  appetizer: "Appetizers",
  soup: "Soups",
  dessert: "Desserts",
  drink: "Drinks",
  breakfast: "Breakfast",
  main: "Main Courses",
  salad: "Salads",
  side: "Side Dishes",
  pickle: "Pickles",
  sweet: "Sweets",
  bread: "Breads",
};

function capitalize(s: string) {
  if (!s) return s;
  return labelMap[s.toLowerCase()] || s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

interface BreadcrumbJsonLdProps {
  recipe: Recipe;
}

export function BreadcrumbJsonLd({ recipe }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zaffaron.com" },
      {
        "@type": "ListItem",
        position: 2,
        name: capitalize(recipe.cuisine),
        item: `https://zaffaron.com/cuisine/${recipe.cuisine_slug || recipe.cuisine.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: capitalize(recipe.category),
        item: `https://zaffaron.com/category/${recipe.category_slug || recipe.category.toLowerCase()}`,
      },
      { "@type": "ListItem", position: 4, name: recipe.title },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
