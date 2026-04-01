'use server';

import { createServerSupabase } from '@/lib/supabase-server-auth';
import { supabaseServer } from '@/lib/supabase-server';

export interface Review {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  createdAt: string;
}

interface ReviewRow {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
}

export async function getRecipeReviews(
  recipeId: string
): Promise<{ ok: true; reviews: Review[] } | { ok: false; error: string }> {
  try {
    if (!recipeId) {
      return { ok: true, reviews: [] };
    }
    const { data, error } = await supabaseServer
      .from('recipe_reviews')
      .select('id, rating, body, created_at, user_id')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch reviews:', error);
      return { ok: false, error: error.message };
    }

    const reviews: Review[] = (data as ReviewRow[] || []).map((item) => ({
      id: item.id,
      rating: item.rating,
      text: item.body || "",
      authorName: 'Anonymous',
      createdAt: item.created_at,
    }));

    return { ok: true, reviews };
  } catch (error) {
    console.error('Unexpected error fetching reviews:', error);
    return { ok: false, error: 'An unexpected error occurred.' };
  }
}

export async function submitRecipeReview(
  recipeId: string,
  rating: number,
  body: string
): Promise<{ ok: true; review: Review } | { ok: false; error: string }> {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: 'auth' };
    }

    if (rating < 1 || rating > 5) {
      return { ok: false, error: 'Rating must be between 1 and 5' };
    }

    if (!body.trim()) {
      return { ok: false, error: 'Review text is required' };
    }

    const { data, error } = await supabase
      .from('recipe_reviews')
      .upsert(
        {
          recipe_id: recipeId,
          user_id: user.id,
          rating,
          body: body.trim(),
        },
        {
          onConflict: 'recipe_id,user_id',
        }
      )
      .select('id, rating, body, created_at, user_id')
      .single();

    if (error) {
      console.error('Failed to submit review:', error);
      return { ok: false, error: error.message };
    }

    const row = data as ReviewRow;
    const review: Review = {
      id: row.id,
      rating: row.rating,
      text: row.body || "",
      authorName: 'Anonymous',
      createdAt: row.created_at,
    };

    return { ok: true, review };
  } catch (error) {
    console.error('Unexpected error submitting review:', error);
    return { ok: false, error: 'An unexpected error occurred.' };
  }
}
