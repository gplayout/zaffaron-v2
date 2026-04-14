import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

interface Campaign {
  slug: string;
  title: string;
  event_slug: string;
  recipe_slugs: string[];
  priority: number;
}

interface Recipe {
  slug: string;
  title: string;
  image_url: string | null;
  cuisine_slug: string;
}

export default async function SeasonalSpotlight() {
  const today = new Date().toISOString().split("T")[0];

  // Get active campaigns (today is between start_date and end_date)
  const { data: campaigns } = await supabaseServer
    .from("featured_campaigns")
    .select("slug, title, event_slug, recipe_slugs, priority")
    .eq("published", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("priority", { ascending: false })
    .limit(2);

  if (!campaigns || campaigns.length === 0) return null;

  // Get recipes for the top campaign
  const topCampaign = campaigns[0] as Campaign;
  if (!topCampaign.recipe_slugs || topCampaign.recipe_slugs.length === 0) return null;

  const { data: recipes } = await supabaseServer
    .from("recipes_v2")
    .select("slug, title, image_url, cuisine_slug")
    .in("slug", topCampaign.recipe_slugs)
    .eq("published", true)
    .limit(4);

  if (!recipes || recipes.length < 2) return null; // Need at least 2 recipes for a good visual grid

  return (
    <section className="my-12 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8 border border-amber-200">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🗓️</span>
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            {topCampaign.title}
          </h2>
          <p className="text-sm text-stone-500">
            Seasonal spotlight — traditional recipes for this celebration
          </p>
        </div>
        <Link
          href={`/calendar/${topCampaign.event_slug}`}
          className="ml-auto text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline"
        >
          Learn more →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(recipes as Recipe[]).map((recipe) => (
          <Link
            key={recipe.slug}
            href={`/recipe/${recipe.slug}`}
            className="group block overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-amber-300 hover:shadow-md"
          >
            {recipe.image_url && (
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-3">
              <h3 className="text-sm font-medium text-stone-900 line-clamp-2 group-hover:text-amber-700">
                {recipe.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
