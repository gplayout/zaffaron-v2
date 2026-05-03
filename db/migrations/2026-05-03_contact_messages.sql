-- 2026-05-03_contact_messages.sql
-- Fixes C-1 from forensic audit 2026-05-03: contact form silently
-- broken because contact_messages table did not exist.

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK (
    email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(email) BETWEEN 5 AND 200
  ),
  subject TEXT NOT NULL DEFAULT 'General Inquiry'
    CHECK (char_length(subject) BETWEEN 1 AND 200),
  message TEXT NOT NULL CHECK (
    char_length(trim(message)) BETWEEN 1 AND 5000
  ),
  ip_address TEXT,
  user_agent TEXT,
  handled BOOLEAN NOT NULL DEFAULT false,
  handled_at TIMESTAMPTZ,
  handled_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anon INSERT (form submissions from public /contact page)
CREATE POLICY "anon_insert_contact" ON public.contact_messages
  FOR INSERT TO anon WITH CHECK (true);

-- No SELECT policy = default deny for anon/authenticated
-- Service role bypasses RLS by Supabase default

-- Indexes
CREATE INDEX idx_contact_messages_created_at
  ON public.contact_messages (created_at DESC);
CREATE INDEX idx_contact_messages_handled
  ON public.contact_messages (handled) WHERE handled = false;

-- Comment for documentation
COMMENT ON TABLE public.contact_messages IS
  'Contact form submissions from /contact page. Anon-INSERT allowed via RLS. Service-role-only read. Created 2026-05-03 to fix C-1 from forensic audit.';
