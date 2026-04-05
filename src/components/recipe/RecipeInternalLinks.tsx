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

export async function RecipeInternalLinks({ recipe }: { recipe: Recipe }) {
  // Build a small, guaranteed-real set of internal links.
  // IMPORTANT: We only link to recipes we actually found in the DB.

  const picks: { slug: string; title: string }[] = [];

  // Heuristic: for kebabs, try to link to a chelo (rice) page.
  if ((recipe.category_slug || recipe.category.toLowerCase()) === 'kebab') {
    const chelo = await findByTitleKeyword('Chelo', 2);
    for (const r of chelo) picks.push({ slug: r.slug, title: r.title });
  }

  // Heuristic: for Persian snacks/appetizers, try to link to other Persian items.
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
