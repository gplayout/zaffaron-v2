# Zaffaron v2 — Phase 1 Plan (v2, post-audit)

_Updated: 2026-03-10 after triple audit (GPT 5.4 + Gemini 3.1 Pro + Opus)_

## Vision
Persian-first recipe site → grow audience → become "Uber for Home Cooks" marketplace

## Niche Strategy
**Lead with Persian cuisine.** The brand name "Zaffaron" means saffron — it's inherently Persian. Build topical authority in Persian food first, then expand to adjacent Middle Eastern, then broader world cuisines. Do NOT scatter across 10 cuisines from day one.

## Phase 1: "The Recipe Engine"
Goal: A beautiful, SEO-optimized, Google-rich-snippet-ready recipe site with 50+ verified Persian-focused recipes that ranks on Google and attracts organic traffic.

---

### Step 1: Security + SEO Foundation
- [ ] Replace service role key with anon key for all public reads
- [ ] Add Recipe JSON-LD structured data to every recipe page
- [ ] Add canonical URLs to all pages
- [ ] Add `metadataBase` to root layout
- [ ] Restrict image domains in next.config.ts (Supabase Storage only)
- [ ] Convert recipe pages to SSG + ISR with `generateStaticParams()` + `revalidate = 3600`
- [ ] Deduplicate DB calls (shared cached fetch for generateMetadata + page)
- [ ] Fix sitemap to revalidate dynamically (not stale until redeploy)
- [ ] Setup Google Search Console + Bing Webmaster Tools
- [ ] Add `og:image` fallback (site-wide default share image)
- [ ] Add `aria-label` to search icon and search input
- [ ] Sanitize search input for PostgREST safety

### Step 2: Schema + Taxonomy
- [ ] Add DB columns: `published_at`, `verification_status`, `verified_by`, `source_urls`, `image_alt`, `image_source`, `author`
- [ ] Add stronger constraints: `NOT NULL` where needed, `CHECK` for positive values
- [ ] Define canonical taxonomy: lock category slugs (appetizer, main, stew, soup, salad, rice, dessert, breakfast, bread, snack)
- [ ] Define canonical cuisine slugs (persian, middle-eastern, indian, etc.)
- [ ] Add optimized indexes for homepage + category + cuisine queries
- [ ] Remove redundant slug index (UNIQUE already creates one)
- [ ] Clean up unused dependencies (pg, ws) from package.json

### Step 3: Editorial Workflow
- [ ] Build recipe ingestion script (JSON/Markdown → validate → push to Supabase)
- [ ] Create recipe verification checklist (automated where possible):
  - Ingredient amounts realistic
  - Every ingredient appears in instructions
  - Times are consistent
  - Steps are sequential and clear
  - Food safety checked
  - Source URLs stored
  - Verification status set
- [ ] Define image policy: AI-generated (carefully prompted), reviewed by human, hosted on Supabase Storage
- [ ] Consistent image aspect ratio (4:3 card, 16:9 hero)

### Step 4: Trust Pages
- [ ] `/about` — Who is Zaffaron, what makes it different
- [ ] `/contact` — Simple contact form or email
- [ ] `/editorial-policy` — How recipes are tested/verified
- [ ] `/privacy` — Privacy policy
- [ ] Add "Tested in the Zaffaron Kitchen" or similar trust badge to recipes

### Step 5: First 30 Persian Recipes (Deeply Verified)
- [ ] Focus: Persian stews (ghormeh sabzi, gheymeh, fesenjān, etc.)
- [ ] Focus: Persian rice dishes (tahdig, zereshk polo, sabzi polo, etc.)
- [ ] Focus: Persian kebabs (koobideh, joojeh, barg, etc.)
- [ ] Focus: Persian breakfast (halim, adasi, naan-panir-sabzi, etc.)
- [ ] Focus: Persian desserts/sweets (sholeh zard, faloodeh, bastani, etc.)
- [ ] Each recipe: AI-drafted → cross-referenced against 2+ authoritative sources → verified → images generated + reviewed
- [ ] Rich recipe pages: substitutions, common mistakes, storage, "serve with" suggestions
- [ ] Each recipe has JSON-LD, canonical, og:image, alt text

### Step 6: Category + Cuisine Hub Pages + Internal Linking
- [ ] `/cuisine/persian` hub page (all Persian recipes)
- [ ] `/category/stew`, `/category/rice`, etc. hub pages
- [ ] Breadcrumbs on recipe pages
- [ ] "You might also like" related recipes section
- [ ] "Serve this with..." cross-links between recipes
- [ ] Ingredient guide pages (saffron, dried lime, barberries, etc.)

### Step 7: Expand to 50+ Recipes
- [ ] Add adjacent cuisines: Middle Eastern (hummus, shawarma, fattoush)
- [ ] Add a few world favorites (carbonara, tikka masala, etc.)
- [ ] Maintain same quality standard
- [ ] Target long-tail keywords: "Authentic Persian Fesenjan for Beginners" not "chicken stew recipe"

### Step 8: Performance + Rich Result Validation
- [ ] Lighthouse 90+ on mobile
- [ ] Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Google Rich Results Test: all recipes pass
- [ ] Search Console: 0 crawl errors, sitemap clean
- [ ] Check indexing rate: 80%+ of recipes indexed

---

## Phase 1 Exit Criteria

### Product/Quality Gates (controllable)
- [ ] 50+ published recipes passing documented QA checklist
- [ ] 100% of recipe pages have valid JSON-LD, canonical, og:image
- [ ] Category + cuisine hub pages exist and are crawlable from homepage
- [ ] 0 crawl errors in Search Console
- [ ] Sitemap auto-updates without manual redeploy
- [ ] Lighthouse 90+ on mobile
- [ ] Trust pages live (About, Editorial Policy, Contact, Privacy)

### Outcome Signals (3-6 month horizon, not blockers)
- 80%+ of published recipes indexed by Google
- 25+ recipes receiving impressions in Search Console
- 10+ recipes with rich result eligibility
- Upward organic traffic trend for 8+ consecutive weeks

---

## What We Are NOT Doing in Phase 1
- ❌ User accounts / authentication
- ❌ Multi-language / translation
- ❌ AI chat features
- ❌ Cook marketplace (Phase 2)
- ❌ Payment processing
- ❌ Native mobile app
- ❌ Complex batch pipelines (n8n, etc.)
- ❌ Full admin panel (ingestion script + direct DB is enough)
- ❌ Email newsletter (add in late Phase 1 or early Phase 2)
- ❌ Social media accounts / marketing (focus on SEO-first)

---

## Phase 2: Marketplace (ONLY after Phase 1 exit criteria met)
- Cook profiles + "Cook this for me" button on recipes
- Location-based cook discovery
- Direct WhatsApp connection
- Cook signup form
- Revenue: featured listings, cook subscriptions

## Phase 3: Scale & Monetize
- In-app ordering (if volume justifies)
- Recipe sponsorship
- Mobile app (React Native or PWA)
- Multi-language expansion (Farsi first, then Arabic, Turkish)
