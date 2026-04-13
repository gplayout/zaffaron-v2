-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'website', -- website, footer, popup, etc.
  ip_address TEXT,
  active BOOLEAN DEFAULT true
);

-- RLS: only service role can read all, anon can insert
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Service role reads all" ON newsletter_subscribers
  FOR SELECT TO service_role USING (true);

-- Rate limit: max 5 subscriptions per IP per hour (handled in app, not DB)
-- Index for fast lookup
CREATE INDEX idx_newsletter_email ON newsletter_subscribers (email);
CREATE INDEX idx_newsletter_active ON newsletter_subscribers (active) WHERE active = true;
