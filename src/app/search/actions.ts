'use server'

import { supabaseServer } from '@/lib/supabase-server'
import type { Recipe } from '@/types'

const CARD_FIELDS = "id,slug,title,description,image_url,image_alt,prep_time_minutes,cook_time_minutes,servings,difficulty,category,category_slug,cuisine,cuisine_slug,calories_per_serving,published_at"

export async function searchRecipes(query: string): Promise<Recipe[]> {
  // Sanitize
  const clean = query.replace(/[%_\\(),."']/g, '').trim().slice(0, 100)
  if (!clean) return []

  // Use textSearch if FTS index exists, otherwise fall back to ilike with server-side safety
  const { data, error } = await supabaseServer
    .from('recipes_v2')
    .select(CARD_FIELDS)
    .eq('published', true)
    .or(`title.ilike.%${clean}%,description.ilike.%${clean}%,cuisine.ilike.%${clean}%,category.ilike.%${clean}%`)
    .order('published_at', { ascending: false })
    .limit(24)

  if (error) {
    console.error('Search error:', error)
    return []
  }
  return (data as Recipe[]) || []
}
