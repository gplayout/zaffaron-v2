// fill-featured-campaigns.mjs - auto-fill recipe_slugs for campaigns missing curation
// Uses Gemini to match campaign culture/festival to existing recipes from catalog
// Tier 1 mutation: additive per-campaign UPDATE on recipe_slugs array
//
// Usage: node scripts/fill-featured-campaigns.mjs [--dry-run]

import fs from 'node:fs/promises';
import path from 'node:path';

const envPath = 'C:/Users/Mehdi/.openclaw/workspace/.credentials-master.env';
const envRaw = await fs.readFile(envPath, 'utf8');
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => /^[A-Z_0-9]+=/.test(l))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1).trim()];
    })
);

const DRY_RUN = process.argv.includes('--dry-run');
const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_KEY = env.GOOGLE_AI_KEY_OPENCLAW; // Using OpenClaw key

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_KEY) {
  console.error('Missing required env vars');
  process.exit(1);
}

const sbHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

// Step 1: fetch campaigns with empty recipe_slugs
const campaignsRes = await fetch(
  `${SUPABASE_URL}/rest/v1/featured_campaigns?select=*&published=eq.true`,
  { headers: sbHeaders }
);
const campaigns = await campaignsRes.json();
const needsFill = campaigns.filter(c => !c.recipe_slugs || c.recipe_slugs.length === 0);

console.log(`\n=== Featured Campaigns Auto-Fill ===`);
console.log(`Total campaigns: ${campaigns.length}`);
console.log(`Needing fill:    ${needsFill.length}`);
if (DRY_RUN) console.log(`MODE: DRY RUN\n`);
else console.log(`MODE: LIVE\n`);

// Step 2: fetch all published recipes (slug + title + cuisine + category)
// Use pagination
let allRecipes = [];
let offset = 0;
const pageSize = 1000;
while (true) {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/recipes_v2?select=slug,title,cuisine,category,description&published=eq.true&limit=${pageSize}&offset=${offset}`,
    { headers: sbHeaders }
  );
  const page = await r.json();
  if (!Array.isArray(page) || page.length === 0) break;
  allRecipes = allRecipes.concat(page);
  if (page.length < pageSize) break;
  offset += pageSize;
}
console.log(`Available recipe pool: ${allRecipes.length}\n`);

// Step 3: for each campaign needing fill, ask Gemini to pick 8-12 matching recipes
async function pickRecipesForCampaign(campaign, pool) {
  const poolSummary = pool.map(r => `${r.slug}|${r.title}|${r.cuisine}|${r.category}`).join('\n');

  const prompt = `You are curating a food festival campaign for Zaffaron, a multi-cuisine recipe website.

Festival: ${campaign.title}
Event slug: ${campaign.event_slug}
Dates: ${campaign.start_date} to ${campaign.end_date}

Your task: from the recipe pool below, select 8-12 recipes that are CULTURALLY, CULINARILY, or THEMATICALLY appropriate for this festival. Priority order:
1. Recipes from the festival's native cuisine (e.g., Sri Lankan festival -> South Asian/Indian)
2. Recipes from culturally-adjacent cuisines
3. Thematic fit (spring, harvest, sweets, specific ingredients)
4. Variety (mix of mains, desserts, snacks)

Respond ONLY with a JSON array of slugs. No explanation. Example:
["recipe-slug-1","recipe-slug-2","recipe-slug-3",...]

If none fit well, return empty array: []

RECIPE POOL (slug|title|cuisine|category):
${poolSummary.slice(0, 80000)}

Return 8-12 slugs for "${campaign.title}":`;

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    throw new Error(`Gemini error ${geminiRes.status}: ${errText.slice(0, 300)}`);
  }

  const g = await geminiRes.json();
  let raw = g.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '[]';

  let slugs;
  try {
    slugs = JSON.parse(raw);
  } catch (e) {
    // Attempt repair: if truncated mid-array, try to salvage complete entries
    const match = raw.match(/\[\s*(?:"[^"]+"(?:\s*,\s*"[^"]+")*)?\s*,?/);
    if (match) {
      // Find last complete string entry before truncation
      const entries = Array.from(raw.matchAll(/"([^"]+)"/g)).map(m => m[1]);
      if (entries.length > 0) {
        console.log(`  [recovered ${entries.length} slugs from truncated JSON for ${campaign.slug}]`);
        slugs = entries;
      } else {
        console.error(`Parse fail for ${campaign.slug}: ${raw.slice(0, 200)}`);
        return { slugs: [], raw };
      }
    } else {
      console.error(`Parse fail for ${campaign.slug}: ${raw.slice(0, 200)}`);
      return { slugs: [], raw };
    }
  }

  if (!Array.isArray(slugs)) slugs = [];

  // Validate each slug exists in pool
  const poolSlugs = new Set(pool.map(r => r.slug));
  const valid = slugs.filter(s => poolSlugs.has(s));
  const invalid = slugs.filter(s => !poolSlugs.has(s));

  return { slugs: valid, invalid, raw, rawCount: slugs.length };
}

// Step 4: process each campaign
const results = [];
for (const campaign of needsFill) {
  console.log(`--- ${campaign.title} (${campaign.slug}) ---`);
  try {
    const { slugs, invalid, raw, rawCount } = await pickRecipesForCampaign(campaign, allRecipes);
    console.log(`  Got ${slugs.length}/${rawCount || 0} valid slugs${invalid?.length ? ` (${invalid.length} invalid: ${invalid.slice(0,3).join(',')}${invalid.length > 3 ? '...' : ''})` : ''}`);
    slugs.forEach(s => console.log(`    - ${s}`));

    if (slugs.length === 0) {
      console.log(`  SKIP (no valid matches)\n`);
      results.push({ campaign: campaign.slug, skipped: true, reason: 'no valid matches' });
      continue;
    }

    if (!DRY_RUN) {
      // UPDATE recipe_slugs for this campaign
      const updRes = await fetch(
        `${SUPABASE_URL}/rest/v1/featured_campaigns?id=eq.${campaign.id}`,
        {
          method: 'PATCH',
          headers: {
            ...sbHeaders,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({
            recipe_slugs: slugs,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!updRes.ok) {
        const errText = await updRes.text();
        console.error(`  UPDATE FAILED: ${errText.slice(0, 200)}\n`);
        results.push({ campaign: campaign.slug, error: errText.slice(0, 200) });
        continue;
      }
      console.log(`  ✓ UPDATED with ${slugs.length} recipes\n`);
      results.push({ campaign: campaign.slug, filled: slugs.length, slugs });
    } else {
      console.log(`  (dry-run; would update with ${slugs.length} recipes)\n`);
      results.push({ campaign: campaign.slug, dryRun: true, wouldFill: slugs.length });
    }
  } catch (e) {
    console.error(`  ERROR: ${e.message}\n`);
    results.push({ campaign: campaign.slug, error: e.message });
  }
}

console.log(`\n=== Summary ===`);
console.log(`Processed: ${needsFill.length}`);
console.log(`Filled:    ${results.filter(r => r.filled).length}`);
console.log(`Skipped:   ${results.filter(r => r.skipped).length}`);
console.log(`Errors:    ${results.filter(r => r.error).length}`);
console.log(`Total slugs added: ${results.reduce((sum, r) => sum + (r.filled || 0), 0)}`);

// Write result log
const logPath = path.join(
  'C:/Users/Mehdi/Desktop/Projects/zaffaron-v2/scripts',
  `fill-featured-campaigns-log-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`
);
await fs.writeFile(logPath, JSON.stringify({ date: new Date().toISOString(), dryRun: DRY_RUN, results }, null, 2));
console.log(`\nLog written to: ${logPath}`);
