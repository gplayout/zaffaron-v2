// Server Component shell — Phase 2.5 Fix A (prop drilling).
// Forces bundler to register saveVaultRecipe + structureRecipeStreaming
// action-IDs into route's server-reference-manifest. Without this Server
// Component layer, importing Server Actions exclusively from a "use client"
// page leaves the action-IDs in the client bundle but absent from the
// runtime route manifest -> x-nextjs-action-not-found 404 on POST.
// References: vercel/next.js PR #77012, Issue #69756, Discussion #58431.

import { saveVaultRecipe } from "@/app/actions/vault";
import { structureRecipeStreaming } from "@/app/actions/vault-stream";
import VaultCreateClient from "./VaultCreateClient";

export default function VaultCreatePage() {
  return (
    <VaultCreateClient
      structureAction={structureRecipeStreaming}
      saveAction={saveVaultRecipe}
    />
  );
}
