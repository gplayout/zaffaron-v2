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

    // Server-side validation
    const name = String(data.name || '').trim();
    const phone = String(data.phone || '').trim();
    const city = String(data.city || '').trim();
    const bio = String(data.bio || '').trim();
    const kitchenType = String(data.kitchenType || '').trim();
    const availability = String(data.availability || '').trim();
    const specialties = Array.isArray(data.specialties) ? data.specialties.map(s => String(s).trim()).filter(Boolean).slice(0, 10) : [];
    const validYearsRanges = ['0-1', '1-3', '3-5', '5-10', '10+'];
    const yearsExp = validYearsRanges.includes(data.yearsOfExperience) ? data.yearsOfExperience : '0-1';

    if (name.length < 2 || name.length > 100) return { ok: false, error: 'Name must be 2-100 characters.' };
    if (phone.length < 5 || phone.length > 30) return { ok: false, error: 'Invalid phone number.' };
    if (city.length < 2 || city.length > 100) return { ok: false, error: 'Invalid city.' };
    if (bio.length < 50 || bio.length > 2000) return { ok: false, error: 'Bio must be 50-2000 characters.' };
    if (specialties.length < 1) return { ok: false, error: 'Select at least one specialty.' };
    const validKitchenTypes = ['home_kitchen', 'commercial_kitchen', 'catering', 'food_truck', 'other'];
    if (!validKitchenTypes.includes(kitchenType)) return { ok: false, error: 'Invalid kitchen type.' };

    // Check for existing application
    const { data: existing } = await supabase.from('cook_applications').select('id').eq('user_id', user.id).limit(1);
    if (existing && existing.length > 0) return { ok: false, error: 'You have already submitted an application.' };

    // Insert into cook_applications table
    const { error: insertError } = await supabase
      .from('cook_applications')
      .insert({
        user_id: user.id,
        name,
        phone,
        city,
        specialties,
        years_experience: yearsExp,
        bio,
        kitchen_type: kitchenType,
        availability,
      });

    if (insertError) {
      console.error('Failed to submit cook application:', insertError);
      console.error('Cook application insert error:', insertError.message);
      return { ok: false, error: 'Failed to submit application. Please try again.' };
    }

    return { ok: true };
  } catch (error) {
    console.error('Unexpected error submitting cook application:', error);
    return { ok: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
