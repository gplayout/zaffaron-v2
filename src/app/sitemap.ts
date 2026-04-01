import { supabaseServer } from "@/lib/supabase-server";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: recipes } = await supabaseServer
    .from("recipes_v2")
    .select("slug, updated_at, cuisine_slug, category_slug")
    .eq("published", true);

  const now = new Date().toISOString();
  const lastMod = recipes?.[0]?.updated_at || now;

  const recipeUrls = (recipes || []).map((r) => ({
    url: `https://zaffaron.com/recipe/${r.slug}`,
    lastModified: r.updated_at,
    changeFrequency: "weekly" as const,
  }));

  // Unique cuisine and category slugs
  const cuisines = [...new Set((recipes || []).map((r) => r.cuisine_slug).filter(Boolean))];
  const categories = [...new Set((recipes || []).map((r) => r.category_slug).filter(Boolean))];

  const cuisineUrls = cuisines.map((slug) => ({
    url: `https://zaffaron.com/cuisine/${slug}`,
    lastModified: lastMod,
    changeFrequency: "weekly" as const,
  }));

  const categoryUrls = categories.map((slug) => ({
    url: `https://zaffaron.com/category/${slug}`,
    lastModified: lastMod,
    changeFrequency: "weekly" as const,
  }));

  return [
    { url: "https://zaffaron.com", lastModified: lastMod, changeFrequency: "daily" as const },
    { url: "https://zaffaron.com/recipes", lastModified: lastMod, changeFrequency: "weekly" as const },
    { url: "https://zaffaron.com/about", lastModified: now, changeFrequency: "monthly" as const },
    { url: "https://zaffaron.com/contact", lastModified: now, changeFrequency: "monthly" as const },
    { url: "https://zaffaron.com/editorial-policy", lastModified: now, changeFrequency: "monthly" as const },
    { url: "https://zaffaron.com/privacy", lastModified: now, changeFrequency: "monthly" as const },
    { url: "https://zaffaron.com/terms", lastModified: now, changeFrequency: "monthly" as const },
    ...cuisineUrls,
    ...categoryUrls,
    ...recipeUrls,
  ];
}
