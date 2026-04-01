import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Flame, ChefHat, CheckCircle, Leaf, AlertTriangle, Utensils, MapPin, Calendar, DollarSign } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import JumpToRecipe from "@/components/JumpToRecipe";
import { supabaseServer } from "@/lib/supabase-server";
import { getRecipeBySlug } from "@/lib/get-recipe";
import type { Recipe, Ingredient, Instruction, Substitution, CommonMistake, RegionalVariation } from "@/types";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data } = await supabaseServer
    .from("recipes_v2")
    .select("slug")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(500);
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

function parseTips(tips: string | string[] | null): string[] {
  if (!tips) return [];
  if (Array.isArray(tips)) return tips;
  if (typeof tips === 'string') {
    try { const p = JSON.parse(tips); if (Array.isArray(p)) return p; } catch {}
    return tips.split("\n").filter(Boolean);
  }
  return [];
}

function parseServeWith(val: string | string[] | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); if (Array.isArray(p)) return p; } catch {}
    return val.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

const labelMap: Record<string, string> = {
  persian: "Persian", indian: "Indian", "middle-eastern": "Middle Eastern",
  stew: "Stews", rice: "Rice Dishes", kebab: "Kebabs", appetizer: "Appetizers",
  soup: "Soups", dessert: "Desserts", drink: "Drinks", breakfast: "Breakfast",
  main: "Main Courses", salad: "Salads", side: "Side Dishes",
  pickle: "Pickles", sweet: "Sweets", bread: "Breads",
};

function capitalize(s: string) {
  if (!s) return s;
  return labelMap[s.toLowerCase()] || s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
}

function RecipeJsonLd({ recipe }: { recipe: Recipe }) {
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
      ? { "@type": "ImageObject", url: recipe.image_url, caption: recipe.image_alt || recipe.title }
      : undefined,
    prepTime: `PT${recipe.prep_time_minutes}M`,
    cookTime: `PT${recipe.cook_time_minutes}M`,
    totalTime: `PT${totalMinutes}M`,
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category,
    recipeCuisine: recipe.cuisine,
    keywords: recipe.tags?.join(", ") || undefined,
    recipeIngredient: recipe.ingredients.map(
      (i: Ingredient) => `${i.amount} ${i.unit} ${i.item}${i.note ? ` (${i.note})` : ""}`.trim()
    ),
    recipeInstructions: recipe.instructions.map((s: Instruction) => ({
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
    ...(recipe.dietary_info ? {
      suitableForDiet: [
        ...(recipe.dietary_info.vegetarian ? ["https://schema.org/VegetarianDiet"] : []),
        ...(recipe.dietary_info.vegan ? ["https://schema.org/VeganDiet"] : []),
        ...(recipe.dietary_info.gluten_free ? ["https://schema.org/GlutenFreeDiet"] : []),
        ...(recipe.dietary_info.dairy_free ? ["https://schema.org/DairyFreeDiet"] : []),
      ].filter(Boolean),
    } : {}),
    ...(nutrition ? {
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
    } : recipe.calories_per_serving ? {
      nutrition: { "@type": "NutritionInformation", calories: `${recipe.calories_per_serving} calories` },
    } : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />;
}

function BreadcrumbJsonLd({ recipe }: { recipe: Recipe }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zaffaron.com" },
      { "@type": "ListItem", position: 2, name: capitalize(recipe.cuisine), item: `https://zaffaron.com/cuisine/${recipe.cuisine_slug || recipe.cuisine.toLowerCase()}` },
      { "@type": "ListItem", position: 3, name: capitalize(recipe.category), item: `https://zaffaron.com/category/${recipe.category_slug || recipe.category.toLowerCase()}` },
      { "@type": "ListItem", position: 4, name: recipe.title },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Dietary badge component
function DietaryBadges({ dietary }: { dietary: Recipe['dietary_info'] }) {
  if (!dietary) return null;
  const badges: { label: string; color: string }[] = [];
  if (dietary.vegetarian) badges.push({ label: "Vegetarian", color: "bg-green-100 text-green-700" });
  if (dietary.vegan) badges.push({ label: "Vegan", color: "bg-green-100 text-green-700" });
  if (dietary.gluten_free) badges.push({ label: "Gluten-Free", color: "bg-blue-100 text-blue-700" });
  if (dietary.dairy_free) badges.push({ label: "Dairy-Free", color: "bg-sky-100 text-sky-700" });
  if (dietary.nut_free) badges.push({ label: "Nut-Free", color: "bg-purple-100 text-purple-700" });
  if (dietary.halal) badges.push({ label: "Halal", color: "bg-emerald-100 text-emerald-700" });
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <span key={b.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${b.color}`}>
          <Leaf className="h-3 w-3" /> {b.label}
        </span>
      ))}
    </div>
  );
}

// Allergen warning
function AllergenWarning({ dietary }: { dietary: Recipe['dietary_info'] }) {
  const allergens = dietary?.allergens;
  if (!allergens || !Array.isArray(allergens) || allergens.length === 0) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
      <div>
        <span className="font-medium text-amber-800">Contains: </span>
        <span className="text-amber-700">{allergens.join(", ")}</span>
      </div>
    </div>
  );
}

// Nutrition card
function NutritionCard({ nutrition, calories }: { nutrition: Recipe['nutrition_per_serving']; calories: number | null }) {
  if (!nutrition && !calories) return null;
  const items = nutrition ? [
    { label: "Calories", value: nutrition.calories, unit: "" },
    { label: "Protein", value: nutrition.protein_g, unit: "g" },
    { label: "Fat", value: nutrition.fat_g, unit: "g" },
    { label: "Carbs", value: nutrition.carbs_g, unit: "g" },
    { label: "Fiber", value: nutrition.fiber_g, unit: "g" },
    { label: "Sodium", value: nutrition.sodium_mg, unit: "mg" },
  ].filter(i => i.value != null) : [{ label: "Calories", value: calories, unit: "" }];

  return (
    <section className="mt-6 rounded-lg border border-stone-200 p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-500">Nutrition per serving</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-lg font-bold text-stone-800">{item.value}{item.unit}</div>
            <div className="text-xs text-stone-500">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const cuisineSlug = recipe.cuisine_slug || recipe.cuisine.toLowerCase();
  const categorySlug = recipe.category_slug || recipe.category.toLowerCase();
  const dietary = recipe.dietary_info;
  const nutrition = recipe.nutrition_per_serving;
  const flavor = recipe.flavor_profile;
  const mistakes = recipe.common_mistakes;
  const variations = recipe.regional_variations;

  return (
    <>
      <RecipeJsonLd recipe={recipe} />
      <BreadcrumbJsonLd recipe={recipe} />
      <article className="mx-auto max-w-3xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-stone-500">
            <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
            <li aria-hidden="true" className="text-stone-300">›</li>
            <li><Link href={`/cuisine/${cuisineSlug}`} className="hover:text-amber-600">{capitalize(recipe.cuisine)}</Link></li>
            <li aria-hidden="true" className="text-stone-300">›</li>
            <li><Link href={`/category/${categorySlug}`} className="hover:text-amber-600">{capitalize(recipe.category)}</Link></li>
            <li aria-hidden="true" className="text-stone-300">›</li>
            <li aria-current="page" className="text-stone-700 font-medium truncate max-w-[200px]">{recipe.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
            <Link href={`/cuisine/${cuisineSlug}`} className="text-amber-600 hover:text-amber-700">{recipe.cuisine}</Link>
            <span className="text-stone-300">·</span>
            <Link href={`/category/${categorySlug}`} className="text-amber-600 hover:text-amber-700">{recipe.category}</Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{recipe.title}</h1>
          <p className="mt-3 text-lg text-stone-600">{recipe.description}</p>

          {/* Author & Date */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
            <span>By {recipe.author || "Zaffaron Kitchen"}</span>
            {recipe.published_at && <span>· Published {formatDate(recipe.published_at)}</span>}
            {recipe.verification_status === "verified" && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle className="h-4 w-4" /> Tested Recipe
              </span>
            )}
          </div>

          {/* Dietary Badges + Allergens */}
          <div className="mt-4 space-y-3">
            <DietaryBadges dietary={dietary} />
            <AllergenWarning dietary={dietary} />
          </div>

          {/* Stats */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-600">
            <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
              <Clock className="h-4 w-4" /> {totalTime} min total
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
              <ChefHat className="h-4 w-4" /> Prep {recipe.prep_time_minutes}m · Cook {recipe.cook_time_minutes}m
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
              <Users className="h-4 w-4" /> {recipe.servings} servings
            </span>
            {recipe.calories_per_serving && (
              <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
                <Flame className="h-4 w-4" /> {recipe.calories_per_serving} cal
              </span>
            )}
            {recipe.cost_estimate?.per_serving_usd && (
              <span className="flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1">
                <DollarSign className="h-4 w-4" /> ~${recipe.cost_estimate.per_serving_usd}/serving
              </span>
            )}
          </div>

          {/* Jump to Recipe + Print */}
          <div className="mt-4 flex gap-3 print:hidden">
            <JumpToRecipe />
            <PrintButton />
          </div>
        </header>

        {/* Image */}
        {recipe.image_url && (
          <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
            <Image
              src={recipe.image_url}
              alt={recipe.image_alt || recipe.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Cultural Significance */}
        {recipe.cultural_significance && (
          <section className="mb-8 rounded-lg border-l-4 border-amber-400 bg-amber-50/50 px-5 py-4">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">Cultural Background</h2>
            <p className="text-sm leading-relaxed text-stone-700">{recipe.cultural_significance}</p>
          </section>
        )}

        {/* Flavor Profile */}
        {flavor && (
          <div className="mb-8 flex flex-wrap gap-2">
            {flavor.taste?.map((t: string) => (
              <span key={t} className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs text-rose-600">{t}</span>
            ))}
            {flavor.texture?.map((t: string) => (
              <span key={t} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs text-violet-600">{t}</span>
            ))}
            {flavor.aroma?.map((a: string) => (
              <span key={a} className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{a}</span>
            ))}
            {flavor.spice_level && flavor.spice_level !== "none" && (
              <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600">🌶 {flavor.spice_level}</span>
            )}
          </div>
        )}

        {/* Equipment */}
        {recipe.equipment && Array.isArray(recipe.equipment) && recipe.equipment.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-stone-500">
              <Utensils className="h-4 w-4" /> Equipment
            </h2>
            <div className="flex flex-wrap gap-2">
              {recipe.equipment.map((e: string) => (
                <span key={e} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600">{e}</span>
              ))}
            </div>
          </section>
        )}

        <div id="recipe-ingredients" className="grid gap-8 md:grid-cols-[1fr_2fr]">
          {/* Ingredients */}
          <section>
            <h2 className="mb-4 text-xl font-bold">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing: Ingredient, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="font-medium text-stone-800 min-w-fit">
                    {ing.amount} {ing.unit}
                  </span>
                  <span className="text-stone-600">
                    {ing.item}
                    {ing.note && <span className="text-stone-500"> ({ing.note})</span>}
                  </span>
                </li>
              ))}
            </ul>

            {/* Substitutions */}
            {recipe.substitutions && Array.isArray(recipe.substitutions) && recipe.substitutions.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-bold text-stone-700">🔄 Substitutions</h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  {recipe.substitutions.map((sub: Substitution, i: number) => (
                    <li key={i} className="rounded-lg bg-stone-50 p-2">
                      <span className="font-medium">{sub.original}</span>
                      <span className="block mt-0.5 text-stone-500">→ {sub.substitute}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Instructions */}
          <section>
            <h2 className="mb-4 text-xl font-bold">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step: Instruction) => (
                <li key={step.step} id={`step-${step.step}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                    {step.step}
                  </span>
                  <div>
                    <p className="text-sm leading-relaxed text-stone-700">{step.text}</p>
                    {step.time_minutes && (
                      <p className="mt-1 text-xs text-stone-500">⏱ {step.time_minutes} minutes</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Nutrition Card */}
        <NutritionCard nutrition={nutrition} calories={recipe.calories_per_serving} />

        {/* Tips */}
        {recipe.tips && (
          <section className="mt-6 rounded-lg bg-amber-50 p-6">
            <h2 className="mb-3 text-lg font-bold text-amber-800">💡 Tips</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-amber-900 list-disc list-inside">
              {parseTips(recipe.tips).map((tip: string, i: number) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Common Mistakes */}
        {mistakes && Array.isArray(mistakes) && mistakes.length > 0 && (
          <section className="mt-6 rounded-lg bg-red-50 p-6">
            <h2 className="mb-3 text-lg font-bold text-red-800">⚠️ Common Mistakes</h2>
            <ul className="space-y-3">
              {mistakes.map((m: CommonMistake, i: number) => (
                <li key={i} className="text-sm">
                  <p className="font-medium text-red-700">{m.mistake}</p>
                  <p className="text-red-600">Why: {m.why}</p>
                  <p className="text-emerald-700">Fix: {m.fix}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Storage Notes */}
        {recipe.storage_notes && (
          <section className="mt-6 rounded-lg bg-stone-100 p-6">
            <h2 className="mb-3 text-lg font-bold text-stone-800">🧊 How to Store</h2>
            <p className="text-sm leading-relaxed text-stone-700">{recipe.storage_notes}</p>
          </section>
        )}

        {/* Make Ahead */}
        {recipe.make_ahead && (
          <section className="mt-6 rounded-lg bg-blue-50 p-6">
            <h2 className="mb-3 text-lg font-bold text-blue-800">📅 Make Ahead</h2>
            <p className="text-sm leading-relaxed text-blue-700">{recipe.make_ahead}</p>
          </section>
        )}

        {/* Serve With */}
        {recipe.serve_with && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-bold">🍽️ Pairs Well With</h2>
            <ul className="list-disc pl-5 text-sm text-stone-600 space-y-1">
              {parseServeWith(recipe.serve_with).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Regional Variations */}
        {variations && Array.isArray(variations) && variations.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 flex items-center gap-1.5 text-lg font-bold">
              <MapPin className="h-5 w-5 text-stone-400" /> Regional Variations
            </h2>
            <ul className="space-y-2">
              {variations.map((v: RegionalVariation, i: number) => (
                <li key={i} className="rounded-lg border border-stone-200 p-3 text-sm">
                  <span className="font-medium text-stone-800">{v.region}</span>
                  <span className="block mt-0.5 text-stone-600">{v.description || v.difference}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Occasions */}
        {recipe.occasions && Array.isArray(recipe.occasions) && recipe.occasions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {recipe.occasions.map((o: string) => (
              <span key={o} className="flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600">
                <Calendar className="h-3 w-3" /> {o}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {recipe.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {/* Related Recipes */}
        <RelatedRecipes currentSlug={recipe.slug} cuisineSlug={recipe.cuisine_slug || recipe.cuisine.toLowerCase()} categorySlug={recipe.category_slug || recipe.category.toLowerCase()} />
      </article>
    </>
  );
}

async function RelatedRecipes({ currentSlug, cuisineSlug, categorySlug }: { currentSlug: string; cuisineSlug: string; categorySlug: string }) {
  // Get related recipes: same cuisine first, fill with same category
  const { data: sameCuisine } = await supabaseServer
    .from("recipes_v2")
    .select("slug,title,image_url,image_alt,prep_time_minutes,cook_time_minutes,difficulty,cuisine,category")
    .eq("published", true)
    .eq("cuisine_slug", cuisineSlug)
    .neq("slug", currentSlug)
    .limit(4);

  const related = (sameCuisine || []).slice(0, 4);

  // Fill remaining slots with same category if needed
  if (related.length < 4 && categorySlug) {
    const existingSlugs = new Set(related.map(r => r.slug));
    const { data: sameCat } = await supabaseServer
      .from("recipes_v2")
      .select("slug,title,image_url,image_alt,prep_time_minutes,cook_time_minutes,difficulty,cuisine,category")
      .eq("published", true)
      .eq("category_slug", categorySlug)
      .neq("slug", currentSlug)
      .limit(4);
    for (const r of (sameCat || [])) {
      if (related.length >= 4) break;
      if (!existingSlugs.has(r.slug)) related.push(r);
    }
  }
  if (related.length === 0) return null;

  return (
    <section className="mt-10 border-t border-stone-200 pt-8">
      <h2 className="text-xl font-bold text-stone-800 mb-4">You Might Also Like</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((r) => (
          <Link
            key={r.slug}
            href={`/recipe/${r.slug}`}
            className="group rounded-lg border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {r.image_url && (
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <Image
                  src={r.image_url}
                  alt={r.image_alt || r.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width:640px) 50vw, 25vw"
                />
              </div>
            )}
            <div className="p-3">
              <h3 className="text-sm font-semibold text-stone-800 line-clamp-2">{r.title}</h3>
              <p className="mt-1 text-xs text-stone-500">
                {capitalize(r.cuisine)} · {capitalize(r.category)} · {r.prep_time_minutes + r.cook_time_minutes} min
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
