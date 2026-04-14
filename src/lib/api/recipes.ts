import { supabaseServer } from "@/lib/supabase-server";
import { getSynonyms } from "@/lib/search-synonyms";
import type { Recipe, RecipeSummary } from "@/types";

const CARD_FIELDS = `id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at`;

/**
 * Get the latest published recipes, optionally excluding IDs already shown
 */
export async function getLatestRecipes(limit: number, excludeIds: string[] = []): Promise<RecipeSummary[]> {
  let query = supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .order("published_at", { ascending: false });

  // Over-fetch to compensate for excluded items, then filter client-side
  const fetchLimit = limit + excludeIds.length;
  query = query.limit(fetchLimit);

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch latest recipes:", error);
    throw new Error("Failed to load recipes. Please try again later.");
  }

  const excludeSet = new Set(excludeIds);
  return ((data as RecipeSummary[]) || []).filter(r => !excludeSet.has(r.id)).slice(0, limit);
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
 * Queries each cuisine separately to guarantee perCuisine results regardless of data distribution.
 * 8 parallel queries is fine for SSG with 60s revalidation.
 */
export async function getFeaturedByCuisine(
  cuisineSlugs: string[],
  perCuisine: number = 3,
  excludeIds: string[] = []
): Promise<Record<string, RecipeSummary[]>> {
  if (cuisineSlugs.length === 0) return {};

  const excludeSet = new Set(excludeIds);

  // Parallel query per cuisine — guarantees enough results for each
  const entries = await Promise.all(
    cuisineSlugs.map(async (slug) => {
      // Over-fetch to compensate for excluded items
      const { data, error } = await supabaseServer
        .from("recipes_v2")
        .select(CARD_FIELDS)
        .eq("published", true)
        .eq("cuisine_slug", slug)
        .order("updated_at", { ascending: false })
        .limit(perCuisine + excludeIds.length + 3);

      if (error || !data) return [slug, []] as const;

      const filtered = (data as RecipeSummary[])
        .filter((r) => !excludeSet.has(r.id))
        .slice(0, perCuisine);

      return [slug, filtered] as const;
    })
  );

  return Object.fromEntries(entries);
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

  // Expand synonyms: "kabob" -> also search kabab, kebab, kebob, kabeb
  const words = clean.toLowerCase().split(/\s+/).filter(Boolean);
  const synonymVariants = new Set<string>();
  for (const word of words) {
    for (const syn of getSynonyms(word)) synonymVariants.add(syn);
  }
  const searchTerms = [clean, ...[...synonymVariants].filter((v) => v !== clean.toLowerCase())];

  // Try FTS with original + each synonym variant, merge deduplicated results
  const resultMap = new Map<string, RecipeSummary>();
  for (const term of searchTerms.slice(0, 6)) {
    if (resultMap.size >= limit) break;
    const { data: ftsData } = await supabaseServer
      .rpc("search_recipes_fts", { search_query: term, result_limit: limit });
    if (ftsData) {
      for (const r of ftsData as RecipeSummary[]) {
        if (!resultMap.has(r.id)) resultMap.set(r.id, r);
      }
    }
  }

  if (resultMap.size > 0) {
    return [...resultMap.values()].slice(0, limit);
  }

  // Fallback to ilike — also use synonym variants
  const ilikeTerms = searchTerms.slice(0, 5);
  const orClauses = ilikeTerms
    .flatMap((t) => [`title.ilike.%${t}%`, `description.ilike.%${t}%`])
    .join(",");

  const { data, error } = await supabaseServer
    .from("recipes_v2")
    .select(CARD_FIELDS)
    .eq("published", true)
    .or(orClauses)
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
