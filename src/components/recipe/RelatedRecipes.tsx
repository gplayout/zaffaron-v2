import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { humanize } from "@/lib/formatting";

interface RelatedRecipesProps {
  currentSlug: string;
  cuisineSlug: string;
  categorySlug: string;
}

export async function RelatedRecipes({ currentSlug, cuisineSlug, categorySlug }: RelatedRecipesProps) {
  // Two queries: same cuisine first, then same category as fallback
  const FIELDS = "slug,title,image_url,image_alt,prep_time_minutes,cook_time_minutes,difficulty,cuisine,category,cuisine_slug";

  // Primary: same cuisine (most relevant)
  const { data: sameCuisine } = await supabaseServer
    .from("recipes_v2")
    .select(FIELDS)
    .eq("published", true)
    .eq("cuisine_slug", cuisineSlug)
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(4);

  // Fallback: same category, different cuisine (for variety)
  const slugsToExclude = [currentSlug, ...(sameCuisine || []).map(r => r.slug)];
  let categoryFill: typeof sameCuisine = [];
  if ((sameCuisine || []).length < 4) {
    const { data: catData } = await supabaseServer
      .from("recipes_v2")
      .select(FIELDS)
      .eq("published", true)
      .eq("category_slug", categorySlug)
      .not("slug", "in", `(${slugsToExclude.join(",")})`)
      .order("published_at", { ascending: false })
      .limit(4 - (sameCuisine || []).length);
    categoryFill = catData || [];
  }

  const related = [...(sameCuisine || []), ...categoryFill].slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-10 border-t border-stone-200 dark:border-stone-700 pt-8">
      <h2 className="text-xl font-bold text-stone-800 dark:text-stone-200 mb-4">You Might Also Like</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((r) => (
          <Link
            key={r.slug}
            href={`/recipe/${r.slug}`}
            className="group rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 overflow-hidden hover:shadow-md transition-shadow"
          >
            {r.image_url && (
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-700">
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
              <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-200 line-clamp-2">{r.title}</h3>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {humanize(r.cuisine)} · {humanize(r.category)} · {(r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0)} min
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
