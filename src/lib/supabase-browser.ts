import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Prefer new-format publishable key; fallback to legacy anon during migration
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publishableKey
  )
}
