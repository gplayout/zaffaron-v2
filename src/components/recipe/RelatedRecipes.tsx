import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

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

interface RelatedRecipesProps {
  currentSlug: string;
  cuisineSlug: string;
  categorySlug: string;
}

export async function RelatedRecipes({ currentSlug, cuisineSlug, categorySlug }: RelatedRecipesProps) {
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
    const existingSlugs = new Set(related.map((r) => r.slug));
    const { data: sameCat } = await supabaseServer
      .from("recipes_v2")
      .select("slug,title,image_url,image_alt,prep_time_minutes,cook_time_minutes,difficulty,cuisine,category")
      .eq("published", true)
      .eq("category_slug", categorySlug)
      .neq("slug", currentSlug)
      .limit(4);
    for (const r of sameCat || []) {
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
