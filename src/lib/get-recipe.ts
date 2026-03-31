import { cache } from 'react';
import { supabaseServer } from './supabase-server';
import type { Recipe } from '@/types';

// Shared cached fetch — deduplicates generateMetadata + page render calls
export const getRecipeBySlug = cache(async (slug: string): Promise<Recipe | null> => {
  const { data, error } = await supabaseServer
    .from('recipes_v2')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error || !data) return null;
  return data as Recipe;
});
