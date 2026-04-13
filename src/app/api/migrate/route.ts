import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  const sql = `
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_markdown TEXT NOT NULL,
  author_name TEXT DEFAULT 'Zaffaron Kitchen',
  featured_image TEXT,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'anon_read_blog_posts') THEN
    CREATE POLICY anon_read_blog_posts ON blog_posts FOR SELECT TO anon USING (published = true);
  END IF;
END $$;
  `;

  // Workaround: Use RPC 'exec_sql' if available, otherwise just error out
  const { data, error } = await supabaseServer.rpc('exec_sql', { sql_query: sql });

  return NextResponse.json({ data, error });
}
