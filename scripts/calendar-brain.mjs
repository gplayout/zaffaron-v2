/**
 * Calendar Brain — The Smart Campaign Generator
 * 
 * Runs daily (or weekly). Looks at calendar_events, finds upcoming events,
 * matches them to existing recipes, and creates featured_campaigns.
 * 
 * If a signature dish is missing from recipes_v2, it enqueues a RecipeOps job.
 * 
 * Architecture:
 *   calendar_events (read-only) → Brain → featured_campaigns (write)
 *                                       → recipes_v2 (read, search by title)
 *                                       → recipeops_jobs (write, if missing)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load env
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
} catch {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY/SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Config
const WINDOW_DAYS = 45;       // Look ahead 45 days
const FEATURE_DAYS_BEFORE = 14; // Start featuring 14 days before event
const FEATURE_DAYS_AFTER = 3;   // Keep featuring 3 days after event
const MAX_RECIPES_PER_CAMPAIGN = 4;
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Normalize a dish name for fuzzy matching against recipe titles
 */
function normalizeDish(name) {
  return name
    .replace(/\([^)]*\)/g, '')
    .replace(/[^\w\s]/g, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Get the current month/day for upcoming event detection.
 * For fixed dates (gregorian_fixed), we just compare month+day.
 * For variable dates, we use start_month as approximation (good enough for 45-day window).
 */
function getUpcomingEvents(events, today) {
  const upcoming = [];
  const todayMs = today.getTime();
  const windowMs = WINDOW_DAYS * 24 * 60 * 60 * 1000;

  for (const ev of events) {
    if (!ev.start_month) continue;

    // Approximate event date for this year
    const eventDate = new Date(today.getFullYear(), ev.start_month - 1, ev.start_day || 15);
    
    // If event already passed this year, check next year
    if (eventDate.getTime() < todayMs - (FEATURE_DAYS_AFTER * 24 * 60 * 60 * 1000)) {
      eventDate.setFullYear(eventDate.getFullYear() + 1);
    }

    const daysUntil = Math.ceil((eventDate.getTime() - todayMs) / (24 * 60 * 60 * 1000));

    if (daysUntil <= WINDOW_DAYS && daysUntil >= -FEATURE_DAYS_AFTER) {
      upcoming.push({
        ...ev,
        eventDate,
        daysUntil,
        featureStart: new Date(eventDate.getTime() - FEATURE_DAYS_BEFORE * 24 * 60 * 60 * 1000),
        featureEnd: new Date(eventDate.getTime() + FEATURE_DAYS_AFTER * 24 * 60 * 60 * 1000),
      });
    }
  }

  return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
}

/**
 * Search recipes_v2 for dishes matching an event's signature_dishes
 */
async function findMatchingRecipes(signatureDishes) {
  const matches = [];
  
  for (const dish of signatureDishes) {
    const dishName = typeof dish === 'string' ? dish : (dish.name || '');
    if (!dishName) continue;
    
    const normalized = normalizeDish(dishName);
    const keywords = normalized.split(' ').filter(w => w.length > 2).slice(0, 3);
    if (keywords.length === 0) continue;

    // Search by keywords in title
    const orFilter = keywords.map(k => `title.ilike.%${k}%`).join(',');
    const { data } = await sb
      .from('recipes_v2')
      .select('slug, title')
      .eq('published', true)
      .or(orFilter)
      .limit(5);

    if (data && data.length > 0) {
      // Pick best match: recipe whose title contains ALL keywords
      const best = data.find(r => {
        const rNorm = normalizeDish(r.title);
        return keywords.every(k => rNorm.includes(k));
      });
      if (best && !matches.find(m => m.slug === best.slug)) {
        matches.push(best);
      }
    }
  }

  return matches.slice(0, MAX_RECIPES_PER_CAMPAIGN);
}

/**
 * Main brain logic
 */
async function run() {
  const today = new Date();
  console.log(`\n🧠 Calendar Brain — ${today.toISOString().split('T')[0]}`);
  console.log(`   Window: ${WINDOW_DAYS} days ahead | Feature: T-${FEATURE_DAYS_BEFORE} to T+${FEATURE_DAYS_AFTER}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  // 1. Fetch all calendar events
  const { data: events, error: evErr } = await sb
    .from('calendar_events')
    .select('slug, name, name_local, tier, start_month, start_day, signature_dishes, cultural_context')
    .eq('published', true);

  if (evErr) { console.error('Failed to fetch events:', evErr); return; }
  console.log(`📅 Total events: ${events.length}`);

  // 2. Find upcoming events
  const upcoming = getUpcomingEvents(events, today);
  console.log(`🔜 Upcoming (next ${WINDOW_DAYS} days): ${upcoming.length}\n`);

  if (upcoming.length === 0) {
    console.log('Nothing upcoming. Done.');
    return;
  }

  let campaignsCreated = 0;
  let recipesQueued = 0;

  for (const ev of upcoming) {
    console.log(`--- ${ev.name} (${ev.daysUntil > 0 ? 'in ' + ev.daysUntil + ' days' : ev.daysUntil === 0 ? 'TODAY' : Math.abs(ev.daysUntil) + ' days ago'}) [Tier ${ev.tier}] ---`);

    // 3. Check if campaign already exists for this event+year
    const year = ev.eventDate.getFullYear();
    const campaignSlug = `${ev.slug}-${year}`;
    
    const { data: existing } = await sb
      .from('featured_campaigns')
      .select('slug')
      .eq('slug', campaignSlug)
      .single();

    if (existing) {
      console.log(`  ✅ Campaign already exists: ${campaignSlug}`);
      // check if it needs backfilling recipes 
      // (Skipping to keep it simple, we just won't enqueue for already existing campaigns. To trigger queue, you'd delete the campaign from DB manually).
      continue;
    }

    // 4. Find matching recipes
    const dishes = ev.signature_dishes || [];
    const matches = await findMatchingRecipes(dishes);
    console.log(`  📖 Matched ${matches.length} recipes: ${matches.map(m => m.slug).join(', ') || 'none'}`);

    // 5. Queue missing dishes to RecipeOps (if any core dishes are missing)
    const missingDishes = [];
    for (const dish of dishes.slice(0, 3)) {  // Only check top 3 signature dishes
      const dishName = typeof dish === 'string' ? dish : (dish.name || '');
      if (!dishName) continue;
      const found = matches.some(m => {
        const mNorm = normalizeDish(m.title);
        const dNorm = normalizeDish(dishName);
        const keywords = dNorm.split(' ').filter(w => w.length > 2);
        return keywords.every(k => mNorm.includes(k));
      });
      if (!found) {
        missingDishes.push(dishName);
      }
    }

    if (missingDishes.length > 0) {
      console.log(`  ⚠️ Missing dishes: ${missingDishes.join(', ')}`);
      if (!DRY_RUN) {
        // Enqueue to RecipeOps
        for (const dish of missingDishes) {
          const { error: jobErr } = await sb.from('recipeops_jobs').insert({
            status: 'pending',
            input_type: 'name',
            input_data: { name: dish, event: ev.slug }
          });
          if (jobErr) console.error(`  ❌ Failed to enqueue: ${dish}`, jobErr.message);
          else { console.log(`  📝 Enqueued: ${dish}`); recipesQueued++; }
        }
      } else {
        console.log(`  [DRY RUN] Would enqueue: ${missingDishes.join(', ')}`);
      }
    }

    // 6. Create campaign
    const campaign = {
      slug: campaignSlug,
      title: ev.name,
      event_slug: ev.slug,
      start_date: ev.featureStart.toISOString().split('T')[0],
      end_date: ev.featureEnd.toISOString().split('T')[0],
      recipe_slugs: matches.map(m => m.slug),
      priority: ev.tier === 1 ? 10 : ev.tier === 2 ? 5 : 1,
      published: true,
    };

    if (!DRY_RUN) {
      const { error: campErr } = await sb.from('featured_campaigns').upsert(campaign, { onConflict: 'slug' });
      if (campErr) console.error(`  ❌ Campaign error:`, campErr.message);
      else { console.log(`  ✅ Campaign created: ${campaignSlug} (${campaign.start_date} → ${campaign.end_date})`); campaignsCreated++; }
    } else {
      console.log(`  [DRY RUN] Would create campaign: ${campaignSlug}`);
      campaignsCreated++;
    }
    console.log('');
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Campaigns created: ${campaignsCreated}`);
  console.log(`Recipes queued: ${recipesQueued}`);
  console.log(`Done.\n`);
}

run().catch(console.error);
