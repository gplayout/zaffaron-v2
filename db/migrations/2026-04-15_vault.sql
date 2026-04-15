-- Family Recipe Vault — Core Schema
-- Date: 2026-04-15
-- Source: 4-model strategy (GPT 5.4 + Gemini + Kimi + Opus)

-- Core vault recipes
CREATE TABLE IF NOT EXISTS vault_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users NOT NULL,
  family_id UUID REFERENCES vault_families(id),
  title TEXT NOT NULL,
  structured_data JSONB NOT NULL DEFAULT '{}',
  source_type TEXT CHECK (source_type IN ('voice', 'photo', 'text', 'fork')) DEFAULT 'text',
  original_media_url TEXT,
  raw_transcript TEXT,
  attribution_name TEXT,
  attribution_story TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'family', 'public')),
  share_slug TEXT UNIQUE,
  ai_confidence FLOAT,
  is_verified BOOLEAN DEFAULT FALSE,
  cuisine TEXT,
  language TEXT DEFAULT 'en',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families (Phase 2, schema ready now)
CREATE TABLE IF NOT EXISTS vault_families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_by UUID REFERENCES auth.users,
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault_family_members (
  family_id UUID REFERENCES vault_families ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (family_id, user_id)
);

-- Version history (safety)
CREATE TABLE IF NOT EXISTS vault_recipe_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES vault_recipes ON DELETE CASCADE,
  content JSONB NOT NULL,
  edited_by UUID REFERENCES auth.users,
  change_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Share tracking (viral analytics)
CREATE TABLE IF NOT EXISTS vault_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES vault_recipes ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users,
  channel TEXT,
  view_count INT DEFAULT 0,
  signup_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI processing tracking
CREATE TABLE IF NOT EXISTS vault_ingestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES vault_recipes ON DELETE CASCADE,
  source_type TEXT,
  raw_input_url TEXT,
  raw_transcript TEXT,
  structured_output JSONB,
  confidence FLOAT,
  model_used TEXT,
  language_detected TEXT,
  processing_time_ms INT,
  cost_usd FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User entitlements (free vs paid)
CREATE TABLE IF NOT EXISTS user_entitlements (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro')),
  ai_credits_remaining INT DEFAULT 5,
  ai_credits_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  recipe_limit INT DEFAULT 10,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE vault_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;

-- Owner can CRUD their own recipes
CREATE POLICY vault_recipes_owner ON vault_recipes
  FOR ALL TO authenticated
  USING (owner_id = auth.uid());

-- Public recipes visible to all
CREATE POLICY vault_recipes_public ON vault_recipes
  FOR SELECT TO authenticated
  USING (visibility = 'public');

-- Family members can view family recipes
CREATE POLICY vault_recipes_family ON vault_recipes
  FOR SELECT TO authenticated
  USING (
    visibility = 'family' AND 
    family_id IN (SELECT family_id FROM vault_family_members WHERE user_id = auth.uid())
  );

-- Family owner manages family
CREATE POLICY vault_families_owner ON vault_families
  FOR ALL TO authenticated
  USING (created_by = auth.uid());

-- Members can view their families
CREATE POLICY vault_families_member ON vault_families
  FOR SELECT TO authenticated
  USING (id IN (SELECT family_id FROM vault_family_members WHERE user_id = auth.uid()));

-- Members see their memberships
CREATE POLICY vault_members_self ON vault_family_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Owner manages versions of their recipes
CREATE POLICY vault_versions_owner ON vault_recipe_versions
  FOR ALL TO authenticated
  USING (recipe_id IN (SELECT id FROM vault_recipes WHERE owner_id = auth.uid()));

-- Owner manages their shares
CREATE POLICY vault_shares_owner ON vault_shares
  FOR ALL TO authenticated
  USING (shared_by = auth.uid());

-- Owner sees their ingestions
CREATE POLICY vault_ingestions_owner ON vault_ingestions
  FOR ALL TO authenticated
  USING (recipe_id IN (SELECT id FROM vault_recipes WHERE owner_id = auth.uid()));

-- User sees own entitlements
CREATE POLICY entitlements_self ON user_entitlements
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vault_recipes_owner ON vault_recipes(owner_id);
CREATE INDEX IF NOT EXISTS idx_vault_recipes_family ON vault_recipes(family_id);
CREATE INDEX IF NOT EXISTS idx_vault_recipes_visibility ON vault_recipes(visibility);
CREATE INDEX IF NOT EXISTS idx_vault_recipes_share_slug ON vault_recipes(share_slug);
CREATE INDEX IF NOT EXISTS idx_vault_family_members_user ON vault_family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_versions_recipe ON vault_recipe_versions(recipe_id);
