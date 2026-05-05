// Server Component shell — Phase 2.5 Fix A (prop drilling).
// Forces bundler to register saveVaultRecipe + structureRecipeStreaming
// action-IDs into route's server-reference-manifest. Without this Server
// Component layer, importing Server Actions exclusively from a "use client"
// page leaves the action-IDs in the client bundle but absent from the
// runtime route manifest -> x-nextjs-action-not-found 404 on POST.
// References: vercel/next.js PR #77012, Issue #69756, Discussion #58431.

// Phase 2.5 vault fix (2026-05-05 00:15 PDT): swap active path from
// structureRecipeStreaming (vault-stream.ts) → structureRecipe (vault.ts).
// Reasoning: vault-stream awaited result.object server-side (no client streaming
// benefit) AND used @ai-sdk/openai + streamObject which is heavier surface than
// raw fetch. structureRecipe uses IRON-LAW-compliant raw fetch via
// structureRecipeText, plus added maxDuration=60 in vault.ts insures against
// slow OpenAI responses (root cause of "Connection closed digest 1619326732").
// vault-stream.ts deleted; structure-stream.ts foundation preserved per
// 2026-04-16 architecture intent (selective streaming for future UX).
import { saveVaultRecipe, structureRecipe } from "@/app/actions/vault";
import VaultCreateClient from "./VaultCreateClient";

export default function VaultCreatePage() {
  return (
    <VaultCreateClient
      structureAction={structureRecipe}
      saveAction={saveVaultRecipe}
    />
  );
}
