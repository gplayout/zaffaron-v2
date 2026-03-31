# Zaffaron v2 — UI/UX, Metadata & Recipe Quality Upgrade Plan

_Date: 2026-03-10 | Status: DRAFT — needs audit before execution_
_Rule: Images are DONE — do NOT touch image_url or image generation_

---

## Current State
- 40 published recipes, all with Gemini 3 Pro Image photos
- 16 source files, minimal UI (grid homepage, basic recipe detail, search)
- Schema v2 columns exist but many unused (tips, storage_notes, serve_with, substitutions, source_urls, author, published_at, verification_status)
- No category/cuisine pages, no breadcrumbs, no related recipes
- No favicon/OG default image, no sitemap priority hints
- Recipe detail page shows ingredients + steps but NOT tips, substitutions, storage, serve_with

---

## Upgrade Areas

### A. Recipe Page Enhancement (UI/UX)
**Goal:** World-class recipe page that competes with Serious Eats / NYT Cooking

1. **Tips section** — display `tips` field (already in DB schema)
2. **Substitutions section** — display `substitutions` JSON field
3. **Storage notes** — "How to Store" section from `storage_notes`
4. **Serve with** — "Pairs Well With" section from `serve_with`, link to other recipes if they exist
5. **Jump to Recipe button** — sticky at top for SEO-optimized pages with long intros (future)
6. **Print-friendly layout** — `@media print` CSS or print button
7. **Nutrition card** — structured display (calories, protein, fat, carbs) not just one number
8. **Equipment list** — if available in recipe data
9. **Ingredient checkboxes** — interactive, helps while cooking (client component)
10. **Step highlighting** — click/tap a step to highlight it while cooking
11. **Author attribution** — show `author` field with link to about page
12. **Share buttons** — copy link, share to social (minimal, no 3rd party scripts)

### B. Homepage & Navigation (UI/UX)
**Goal:** Easy discovery, professional look

1. **Category filter tabs** — filter by: All, Stews, Rice, Kebabs, Appetizers, Desserts, Drinks
2. **Cuisine filter** — Persian (default), Middle Eastern, Indian, World
3. **Featured recipe hero** — large card at top for a highlighted recipe
4. **"New Recipes" badge** — on recently added recipes
5. **Pagination or "Load More"** — currently limited to 24, need way to see all 40+
6. **Recipe count** — "40 Authentic Recipes" subtitle
7. **Mobile navigation** — hamburger menu with categories
8. **Search improvements** — show results count, empty state with suggestions

### C. Category & Cuisine Hub Pages (SEO)
**Goal:** Topical authority, more indexable pages

1. **`/cuisine/persian`** — all Persian recipes with description paragraph
2. **`/cuisine/[slug]`** — dynamic for each cuisine
3. **`/category/[slug]`** — stew, rice, kebab, appetizer, dessert, drink, soup, breakfast, salad
4. **Breadcrumbs** — `Home > Persian > Stews > Ghormeh Sabzi`
5. **BreadcrumbList JSON-LD** on every recipe page
6. **Hub page descriptions** — unique 150+ word SEO text per hub
7. **Internal linking** — every recipe links to its cuisine and category hub

### D. Metadata & SEO (Technical)
**Goal:** Maximum Google visibility

1. **Update types/index.ts** — add new schema fields (tips, storage_notes, serve_with, substitutions, source_urls, author, published_at, verification_status, cuisine_slug, category_slug)
2. **og:image fallback** — create a default Zaffaron share image (1200x630)
3. **favicon** — proper favicon.ico + apple-touch-icon + manifest.json
4. **FAQ JSON-LD** — add FAQ structured data to recipe pages (common questions about the dish)
5. **Sitemap priorities** — homepage 1.0, hub pages 0.8, recipes 0.7, trust pages 0.5
6. **robots.txt** — ensure hub pages are crawlable
7. **Inter-recipe linking in JSON-LD** — `isPartOf` collection
8. **Review/Rating placeholder** — Schema.org AggregateRating (future, needs real user data)
9. **HowTo structured data** — for step-by-step recipes (in addition to Recipe schema)
10. **Image alt text** — use `image_alt` from DB (already populated)
11. **Canonical URLs** on all new pages

### E. Visual Design Polish (UI)
**Goal:** Professional, warm, appetizing

1. **Color refinement** — warm stone/amber palette is good, add saffron gradient accents
2. **Recipe card hover effects** — smoother, image zoom + shadow
3. **Typography** — recipe title in a serif font for editorial feel (e.g., Playfair Display for headings)
4. **Loading states** — skeleton cards while loading
5. **Responsive recipe page** — ingredients sidebar on desktop, full-width on mobile
6. **Dark mode** — optional, CSS variables approach
7. **Custom 404** — warm, on-brand with recipe suggestions
8. **Micro-animations** — subtle fade-in on scroll for recipe cards

### F. Recipe Quality & Data Completion
**Goal:** Fill all schema v2 fields for existing 40 recipes

1. **Populate tips** for all 40 recipes (cooking tips, cultural notes)
2. **Populate substitutions** (ingredient alternatives)
3. **Populate storage_notes** (fridge, freezer, reheating)
4. **Populate serve_with** (pairings, side dishes)
5. **Populate source_urls** (authoritative recipe sources)
6. **Set author** field ("Zaffaron Kitchen" or specific)
7. **Set published_at** dates
8. **Set verification_status** to "verified"
9. **Add cuisine_slug and category_slug** for hub page routing
10. **Cross-verify ingredient accuracy** with authoritative sources

---

## Execution Order (Priority)

### Phase A: Data + Types (foundation, no UI changes)
Steps: F1-F10, D1
_Why first: UI can't show data that doesn't exist_

### Phase B: Recipe Page Enhancement  
Steps: A1-A6, A11
_Why second: biggest user impact, improve existing pages_

### Phase C: Hub Pages + Navigation
Steps: C1-C7, B1-B4, B5
_Why third: SEO multiplier, new indexable pages_

### Phase D: SEO & Meta
Steps: D2-D11
_Why fourth: technical SEO polish_

### Phase E: Visual Polish
Steps: E1-E8, A7-A10, A12, B6-B8
_Why last: nice-to-have, doesn't affect functionality_

---

## Cost Estimate
- Data enrichment (F1-F10): ~$5-10 (AI-assisted, multi-model)
- Development: $0 (we code it)
- Total: **~$5-10**

---

## Audit Request
Before executing, this plan needs review by:
1. **GPT 5.4** — UX best practices, accessibility, recipe site patterns
2. **Gemini 3.1 Pro** — SEO optimization, Schema.org compliance, technical architecture

Both auditors should review current codebase + this plan and provide specific corrections/additions.

---

_Do NOT touch: image_url, image generation, image_source, or any image pipeline._
