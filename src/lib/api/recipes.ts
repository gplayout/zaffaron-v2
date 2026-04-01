import { supabaseServer } from "@/lib/supabase-server";
import type { Recipe } from "@/types";

const CARD_FIELDS = `id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at`;

/**
 * Get the latest published recipes
 */
export async function getLatestRecipes(limit: number): Promise<Recipe[]> {
  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch latest recipes:", error);
    throw new Error("Failed to load recipes. Please try again later.");
  }

  return (data as Recipe[]) || [];
}

/**
 * Get popular/editor's pick recipes (oldest first for variety)
 */
export async function getPopularRecipes(limit: number): Promise<Recipe[]> {
  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .order("published_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch popular recipes:", error);
    throw new Error("Failed to load recipes. Please try again later.");
  }

  return (data as Recipe[]) || [];
}

/**
 * Get recipes by category with pagination
 */
export async function getRecipesByCategory(
  slug: string,
  page: number,
  pageSize: number
): Promise<{ recipes: Recipe[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS, { count: "exact" })
    .eq("published", true)
    .eq("category_slug", slug)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch recipes by category:", error);
    throw new Error("Failed to load recipes. Please try again later.");
  }

  return { recipes: (data as Recipe[]) || [], count: count || 0 };
}

/**
 * Get recipes by cuisine with pagination
 */
export async function getRecipesByCuisine(
  slug: string,
  page: number,
  pageSize: number
): Promise<{ recipes: Recipe[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS, { count: "exact" })
    .eq("published", true)
    .eq("cuisine_slug", slug)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch recipes by cuisine:", error);
    throw new Error("Failed to load recipes. Please try again later.");
  }

  return { recipes: (data as Recipe[]) || [], count: count || 0 };
}

/**
 * Get total count of published recipes
 */
export async function getRecipeCount(): Promise<number> {
  const { count, error } = await supabaseServer
    .from("recipes_v2")
    .select("id", { count: "exact", head: true })
    .eq("published", true);

  if (error) {
    console.error("Failed to fetch recipe count:", error);
    throw new Error("Failed to load recipe count. Please try again later.");
  }

  return count || 0;
}

/**
 * Search recipes by query string
 */
export async function searchRecipes(query: string, limit: number): Promise<Recipe[]> {
  // Sanitize input
  const clean = query.replace(/[%_\\(),."']/g, "").trim().slice(0, 100);
  if (!clean) return [];

  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .or(
      `title.ilike.%${clean}%,description.ilike.%${clean}%,cuisine.ilike.%${clean}%,category.ilike.%${clean}%`
    )
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return (data as Recipe[]) || [];
}

/**
 * Get paginated recipes (for /recipes page)
 */
export async function getRecipes(
  page: number,
  pageSize: number
): Promise<{ recipes: Recipe[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS, { count: "exact" })
    .eq("published", true)
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to fetch recipes:", error);
    throw new Error("Failed to load recipes. Please try again later.");
  }

  return { recipes: (data as Recipe[]) || [], count: count || 0 };
}

/**
 * Get all category slugs for generateStaticParams
 */
export async function getCategorySlugs(): Promise<string[]> {
  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select("category_slug")
    .eq("published", true);

  if (error) {
    console.error("Failed to fetch category slugs:", error);
    return [];
  }

  return [...new Set((data || []).map((r) => r.category_slug).filter(Boolean))];
}

/**
 * Get all cuisine slugs for generateStaticParams
 */
export async function getCuisineSlugs(): Promise<string[]> {
  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select("cuisine_slug")
    .eq("published", true);

  if (error) {
    console.error("Failed to fetch cuisine slugs:", error);
    return [];
  }

  return [...new Set((data || []).map((r) => r.cuisine_slug).filter(Boolean))];
}

/**
 * Get category recipe count
 */
export async function getCategoryRecipeCount(slug: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from("recipes_v2")
    .select("id", { count: "exact", head: true })
    .eq("published", true)
    .eq("category_slug", slug);

  if (error) {
    console.error("Failed to fetch category recipe count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Get cuisine recipe count
 */
export async function getCuisineRecipeCount(slug: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from("recipes_v2")
    .select("id", { count: "exact", head: true })
    .eq("published", true)
    .eq("cuisine_slug", slug);

  if (error) {
    console.error("Failed to fetch cuisine recipe count:", error);
    return 0;
  }

  return count || 0;
}
