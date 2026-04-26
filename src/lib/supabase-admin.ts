/**
 * supabase-admin.ts — Server-only service-role Supabase client.
 *
 * Use ONLY for privileged operations that bypass RLS (e.g., admin-equivalent
 * mutations after independent authentication via a signed token).
 *
 * NEVER import this in client components or use as a fallback for auth-context
 * RLS reads. For user-context reads/writes, use createServerSupabase() from
 * supabase-server-auth.ts. For published-only public reads, use supabaseServer
 * (anon key) from supabase-server.ts.
 *
 * Lazy-init pattern: errors on first call (not module load) so Next.js builds
 * succeed in environments that don't have SUPABASE_SERVICE_ROLE_KEY set.
 */

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("supabase-admin: NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!key) {
    throw new Error(
      "supabase-admin: SUPABASE_SERVICE_ROLE_KEY is not set — admin operations unavailable"
    );
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-zaffaron-context": "admin-server",
      },
    },
  });

  return _client;
}
