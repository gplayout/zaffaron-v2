'use server';

import { createServerSupabase } from '@/lib/supabase-server-auth';
import { supabaseServer } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

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
  author_name: string | null;
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
      .select('id, rating, body, author_name, created_at')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch reviews:', error);
      return { ok: false, error: 'Failed to load reviews. Please try again.' };
    }

    const reviews: Review[] = (data as ReviewRow[] || []).map((item) => ({
      id: item.id,
      rating: item.rating,
      text: item.body || "",
      authorName: item.author_name || 'Anonymous',
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
  body: string,
  slug?: string
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

    if (body.trim().length > 2000) {
      return { ok: false, error: 'Review is too long (max 2000 characters)' };
    }

    if (body.trim().length < 10) {
      return { ok: false, error: 'Review is too short (min 10 characters)' };
    }

    // Simple rate limit: check if user submitted a review in the last 60 seconds
    const { data: recent } = await supabase
      .from('recipe_reviews')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    if (recent?.[0]) {
      const lastReview = new Date(recent[0].created_at).getTime();
      if (Date.now() - lastReview < 60000) {
        return { ok: false, error: 'Please wait a minute before submitting another review' };
      }
    }

    // Get user's display name from metadata
    const authorName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Anonymous';

    const { data, error } = await supabase
      .from('recipe_reviews')
      .upsert(
        {
          recipe_id: recipeId,
          user_id: user.id,
          rating,
          body: body.trim(),
          author_name: authorName,
        },
        {
          onConflict: 'recipe_id,user_id',
        }
      )
      .select('id, rating, body, author_name, created_at')
      .single();

    if (error) {
      console.error('Failed to submit review:', error);
      return { ok: false, error: 'Failed to submit review. Please try again.' };
    }

    const row = data as ReviewRow;
    const review: Review = {
      id: row.id,
      rating: row.rating,
      text: row.body || "",
      authorName: row.author_name || authorName,
      createdAt: row.created_at,
    };

    // Invalidate cache so the review appears immediately
    revalidatePath(`/recipe/${slug || recipeId}`);

    return { ok: true, review };
  } catch (error) {
    console.error('Unexpected error submitting review:', error);
    return { ok: false, error: 'An unexpected error occurred.' };
  }
}
