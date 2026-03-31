import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";
import type { Recipe } from "@/types";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const categoryDescriptions: Record<string, { title: string; emoji: string; description: string }> = {
  stew: { title: "Stew Recipes", emoji: "🍲", description: "Rich, slow-cooked stews that form the heart of Persian cuisine. From the herb-laden Ghormeh Sabzi to the tangy-sweet Fesenjān, these dishes reward patience with extraordinary depth of flavor." },
  rice: { title: "Rice Dishes", emoji: "🍚", description: "Persian rice is an art form — fluffy, fragrant, and crowned with golden tahdig. Explore our collection of polo and chelow dishes, each a celebration of saffron, herbs, and perfect technique." },
  kebab: { title: "Kebab Recipes", emoji: "🍢", description: "The pride of Persian grilling — from juicy Joojeh Kabab marinated in saffron to the legendary Koobideh. Master the techniques behind Iran's most beloved street and restaurant food." },
  appetizer: { title: "Appetizers & Sides", emoji: "🥗", description: "Start your Persian feast right with creamy dips, fresh salads, and vibrant small plates — from Kashk-e Bademjan to Salad Shirazi." },
  soup: { title: "Soup Recipes", emoji: "🥣", description: "Hearty, nourishing soups that warm the soul — including the beloved Ash Reshteh and traditional Abgoosht." },
  dessert: { title: "Desserts & Sweets", emoji: "🍮", description: "Persian sweets are legendary — from saffron-scented Sholeh Zard to delicate Nan-e Berenji cookies and refreshing Faloodeh." },
  drink: { title: "Drinks & Beverages", emoji: "🥛", description: "Traditional Persian beverages to complement your meal — including the refreshing yogurt drink Doogh." },
  breakfast: { title: "Breakfast Recipes", emoji: "🍳", description: "Start your morning the Persian way with hearty, warming breakfast dishes like Halim." },
  main: { title: "Main Courses", emoji: "🍽️", description: "Complete main dishes from cuisines around the world." },
  salad: { title: "Salad Recipes", emoji: "🥗", description: "Fresh, vibrant salads from Persian and world cuisines." },
  side: { title: "Side Dishes", emoji: "🫒", description: "Perfect accompaniments to complete your meal." },
  pickle: { title: "Pickles & Preserves", emoji: "🫙", description: "Traditional Persian pickles and preserves — the tangy, crunchy companion to every meal." },
  sweet: { title: "Sweets", emoji: "🍯", description: "Traditional sweets and confections from Persian and Middle Eastern kitchens." },
};

const defaultDesc = (slug: string) => ({
  title: `${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")} Recipes`,
  emoji: "🍽️",
  description: `Browse our collection of ${slug.replace(/-/g, " ")} recipes.`,
});

export async function generateStaticParams() {
  const { data } = await supabaseServer
    .from("recipes_v2")
    .select("category_slug")
    .eq("published", true);
  const slugs = [...new Set((data || []).map((r) => r.category_slug).filter(Boolean))];
  return slugs.map((slug) => ({ slug }));
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!categoryDescriptions[slug]) {
    // Check if any recipes exist for this slug
    const { data } = await supabaseServer.from("recipes_v2").select("id", { count: "exact", head: true }).eq("published", true).eq("category_slug", slug);
    if (!data || data.length === 0) return { title: "Not Found", robots: { index: false } };
  }
  const info = categoryDescriptions[slug] || defaultDesc(slug);
  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: `https://zaffaron.com/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const info = categoryDescriptions[slug] || defaultDesc(slug);

  const { data: recipes } = await supabaseServer
    .from("recipes_v2")
    .select("id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at")
    .eq("published", true)
    .eq("category_slug", slug)
    .order("published_at", { ascending: false });

  const items = (recipes as Recipe[]) || [];

  // 404 for invalid categories
  if (items.length === 0 && !categoryDescriptions[slug]) {
    notFound();
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <span className="mx-1.5 text-stone-300">›</span>
        <span className="text-stone-700 font-medium">{info.title}</span>
      </nav>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{info.emoji} {info.title}</h1>
        <p className="mt-3 max-w-2xl text-stone-500">{info.description}</p>
        <p className="mt-2 text-sm text-stone-400">{items.length} recipes</p>
      </div>
      {items.length === 0 ? (
        <p className="text-stone-400">No recipes in this category yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((recipe, i) => (
            <li key={recipe.id}>
              <RecipeCard recipe={recipe} priority={i < 6} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
