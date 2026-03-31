# 🛡️ Zaffaron V2 "Zero Defect" Architecture Audit
**Date:** 2026-03-11
**Auditor:** Dadash / Gemini 3.1 Pro (Subagent)
**Status:** BRUTAL REVIEW

---

## 🛑 EXECUTIVE SUMMARY
The current 5-layer architecture is strong for basic syntax validation but **fundamentally flawed for semantic safety and high-concurrency scale**. It relies too heavily on LLM vibes for reality checks, has critical race conditions that will burn API credits, and Postgres JSONB/Trigger bottlenecks that will crush a Supabase Free Tier at 1M rows.

"Zero Defect" is currently a myth. Here are the brutal gaps.

---

## 🔍 DEEP DIVE: The 10 Focus Areas

### 1. The "Fried Water" Bypass (Hallucination Vulnerability)
**Can a hallucinated recipe pass all 5 layers?**
*YES.* LLMs (GPT 5.2) generate *structurally perfect* nonsense. If a recipe is generated for "Medium-Rare Chicken Tartare" with exact prep times (15m), valid cooking times (0m), and valid JSON structure, Layer 1 & 3 will pass it. Gemini 3.1 (Layer 4) will likely rubber-stamp it because LLMs often prioritize formatting and tone over deep culinary safety unless explicitly prompted with a zero-trust safety prompt.
**Fix:** Layer 4 must include a deterministic rules engine (e.g., meat temperatures vs safety guidelines) and ingredient cross-referencing against a whitelist (USDA DB), not just an LLM secondary review.

### 2. The Homoglyph & Phantom Text Attacks (Encoding Tricks)
**Unicode/encoding tricks to bypass CHECK constraints?**
*YES.* The `CHECK (length(title) >= 10)` constraint counts characters, not visible information.
*   **Invisible text:** `U+200B` (Zero-width space) or 50 regular spaces will pass the 50-char description check. `''` is NOT NULL.
*   **Duplicate bypass:** "Tomato" vs "Tοmato" (using a Greek omicron). This bypasses unique ingredient checks or slug checks, poisoning the DB with visual duplicates.
**Fix:** Apply `TRIM()` in `CHECK` constraints (e.g., `length(TRIM(title)) >= 10`). Normalize text (NFKC) before validation to kill homoglyphs. 

### 3. JSONB Structure Illusions (Validation Gaps)
**What if ingredients is valid JSON but wrong shape?**
Layer 1 says `ingredients>=2` (likely checking array length). But `[1, "garbage"]` or `[{"foo":"bar"}, {"foo":"baz"}]` has a length of 2.
While Layer 3 (Zod) catches the shape, direct DB inserts (Layer 6 via service_role) bypass Zod. If the Trigger expects `->>'name'` and it's missing, it returns `NULL`. The trigger rejects `NULL`, but what if the payload is `{"name": "  "}`? It passes.
**Fix:** Postgres native JSON schema validation using `jsonb_path_exists` or strict trigger extraction.

### 4. API-Burning Race Conditions
**Race conditions in duplicate detection?**
*MASSIVE.* Layer 4 does: `duplicate detection → image gen → DB insert`.
If two workers generate "Chicken Parmesan" concurrently, both check the DB, see no duplicate, and BOTH fire off expensive Image Gen API calls (taking 5-10 seconds). Upon DB insert, the second one fails the `UNIQUE(slug)` constraint. You just burned Image Gen credits for nothing.
**Fix:** Insert an *incomplete/locked* row (or claim the slug in Redis/DB) *before* triggering image generation.

### 5. Sycophancy: When Gemini Lies
**What happens if Gemini verifier ALSO hallucinates?**
Cascading failures. If GPT 5.2 confidently hallucinates a recipe with 5,000 calories per serving but the math (macros) doesn't add up, Gemini 3.1 Pro might gloss over the math because LLMs are bad calculators. If Gemini rubber-stamps a bad recipe, you have poison in the published pool.
**Fix:** Deterministic math checks. Calculate calories via standard macro formulas (4x Carb + 4x Protein + 9x Fat) in standard code, do not trust the LLM to verify its own math.

### 6. The `service_role` Backdoor
**RLS vs service_role bypass vectors**
Since the factory pipeline uses `service_role` (Server-Side), it bypasses Row Level Security. More dangerously, `service_role` bypasses application-level Zod checks if a developer runs a quick fix script or data migration. If the DB constraints aren't bulletproof on their own, bad data will enter.
**Fix:** Treat the DB as the final unyielding fortress. Move as much of the Zod schema into Postgres PL/pgSQL functions or domains.

### 7. Unchecked Wildcard Columns
**Missing constraints on NEW columns**
Columns like `dietary_info` or `nutrition_per_serving` lack deep DB constraints. You can insert `{"calories": "five hundred", "protein": -10}`. Zod protects the front door, but backend scripts, migrations, or manual edits will easily corrupt these JSONB fields.
**Fix:** Add `CHECK` constraints on internal JSONB structure: `CHECK ((nutrition_per_serving->>'calories')::int >= 0)`.

### 8. Slug Chaos
**Slug collision with URL-encoded variants**
`chicken-parmesan`, `chicken--parmesan`, and `chicken-parmesan-` are different slugs but the same recipe. Is Postgres using case-sensitive text? `Chicken-Parmesan` vs `chicken-parmesan`.
**Fix:** Enforce a strict regex in Postgres: `CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')` which prevents trailing/double hyphens and enforces lowercase.

### 9. Empty Strings != NULL
**Empty string vs NULL distinction**
Your `SET NOT NULL` constraints do nothing against empty strings. `author = ''` passes.
**Fix:** `CHECK (author <> '')`, `CHECK (category_slug <> '')`. 

### 10. The 1 Million Row Free Tier Meltdown
**Trigger performance at 1M rows**
Supabase Free Tier (1GB RAM, 2 vCPUs).
If your trigger loops through `jsonb_array_elements` for every single insert/update to check ingredient validity, CPU usage will spike during factory bulk inserts. If the trigger does *any* cross-table SELECTs to check for duplicate ingredients globally, it will cause lock contention and table scans, crashing the database at scale.
**Fix:** Optimize the trigger. Do not do cross-table lookups in a trigger on a free tier. Normalize ingredients into a separate table if global uniqueness is required, or rely purely on indexed constraints. Use `UNLOGGED` tables for the ingestion queue.

---

## 🛠️ THE "ACTUALLY ZERO DEFECT" ACTION PLAN
1.  **Semantic Gatekeeper:** LLMs cannot be the final authority on fact or safety. Use a verified ingredient whitelist (USDA).
2.  **Claim-Then-Generate:** Reserve the slug in the DB *before* calling the image API to stop race conditions.
3.  **Strict DB Types:** Convert loose JSONB into strongly typed arrays or use PostGIS/PgSQL schema extensions.
4.  **Math in Code, Not LLMs:** Calculate macros deterministically.
5.  **Trim and Regex Everything:** `CHECK (TRIM(col) <> '')` across the board.