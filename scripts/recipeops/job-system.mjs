/**
 * RecipeOps Job System v4A (Phase 4A refactor)
 *
 * Key changes from pre-4A:
 *   - claimJob() now calls the atomic RPC recipeops_claim_next_job() which
 *     returns a claim_token UUID the worker MUST use in every subsequent write.
 *   - updateJob() now REQUIRES claim_token + locked_by. Writes without the
 *     ownership contract return 0-rows-updated and THROW (ghost write protection).
 *   - heartbeat() exposes recipeops_heartbeat RPC for long-running phases.
 *   - completeJob/failJob preserve ownership gate while transitioning status.
 *
 * Worker identity: `${os.hostname()}:${process.pid}` unique per container/process.
 */

import { createClient } from '@supabase/supabase-js';
import os from 'node:os';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** Stable worker identity for this process */
export const WORKER_ID = `${os.hostname()}:${process.pid}`;

/**
 * Enqueue a new recipe generation job.
 * No ownership gate needed (creates new row).
 */
export async function enqueueJob({ inputType = 'text', inputData = {}, createdBy = 'system' } = {}) {
  const { data, error } = await sb
    .from('recipeops_jobs')
    .insert({
      input_type: inputType,
      input_data: inputData,
      status: 'queued',
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw new Error(`Enqueue failed: ${error.message}`);
  return data;
}

/**
 * Claim the next queued job via atomic RPC.
 * Returns { id, input_type, input_data, claim_token } OR null if nothing queued.
 * 
 * Claim contract:
 *   - Caller gets a UUID claim_token unique to this claim.
 *   - ALL subsequent writes from this worker for this job MUST include WHERE claim_token = $token.
 *   - If another worker claims the same job (shouldn't happen due to SKIP LOCKED), the token guarantees isolation.
 */
export async function claimJob() {
  const { data, error } = await sb.rpc('recipeops_claim_next_job', {
    p_worker_id: WORKER_ID,
  });

  if (error) throw new Error(`Claim RPC failed: ${error.message}`);
  if (!data || data.length === 0) return null;

  const claim = data[0];
  // F-kimi-3 fix (2026-04-26): RPC returns only {job_id, input_type, input_data, claim_token}
  // (empirically verified via fb005-rpc-probe). Refetch full row so retry_count, max_retries,
  // recipe_data, cost_usd propagate to processJob — without this, retries regenerate from
  // scratch (wasted GPT cost), max_retries cap not enforced, and Telegram alerts show
  // "Retry: undefined".
  const { data: full, error: fetchErr } = await sb
    .from('recipeops_jobs')
    .select('id, input_type, input_data, claim_token, retry_count, max_retries, recipe_data, cost_usd')
    .eq('id', claim.job_id)
    .eq('claim_token', claim.claim_token)
    .single();

  if (fetchErr || !full) {
    console.warn(
      `[claimJob] degraded: refetch failed (${fetchErr?.message || 'no row'}); ` +
      `falling back to RPC minimal fields. retry_count + recipe_data + cost_usd will be lost ` +
      `for job ${claim.job_id}. F-kimi-3 fallback path active — investigate if frequent.`
    );
    return {
      id: claim.job_id,
      input_type: claim.input_type,
      input_data: claim.input_data,
      claim_token: claim.claim_token,
    };
  }
  return full;
}

/**
 * Update job with ownership gate.
 * THROWS if ownership contract broken (returns 0 rows).
 * This is the core anti-ghost-write guard.
 */
export async function updateJob(jobId, claimToken, updates, retries = 3) {
  if (!claimToken) {
    throw new Error('updateJob: claim_token REQUIRED (ownership gate)');
  }

  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await sb
        .from('recipeops_jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .eq('claim_token', claimToken)
        .eq('locked_by', WORKER_ID)
        .select('id');

      if (error) throw new Error(error.message);

      if (!data || data.length === 0) {
        // Ghost-write protection fired. This means either:
        //  (a) claim_token mismatch (another worker claimed or job was swept)
        //  (b) locked_by mismatch (another process is operating this job)
        //  (c) job was released back to queued
        throw new Error(
          `updateJob ownership-gate-fail for job=${jobId} worker=${WORKER_ID}. ` +
          `Job may have been swept or reassigned. Halting write.`
        );
      }
      return;
    } catch (e) {
      // Ownership-gate failures should NOT retry — they indicate lost ownership.
      if (String(e.message || '').includes('ownership-gate-fail')) throw e;
      if (i === retries - 1) throw new Error(`Update job failed after ${retries}: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

/**
 * Worker heartbeat — updates heartbeat_at + optional phase.
 * Returns true if still own the job, false if ownership lost (caller should halt).
 */
export async function heartbeat(jobId, claimToken, phase = null) {
  const { data, error } = await sb.rpc('recipeops_heartbeat', {
    p_job_id: jobId,
    p_claim_token: claimToken,
    p_phase: phase,
  });

  if (error) {
    console.error(`[heartbeat] RPC error: ${error.message}`);
    return false;  // Treat errors as lost ownership for safety
  }
  return data === true;
}

/**
 * Complete a job (successful publish).
 */
export async function completeJob(jobId, claimToken, { recipeId, imageUrl, cost } = {}) {
  await updateJob(jobId, claimToken, {
    status: 'done',
    phase: 'done',
    recipe_id: recipeId,
    image_url: imageUrl,
    cost_usd: cost || 0,
    completed_at: new Date().toISOString(),
  });
}

/**
 * Fail a job (with optional retry).
 * Both retry and final-fail paths clear claim_token so sweeper/claimer can pick it up cleanly.
 */
export async function failJob(jobId, claimToken, error, currentRetry = 0, maxRetries = 2) {
  if (currentRetry < maxRetries) {
    // Retry: put back in queue + release ownership
    await updateJob(jobId, claimToken, {
      status: 'queued',
      claim_token: null,  // release ownership so next claimer can grab
      locked_by: null,
      locked_at: null,
      heartbeat_at: null,
      phase: null,
      error: `Retry ${currentRetry + 1}: ${error}`,
      retry_count: currentRetry + 1,
    });
    return 'retrying';
  }

  // Final failure — preserve claim_token for post-mortem, but mark failed
  await updateJob(jobId, claimToken, {
    status: 'failed',
    phase: 'failed',
    error: `Final failure after ${maxRetries} retries: ${error}`,
    retry_count: currentRetry + 1,
    completed_at: new Date().toISOString(),
  });
  return 'failed';
}

/**
 * Log a job step — no ownership gate needed (append-only log table).
 */
export async function logStep(jobId, step, status, details = {}, durationMs = 0, costUsd = 0) {
  const { error } = await sb
    .from('recipeops_job_logs')
    .insert({
      job_id: jobId,
      step,
      status,
      details,
      duration_ms: durationMs,
      cost_usd: costUsd,
    });

  if (error) console.error(`Log step failed: ${error.message}`);
}

/**
 * Get job summary — read-only, no ownership gate.
 */
export async function getJobSummary() {
  const { data, error } = await sb
    .from('recipeops_summary')
    .select('*');

  if (error) {
    const { data: jobs } = await sb
      .from('recipeops_jobs')
      .select('status');

    const counts = {};
    jobs?.forEach(j => { counts[j.status] = (counts[j.status] || 0) + 1; });
    return counts;
  }
  return data;
}

/**
 * Enqueue batch of recipe names — no ownership gate needed (creates new rows).
 */
export async function enqueueBatch(recipeNames, createdBy = 'batch') {
  const jobs = recipeNames.map(name => ({
    input_type: 'text',
    input_data: typeof name === 'string' ? { name } : name,
    status: 'queued',
    created_by: createdBy,
  }));

  const { data, error } = await sb
    .from('recipeops_jobs')
    .insert(jobs)
    .select('id');

  if (error) throw new Error(`Batch enqueue failed: ${error.message}`);
  return data;
}
