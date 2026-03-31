# Zaffaron v2 — FINAL Upgrade Plan (Post-Audit)

_Merged from GPT 5.4 + Gemini 3.1 Pro audits | 2026-03-10_
_Rule: Images are DONE — do NOT touch image_url or image generation_

---

## Phase 1: Fix Code Bugs + Schema (Day 1)
_Foundation fixes that both auditors flagged as critical_

- [ ] **1.1** Fix double DB query — wrap `getRecipeBySlug` in `React.cache()` (both auditors)
- [ ] **1.2** Fix homepage overfetch — `select("*")` → select only needed columns
- [ ] **1.3** Fix image alt — use `image_alt` from DB instead of `recipe.title`
- [ ] **1.4** Fix JSON-LD:
  - Add `datePublished`, `dateModified`
  - Add `keywords` from tags
  - Change author to `Person` (not Organization)
  - REMOVE HowTo schema idea (Google penalty risk)
  - REMOVE AggregateRating placeholder idea (fake = penalty)
  - REMOVE FAQ JSON-LD idea (no visible FAQ = rejected)
- [ ] **1.5** Update `types/index.ts` — add all schema v2 fields
- [ ] **1.6** Fix accessibility: add skip-to-content link in layout
- [ ] **1.7** Make tags clickable links (currently dead pills)
- [ ] **1.8** Make category/cuisine text into links (currently plain text)

## Phase 2: Recipe Page Enhancement (Day 1-2)
_Biggest user impact — show data we already have_

- [ ] **2.1** Add visible author + published date + "Verified" badge
- [ ] **2.2** Add Tips section (conditional: `{recipe.tips && ...}`)
- [ ] **2.3** Add Substitutions section (conditional)
- [ ] **2.4** Add Storage Notes section ("How to Store")
- [ ] **2.5** Add "Serve With" section with links to other recipes
- [ ] **2.6** Add Breadcrumbs UI + BreadcrumbList JSON-LD
- [ ] **2.7** Add "Jump to Recipe" anchor button
- [ ] **2.8** Print-friendly CSS (`@media print`)
- [ ] **2.9** Better nutrition card (not just calories)

## Phase 3: Data Enrichment (Day 2)
_Fill schema v2 fields for all 40 recipes — AI-assisted_

- [ ] **3.1** Populate `tips` for all 40 recipes
- [ ] **3.2** Populate `substitutions` for all 40
- [ ] **3.3** Populate `storage_notes` for all 40
- [ ] **3.4** Populate `serve_with` for all 40
- [ ] **3.5** Set `author` = "Zaffaron Kitchen" for all
- [ ] **3.6** Set `published_at` dates
- [ ] **3.7** Set `verification_status` = "verified"
- [ ] **3.8** Add `cuisine_slug` and `category_slug` for routing
- [ ] **3.9** Populate `source_urls` (2+ authoritative sources per recipe)

## Phase 4: Hub Pages + Navigation (Day 2-3)
_SEO multiplier — new indexable pages + internal linking_

- [ ] **4.1** `/cuisine/[slug]` dynamic pages (persian, indian, etc.)
- [ ] **4.2** `/category/[slug]` dynamic pages (stew, rice, kebab, etc.)
- [ ] **4.3** Hub page SEO descriptions (150+ words each)
- [ ] **4.4** Category filter tabs on homepage
- [ ] **4.5** Archive/pagination — remove 24 limit, add "Load More" or paginated pages
- [ ] **4.6** Add hub links to footer and header nav
- [ ] **4.7** "You might also like" related recipes on recipe page

## Phase 5: SEO & Meta Polish (Day 3)
_Technical SEO finish_

- [ ] **5.1** Favicon + apple-touch-icon + manifest.json
- [ ] **5.2** Default og:image (1200x630 Zaffaron branded)
- [ ] **5.3** Canonical URLs on all new pages
- [ ] **5.4** Google Search Console setup + sitemap submit
- [ ] **5.5** Bing Webmaster Tools setup
- [ ] **5.6** Rich Results Test — all 40 recipes pass
- [ ] **5.7** Lighthouse 90+ mobile check

## Phase 6: Visual Polish (Day 3-4, optional)
_Nice-to-have, low priority_

- [ ] **6.1** Serif font for recipe titles (editorial feel)
- [ ] **6.2** Recipe card hover refinement
- [ ] **6.3** Loading skeleton states
- [ ] **6.4** Recipe count on homepage ("40 Authentic Recipes")

---

## REMOVED from plan (per auditors)
- ❌ HowTo structured data (Google penalty risk)
- ❌ AggregateRating placeholder (fake = penalty)
- ❌ FAQ JSON-LD without visible FAQ
- ❌ Dark mode (premature)
- ❌ Ingredient checkboxes (premature)
- ❌ Step highlighting (premature)
- ❌ Micro-animations (premature)
- ❌ Sitemap priorities (busywork, minimal SEO impact)
- ❌ World cuisine expansion (conflicts with Persian-first strategy)

---

## Estimated Cost
- Data enrichment (Phase 3): ~$5-10 (AI-assisted)
- Everything else: $0 (code)
- **Total: ~$5-10**

## Estimated Time
- Phases 1-5: **3 days** (with OpenClaw)
- Phase 6: **+1 day** (optional)
