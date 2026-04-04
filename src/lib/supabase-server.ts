import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use anon key for server-side reads — RLS enforces published-only access
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
