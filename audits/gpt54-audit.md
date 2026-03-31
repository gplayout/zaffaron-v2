# Zaffaron v2 Audit

_Date: 2026-03-10_

## Executive Summary

This is a **good restart** from the previous over-engineered mess. The codebase is small, readable, and buildable. That alone is a big win.

But rok-go: **this is still a prototype, not a production-grade “recipe engine.”**

The biggest issues are not fancy engineering problems. They are the boring things that actually decide whether a recipe site lives or dies:

1. **Recipe SEO foundation is incomplete** — no Recipe JSON-LD, no canonical tags, no share images on recipe pages.
2. **The “verified recipe” promise is not backed by any real system** — no source tracking, no reviewer fields, no QA workflow, no proof.
3. **Security and architecture are sloppier than they need to be** — server pages use the Supabase service role key for public reads.
4. **Publishing workflow is too weak for 100 recipes** — direct DB editing with loose schema + AI content = future garbage.
5. **The content strategy is too broad** — “world-class recipes from everywhere” is how a new domain gets buried by incumbents.

If you fix the editorial/SEO foundation now, this can become a strong Phase 1 site.
If you start mass-producing 100 AI recipes on the current foundation, you will create a thin, untrusted commodity site that is hard to recover.

---

## What I Verified

I read all 16 requested files and also did a lightweight reality check.

### Build / lint / live checks
- `npm run build` ✅ passed
- `npm run lint` ✅ passed with **1 warning** in `scripts/seed.mjs` (`existing` unused)
- Build output shows:
  - `/` = static with `revalidate = 60`
  - `/recipe/[slug]` = **dynamic SSR on demand**
  - `/sitemap.xml` = **static**
- Live site checks on `https://zaffaron.com/recipe/classic-ghormeh-sabzi` confirmed:
  - **No canonical tag**
  - **No JSON-LD**
  - **No `og:image`**

That matters. I’m not guessing here.

---

## Prioritized Findings

### CRITICAL
1. **Recipe pages are missing the SEO primitives recipe sites depend on**
   - No Recipe JSON-LD
   - No canonical tags
   - No per-recipe share image / `og:image`
   - Impact: weak rich results eligibility, weaker crawl clarity, weaker social CTR.

2. **“Verified recipes” is currently marketing copy, not an operational system**
   - No source URLs
   - No reviewer/verifier fields
   - No verification status
   - No recipe QA checklist in the data model or workflow
   - Impact: trust collapse, inconsistent content, eventual SEO quality problems.

### HIGH
3. **`SUPABASE_SERVICE_ROLE_KEY` is being used for public page rendering**
   - This bypasses RLS and is unnecessary for public reads.

4. **Recipe pages are SSR’d dynamically and hit the database twice per request**
   - Once in `generateMetadata`
   - Once in the page itself
   - Verified by build output: route is dynamic.

5. **`sitemap.ts` is static and can go stale until redeploy**
   - New recipes added directly in Supabase may not appear in the sitemap promptly.

6. **Search uses raw user input inside a PostgREST filter string**
   - Brittle, easy to break, and not future-proof.

7. **The schema is too loose for the content plan**
   - No `published_at`
   - No verification fields
   - No stable taxonomy slugs
   - Weak constraints
   - App types assume data integrity that the DB does not enforce.

8. **The content strategy is too broad for a new domain**
   - Randomly covering Persian + Indian + Italian + Thai + French + Mexican + Japanese + Greek + American is a topical authority disaster.

### MEDIUM
9. **Error handling hides real failures as empty states or 404s**
10. **Wildcard remote image config is too permissive**
11. **Accessibility basics are missing in search/navigation UI**
12. **TypeScript is “strict” on paper, but runtime validation is weak**
13. **Plan ordering is wrong: analytics/Search Console/schema/taxonomy should happen before bulk content**

### LOW
14. **Unused dependencies / lint warning / multiple lockfile warning**

---

# A. Plan Audit

## Verdict
**Phase 1 is directionally right, but not complete and not ordered well enough.**

The good part: it is much simpler than the failed previous attempt.

The bad part: it still underestimates what a recipe site needs to be credible and rankable.

## Is Phase 1 realistic?
### Technically: **Yes**
- Next.js + Supabase + 100 recipe pages is absolutely doable.
- This is not a complex build.

### Strategically: **Only partly**
The plan assumes that once 100 “verified” recipes exist, organic traffic will follow.
That is not how recipe SEO works in 2026.

A new site with broad, generic recipes will get smashed by:
- Allrecipes
- Serious Eats
- Food Network
- NYT Cooking
- Delish
- niche creator sites with original photos and tested recipes

If Zaffaron tries to be “everything for everyone” in Phase 1, it will be weak everywhere.

## Is the plan complete?
**No. Important things are missing.**

### Missing steps that will cause pain later

#### 1. Search Console + Bing Webmaster setup should be Step 1, not Step 5
You need indexing, coverage, query, CTR, and sitemap feedback from day zero.
Without this, you’re publishing blind.

#### 2. Recipe structured data should not be Step 4
For a recipe site, JSON-LD is not “later polish.” It is core infrastructure.
It should be there before scaling content.

#### 3. Taxonomy design should happen before 100 recipes
You plan `/category/[name]` and `/cuisine/[name]` later, but the DB currently stores category/cuisine as loose text.
That means you are about to create 100 recipes before you’ve locked the taxonomy.
That is backwards.

#### 4. Minimal editorial workflow is missing
“No admin panel” is fine.
“No content operations tooling at all” is not fine.
You need at minimum:
- a recipe ingestion template
- validation checks
- source tracking
- verification status
- publish checklist
- slug rules

#### 5. Trust pages are missing from the plan
For a site built around “verified recipes,” Phase 1 should include:
- About
- Contact
- Editorial policy
- Recipe testing / verification policy
- Privacy policy

These are not fluff. They support trust, compliance, and E-E-A-T signals.

#### 6. Redirect / slug-change policy is missing
When recipe titles improve, slugs will change.
You need a redirect strategy now, not after indexing starts.

#### 7. Error monitoring is missing
At minimum, use Vercel logs + alerts or lightweight error monitoring.
Right now several failures would silently look like “no recipes found.”

#### 8. Image pipeline decision is too late
If you wait until after dozens of recipes, you’ll end up with inconsistent image sources, dimensions, licensing, and alt text.
Define the image policy before bulk publishing.

## Is the step ordering good?
**No. I would reorder it.**

### Current ordering problem
You have:
- Step 2: visuals/images
- Step 3: 50 verified recipes
- Step 4: 50 more recipes + taxonomy pages + recipe JSON-LD
- Step 5: analytics/performance

That sequence is wrong.

### Better Phase 1 ordering
1. **Foundation + trust + measurement**
   - stack, deploy, Search Console, Bing, analytics, trust pages, metadata base, schema foundation
2. **Taxonomy + content model**
   - lock categories/cuisines/slugs, add verification fields, image policy, published workflow
3. **Recipe template + verification workflow**
   - create the checklist before scaling
4. **First 20–30 excellent recipes**
   - not 100 mediocre ones
5. **Category/cuisine hubs + internal linking**
6. **Scale to 100 recipes with ISR, schema, images, related recipes**
7. **Performance tuning / rich-result cleanup / iteration**

## Exit criteria audit
Current exit criteria:
1. 100+ verified recipes live
2. Site loads < 2s on mobile
3. 1,000+ monthly visitors (organic)
4. Lighthouse score 90+
5. At least 10 recipes ranking on Google page 1-2

### What’s wrong with them?

#### `100+ verified recipes live`
Good in spirit, but meaningless unless “verified” is operationally defined.
Right now it is not.

#### `Site loads < 2s on mobile`
Too vague.
Use real web vitals, not a vague stopwatch metric.

Better:
- LCP < 2.5s at P75
- INP < 200ms at P75
- CLS < 0.1 at P75

#### `1,000+ monthly visitors (organic)`
This is a lagging business metric, not a delivery metric.
It is useful, but not a good gate by itself.
A great site can miss this temporarily; a mediocre site can hit it from a few lucky keywords.

#### `Lighthouse 90+`
Fine as a guardrail, not as a goal.
A 90 Lighthouse score does not mean the site deserves rankings.

#### `10 recipes ranking on Google page 1-2`
Too ambiguous and partly outside your control.
For which queries? Branded? Non-branded? Long-tail? Head terms?
This is not a clean exit criterion.

### Better Phase 1 exit criteria
Use a mix of controllable and outcome metrics:

#### Product / quality gates
- 100 published recipes that each pass a documented QA checklist
- All recipe pages emit valid Recipe JSON-LD
- All indexed pages have canonicals, metadata, and share images
- Category/cuisine hub pages exist and are internally linked
- No major crawl/index errors in Search Console
- Sitemap updates without manual redeploys

#### Outcome signals
- 80%+ of published recipes indexed
- 25+ recipes receiving impressions in Search Console
- 10+ recipes with rich result eligibility
- organic traffic trend is upward for 8+ weeks
- a defined cluster of target keywords reaching top 20

## “Not doing” list audit
Most of it is correct:
- No auth ✅
- No marketplace yet ✅
- No mobile app ✅
- No AI chat ✅
- No multilingual yet ✅
- No huge automation pipeline ✅

### But one thing should NOT be omitted from Phase 1
**A minimal editorial workflow/tooling layer absolutely should be in Phase 1.**

Not a full admin panel.
But at least one of these:
- a validated seed/import script
- a simple internal form
- structured markdown/JSON source files + publish script
- a verification checklist stored with each recipe

Direct DB editing for 100 recipes is how inconsistencies, bad slugs, null fields, and broken JSON enter the system.

---

# B. Architecture Audit

## 1. Is Next.js 16 + Supabase the right choice?
## Verdict: **Yes, for Phase 1**
This is a good stack for the current goal.

### Why it fits
- Next.js App Router is strong for content sites, metadata, sitemaps, ISR.
- Supabase Postgres is more than enough for 100–500 recipes.
- Vercel deployment is fast and simple.
- You avoided the classic early-stage mistake of building a giant CMS/platform before product fit.

### Where it goes wrong currently
The stack is fine.
The **usage** is not yet fine:
- unnecessary service role usage
- SSR where static/ISR would be better
- weak editorial model for “verified” content

So: **keep the stack, fix the architecture choices.**

## 2. Is the single-table schema future-proof?
## Verdict: **Good for now, not future-proof, and missing several important fields**

For Phase 1, a single `recipes_v2` table is reasonable.
Do **not** split into 12 tables just because it feels “proper.” That would repeat the same over-engineering mistake.

But the current table is too naive for your actual roadmap.

### What’s good
- simple
- readable
- enough for MVP recipe rendering
- JSONB for ingredients/instructions is pragmatic at this stage

### What’s weak or missing

#### Missing columns I would add now
1. **`published_at TIMESTAMPTZ`**
   - Needed for real publishing chronology, sitemap quality, and editorial scheduling.

2. **Verification fields**
   - `verification_status` (`draft`, `ai_draft`, `reviewed`, `verified`)
   - `verified_by`
   - `verified_at`
   - `source_urls JSONB`
   - `notes_internal` or `verification_notes`

3. **Image fields**
   - `image_alt`
   - `image_source`
   - maybe `og_image_url`

4. **Taxonomy slugs or normalized taxonomy model**
   - `category_slug`
   - `cuisine_slug`

5. **Author / reviewer identity**
   - Even if it is just one editor for now.

#### Fields that should probably be constrained harder
- `published` should be `NOT NULL`
- `tags` should be `NOT NULL DEFAULT '{}'`
- `created_at` / `updated_at` should be `NOT NULL`
- `prep_time_minutes >= 0`
- `cook_time_minutes >= 0`
- `servings > 0`
- `calories_per_serving >= 0` when present
- consider forcing `slug = lower(slug)`

#### Taxonomy issue
`category` and `cuisine` are free text.
That is fine for a prototype.
It is **not** fine if you plan dedicated category/cuisine pages.

If you don’t lock the taxonomy now, you will eventually get nonsense like:
- `middle eastern`
- `Middle Eastern`
- `Middle-East`
- `middle_eastern`

That becomes an SEO and UX mess fast.

### Index audit
Current indexes:
- `slug`
- `category`
- `published WHERE published = true`

#### Problems
1. **`idx_recipes_v2_slug` is redundant**
   - `slug TEXT UNIQUE` already creates an index.

2. **Homepage query is not properly indexed**
   - Current homepage query:
     - `published = true`
     - order by `created_at desc`
     - limit 24
   - Better index:
     ```sql
     CREATE INDEX idx_recipes_v2_published_created_at
     ON recipes_v2 (created_at DESC)
     WHERE published = true;
     ```

3. **Future taxonomy pages need better indexes**
   - likely `(category_slug, published, published_at desc)`
   - likely `(cuisine_slug, published, published_at desc)`

4. **Search needs a plan**
   - Right now no FTS index exists.
   - For 100 recipes this is okay.
   - For growth, use a generated `tsvector` + GIN index or a dedicated search function.

## 3. SSG vs ISR vs SSR for recipe pages
## Verdict: **Use SSG + ISR, not full SSR**

Recipes are classic ISR content.
They change infrequently and need good SEO and fast TTFB.

### Current state
`/recipe/[slug]` builds as **dynamic SSR**.
That is not ideal.

### Recommended strategy
#### Homepage
- **ISR** (`revalidate` 60–300 seconds is fine)

#### Recipe detail pages
- **Pre-render known slugs with `generateStaticParams()`**
- Add **ISR** (`revalidate` 1 hour or 1 day depending on publish cadence)
- If you add recipes directly in DB, either:
  - rely on ISR + dynamic fallback for unknown slugs, or
  - trigger on-demand revalidation when publishing

#### Category/cuisine pages
- **SSG + ISR**

#### Search page
- Either:
  - client-side search for small dataset, or
  - server-rendered search with URL params and `noindex`

But recipe pages themselves should not be SSR by default.

### Extra performance issue
`generateMetadata()` and the page both query Supabase separately.
That means two DB hits per recipe request.

Use a shared cached function, e.g. a `getRecipeBySlug()` wrapped with `cache()` / `unstable_cache()`.

## 4. SEO architecture issues
This is the area with the most missing foundation.

### Major issues

#### 1. No Recipe JSON-LD
This is a serious gap for a recipe site.
You want eligibility for recipe-rich features, better entity understanding, and cleaner extraction of time/ingredients/etc.

#### 2. No canonical URLs
Verified live.
This is basic SEO hygiene.

#### 3. No per-recipe social image
Verified live: no `og:image` on the checked recipe page.
If there is no image, social sharing looks weak and generic.

#### 4. No `metadataBase`
In App Router metadata, this is helpful for absolute URLs and future-proof metadata behavior.

#### 5. No trust / editorial pages
For “verified recipe” positioning, this is missing.

#### 6. Internal linking is too weak
Right now the site is basically:
- homepage grid
- recipe page
- search

That is not enough crawl architecture.
You need:
- category hubs
- cuisine hubs
- related recipes
- breadcrumbs
- maybe ingredient/theme hubs later

#### 7. Sitemap freshness is weak
`sitemap.ts` is static right now.
That is bad for a content site where recipes may be inserted after deploy.

#### 8. Thin-page risk
The “no fluff” positioning is good.
But don’t confuse “no fluff” with “thin content.”

Recipe pages still need helpful depth:
- substitutions
- key technique notes
- storage/reheating
- make-ahead notes
- troubleshooting
- equipment notes when relevant

If pages become just title + ingredients + steps, they may be too commodity-like.

## 5. Image strategy recommendations
## Verdict: **Do not build this on random Unsplash hotlinks and definitely don’t lean on obvious AI food slop**

### My recommendation
#### Best long-term option
- Original photography for the priority recipes that matter most
- Store optimized images in your own controlled storage/CDN

#### Good enough Phase 1 option
- High-quality licensed stock or carefully selected rights-safe images
- Consistent aspect ratio and art direction
- Store or proxy through your own controlled image path where possible

### Avoid
- a random mix of Unsplash + AI + scraped images
- obvious AI-generated food photos that look fake on close inspection
- hotlinking everything forever

### Why
In 2026, recipe trust is visual too.
Users can smell fake food photography.
So can platforms and raters.

### Image system requirements for Phase 1
- fixed hero aspect ratio
- alt text per image
- share image per recipe (`og:image`)
- explicit image source/licensing policy
- whitelisted image domains only

---

# C. Code Audit

## 1. Security

### HIGH — `src/lib/supabase-server.ts`
```ts
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
```

This is the biggest security smell in the codebase.

### Why it’s bad
- Service role bypasses RLS.
- These pages only need public published content.
- If a future bug, route, action, or import uses this client carelessly, you can leak drafts or worse.

### What to do instead
Use the **anon key** on the server for public reads too.
RLS already allows published rows.
That is what RLS is for.

### Severity note
This is not “the site is hacked right now.”
But it is an unnecessary blast-radius increase. For a small app, remove it early.

### MEDIUM — `next.config.ts` remote image pattern is too open
```ts
hostname: "**"
```
This allows remote images from basically anywhere.

### Why it matters
- weaker control
- easier abuse if bad `image_url` values enter DB
- not good hygiene for production

Whitelist the actual domains you use.

### MEDIUM — Search query interpolation is brittle
In `src/app/search/page.tsx`:
```ts
.or(`title.ilike.%${query}%,cuisine.ilike.%${query}%,category.ilike.%${query}%`)
```

This is not raw SQL injection, but it is still bad input handling.
A user can break the filter syntax with punctuation/comma patterns, and the search logic is fragile.

### Recommendation
- move search to a server-side function/API or safe helper
- sanitize user input for PostgREST filter syntax
- long-term: use full-text search

## 2. Performance

### HIGH — Recipe route is dynamic SSR
Verified in build output.
For recipe content this is leaving performance on the table.

### HIGH — Double DB query on recipe pages
`generateMetadata()` fetches recipe data.
Then the page fetches it again.

That means extra latency and more DB calls.
Use a shared cached fetch function.

### MEDIUM — Homepage index can be improved
Current index strategy does not optimize the actual homepage query well.
Add a partial index on published `created_at DESC`.

### MEDIUM — Search is a client-side DB hit with no caching or error handling
Fine for 10 recipes.
Not fine as the site grows.

### LOW — Unused runtime dependencies
`pg` and `ws` appear unnecessary for the current app surface.
If they are not actually used in runtime, remove them.
Less weight, less attack surface, less confusion.

### LOW — Next warning about multiple lockfiles
Build warning says Turbopack inferred the workspace root from another lockfile.
Set `turbopack.root` or remove the extra lockfile ambiguity.
This is not urgent, but clean it up.

## 3. SEO

### CRITICAL — Recipe pages lack structured data
There should be Recipe JSON-LD with at least:
- `@type: Recipe`
- name
- description
- image
- recipeYield
- prepTime
- cookTime
- totalTime
- recipeCategory
- recipeCuisine
- recipeIngredient
- recipeInstructions
- author / publisher

### CRITICAL — No canonical tags
Verified live.
Add `alternates: { canonical: ... }` in metadata.

### HIGH — No social image strategy
Recipe metadata only uses `image_url` if present.
Right now many pages may have no image, meaning poor sharing.

### HIGH — Missing editorial trust pages
Not strictly code in the listed files, but absolutely an SEO architecture problem.

### MEDIUM — Root metadata is incomplete
`src/app/layout.tsx` should likely add:
- `metadataBase`
- twitter card metadata
- icons
- maybe title template
- maybe authors/publisher info

### MEDIUM — Sitemap implementation is too naive
Current sitemap:
- fetches all published recipes
- includes homepage with `lastModified: new Date()`
- no revalidate

Problems:
- homepage `lastModified` changes even if content didn’t
- new recipes may not appear until rebuild

## 4. Accessibility

### MEDIUM — Search icon link in header has no accessible name
In `layout.tsx`, the `/search` icon link should have `aria-label="Search recipes"`.

### MEDIUM — Search input has placeholder only, no label
Placeholder is not a label.
Add a visible label or screen-reader label.

### LOW/MEDIUM — Search result state should be announced
Use an `aria-live` region for “Searching…” / “No recipes found”.

### LOW — Color dependence is acceptable but could improve
Difficulty badge includes text, so it is not color-only, which is good.
Contrast should still be checked.

## 5. TypeScript strictness

### Good
- `strict: true` in `tsconfig.json`

### But in practice: only partly strong
Problems:
- lots of casting (`as Recipe[]`, `as Recipe`)
- manual TypeScript types are disconnected from the database
- JSONB structures are trusted without runtime validation

### Why that matters
With direct DB editing and AI-generated content, malformed JSON is not hypothetical.
It will happen.

Examples of mismatch risk:
- DB allows `tags` to be null, TypeScript expects `string[]`
- DB JSON may omit `unit` / `step` / `text`
- UI assumes arrays and object shapes exist

### Recommendation
- generate Supabase types from the schema
- validate recipe payloads with Zod (or similar) before rendering
- align DB nullability with TS expectations

## 6. Error handling

### HIGH — Homepage masks backend failure as “Recipes coming soon…”
In `src/app/page.tsx`, if Supabase fails, you log the error and render empty state.
That hides an outage as a content state.

### HIGH — Recipe page turns some backend failures into 404s
In `src/app/recipe/[slug]/page.tsx`:
```ts
if (error || !data) notFound();
```
That means database/network/config failures may become false 404s.
Bad for users, bad for observability, bad for SEO.

### MEDIUM — Search ignores errors
`src/app/search/page.tsx` does not handle search errors explicitly.
A failed query can look like “no results.”

## 7. Best practices violations / file-specific notes

### `schema.sql`
- redundant slug index
- too few constraints
- tags nullable mismatch
- no `published_at`
- no verification fields

### `src/app/layout.tsx`
- incomplete metadata
- claims “chef-verified” / “Every recipe verified” before the system proves it

### `src/app/page.tsx`
- empty-state on failure issue
- homepage query index could be better

### `src/app/recipe/[slug]/page.tsx`
- dynamic SSR instead of ISR/SSG
- duplicate DB query
- 404-on-error issue
- missing JSON-LD
- missing canonical metadata
- no related recipes / breadcrumbs

### `src/app/search/page.tsx`
- brittle query construction
- no accessible label
- no error state
- search not reflected in URL

### `src/app/sitemap.ts`
- static freshness issue
- homepage `lastModified` is noisy

### `src/components/RecipeCard.tsx`
- generally fine
- image card sizes are set, good
- detail hero image should also specify sizes

### `src/lib/supabase.ts`
- okay for public anon client
- could benefit from env validation instead of `!`

### `src/lib/supabase-server.ts`
- should not use service role for this use case

### `src/types/index.ts`
- fine as starter types
- too trusting for JSONB data from DB

### `next.config.ts`
- remote image whitelist is too permissive

### `package.json`
- add a `typecheck` script explicitly
- remove unused deps if actually unused

---

# D. Recipe Quality Strategy

This is the part that will make or break the business.

If you publish 100 AI-generated recipes without a disciplined QA system, you will create a site that looks clean but is fundamentally fake.
That might get some impressions. It will not create durable trust.

## How to generate verified recipes at scale

## Principle
**AI can draft. AI cannot be your definition of truth.**

### Recommended workflow

#### Step 1 — Structured recipe brief
Before generation, define:
- cuisine
- dish canonical name
- region/style
- intended serving count
- difficulty
- target audience (beginner/intermediate)
- required authenticity level (traditional vs weeknight adaptation)

#### Step 2 — AI draft using strict schema
Generate into a structured format only:
- title
- summary
- ingredient objects
- instruction objects
- time estimates
- notes
- substitutions
- storage/reheating

#### Step 3 — Source review against at least 2 strong references
For each recipe, store and compare against:
- respected chef/site/book source
- at least one corroborating traditional or highly reputable source

Not just “two random blogs.”

#### Step 4 — Human culinary QA pass
Check:
- ingredient ratios
- timing realism
- sequencing realism
- equipment assumptions
- food safety
- authenticity claims
- whether the instructions are actually cookable

#### Step 5 — Sanity-check automation
Build simple validators for:
- no absurd ingredient amounts
- no missing units where units are required
- step numbers sequential
- total time roughly consistent with steps
- servings not zero
- ingredient references match the instructions

#### Step 6 — Verification tiering
Not every recipe needs the same validation cost.
Use tiers:
- **Tier A:** fully cooked/tested in kitchen
- **Tier B:** reviewed against 2+ trusted sources + culinary sanity checked
- **Tier C:** AI draft only → never publish as “verified”

Right now your plan implicitly treats everything as Tier A/B without a system.
That is the problem.

#### Step 7 — Store proof in the DB
Each recipe should carry:
- verification status
- verifier/reviewer
- source URLs
- date reviewed
- internal notes

Without this, “verified” is just brand theater.

## Quality checklist per recipe

Every recipe should pass this before publish:

### Identity / intent
- [ ] Dish name is standard and not misleading
- [ ] Cuisine/region is accurate
- [ ] Description does not overclaim authenticity unless justified

### Ingredients
- [ ] Every ingredient has realistic amount + unit
- [ ] No impossible or silly quantities
- [ ] Specialty ingredients have substitutions if appropriate
- [ ] Ingredient names are specific enough for shopping

### Method
- [ ] Steps are in workable order
- [ ] Heat level / timing / doneness cues are included
- [ ] Beginner can follow without guessing
- [ ] No hidden steps or implicit assumptions

### Time / yield
- [ ] Prep time realistic
- [ ] Cook time realistic
- [ ] Total time realistic
- [ ] Serving count believable

### Food safety
- [ ] Meat/egg handling is safe
- [ ] Storage guidance is sensible when relevant
- [ ] Reheating advice is safe when relevant

### Authenticity / usefulness
- [ ] If traditional, technique is faithful enough
- [ ] If adapted, adaptation is disclosed
- [ ] Includes useful tips, not just bare steps

### SEO / metadata
- [ ] Slug is clean
- [ ] Meta title / description reviewed
- [ ] Canonical defined
- [ ] Recipe JSON-LD valid
- [ ] Image + alt text present

### Editorial proof
- [ ] Source links stored
- [ ] Reviewer stored
- [ ] Verification status stored
- [ ] Publish date stored

## One more blunt point
“Verified” is expensive.
If you really mean it, you may be better off publishing **30 excellent recipes** first than rushing to **100 supposed verified recipes**.

---

# E. Growth / SEO Strategy

## What makes recipe sites rank in 2026?
Not “AI volume.”
Not generic surface-level recipes.

The winners usually combine:
1. **Topical authority** in a focused niche
2. **Original experience / judgment**
3. **Structured data + clean technical SEO**
4. **Original or trusted visual assets**
5. **Deep internal linking and content hubs**
6. **Real usefulness beyond the ingredient list**
7. **Brand signals** (search demand, mentions, return visits, saves, shares)

## Biggest strategic issue: the niche is too broad
This is the part I’d push hardest on.

A new domain should not try to win “the world’s recipes.”
That is strategically soft.

### Why it’s a problem
- weak topical concentration
- weak internal linking coherence
- weak brand story
- hard to build authority fast
- hard to earn backlinks for “random everything” content

## Better strategic wedge
Given the brand **Zaffaron**, I would seriously consider:

### Option A — Own Persian first
- Persian rice dishes
- Persian stews
- kebabs
- breakfasts
- sweets/desserts
- ingredient guides (saffron, dried lime, barberries, tahdig, sabzi)

Then expand adjacent.

### Option B — Persian + neighboring/adjacent lane
- Persian
- Middle Eastern
- a small number of restaurant-favorite crossover dishes

### What I would NOT do
Publish a scattered set of generic recipes across 10 cuisines just to hit 100 pages.
That looks like filler, not authority.

## Content strategy recommendations

### 1. Build clusters, not isolated recipes
Example clusters:
- Persian stews hub
- Persian rice hub
- Persian breakfast hub
- saffron guide hub
- dried lime / barberry ingredient guides
- “restaurant-style at home” cluster if that becomes a secondary lane

### 2. Create hub pages early
Not just recipe pages.
Create:
- category hubs
- cuisine hubs
- ingredient guides
- technique guides

These help crawling, internal links, and authority.

### 3. Add useful recipe sections beyond the core card
For ranking and user satisfaction, the winning recipe pages usually answer adjacent intent too:
- substitutions
- common mistakes
- storage and reheating
- make-ahead
- what to serve with it
- ingredient notes

You do not need essay fluff.
You do need complete usefulness.

### 4. Originality matters more than ever
What can make Zaffaron defensible:
- clear tested judgment
- cultural/contextual accuracy
- useful adaptations explained honestly
- consistent high-quality imagery
- strong editorial standard

### 5. Rich result eligibility is table stakes
Add Recipe schema, image requirements, clear time/yield, FAQs only when genuinely helpful.

### 6. Distribution should support SEO, not distract from it
For Phase 1:
- Pinterest is more relevant than trying to be everywhere
- short-form video can support brand later
- don’t spend huge effort on social before the recipe library and image system are good

### 7. Email capture is worth considering earlier than you think
Even a simple “get new recipes weekly” can help create direct audience signals.
Not mandatory on day one, but worth adding before serious traffic arrives.

## Recommended Phase 1 growth approach

### First 90 days
- pick the niche wedge
- publish 20–30 truly strong recipes in that wedge
- create 3–5 hub pages
- add technical SEO foundations
- get Search Console clean
- start collecting impression/query data

### Next 90 days
- expand only into adjacent clusters that fit the brand
- improve internal linking based on what gains impressions
- update underperforming pages with richer usefulness, not more fluff
- add a handful of best-in-class original images where they matter most

---

# Final Verdict

## What’s good
- Clean reset
- Simple stack
- Build passes
- Codebase is understandable
- You avoided the previous over-engineering trap

## What’s not good enough yet
- SEO foundation for recipes is incomplete
- “Verified” is not backed by a system
- Security posture around Supabase is too loose
- Architecture is using SSR where ISR/SSG would be better
- Schema is under-modeled for the upcoming content plan
- Strategy is too broad for a new recipe brand

## Brutal bottom line
If you fix the following before scaling content, Zaffaron has a real shot:
1. stop using service role for public reads
2. add recipe JSON-LD + canonical + share images
3. make sitemap freshness reliable
4. add verification fields + editorial workflow
5. lock taxonomy now
6. narrow the niche and publish fewer, better recipes first

If you do **not** fix those and just rush to 100 pages, you will likely build a clean-looking but weak commodity recipe site.

---

# Suggested Immediate Action List (in order)

1. Replace server-side service-role client with anon/RLS-safe reads for public pages
2. Add `published_at`, verification fields, image alt/source fields, stronger constraints
3. Add Recipe JSON-LD + canonical metadata + `metadataBase`
4. Convert recipe pages to SSG + ISR with shared cached fetch
5. Fix `sitemap.ts` freshness with revalidation or on-demand update
6. Lock category/cuisine taxonomy before adding dozens more recipes
7. Create a recipe verification checklist and store verification status per recipe
8. Add About / Contact / Editorial Policy / Recipe Testing Policy / Privacy pages
9. Narrow the content strategy to a stronger topical wedge
10. Only then scale from 10 to 30 to 100 recipes
