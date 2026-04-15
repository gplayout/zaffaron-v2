import { SITE_URL } from '@/lib/config';
import { supabaseServer } from "@/lib/supabase-server";
import { getAllIngredientSlugs } from "@/lib/ingredients";
import recipeRedirects from "@/lib/seo/recipe-redirects.json";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch ALL recipes (Supabase default limit is 1000, so paginate)
  let allRecipes: Array<{ slug: string; updated_at: string; cuisine_slug: string; category_slug: string }> = [];
  let page = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data } = await supabaseServer
      .from("recipes_v2")
      .select("slug, updated_at, cuisine_slug, category_slug")
      .eq("published", true)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    allRecipes = allRecipes.concat(data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }
  const recipes = allRecipes;

  const now = new Date().toISOString();
  const lastMod = recipes?.reduce((max, r) => r.updated_at > max ? r.updated_at : max, recipes[0]?.updated_at || now) || now;

  // Exclude slugs that redirect to a canonical (they should not be in sitemap).
  const redirectedSlugs = new Set(Object.keys(recipeRedirects as Record<string, string>));

  const recipeUrls = (recipes || [])
    .filter((r) => !redirectedSlugs.has(r.slug))
    .map((r) => ({
      url: `${SITE_URL}/recipe/${r.slug}`,
      lastModified: r.updated_at,
      changeFrequency: "weekly" as const,
    }));

  // Unique cuisine and category slugs
  const cuisines = [...new Set((recipes || []).map((r) => r.cuisine_slug).filter(Boolean))];
  const categories = [...new Set((recipes || []).map((r) => r.category_slug).filter(Boolean))];

  const cuisineUrls = cuisines.map((slug) => ({
    url: `${SITE_URL}/cuisine/${slug}`,
    lastModified: lastMod,
    changeFrequency: "weekly" as const,
  }));

  const categoryUrls = categories.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: lastMod,
    changeFrequency: "weekly" as const,
  }));

  // Fetch calendar events for sitemap
  const { data: calendarEvents } = await supabaseServer
    .from("calendar_events")
    .select("slug")
    .eq("published", true);

  const calendarUrls = (calendarEvents || []).map((ev) => ({
    url: `${SITE_URL}/calendar/${ev.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
  }));

  // Fetch blog posts for sitemap
  const { data: blogPosts } = await supabaseServer
    .from("blog_posts")
    .select("slug, published_at, updated_at")
    .eq("published", true);

  const blogUrls = (blogPosts || []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at || now,
    changeFrequency: "monthly" as const,
  }));

  return [
    { url: SITE_URL, lastModified: lastMod, changeFrequency: "daily" as const },
    { url: `${SITE_URL}/recipes`, lastModified: lastMod, changeFrequency: "weekly" as const },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/editorial-policy`, lastModified: now, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "monthly" as const },
    // Calendar
    { url: `${SITE_URL}/calendar`, lastModified: now, changeFrequency: "weekly" as const },
    ...calendarUrls,
    // Blog
    ...(blogUrls.length > 0 ? [{ url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly" as const }] : []),
    ...blogUrls,
    // Auth pages excluded from sitemap (no SEO value)
    ...cuisineUrls,
    ...categoryUrls,
    ...recipeUrls,
    // Ingredient encyclopedia
    { url: `${SITE_URL}/ingredients`, lastModified: now, changeFrequency: "weekly" as const },
    ...getAllIngredientSlugs().map((slug) => ({
      url: `${SITE_URL}/ingredients/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
    })),
  ];
}
