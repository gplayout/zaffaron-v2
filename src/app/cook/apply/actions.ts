'use server';

import { createServerSupabase } from '@/lib/supabase-server-auth';

export interface CookApplicationData {
  name: string;
  phone: string;
  city: string;
  specialties: string[];
  yearsOfExperience: string;
  bio: string;
  kitchenType: string;
  availability: string;
}

export async function submitCookApplication(
  data: CookApplicationData
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createServerSupabase();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { ok: false, error: 'auth' };
    }

    // Insert into cook_applications table
    const { error: insertError } = await supabase
      .from('cook_applications')
      .insert({
        user_id: user.id,
        name: data.name,
        phone: data.phone,
        city: data.city,
        specialties: data.specialties,
        years_experience: data.yearsOfExperience,
        bio: data.bio,
        kitchen_type: data.kitchenType,
        availability: data.availability,
      });

    if (insertError) {
      console.error('Failed to submit cook application:', insertError);
      return { ok: false, error: insertError.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('Unexpected error submitting cook application:', error);
    return { ok: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
