import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import type { Recipe } from '@/types';

async function findByTitleKeyword(keyword: string, limit = 1) {
  const { data } = await supabaseServer
    .from('recipes_v2')
    .select('slug,title,cuisine_slug,category_slug')
    .eq('published', true)
    .ilike('title', `%${keyword}%`)
    .order('published_at', { ascending: false })
    .limit(limit);
  return data || [];
}

async function findSameCuisine(recipe: Recipe, limit = 4) {
  const cuisineSlug = recipe.cuisine_slug || recipe.cuisine.toLowerCase();
  const { data } = await supabaseServer
    .from('recipes_v2')
    .select('slug,title')
    .eq('published', true)
    .eq('cuisine_slug', cuisineSlug)
    .neq('slug', recipe.slug)
    .order('published_at', { ascending: false })
    .limit(limit);
  return data || [];
}

const CURATED_LINKS_BY_SLUG: Record<string, string[]> = {
  // Keep this list SMALL + high-confidence. Every slug is verified via DB before linking.
  'authentic-persian-kabab-koobideh': [
    'salad-shirazi-persian-cucumber-tomato-salad',
    'persian-chelo-fluffy-steamed-rice',
    'chelow-e-sadeh-persian-steamed-rice',
    'chelow-saffron-tahdig-persian-steamed-rice',
  ],
  'chelo-goosht-semnani': [
    'chelow-e-sadeh-persian-steamed-rice',
    'chelow-saffron-tahdig-persian-steamed-rice',
    'tahchin-e-goosht-saffron-rice-cake',
  ],
  'samboseh-sabzi-persian-herb-samosas': [
    'salad-shirazi-persian-cucumber-tomato-salad',
    'fattoush-lebanese-toasted-pita-salad-with-sumac-dressing',
  ],
  'esnak-holandi-chicken-toast-sandwich': [
    'khorak-e-chips-o-panir',
    'persian-pizza-chips-bake',
    'saffron-chicken-mozzarella-toastie',
    'sandwich-kaseei-morgh',
  ],
  'fondou-ye-gojeh-farangi': [
    'omlet-e-gojeh-persian-tomato-omelet',
    'persian-tomato-feta-omelette',
    'omelet-e-reyhan-basil-tomato-omelette',
    'taktouka-moroccan-cooked-tomato-and-roasted-pepper-salad',
  ],
};

async function fetchSlugs(slugs: string[]) {
  if (!slugs || slugs.length === 0) return [];
  const { data } = await supabaseServer
    .from('recipes_v2')
    .select('slug,title')
    .eq('published', true)
    .in('slug', slugs);

  const map = new Map((data || []).map((r) => [r.slug, r]));
  return slugs.map((s) => map.get(s)).filter(Boolean) as { slug: string; title: string }[];
}

export async function RecipeInternalLinks({ recipe }: { recipe: Recipe }) {
  // Build a small, guaranteed-real set of internal links.
  // IMPORTANT: We only link to recipes we actually found in the DB.

  const picks: { slug: string; title: string }[] = [];

  // 1) Curated links for high-priority pages (verified via DB)
  const curated = CURATED_LINKS_BY_SLUG[recipe.slug];
  if (curated && curated.length > 0) {
    const found = await fetchSlugs(curated);
    for (const r of found) picks.push({ slug: r.slug, title: r.title });
  }

  // 2) Heuristics (fallback)
  if ((recipe.category_slug || recipe.category.toLowerCase()) === 'kebab') {
    const chelo = await findByTitleKeyword('Chelo', 2);
    for (const r of chelo) picks.push({ slug: r.slug, title: r.title });
  }

  const sameCuisine = await findSameCuisine(recipe, 4);
  for (const r of sameCuisine) picks.push({ slug: r.slug, title: r.title });

  // De-dupe + cap
  const uniq = new Map<string, { slug: string; title: string }>();
  for (const p of picks) {
    if (!p.slug || p.slug === recipe.slug) continue;
    if (!uniq.has(p.slug)) uniq.set(p.slug, p);
  }
  const final = [...uniq.values()].slice(0, 5);

  if (final.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-stone-900">Pairs well with</h2>
      <p className="mt-2 text-sm text-stone-600">
        If you enjoyed this recipe, here are a few related Zaffaron recipes to try next.
      </p>
      <ul className="mt-4 space-y-2">
        {final.map((r) => (
          <li key={r.slug}>
            <Link href={`/recipe/${r.slug}`} className="text-sm font-medium text-amber-700 hover:text-amber-800">
              {r.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
