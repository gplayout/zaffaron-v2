'use server';

import { createServerSupabase } from '@/lib/supabase-server-auth';

export async function getIsFavorited(
  recipeId: string
): Promise<{ ok: true; isFavorited: boolean } | { ok: false; error: string }> {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: 'auth' };
    }

    const { data, error } = await supabase
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to check favorite status:', error);
      return { ok: false, error: 'Failed to check favorite status.' };
    }

    return { ok: true, isFavorited: !!data };
  } catch (error) {
    console.error('Unexpected error checking favorite status:', error);
    return { ok: false, error: 'An unexpected error occurred.' };
  }
}

export async function toggleFavorite(
  recipeId: string
): Promise<{ ok: true; isFavorited: boolean } | { ok: false; error: string }> {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: 'auth' };
    }

    const { data: existing, error: checkError } = await supabase
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Failed to check favorite status:', checkError);
      return { ok: false, error: 'Something went wrong. Please try again.' };
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from('recipe_favorites')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Failed to remove favorite:', deleteError);
        return { ok: false, error: 'Failed to update favorite. Please try again.' };
      }

      return { ok: true, isFavorited: false };
    } else {
      const { error: upsertError } = await supabase
        .from('recipe_favorites')
        .upsert(
          {
            recipe_id: recipeId,
            user_id: user.id,
          },
          {
            onConflict: 'recipe_id,user_id',
          }
        );

      if (upsertError) {
        console.error('Failed to add favorite:', upsertError);
        return { ok: false, error: 'Failed to update favorite. Please try again.' };
      }

      return { ok: true, isFavorited: true };
    }
  } catch (error) {
    console.error('Unexpected error toggling favorite:', error);
    return { ok: false, error: 'An unexpected error occurred.' };
  }
}
