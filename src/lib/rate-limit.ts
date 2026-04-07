/**
 * Distributed rate limiter using Supabase.
 * Works correctly on Vercel serverless (no in-memory state).
 * Uses x-real-ip (trusted) instead of spoofable x-forwarded-for.
 */

import { supabaseServer } from '@/lib/supabase-server';
import { headers } from 'next/headers';

/**
 * Get the client's IP address from trusted headers.
 * Prefers x-real-ip (set by Vercel/reverse proxy), falls back to last hop of x-forwarded-for.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get('x-real-ip') ??
    h.get('x-forwarded-for')?.split(',').pop()?.trim() ??
    'unknown'
  );
}

/**
 * Check and increment rate limit.
 * Uses a simple Supabase table for distributed counting.
 * 
 * @param key - Unique key (e.g. "contact:{ip}" or "tahdig:{ip}")
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, waitMinutes?: number }
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; waitMinutes?: number }> {
  const now = Date.now();
  const windowStart = new Date(now - windowMs).toISOString();

  try {
    // Count recent requests in window
    const { count, error: countError } = await supabaseServer
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart);

    if (countError) {
      console.error('Rate limit check failed:', countError.message);
      // Fail open — allow request but log the error
      return { allowed: true, remaining: maxRequests };
    }

    const currentCount = count ?? 0;

    if (currentCount >= maxRequests) {
      // Find when the oldest entry in window expires
      const { data: oldest } = await supabaseServer
        .from('rate_limits')
        .select('created_at')
        .eq('key', key)
        .gte('created_at', windowStart)
        .order('created_at', { ascending: true })
        .limit(1);

      const oldestTime = oldest?.[0]?.created_at
        ? new Date(oldest[0].created_at).getTime()
        : now;
      const waitMs = (oldestTime + windowMs) - now;

      return {
        allowed: false,
        remaining: 0,
        waitMinutes: Math.max(1, Math.ceil(waitMs / 60000)),
      };
    }

    // Record this request
    const { error: insertError } = await supabaseServer
      .from('rate_limits')
      .insert({ key, created_at: new Date(now).toISOString() });

    if (insertError) {
      console.error('Rate limit insert failed:', insertError.message);
      // Fail open
      return { allowed: true, remaining: maxRequests - currentCount };
    }

    return { allowed: true, remaining: maxRequests - currentCount - 1 };
  } catch (e) {
    console.error('Rate limit exception:', e);
    // Fail open
    return { allowed: true, remaining: maxRequests };
  }
}
