import { supabaseServer } from "@/lib/supabase-server";
import type { Recipe, RecipeSummary } from "@/types";

const CARD_FIELDS = `id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at`;

/**
 * Get the latest published recipes
 */
export async function getLatestRecipes(limit: number): Promise<RecipeSummary[]> {
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

  return (data as RecipeSummary[]) || [];
}

/**
 * Get popular/editor's pick recipes (oldest first for variety)
 */
export async function getPopularRecipes(limit: number): Promise<RecipeSummary[]> {
  // Pick a diverse set: one from each major cuisine, ordered by most recently updated
  // Single query + client-side grouping (avoids N+1)
  const cuisines = ['persian', 'turkish', 'lebanese', 'indian', 'moroccan', 'greek', 'afghan', 'azerbaijani'];

  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .in("cuisine_slug", cuisines)
    .order("updated_at", { ascending: false })
    .limit(cuisines.length * 3);

  if (error || !data) return [];

  // Group by cuisine, then round-robin pick
  const byCuisine = new Map<string, RecipeSummary[]>();
  for (const r of data as RecipeSummary[]) {
    const arr = byCuisine.get(r.cuisine_slug!) || [];
    arr.push(r);
    byCuisine.set(r.cuisine_slug!, arr);
  }

  const picks: RecipeSummary[] = [];
  for (let round = 0; picks.length < limit; round++) {
    let added = false;
    for (const slug of cuisines) {
      const recipes = byCuisine.get(slug) || [];
      if (round < recipes.length && picks.length < limit) {
        picks.push(recipes[round]);
        added = true;
      }
    }
    if (!added) break;
  }

  return picks;
}

/**
 * Get featured recipes per cuisine (for homepage showcase)
 * Single query + group in memory (fixes N+1)
 */
export async function getFeaturedByCuisine(
  cuisineSlugs: string[],
  perCuisine: number = 3
): Promise<Record<string, RecipeSummary[]>> {
  if (cuisineSlugs.length === 0) return {};

  // Single query: fetch top recipes across all requested cuisines
  // Over-fetch to ensure we get enough per cuisine after grouping
  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .in("cuisine_slug", cuisineSlugs)
    .order("published_at", { ascending: false })
    .limit(cuisineSlugs.length * perCuisine * 2);

  if (error) {
    console.error("Failed to fetch featured recipes:", error);
    return {};
  }

  // Group by cuisine_slug and take top perCuisine from each
  const result: Record<string, RecipeSummary[]> = {};
  for (const slug of cuisineSlugs) {
    result[slug] = [];
  }
  for (const row of (data || []) as RecipeSummary[]) {
    const slug = row.cuisine_slug;
    if (slug && result[slug] && result[slug].length < perCuisine) {
      result[slug].push(row);
    }
  }
  return result;
}

/**
 * Get recipes by category with pagination
 */
export async function getRecipesByCategory(
  slug: string,
  page: number,
  pageSize: number
): Promise<{ recipes: RecipeSummary[]; count: number }> {
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

  return { recipes: (data as RecipeSummary[]) || [], count: count || 0 };
}

/**
 * Get recipes by cuisine with pagination
 */
export async function getRecipesByCuisine(
  slug: string,
  page: number,
  pageSize: number
): Promise<{ recipes: RecipeSummary[]; count: number }> {
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

  return { recipes: (data as RecipeSummary[]) || [], count: count || 0 };
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
export async function searchRecipes(query: string, limit: number): Promise<RecipeSummary[]> {
  // Sanitize input: strip PostgREST-meaningful chars + colons
  const clean = query.replace(/[%_\\(),."':;]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);
  if (!clean || clean.length < 2) return [];

  // Try FTS first (ranked, fast, uses GIN index)
  const { data: ftsData, error: ftsError } = await supabaseServer
    .rpc("search_recipes_fts", { search_query: clean, result_limit: limit });

  if (!ftsError && ftsData && ftsData.length > 0) {
    return ftsData as RecipeSummary[];
  }

  // Fallback to ilike for partial matches (single words, typos)
  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .or(
      `title.ilike.%${clean}%,description.ilike.%${clean}%,cuisine_slug.ilike.%${clean}%,category_slug.ilike.%${clean}%`
    )
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return (data as RecipeSummary[]) || [];
}

/**
 * Get paginated recipes (for /recipes page)
 */
export async function getRecipes(
  page: number,
  pageSize: number
): Promise<{ recipes: RecipeSummary[]; count: number }> {
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

  return { recipes: (data as RecipeSummary[]) || [], count: count || 0 };
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
