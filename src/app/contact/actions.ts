'use server';

// EPHEMERAL SKELETON — Phase 2.5 search-space partition test.
// Returns { ok: true } immediately with no DB / headers / supabase calls.
// If POST -> 200: original 500 was in body (DB/rate-limit/etc) → Option α (request-scoped supabase).
// If POST -> 500: 500 is in wiring (useActionState/RSC/serialization) → different fix path.
// Will be reverted after empirical signal captured.

export type ContactState = { ok: boolean | null; error?: string };

export async function submitContactForm(
  _prev: ContactState,
  _formData: FormData,
): Promise<ContactState> {
  return { ok: true };
}
