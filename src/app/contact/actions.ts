'use server';

import { createServerSupabase } from '@/lib/supabase-server-auth';
import { headers } from 'next/headers';

// Simple in-memory rate limiter (defense-in-depth; Supabase RLS is primary)
const contactRateMap = new Map<string, { count: number; resetAt: number }>();
const MAX_CONTACT_PER_HOUR = 5;

function checkContactRate(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    contactRateMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= MAX_CONTACT_PER_HOUR) return false;
  entry.count++;
  return true;
}

export async function submitContactForm(formData: FormData) {
  // Honeypot check — bots fill this hidden field
  const honeypot = String(formData.get('website') || '').trim();
  if (honeypot) {
    // Silently accept to not tip off the bot
    return { ok: true };
  }

  // Rate limit
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkContactRate(ip)) {
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
