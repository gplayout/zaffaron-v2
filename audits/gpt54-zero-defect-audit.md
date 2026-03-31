# Zaffaron "Zero Defect" Architecture Audit
**Date:** 2026-03-11  
**Auditor:** GPT-5.4 subagent  
**Verdict:** **This is not a zero-defect architecture. Right now it is a porous draft pipeline with a few good ideas, not a publish-safe system.**

---

## Executive summary

If I were trying to get a bad recipe published, I would **not** attack the fancy AI parts first.
I would use one of the boring paths:

1. **Use the leaked `service_role` key** and write straight to Supabase.
2. **Use one of the existing scripts** that can publish directly.
3. **Exploit weak publish checks** with empty strings / empty JSON objects / whitespace / Unicode junk.
4. **Clobber a reviewed row with `upsert`** from a later draft job.
5. **Abuse the fact that your “verifier” is another LLM**, not a deterministic safety gate.

### Brutal bottom line
- **Layer 1 is too shallow.** It mostly checks presence and length, not meaning.
- **Layer 2 is incomplete and mismatched to the current schema.**
- **Layer 3 is basically missing in the actual repo.** I found a JS validator script, not a real Zod enforcement layer.
- **Layer 4 is not a fortress; it is a polite suggestion.** Multiple scripts bypass it.
- **Layer 5 is detective only, not preventive — and I did not find the actual monitoring view in repo code.**

If your goal is **1M+ recipes with ZERO bad ones published**, this architecture in its current form is nowhere close.

My honest score for the overall publish safety: **2/10**.

---

## Evidence from the actual repo + live DB

I did not write to production. I only read.

### Repo findings I verified
- `scripts/ingest-recipe.mjs` can publish directly with `--publish`.
- `scripts/import-golden.mjs` inserted rows with `published: true` directly.
- `scripts/ingest-recipe.mjs` uses `upsert(..., { onConflict: 'slug' })` against the live table.
- `scripts/demo-e2e.mjs` writes `verification_status: 'verified'` from the generator side.
- The repo contains **live credentials in plain text**:
  - Supabase `service_role` token
  - direct Postgres password/connection string
  - OpenAI key
  - Google key

### Live DB evidence I verified via the committed service-role token
- Live DB currently reports **1,557 rows total**.
- **41 published** rows.
- **1,516 unpublished** rows.
- **40 published rows are missing `nutrition_per_serving`.**
- **40 published rows are missing `dietary_info`.**
- **11 published rows are `verification_status = 'verified'` but still have empty `source_urls = []`.**
- **All 1,516 unpublished rows still have `published_at` set**, which means `published_at` is already semantically polluted.

### Why this matters
Those live states are **incompatible** with the proposed “zero defect” rules.
So one of these is true:
1. the new rules are not actually deployed,
2. they were deployed differently than described,
3. they were deployed with bypasses / exceptions,
4. or production data is already in a state the architecture claims should be impossible.

Any of those is bad.

---

## Layer scores

| Layer | Score | Verdict |
|---|---:|---|
| Layer 1: DB constraints | **4/10** | Better than nothing, but easy to bypass with empty shells, whitespace, and semantically bad data. |
| Layer 2: Trigger validation | **3/10** | Too narrow, schema-mismatched, and not enough to protect publish safety. |
| Layer 3: Zod schema | **1/10** | In actual repo this is effectively absent as an enforced layer. |
| Layer 4: Factory pipeline | **3/10** | Good concept, weak enforcement; multiple direct-write bypasses exist. |
| Layer 5: Monitoring view | **2/10** | Detective only, and I did not find the actual view implementation. |

---

## The biggest holes, like an attacker would use them

## 1) The easiest bypass is not SQL trickery — it is your leaked credentials

This is the most serious issue.

Because the repo contains a live `service_role` token and direct DB credentials, an attacker does **not** need to beat RLS, Zod, Gemini, or your app.
They can write straight to Supabase.

### Impact
- publish garbage directly
- overwrite reviewed recipes
- backfill fake `verification_status = 'verified'`
- null out good metadata
- mass-edit slugs, images, or content

### Rating
**Critical**

### Fix
- **Rotate immediately**:
  - Supabase service-role key
  - Supabase DB password
  - OpenAI key
  - Google key
- Remove all secrets from:
  - `.env.local` checked into accessible locations
  - `scripts/*.mjs`
  - any audit/demo files
- Stop hardcoding secrets in scripts. Use environment variables only.
- Assume the current service-role token is burned.

---

## 2) Your live table is still directly writable by scripts that bypass the “pipeline”

You described this path:

`GPT gen -> Zod -> Gemini verify -> duplicate check -> image -> DB -> unpublished`

That is **not the only write path** in the repo.

### Actual bypasses I found
- `scripts/import-golden.mjs` writes directly with `published: true`
- `scripts/ingest-recipe.mjs --publish` writes directly
- `scripts/demo-e2e.mjs` writes `verification_status: 'verified'`
- multiple scripts use service-role credentials directly

### Impact
Your real architecture is not 5 layers.
It is:

`any script with a token -> live table`

That means the pipeline is optional.
Optional safety is fake safety.

### Fix
- **No script should write `published`, `published_at`, `verification_status`, or `verified_by` directly.**
- Remove `--publish` from ingestion scripts.
- Remove direct `published: true` writes from import scripts.
- Publish only through a single DB function / RPC: `publish_recipe(...)`.

---

## 3) `upsert` on `slug` is a silent clobber path

This is one of the nastiest bugs because it looks convenient.

`upsert(..., { onConflict: 'slug' })` means a later run can silently overwrite a previously reviewed recipe.

### Attack path
1. Good recipe exists for slug `ghormeh-sabzi`
2. Later draft job generates worse data for same slug
3. Script upserts by slug
4. Last writer wins
5. Published row is degraded or unpublished or partially corrupted

### Why this is worse than a duplicate insert failure
A unique violation would at least stop the write.
`upsert` turns a duplicate into an overwrite.

### Fix
- **Do not upsert directly into the live table.**
- Split storage into:
  - `recipe_drafts` / `recipe_candidates`
  - `recipes_live`
- Publish by promoting a specific reviewed draft into live.
- Add optimistic locking / versioning if you must keep one table.

---

## 4) Layer 1 checks presence, not validity

Your proposed DB constraints are shallow.
They stop some junk, but not bad recipes.

### Specific weaknesses

#### 4.1 `NOT NULL` does not stop empty strings
These all pass `NOT NULL`:
- `''`
- `'     '`
- zero-width characters
- non-breaking spaces

So `title`, `description`, `author`, `category_slug`, `cuisine_slug` can be garbage while still passing.

#### 4.2 `char_length(...)` counts invisible junk
A title of 10 zero-width characters or 60 spaces satisfies length checks.

#### 4.3 Publish checks only require non-NULL shells
These can pass your publish gates:
- `image_url = ''`
- `nutrition_per_serving = '{}'::jsonb`
- `dietary_info = '{}'::jsonb`

Because your checks are only:
- `image_url IS NOT NULL`
- `nutrition_per_serving IS NOT NULL`
- `dietary_info IS NOT NULL`

That is not meaningful validation.

#### 4.4 No source requirement at publish time
A recipe can be published with:
- zero citations
- fake citations
- `source_urls = []`

And I verified **11 published verified rows already have empty `source_urls`**.

#### 4.5 No validation of JSON internal structure
`ingredients` and `instructions` only need array length.
These can still pass layer 1:
- `[{}, {}]`
- `[{"name":"  "}, {"name":"\u200b\u200b"}]`
- instruction text that is 20 spaces

#### 4.6 No publish-state integrity
No rule currently guarantees:
- `published -> verification_status = 'verified'`
- `published -> verified_by is not null`
- `published -> published_at is not null and meaningful`
- `not published -> published_at is null`

And live data already shows `published_at` is polluted across unpublished rows.

#### 4.7 No taxonomy integrity
`category_slug` and `cuisine_slug` are free text.
No foreign keys to canonical taxonomies.
Typos become production categories.

#### 4.8 No semantic safety checks
Layer 1 cannot detect:
- raw chicken / unsafe poultry instructions
- unboiled kidney beans
- fake cultural claims
- vegetarian recipe containing meat
- halal recipe containing pork
- gluten-free recipe using soy sauce / flour
- impossible nutrition math

### Fix
Move from “non-null” to “nonblank + structurally valid + publish-state valid”.

---

## 5) Layer 2 trigger is too weak and is mismatched to the actual schema

Your trigger uses:
- `elem->>'name'`

But the actual recipe payloads in repo use:
- `item`

That is a major red flag.

### What that means
Either:
1. the trigger is not actually deployed,
2. the trigger is deployed but not attached,
3. or it would reject legitimate current payloads.

Any of those means the layer is not trustworthy.

### Additional holes in the trigger

#### 5.1 Missing `CREATE TRIGGER`
You showed `CREATE FUNCTION`, but not the actual `CREATE TRIGGER` statement.
Without that, the trigger is dead code.

#### 5.2 Duplicate ingredient check is easy to bypass
This can evade `count(DISTINCT elem->>'name')`:
- `Salt`
- `salt`
- `salt `
- `s a0alt`
- `salt 200b`
- `salt (for garnish)`

Same ingredient, different strings.

#### 5.3 Legit recipes may be falsely rejected
Some recipes intentionally repeat ingredients in separate uses:
- onion, divided
- oil for frying + oil for garnish
- garlic in base + garlic in topping

A naive duplicate rule can reject good recipes.

#### 5.4 Whitespace and gibberish still pass
This passes your current length logic:
- ingredient name = `'  '` (length 2)
- instruction text = 20 spaces
- instruction text = `aaaaaaaaaaaaaaaaaaaa`

#### 5.5 Nutrition validation is fragile
This line is brittle:

```sql
(NEW.nutrition_per_serving->>'calories')::int
```

Problems:
- `'500 kcal'` throws
- `'12.5'` throws
- `''` throws
- missing key can slip through as NULL logic
- only calories are checked; other nutrition fields can still be nonsense

#### 5.6 Trigger validates too little of a 35+ field schema
It says nothing about:
- dietary consistency
- allergen consistency
- source URLs
- image alt/source
- SEO fields
- cost estimate
- equipment
- cultural_significance
- regional_variations
- common_mistakes
- make_ahead

### Fix
Use validation functions aligned to the actual schema keys (`item`, not `name`) and gate **all publish-critical fields**, not just calories.

---

## 6) Layer 3 is not actually there in enforceable form

You said Layer 3 is Zod.
In the repo, I found:
- TS interfaces
- a JS validator script
- no actual enforced Zod schema in the ingest/publish path

That means this layer is currently aspirational, not real.

### Problems in the current validator (`scripts/validate-recipe.mjs`)
- warnings do **not** block ingestion
- source URLs missing = only a warning
- no validation for rich fields like `dietary_info`, `nutrition_per_serving`, `equipment`, etc.
- no Unicode normalization
- no anti-whitespace checks
- no actual food-safety rules
- no citation verification
- no contradiction checks

### Example bad publish path
A recipe can:
- have no source URLs
- have fake dietary claims
- have impossible nutrition
- still pass validation if only warnings are raised
- then be published via `--publish`

### Fix
Implement a real Zod schema and use it in every ingest path.
More importantly: **Zod must not be the final gate.** The DB must still refuse invalid publish transitions.

---

## 7) The AI verifier is not a zero-defect verifier

Using GPT to generate and Gemini to verify is better than one model, but it is still **LLM vs LLM**.
That is not zero-defect.

### Failure modes
- both models accept plausible nonsense
- both models miss unsafe culinary technique
- both models hallucinate cultural claims
- both models are bad at precise nutrition math
- both models are sycophantic toward well-structured text

### Examples that can easily slip through
- “medium-rare chicken”
- “boil kidney beans for 10 minutes total”
- “gluten-free” while using regular soy sauce
- “vegan” with yogurt / butter / ghee / kashk
- kashk incorrectly substituted with yogurt as if equivalent
- invented regional history
- fake equipment or timing claims

### Fix
Add deterministic rules that are not model-dependent:
- ingredient safety rules
- contradiction rules
- nutrition math checks
- allergen inference
- taxonomy whitelists
- source URL requirement + domain allowlist or review list

---

## 8) Duplicate detection is underspecified and race-prone

`duplicate check -> image -> DB insert` is a credit-burning race.

### Concurrent write failure
Two workers can both:
1. check for duplicates
2. see none
3. generate images
4. both attempt write

If you use plain insert, one fails after expensive work.
If you use `upsert`, one silently overwrites the other.
Both are bad.

### Fix
Claim the slug before expensive work.
Use either:
- a DB reservation row
- advisory lock
- job queue uniqueness key

And do **not** use live-table upsert as your dedupe mechanism.

---

## 9) Partial updates can bypass the spirit of the system

Even if draft insertion is strict, partial updates can still smuggle garbage through.

### Example
1. Insert a mostly valid unpublished row
2. Later update only:
   - `published = true`
   - `image_url = ''`
   - `nutrition_per_serving = '{}'`
   - `dietary_info = '{}'`
3. Proposed layer 1 passes because values are not NULL
4. Trigger passes because calories key is absent
5. Bad recipe is live

### Fix
When a row is published **or already published**, validate the full publish-critical payload every time.
Not just the changed columns.

---

## 10) The monitoring view is too late even if built perfectly

A monitoring view can tell you a published recipe is broken.
That means the defect already escaped.

### Monitoring is necessary, but not sufficient
Layer 5 should exist, but it is a **tripwire**, not a shield.
And I did not find the actual view implementation in the repo.

### Fix
Keep the view, but treat it as a post-deploy anomaly detector:
- never as a substitute for publish gating
- alert on any published row with violations
- auto-unpublish only if you are comfortable with that blast radius

---

## Specific edge cases you asked me to consider

## NULL vs empty / whitespace
- `NOT NULL` is weak
- `''`, `'   '`, zero-width chars, NBSP all pass unless trimmed/normalized
- empty JSON object `{}` passes `IS NOT NULL`
- empty array `[]` may pass if not specifically blocked

## Unicode tricks
- homoglyph ingredient duplicates
- zero-width joiners to evade duplicate detection
- Persian/Arabic character variants causing near-duplicates
- visually identical titles with different code points

## JSON injection / structure abuse
- arrays of wrong-shaped objects
- strings where numbers are expected
- JSON shell objects with required keys missing
- overlong fields / giant arrays causing performance pain

## Concurrent writes
- duplicate race before image generation
- upsert clobbering reviewed rows
- no optimistic locking / revision model

## RLS bypass
- `service_role` bypasses RLS
- committed token makes this practical, not theoretical
- direct Postgres password is even worse

## Hallucination patterns
- structurally valid nonsense
- invented cultural claims
- fake substitutions
- unsafe cooking instructions
- impossible time/temperature pairings
- contradictory dietary flags

---

## Concrete fixes: SQL / schema

## 1) Add real helper functions

```sql
create or replace function zc_nonblank(v text, min_len int, max_len int)
returns boolean
language sql
immutable
as $$
  select v is not null
     and char_length(
           btrim(
             regexp_replace(
               replace(replace(replace(replace(v, chr(160), ' '), chr(8203), ''), chr(8204), ''), chr(8205), ''),
               '\s+', ' ', 'g'
             )
           )
         ) between min_len and max_len;
$$;

create or replace function zc_norm_token(v text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(coalesce(v, ''), '[^[:alnum:]]+', '', 'g'));
$$;
```

## 2) Validate JSON structure in DB, not only array length

```sql
create or replace function zc_ingredients_valid(j jsonb)
returns boolean
language sql
immutable
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) between 2 and 100
     and not exists (
       select 1
       from jsonb_array_elements(j) e
       where jsonb_typeof(e) <> 'object'
         or not zc_nonblank(e->>'item', 2, 120)
     )
     and (
       select count(*) = count(distinct zc_norm_token(e->>'item'))
       from jsonb_array_elements(j) e
     );
$$;

create or replace function zc_instructions_valid(j jsonb)
returns boolean
language sql
immutable
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) between 3 and 50
     and not exists (
       select 1
       from jsonb_array_elements(j) with ordinality t(e, ord)
       where jsonb_typeof(e) <> 'object'
         or not zc_nonblank(e->>'text', 30, 1500)
         or (e->>'step') !~ '^[0-9]+$'
         or (e->>'step')::int <> ord::int
     );
$$;

create or replace function zc_source_urls_valid(j jsonb, min_count int default 2)
returns boolean
language sql
immutable
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) >= min_count
     and not exists (
       select 1
       from jsonb_array_elements_text(j) u
       where u !~ '^https://'
     );
$$;
```

## 3) Make publish-state rules explicit

```sql
alter table recipes_v2
  alter column published set default false,
  alter column published set not null;

alter table recipes_v2
  add constraint chk_title_nonblank
    check (zc_nonblank(title, 10, 200)),
  add constraint chk_slug_format_strict
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint chk_description_nonblank
    check (zc_nonblank(description, 50, 1000)),
  add constraint chk_author_nonblank
    check (zc_nonblank(author, 2, 120)),
  add constraint chk_category_slug_format
    check (category_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint chk_cuisine_slug_format
    check (cuisine_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  add constraint chk_ingredients_valid
    check (zc_ingredients_valid(ingredients)),
  add constraint chk_instructions_valid
    check (zc_instructions_valid(instructions)),
  add constraint chk_publish_gate
    check (
      published = false or (
        zc_nonblank(image_url, 8, 1000)
        and zc_nonblank(image_alt, 8, 200)
        and zc_source_urls_valid(source_urls, 2)
        and verification_status = 'verified'
        and zc_nonblank(verified_by, 2, 120)
        and published_at is not null
      )
    ),
  add constraint chk_unpublished_has_no_published_at
    check (published = true or published_at is null);
```

## 4) Add a real publish trigger

```sql
create or replace function zc_recipe_state_guard()
returns trigger
language plpgsql
as $$
begin
  -- normalize publish timestamp semantics
  if new.published then
    if new.published_at is null then
      new.published_at := now();
    end if;
  else
    new.published_at := null;
  end if;

  -- published rows must stay valid on every update
  if new.published then
    if new.verification_status <> 'verified' then
      raise exception 'Cannot publish without verification_status=verified';
    end if;

    if not zc_ingredients_valid(new.ingredients) then
      raise exception 'Invalid ingredients payload';
    end if;

    if not zc_instructions_valid(new.instructions) then
      raise exception 'Invalid instructions payload';
    end if;

    if not zc_source_urls_valid(new.source_urls, 2) then
      raise exception 'Published recipe must have >= 2 https source_urls';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_zc_recipe_state_guard on recipes_v2;
create trigger trg_zc_recipe_state_guard
before insert or update on recipes_v2
for each row
execute function zc_recipe_state_guard();
```

---

## Concrete fixes: app / pipeline

## 1) Replace direct table writes with state-transition RPCs

### Bad
```ts
await supabase.from('recipes_v2').upsert(recipe, { onConflict: 'slug' })
```

### Good
```ts
await supabase.from('recipe_drafts').insert(draft)
await supabase.rpc('publish_recipe', {
  p_draft_id: draftId,
  p_verified_by: reviewer,
})
```

## 2) Remove publish from ingestion scripts
- delete `--publish`
- delete direct `published: true`
- ingestion should create drafts only
- only `publish_recipe()` can make content live

## 3) Implement a real Zod layer
At minimum:
- `.strict()` on every object
- normalize strings with NFKC + trim + zero-width stripping
- validate `dietary_info`, `nutrition_per_serving`, `equipment`, `source_urls`, `cost_estimate`, `common_mistakes`, `regional_variations`
- `superRefine()` for contradiction checks

### Example contradiction rules
- vegetarian + ingredient contains `beef|chicken|lamb|fish` -> fail
- halal + ingredient contains `pork|ham|bacon` -> fail
- gluten_free + ingredient contains `flour|breadcrumbs|soy sauce` without GF note -> fail
- kashk recipe described as yogurt without explicit substitution note -> warning/block

## 4) Add deterministic safety gates
Do not let Gemini be the final safety judge.
Use code/rules for:
- poultry minimum-cook patterns
- kidney bean handling
- cassava / raw flour / pork contradictions
- macro calorie consistency
- ingredient/instruction cross-check
- source count + source domain review list

## 5) Stop using the live table as both draft store and published store
For zero-defect, split them:
- `recipe_candidates`
- `recipes_live`
- `recipe_publication_events`

That instantly kills many partial-update and upsert-clobber bugs.

---

## Monitoring view you should have

This is worth having, but remember: it is **after-the-fact detection**.

```sql
create or replace view recipe_publish_violations as
select
  id,
  slug,
  array_remove(array[
    case when published and not zc_nonblank(title, 10, 200) then 'bad_title' end,
    case when published and not zc_nonblank(description, 50, 1000) then 'bad_description' end,
    case when published and not zc_ingredients_valid(ingredients) then 'bad_ingredients' end,
    case when published and not zc_instructions_valid(instructions) then 'bad_instructions' end,
    case when published and not zc_nonblank(image_url, 8, 1000) then 'missing_image' end,
    case when published and verification_status <> 'verified' then 'not_verified' end,
    case when published and not zc_source_urls_valid(source_urls, 2) then 'missing_sources' end,
    case when published and published_at is null then 'missing_published_at' end
  ], null) as violations
from recipes_v2
where published = true;
```

Then alert on:

```sql
select *
from recipe_publish_violations
where array_length(violations, 1) > 0;
```

---

## What I would do immediately, in order

## P0 — today
1. **Rotate all exposed secrets**.
2. Remove `--publish` and direct `published: true` writes.
3. Ban direct writes to live publish-state columns outside one function.
4. Stop using `upsert` on the live table.

## P1 — next
5. Add DB helper functions + publish-gate constraints.
6. Fix field mismatch: `item` vs `name`, lowercase vs uppercase difficulty, etc.
7. Make `published_at` null for unpublished rows and meaningful for published rows only.
8. Require `verified_by`, `source_urls >= 2`, `image_alt`, and non-shell nutrition/dietary payloads for publish.

## P2 — then
9. Split draft vs live tables.
10. Add deterministic culinary safety rules.
11. Add a real anomaly view + alerts.
12. Add optimistic locking / revisioning.

---

## Final verdict

The architecture sounds serious, but the actual enforcement is not.

Right now the easiest path to a bad recipe getting published is:
- use leaked credentials,
- use a direct-write script,
- exploit `upsert`,
- or pass shell values through weak publish checks.

**The biggest lie in the current design is that “publish safety” lives in five independent layers. It doesn’t.**
A determined or careless write path can skip most of them.

If you want **ZERO bad published recipes**, you need three non-negotiables:
1. **no direct live-table publishing except one guarded DB function**
2. **draft/live separation**
3. **deterministic safety rules in addition to LLM review**

Until those exist, this is not zero-defect. It is just better-decorated risk.
