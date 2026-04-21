import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Prefer new-format publishable key; fallback to legacy anon during migration
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use publishable/anon key for server-side reads — RLS enforces published-only access
export const supabaseServer = createClient(supabaseUrl, supabasePublishableKey);
