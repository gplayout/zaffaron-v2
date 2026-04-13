# Zaffaron Pork Content Strategy (Respectful, SEO-Driven, Halal-Friendly)

**Context:** Zaffaron.com is a recipe site (1,700+ recipes) with a strong audience affinity for halal-friendly content across Persian, Turkish, Lebanese, Indian, Moroccan, Greek, Afghan, Azerbaijani, and international cuisines.

**Goal:** Add pork-based recipes to capture meaningful SEO traffic for global cuisine queries, without reshaping the brand into “pork-forward” content, and without hiding content from Muslim-majority countries.

**Founder constraints (non-negotiable):**
- Pork recipes **must exist**.
- Pork recipes **must not** be promoted on the homepage, Editor’s Picks, or equivalent featured modules.
- Each pork recipe **must include** alternative proteins (lamb, chicken, beef) with adapted instructions.
- Users in Muslim-majority countries **must still be able to see** pork recipes (not geo-blocked), but pork should be **less prominent** by default.
- Tone must be inclusive, neutral, non-preachy.
- Future personalization may come later, but not now.
- `dietary_info.halal = false` exists in schema.

---

## 1) Content Strategy

### 1.1 How many pork recipes (and why)
**Recommendation (first 90 days): 30–45 pork recipes**, staged, not dumped.
- **Why not 5–10:** too small to capture long-tail SEO; also risks “thin” category pages.
- **Why not 100+:** operational risk, brand whiplash, harder to enforce alternative-protein requirement consistently.
- 30–45 gives enough breadth to cover major pork query clusters, internal linking, and country/cuisine adjacency.

**Year-1 target:** 80–120 pork recipes total, depending on KPIs (see section 10).

### 1.2 What kinds of pork recipes to publish (priority clusters)
Focus on **high-intent, high-volume** clusters and **cuisine-authentic** recipes where pork is canonical in the global web, plus a few “gateway” comfort foods.

**Cluster A: Bacon basics and dishes (10–15 recipes)**
- Bacon in: pasta, breakfast, salads, soups, Brussels sprouts, baked potatoes
- “How to cook bacon” variants: oven, air fryer, stovetop (these can be non-recipe evergreen posts or recipe-format pages)
- Bacon-wrapped staples: asparagus, chicken (note: alternative proteins section must be especially careful here)

**Cluster B: Italian sausage and sausage pasta (8–12 recipes)**
- Italian sausage pasta (red sauce, creamy, baked)
- Sausage and peppers
- Sausage ragu
- Sausage baked ziti

**Cluster C: Pulled pork and BBQ (6–10 recipes)**
- Pulled pork sandwich
- Slow cooker pulled pork
- Instant pot pulled pork
- Carnitas-style (note: pork canonical; include beef/chicken alternatives)

**Cluster D: Pork chops and tenderloin (6–10 recipes)**
- Pan-seared pork chops
- Oven-baked pork chops
- Pork tenderloin (roasted)

**Cluster E: Regional/cuisine-specific pork dishes (5–10 recipes)**
Do selectively to avoid “brand conflict,” but it’s important for SEO authenticity:
- Greek: pork souvlaki (with chicken/lamb variant)
- Turkish: a small number of “international Turkish” pork adaptations (careful labeling)
- Lebanese: limited (pork is uncommon), instead focus on international dishes on the site
- Indian: pork vindaloo (Goan variants exist), pork curry (regional)
- Moroccan: limited (pork is uncommon)
- Persian/Afghan/Azerbaijani: generally avoid “classic” labeling; if included, clearly mark as “international adaptation”

### 1.3 Which cuisines should have pork recipes
**Primary:** International / Italian / American BBQ / Greek.
- These cuisines naturally map to pork query volume.

**Secondary (small, careful set):** Indian (Goan/Christian regional), Spanish/Latin (carnitas-style), German/Austrian (optional later).

**Avoid forcing pork into cuisines where it is culturally atypical** (Persian, Afghan, many Middle Eastern) unless the page is explicitly framed as an adaptation.

### 1.4 Editorial policy for pork content
- Pork pages should exist as first-class recipe pages (indexable) but **never “hero” content**.
- No sitewide banners, no homepage carousels, no “Editor’s Picks,” no push notifications.
- A consistent **Alternative Proteins** module is mandatory and must be high quality (not token text).
- Use neutral language: “pork option” and “alternative proteins” rather than religious framing.

### 1.5 Alternative proteins: non-negotiable quality bar
Each pork recipe must include:
- **Primary alternative (closest flavor/texture):** often chicken thighs, beef chuck, lamb shoulder, or turkey bacon.
- **Second alternative:** another common option.
- **Adjustment notes:** cooking time, fat content, internal temperature, texture differences.
- **A quick variant selector** (UX section 2) so users can cook the alternative without mental overhead.

---

## 2) UX Design (Visible, Not Promoted)

### 2.1 Discovery principles
- **Pork is searchable and browsable**, but not front-and-center.
- **No “featured” placements**; keep it to standard lists/search results.
- In mixed lists (category pages, “related recipes”), pork items can appear but should be **ranked lower by default** in certain locales (section 4).

### 2.2 Recipe page design: Alternative Proteins module
Add a structured, consistent module near the top of the recipe card (after summary, before ingredients):

**Module title:** “Make it with another protein”

**Interaction:**
- Default selection: **the recipe’s canonical protein** (pork)
- Options shown: “Chicken”, “Beef”, “Lamb” (and “Turkey” for bacon/sausage cases)
- On selection, the page updates:
  - ingredient quantities if needed
  - cooking time range
  - key technique notes
  - food safety temp guidance (e.g., chicken 165°F)

**Copy tone:** Practical cooking guidance, no moral language.

**Disclosure microcopy (one line):** “These swaps are tested for flavor and cook time, but results vary by cut and fat content.”

### 2.3 Listing cards (search results, category pages)
- Add a small, neutral badge: **“Contains pork”** (only when pork is the default protein).
- For alternative-friendly pages, add a second badge: **“Swap-friendly”** (or “Protein swaps included”).
- Avoid using appetizing pork photography in general-purpose lists when possible, but do not misrepresent the recipe.

### 2.4 Homepage / Editor’s Picks rules
- Implement an explicit content gating rule: `eligible_for_featured = false` for pork recipes.
- Ensure all homepage modules (Trending, Picks, Seasonal, etc.) respect this.

### 2.5 Related recipes logic
On pork recipe pages:
- Show related recipes that include **non-pork alternatives** or similar flavor profiles (BBQ chicken, beef ragu, lamb skewers).
On halal recipes:
- Do not show pork recipes in “related” modules by default (unless user has explicitly opted in via a filter toggle).

---

## 3) SEO Strategy (Capture Traffic, Keep Brand)

### 3.1 SEO positioning
- Treat pork recipes as **international cuisine coverage**, not a brand shift.
- Keep Zaffaron’s core narrative (cuisines, technique, flavor) intact.

### 3.2 Keyword targeting framework
For each cluster, create pages targeting:
- **Head terms:** “pulled pork”, “pork chops”, “bacon pasta”, “Italian sausage pasta”
- **Long-tail:** “slow cooker pulled pork no bbq sauce”, “oven baked pork chops with mustard”, “air fryer bacon”
- **Intent modifiers:** easy, quick, weeknight, one pot, healthy-ish, meal prep

### 3.3 On-page SEO: structure
- Strong H1 and first 100 words clearly match query.
- Include **Recipe schema** (structured data) plus variant fields (see technical section).
- Include internal links to:
  - a neutral “Protein swaps guide” article
  - relevant non-pork recipes (this supports brand balance)

### 3.4 Category and hub pages
Create hub pages that are indexable:
- `/ingredients/pork/`
- `/ingredients/bacon/`
- `/ingredients/sausage/` (with subfilters: pork sausage, turkey sausage)

But do **not** surface these hubs on the homepage.

### 3.5 Avoiding brand dilution in SERP snippets
- Meta titles and descriptions should be recipe-specific, not “Zaffaron now has pork.”
- Avoid sitewide “pork” navigation labels in primary nav; use secondary navigation / filters.

### 3.6 International SEO nuance
- Keep content accessible globally.
- For locales where halal friendliness matters, adjust ranking and default filters (section 4 and 5) without cloaking or hiding.

---

## 4) Localization (IP/Locale-Based Sorting, Not Hiding)

### 4.1 Non-hiding rule
No geo-blocking, no “not available in your region.” Pork pages remain reachable, indexable, and searchable.

### 4.2 What changes by locale
**Only ranking and default sort order changes** in:
- category lists
- “browse all” pages
- internal site search ranking
- recommendations modules (if any)

### 4.3 Practical approach to locale signals
Use a **lightweight locale inference**:
- Primary: Accept-Language header (e.g., `fa-IR`, `ar-SA`, `tr-TR`)
- Secondary: IP country (GeoIP)
- Store in session cookie (do not create accounts)

### 4.4 Locale groups
Define groups:
- **Muslim-majority group** (config list of country codes)
- **Default global**

### 4.5 Ranking rules
In Muslim-majority group:
- Apply a ranking demotion to pork recipes in general browsing and generic search queries.
- Pork recipes still appear when the user query is explicitly pork (e.g., “bacon pasta”).
- If the user navigates to pork hub pages directly, show normally.

In global default:
- No demotion by default, but still no homepage featuring.

### 4.6 Transparency (optional but recommended)
A subtle setting in site preferences: “Default browsing preference: Halal-friendly first.”
- Preselected in Muslim-majority locales.
- Users can toggle it, stored in cookie.
- This is about browsing experience, not censorship.

---

## 5) Filter System (Halal Filter in Search/Browse)

### 5.1 Define filter semantics clearly
- `Halal-friendly` filter should mean: **exclude recipes where `dietary_info.halal = false`**.
- Also consider an `Contains pork` facet (true/false) for clarity.

### 5.2 Default behavior
- Do not default to hiding pork globally.
- In Muslim-majority locale group:
  - default sort: “Halal-friendly first” (ranking), not exclusion.
  - provide a one-click filter: “Show only halal-friendly” (exclusion)

### 5.3 UI placement
- Search results page: filter bar includes “Halal-friendly” toggle.
- Ingredient/category pages: filter panel includes “Exclude pork.”

### 5.4 Edge cases
- Recipes with optional pork (e.g., “Carbonara with pancetta or turkey”) should not be marked as `halal=false` if the default protein is not pork.
- If default protein is pork, `halal=false` but include alternatives.

---

## 6) Ethics (Inclusive Without Alienating Core Audience)

### 6.1 Framing principle
Zaffaron is a welcoming cooking site. It can:
- respect halal-friendly preferences
- acknowledge global cuisines include pork
- provide high-quality alternatives

Without:
- moralizing
- religious policing
- making pork a brand identity

### 6.2 Copy guidelines
- Use neutral terms: “pork,” “alternative proteins,” “swap,” “preference.”
- Avoid language like “haram,” “sin,” “forbidden,” etc.
- If asked in FAQ, answer briefly: “We publish recipes from many cuisines, and we always include alternatives where possible.”

### 6.3 Community trust
- Ensure halal-friendly content remains robust and visibly supported.
- Avoid featuring pork in newsletters/socials if those channels are part of brand trust.

---

## 7) Technical Implementation (DB, UI, Pipeline)

### 7.1 Data model changes
Existing: `dietary_info.halal = false`.

Add fields (or equivalents):
- `ingredients.contains_pork: boolean` (explicit, queryable)
- `recipe.flags.eligible_for_featured: boolean` (set false for pork)
- `recipe.variants[]` for protein swaps (structured)

**Variant structure (example):**
- `variant_type: "protein"`
- `options: [ { key: "pork", label: "Pork", is_default: true }, { key: "chicken", ... } ]`
- Each option includes:
  - `ingredient_overrides`
  - `step_overrides` or `step_notes`
  - `time_overrides`
  - `food_safety` (temps)

### 7.2 CMS/editor workflow
- Add validation rules:
  - If `contains_pork=true` then `dietary_info.halal=false`.
  - If `contains_pork=true` then must have >= 2 alternative protein variants (from allowed set).
  - If `contains_pork=true` then `eligible_for_featured=false`.

### 7.3 Search/indexing changes
- Add facets: `contains_pork`, `halal`.
- Add ranking modifier by locale group.
- Ensure query intent override: if query contains pork terms, do not demote.

### 7.4 Frontend changes
- Recipe page: variant selector + dynamic rendering.
- Cards: “Contains pork” badge.
- Homepage modules: filter out `eligible_for_featured=false`.
- Settings: “Halal-friendly first” preference.

### 7.5 Analytics instrumentation
Track:
- impression and click-through by recipe type
- filter toggles usage
- locale group behavior

---

## 8) Roadmap (Phase by Phase)

### Phase 0 (Week 1): Policy + foundations
- Finalize editorial policy and copy guidelines.
- Define the schema changes and validation rules.
- Create a list of “approved pork recipe types” for first batch.

### Phase 1 (Weeks 2–4): MVP launch (10–15 recipes)
- Publish first batch in International/Italian/BBQ clusters.
- Implement: `contains_pork`, `eligible_for_featured=false`, badges, basic “Alternative proteins” section (static if needed for MVP).
- Add halal filter toggle in search.

### Phase 2 (Weeks 5–8): Scale + better UX (30–45 total)
- Upgrade alternatives to structured variants (dynamic selector).
- Add locale-based ranking demotion (not exclusion).
- Build hub pages for pork/bacon/sausage.

### Phase 3 (Months 3–6): Optimize SEO + content depth (60–80 total)
- Expand long-tail content and technique posts.
- Improve internal linking structure.
- Add more cuisine-adjacent pork recipes (Greek, selective Indian).

### Phase 4 (Later): Personalization (when user base supports it)
- Behavior-based homepage modules (“what you like”) while preserving opt-outs.

---

## 9) Risks and Mitigations

### Risk A: Alienating core halal-friendly audience
**Mitigation:** no homepage featuring, clear filters, halal-friendly-first ranking in sensitive locales, high-quality alternatives.

### Risk B: Perceived hypocrisy or preachiness
**Mitigation:** neutral tone, practical cooking guidance, no religious framing.

### Risk C: SEO cannibalization or category confusion
**Mitigation:** strong taxonomy (contains_pork facet), clear hubs, careful internal links.

### Risk D: Low quality alternative swaps (user distrust)
**Mitigation:** strict CMS validation + tested adjustments; editorial QA checklist.

### Risk E: Locale sorting feels like “shadow banning”
**Mitigation:** do not hide; provide an explicit preference toggle; ensure pork-intent queries work normally.

---

## 10) KPIs (Success Metrics)

### SEO / Growth
- Organic sessions to pork recipe pages
- Rankings for target keywords (top 3 / top 10)
- Impressions and CTR in Search Console
- New users driven by pork clusters, and their retention into non-pork content

### Product / UX
- % of pork recipe pageviews that switch to an alternative protein
- Completion signals: scroll depth, time on page, save/print actions
- Filter usage: halal filter toggles by locale group

### Brand health (proxy metrics)
- Bounce rate deltas for Muslim-majority locale group after launch
- Feedback volume and sentiment (contact forms, comments if any)

### Operational quality
- % of pork recipes passing validation (alternatives present, featured=false)
- Editorial QA defects per 10 recipes

---

## Appendix: Practical “First Batch” (Example 12)
1. Slow cooker pulled pork (with beef chuck + chicken thigh variants)
2. Instant pot pulled pork (same variants)
3. Pulled pork sandwich (with shredded chicken and shredded beef)
4. Classic bacon pasta (with turkey bacon; and pancetta note)
5. Bacon Brussels sprouts (with turkey bacon)
6. Oven baked pork chops (with chicken breast cutlet timing)
7. Pan-seared pork chops (with lamb loin chop variant)
8. Italian sausage pasta (with chicken sausage and beef sausage variants)
9. Sausage and peppers (with chicken sausage)
10. Sausage ragu (with beef ragu variant)
11. Greek pork souvlaki (with chicken/lamb souvlaki variants)
12. Pork tenderloin roast (with chicken and beef roast adjustments)
