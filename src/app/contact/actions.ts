'use server';

import { createServerSupabase } from '@/lib/supabase-server-auth';

export async function submitContactForm(formData: FormData) {
  const name = String(formData.get('name') || '').trim().slice(0, 100);
  const email = String(formData.get('email') || '').trim().slice(0, 200);
  const subject = String(formData.get('subject') || '').trim().slice(0, 200);
  const message = String(formData.get('message') || '').trim().slice(0, 5000);

  if (!name || !email || !message) {
    return { ok: false, error: 'Please fill in all required fields.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from('contact_messages').insert({
      name, email, subject, message,
    });
    if (error) {
      console.error('Contact form error:', error.message);
      return { ok: false, error: 'Failed to send message. Please try again.' };
    }
    return { ok: true };
  } catch (e) {
    console.error('Contact form exception:', e);
    return { ok: false, error: 'An unexpected error occurred.' };
  }
}
