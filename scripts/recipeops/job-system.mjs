/**
 * RecipeOps Job System
 * Manages job lifecycle: enqueue → claim → update → complete/fail
 */

import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Enqueue a new recipe generation job
 * @param {object} opts - { inputType, inputData, createdBy }
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
 * Claim the next queued job (atomic)
 */
export async function claimJob() {
  // Try up to 3 times to claim a job (handles concurrent worker races)
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: jobs, error: findErr } = await sb
      .from('recipeops_jobs')
      .select('id')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(5);  // Fetch several to handle races
    
    if (findErr) throw new Error(`Find job failed: ${findErr.message}`);
    if (!jobs || jobs.length === 0) return null;

    // Try each candidate until one is claimed
    for (const candidate of jobs) {
      const { data, error } = await sb
        .from('recipeops_jobs')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString(),
        })
        .eq('id', candidate.id)
        .eq('status', 'queued')  // Atomic: only if still queued
        .select()
        .single();
      
      if (data && !error) return data;  // Successfully claimed
    }
    // All candidates taken, retry
    await new Promise(r => setTimeout(r, 500));
  }
  return null;
}

/**
 * Update job status
 */
export async function updateJob(jobId, updates, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { error } = await sb
        .from('recipeops_jobs')
        .update(updates)
        .eq('id', jobId);
      
      if (error) throw new Error(error.message);
      return;
    } catch (e) {
      if (i === retries - 1) throw new Error(`Update job failed: ${e.message}`);
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

/**
 * Complete a job
 */
export async function completeJob(jobId, { recipeId, imageUrl, cost } = {}) {
  await updateJob(jobId, {
    status: 'done',
    recipe_id: recipeId,
    image_url: imageUrl,
    cost_usd: cost || 0,
    completed_at: new Date().toISOString(),
  });
}

/**
 * Fail a job (with optional retry)
 */
export async function failJob(jobId, error, currentRetry = 0, maxRetries = 2) {
  if (currentRetry < maxRetries) {
    // Retry: put back in queue
    await updateJob(jobId, {
      status: 'queued',
      error: `Retry ${currentRetry + 1}: ${error}`,
      retry_count: currentRetry + 1,
    });
    return 'retrying';
  }
  
  // Final failure
  await updateJob(jobId, {
    status: 'failed',
    error: `Final failure after ${maxRetries} retries: ${error}`,
    retry_count: currentRetry + 1,
    completed_at: new Date().toISOString(),
  });
  return 'failed';
}

/**
 * Log a job step
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
 * Get job summary
 */
export async function getJobSummary() {
  const { data, error } = await sb
    .from('recipeops_summary')
    .select('*');
  
  if (error) {
    // Fallback if view doesn't exist
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
 * Enqueue batch of recipe names
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
