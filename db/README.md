# Zaffaron DB

## Marketplace migrations
- `db/migrations/2026-04-01_marketplace.sql`

### Apply (Supabase SQL Editor)
1. Open Supabase → SQL Editor
2. Paste migration SQL
3. Run inside a transaction (already wrapped in begin/commit)

### After applying
- Enable Google OAuth provider in Supabase Auth settings
- Add redirect URLs:
  - `https://zaffaron.com/auth/callback`
  - `http://localhost:3000/auth/callback`

### Notes
- RLS policies are included.
- This schema uses `auth.users`.
