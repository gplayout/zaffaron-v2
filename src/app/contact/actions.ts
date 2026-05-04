'use server';

import { createServerSupabase } from '@/lib/supabase-server-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export type ContactState = { ok: boolean | null; error?: string };

export async function submitContactForm(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot check — bots fill this hidden field
  const honeypot = String(formData.get('website') || '').trim();
  if (honeypot) {
    // Silently accept to not tip off the bot
    return { ok: true };
  }

  // Rate limit (distributed, works on serverless)
  const ip = await getClientIp();
  const rl = await checkRateLimit(`contact:${ip}`, 5, 3600_000);
  if (!rl.allowed) {
    return { ok: false, error: 'Too many messages. Please try again later.' };
  }

  const name = String(formData.get('name') || '').trim().slice(0, 100);
  const email = String(formData.get('email') || '').trim().slice(0, 200);
  const subject = String(formData.get('subject') || 'General Inquiry').trim().slice(0, 200);
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
