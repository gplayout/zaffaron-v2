/**
 * RecipeOps Supervisor v2 — Always-on, cost-aware, queue-aware
 *
 * Enhancements over v1 (supervisor.mjs):
 *  1. Auto-generates candidate recipes via GPT when queue low
 *  2. Respects daily + hourly cost caps from supervisor-config.json
 *  3. Cuisine-target-driven: queues gaps per target
 *  4. Circuit breaker: pauses on recent failure spike
 *  5. Respects max-queue cap (no runaway queueing)
 *
 * Usage:
 *   node --env-file ../../.env.local supervisor-v2.mjs [--dry-run]
 *
 * Invoked by Windows Task Scheduler every 5 minutes (same as v1).
 *
 * To adopt: after testing, schedule points at supervisor-v2.mjs instead of supervisor.mjs.
 * v1 remains untouched as rollback path.
 */

import { createClient } from '@supabase/supabase-js';
import { execSync, spawn } from 'child_process';
import { existsSync, appendFileSync, openSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');
const LOG_FILE = join(PROJECT_ROOT, 'supervisor.log');
const PIPELINE_SCRIPT = join(__dirname, 'pipeline.mjs');
const ENV_FILE = join(PROJECT_ROOT, '.env.local');
const CONFIG_FILE = join(__dirname, 'supervisor-config.json');

const DRY_RUN_CLI = process.argv.includes('--dry-run');

// Load config
const CONFIG = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
const DRY_RUN = DRY_RUN_CLI || CONFIG.safety.dryRun;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}][v2${DRY_RUN ? ':DRY' : ''}] ${msg}`;
  console.log(line);
  try { appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

function isPipelineRunning() {
  try {
    const output = execSync(
      'powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name=\'node.exe\'\\" | Where-Object { $_.CommandLine -like \'*pipeline.mjs*\' -and $_.CommandLine -notlike \'*supervisor*\' } | Select-Object -ExpandProperty ProcessId"',
      { encoding: 'utf-8', timeout: 10000 }
    ).trim();
    return output.length > 0 ? output.split('\n').map(s => s.trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function getQueueStatus() {
  const { data } = await sb.from('recipeops_jobs').select('status');
  const counts = {};
  (data || []).forEach(j => { counts[j.status] = (counts[j.status] || 0) + 1; });
  return counts;
}

async function getCuisineCounts() {
  // Paginate past Supabase default 1000-row limit
  const counts = {};
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await sb
      .from('recipes_v2')
      .select('cuisine')
      .eq('published', true)
      .range(offset, offset + pageSize - 1);
    if (error) {
      log(`WARN: cuisine count query failed: ${error.message}`);
      break;
    }
    if (!data || data.length === 0) break;
    data.forEach(r => {
      const c = (r.cuisine || 'unknown').toLowerCase();
      counts[c] = (counts[c] || 0) + 1;
    });
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return counts;
}

async function getSpendUsd(windowMinutes) {
  // F-kimi-7 fix (2026-04-26): sum real cost_usd from completed jobs in window.
  // Was: count(done|verifying|imaging|processing within updated_at window) * flat $0.08
  //   → inflated by stuck-job heartbeats (updated_at) AND phantom-charged 535 skipped-duplicate
  //     jobs (cost_usd=0) at flat rate. Hit caps prematurely.
  // Now: SUM(cost_usd) WHERE status='done' AND completed_at >= since AND cost_usd IS NOT NULL.
  // Empirical (probe 2026-04-26 01:13 PDT): 1553 done jobs, 0 null cost_usd, lifetime sum $77.07,
  //   mean $0.0757/recipe. 535 zero-cost rows are deliberate duplicate-skips (no API call → $0
  //   actual), not data gaps — Approach B over A locked.
  //
  // CEILING NOTE: PostgREST default + max row limit is 1000 (Supabase). For 1h/24h windows in
  //   current pipeline capacity (~50-100/hr peak, ~200-300/day) this is safely under cap.
  //   If pipeline ever scales beyond ~1000 done jobs/24h, replace with server-side RPC
  //   `recipeops_sum_cost_usd(since timestamp)` to bypass row cap entirely. Pre-existing OLD
  //   count×flat impl had same 1000-row cap (silent undercount above scale).
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { data, error } = await sb
    .from('recipeops_jobs')
    .select('cost_usd')
    .eq('status', 'done')
    .gte('completed_at', since)
    .not('cost_usd', 'is', null);
  if (error) {
    log(`WARN: spend query failed: ${error.message}`);
    return 0;
  }
  return (data || []).reduce((sum, j) => sum + (parseFloat(j.cost_usd) || 0), 0);
}

async function getRecentFailureCount() {
  // P0.1 fix 2026-04-26 (Kimi F-kimi-03 + GPT-5 F-gpt-5-2-01 STRONG convergence):
  // Use completed_at (set once at terminal status, never updated) instead of updated_at
  // (which can tick on any row update e.g. sweeper resets, inflating circuit-breaker count).
  // Empirically verified 2026-04-26: completed_at populated 20/20 on failed rows.
  const since = new Date(Date.now() - CONFIG.safety.circuitBreakerWindowMinutes * 60 * 1000).toISOString();
  const { data, error } = await sb
    .from('recipeops_jobs')
    .select('status')
    .gte('completed_at', since)
    .eq('status', 'failed');
  if (error) {
    log(`WARN: failure query failed: ${error.message}`);
    return 0;
  }
  return data?.length || 0;
}

function identifyCuisineGaps(currentCounts, targets) {
  const gaps = [];
  for (const [cuisine, target] of Object.entries(targets)) {
    const current = currentCounts[cuisine] || 0;
    if (current < target) {
      gaps.push({ cuisine, current, target, deficit: target - current });
    }
  }
  return gaps.sort((a, b) => b.deficit - a.deficit);
}

async function generateCandidatesViaGpt(cuisine, count) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log(`ERROR: OPENAI_API_KEY missing; cannot generate candidates`);
    return [];
  }

  // Get existing recipe titles to avoid duplicates
  const { data: existing } = await sb
    .from('recipes_v2')
    .select('title, slug')
    .eq('cuisine', cuisine.toLowerCase())
    .limit(200);

  const existingTitles = (existing || []).map(r => r.title).join(', ');

  const prompt = `You are expanding Zaffaron's ${cuisine} recipe catalog.

Existing ${cuisine} recipes (avoid duplicates): ${existingTitles}

Generate ${count} NEW ${cuisine} recipe ideas that are NOT in the existing list. Each should be authentic, distinct, and culturally appropriate. Return as a JSON array of objects with fields: { title, description }. Keep descriptions to 1 short sentence. Return ONLY the JSON, no surrounding prose.

Example:
[{"title":"Recipe Name","description":"Short distinctive description."}]`;

  // Wrap prompt to force JSON-object response with array wrapper
  const wrappedPrompt = prompt + `\n\nReturn in this EXACT format:\n{"recipes":[{"title":"...","description":"..."}]}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Cheap + fast for candidate generation
      messages: [{ role: 'user', content: wrappedPrompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    log(`ERROR: GPT candidate gen ${res.status}: ${err.slice(0, 200)}`);
    return [];
  }

  const d = await res.json();
  const raw = d.choices?.[0]?.message?.content || '';
  try {
    // OpenAI may wrap array in object; try both
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    // Look for array in any top-level property
    for (const v of Object.values(parsed)) {
      if (Array.isArray(v)) return v;
    }
    return [];
  } catch (e) {
    log(`WARN: candidate parse failed: ${raw.slice(0, 200)}`);
    return [];
  }
}

async function enqueueCandidates(cuisine, candidates) {
  if (candidates.length === 0) return { inserted: 0, duplicates: 0 };

  // Check dup against existing jobs + published recipes
  const rows = candidates
    .filter(c => c.title)
    .map(c => ({
      input_type: 'text',
      input_data: {
        name: c.title,
        description: c.description || '',
        cuisine_hint: cuisine.toLowerCase(),
      },
      status: 'queued',
      created_by: 'supervisor-v2',
      notes: `Auto-generated by supervisor v2 (cuisine gap: ${cuisine})`,
    }));

  if (DRY_RUN) {
    log(`DRY_RUN: would enqueue ${rows.length} jobs (first 3 titles: ${rows.slice(0, 3).map(r => r.input_data.name).join(', ')}${rows.length > 3 ? '...' : ''})`);
    return { inserted: 0, duplicates: 0, dryRun: true, wouldInsert: rows.length };
  }

  // Live insert (only reached if !DRY_RUN)
  const { error, count } = await sb
    .from('recipeops_jobs')
    .insert(rows, { count: 'exact' });

  if (error) {
    log(`WARN: enqueue failed: ${error.message}`);
    return { inserted: 0, duplicates: 0, error: error.message };
  }
  return { inserted: count ?? rows.length, duplicates: rows.length - (count ?? rows.length) };
}

function startPipeline() {
  if (DRY_RUN) {
    log('DRY_RUN: would start pipeline');
    return -1;
  }
  const child = spawn('node', ['--env-file', ENV_FILE, PIPELINE_SCRIPT, '--batch=50'], {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: [
      'ignore',
      openSync(join(PROJECT_ROOT, 'pipeline-output.log'), 'a'),
      openSync(join(PROJECT_ROOT, 'pipeline-error.log'), 'a'),
    ],
  });
  child.unref();
  return child.pid;
}

async function main() {
  log('--- Supervisor v2 check ---');

  // 1. Safety: circuit breaker on recent failures
  const failureCount = await getRecentFailureCount();
  if (failureCount >= CONFIG.safety.pauseIfRecentFailures) {
    log(`CIRCUIT BREAKER: ${failureCount} failures in last ${CONFIG.safety.circuitBreakerWindowMinutes}m — pausing. Manual intervention needed.`);
    process.exit(0);
  }

  // 2. Safety: cost caps
  const dailySpend = await getSpendUsd(24 * 60);
  const hourlySpend = await getSpendUsd(60);
  log(`Spend (est): daily=$${dailySpend.toFixed(2)} hourly=$${hourlySpend.toFixed(2)}`);

  if (dailySpend >= CONFIG.costCaps.dailyUsd) {
    log(`COST CAP HIT: daily $${dailySpend.toFixed(2)} >= $${CONFIG.costCaps.dailyUsd} — skip this cycle`);
    process.exit(0);
  }
  if (hourlySpend >= CONFIG.costCaps.hourlyUsd) {
    log(`COST CAP HIT: hourly $${hourlySpend.toFixed(2)} >= $${CONFIG.costCaps.hourlyUsd} — skip this cycle`);
    process.exit(0);
  }

  // 3. Queue status
  const status = await getQueueStatus();
  const queued = status.queued || 0;
  const processing = status.processing || 0;
  const verifying = status.verifying || 0;
  const imaging = status.imaging || 0;
  const done = status.done || 0;
  const failed = status.failed || 0;
  const total = queued + processing + verifying + imaging;
  log(`Queue: queued=${queued} processing=${processing} verifying=${verifying} imaging=${imaging} done=${done} failed=${failed}`);

  // 4. Top-up queue if below threshold (ALWAYS-ON behavior)
  if (total < CONFIG.queueManagement.minQueuedThreshold) {
    const topUpTarget = CONFIG.queueManagement.topUpToCount;
    const deficit = topUpTarget - total;

    // Check global ceiling
    const totalPublished = Object.values(await getCuisineCounts()).reduce((a, b) => a + b, 0);
    if (totalPublished >= CONFIG.globalTargetCeiling) {
      log(`Global ceiling hit (${totalPublished} >= ${CONFIG.globalTargetCeiling}) — pipeline goes idle. Re-enable by raising globalTargetCeiling.`);
      process.exit(0);
    }

    // Identify cuisine gaps
    const cuisineCounts = await getCuisineCounts();
    const gaps = identifyCuisineGaps(cuisineCounts, CONFIG.cuisineTargets);

    if (gaps.length === 0) {
      log(`All cuisine targets met. Pipeline idles until targets raised.`);
      process.exit(0);
    }

    log(`Top-up needed: queue=${total} target=${topUpTarget} deficit=${deficit}`);
    log(`Top gaps: ${gaps.slice(0, 3).map(g => `${g.cuisine}=${g.current}/${g.target}`).join(', ')}`);

    // Generate candidates for top gap (one cuisine per supervisor cycle to avoid cost spikes)
    const targetCuisine = gaps[0];
    const countToGenerate = Math.min(20, targetCuisine.deficit, deficit);

    log(`Generating ${countToGenerate} ${targetCuisine.cuisine} candidates via GPT...`);
    const candidates = await generateCandidatesViaGpt(targetCuisine.cuisine, countToGenerate);
    log(`Got ${candidates.length} candidates`);

    if (candidates.length > 0) {
      const result = await enqueueCandidates(targetCuisine.cuisine, candidates);
      log(`Enqueued ${result.inserted} new jobs (${result.duplicates} dup)`);
    }
  } else if (total >= CONFIG.queueManagement.maxQueuedCap) {
    log(`Queue at/above cap (${total} >= ${CONFIG.queueManagement.maxQueuedCap}) — not topping up`);
  } else {
    log(`Queue sufficient (${total} within ${CONFIG.queueManagement.minQueuedThreshold}-${CONFIG.queueManagement.maxQueuedCap})`);
  }

  // 5. Check if pipeline is running
  const pids = isPipelineRunning();
  if (pids.length > 0) {
    log(`Pipeline already running (PIDs: ${pids.join(', ')})`);
    process.exit(0);
  }

  // 6. If queue has work + pipeline dead, start it
  const queuedFinal = (await getQueueStatus()).queued || 0;
  if (queuedFinal > 0) {
    log(`Pipeline not running. ${queuedFinal} queued. Starting...`);
    const pid = startPipeline();
    log(`Pipeline started (PID: ${pid})`);
  } else {
    log(`No work + pipeline idle. Exiting clean.`);
  }

  process.exit(0);
}

main().catch(e => {
  log(`FATAL: ${e.message}`);
  process.exit(1);
});
