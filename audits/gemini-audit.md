# Zaffaron v2 Audit Report

## Executive Summary
The foundation of Zaffaron v2 is clean, modern, and avoids the over-engineering traps of v1. The Next.js 16 + Supabase stack is perfectly suited for this use case. However, there are **critical SEO omissions** (missing JSON-LD Recipe schema), **database performance traps** (full table scans on search), and a **workflow bottleneck** (relying on direct DB edits for complex JSONB fields). 

Here is the brutally honest breakdown.

---

## A. Plan Audit

**1. Is Phase 1 plan realistic? Complete? Well-ordered?**
- **Mostly realistic, but misordered.** SEO steps like structured data (JSON-LD) are pushed to Step 4. **This must be in Step 1/2.** Google will index your pages early; without schema markup, you will miss out on Rich Snippets, which are life-or-death for recipe sites.
- **Exit Criteria mismatch:** Expecting "1,000+ organic visitors" immediately upon finishing Phase 1 is unrealistic. SEO is a lagging metric that takes 3-6 months. 
  - *Recommendation:* Change the exit criteria to output-based metrics: "100 recipes published with 0 Core Web Vitals errors and 100% valid Rich Snippets."

**2. The "Not Doing" List Trap**
- You explicitly stated: *❌ Admin panel (direct DB for now)*.
- **Reality Check:** Your `ingredients` and `instructions` are complex JSONB arrays. Hand-typing `{"item": "salt", "amount": "1", "unit": "tsp"}` into the Supabase dashboard 1,000+ times for 100 recipes is guaranteed to cause syntax errors, missing fields, and severe burnout. 
- *Fix:* You don't need a full admin panel, but you **must** build a simple local ingestion script (e.g., reading from Markdown/JSON files and pushing to Supabase) to handle data entry.

---

## B. Architecture Audit

**1. Stack Choice**
- Next.js 16 + Supabase is excellent. It gives you edge caching, fast SSR/SSG, and an easy path to Phase 2 (Marketplace).

**2. Database Schema**
- A single table is fine for Phase 1, but **not future-proof**.
- **Missing Columns:** You have no `author_id` or `source`. Even before Phase 2, Google's E-E-A-T guidelines require knowing *who* wrote/verified the recipe. Add an `author` column now.
- **Missing Indexes:** You need a GIN index on your JSONB columns (`ingredients`) if you ever want to filter by them. 

**3. Rendering Strategy (SSG vs SSR)**
- Currently, `src/app/recipe/[slug]/page.tsx` is defaulting to dynamic rendering (SSR) on every request because you haven't implemented `generateStaticParams`.
- *Fix:* Recipes rarely change. You must export `generateStaticParams` to build these pages statically (SSG) at deploy time, and use ISR (e.g., `revalidate = 3600`) to periodically update them. This will make load times nearly instant and drastically reduce database queries.

**4. Image Strategy**
- **Unsplash is a bad idea.** Users recognize generic stock food photography, which kills trust.
- **AI (Midjourney/DALL-E):** Good, but you must prompt it meticulously to match the *actual* ingredients (e.g., AI often puts tomatoes in a recipe that doesn't use them). 
- *Recommendation:* Stick to high-quality AI images reviewed by a human, and host them in Supabase Storage.

---

## C. Code Audit

### CRITICAL
- **Security / Image Optimization Drain:** In `next.config.ts`, you have `hostname: "**"`. This allows anyone to hotlink any image through your Next.js server, draining your Vercel Image Optimization quota and opening up SSRF vulnerabilities. Restrict this to `images.unsplash.com` and `[your-project].supabase.co`.
- **Security / Bypass RLS:** In `src/lib/supabase-server.ts`, you use `SUPABASE_SERVICE_ROLE_KEY`. This bypasses **all** database rules. While you are manually appending `.eq("published", true)`, this is a dangerous habit. You should use the `NEXT_PUBLIC_SUPABASE_ANON_KEY` on the server so your RLS policies enforce security automatically.

### HIGH
- **SEO / No JSON-LD:** You are missing `application/ld+json` Recipe schema in your `recipe/[slug]/page.tsx`. Without this, Google will not show your recipes with photos, ratings, and cook times in search results.
- **Performance / Search DB Queries:** In `src/app/search/page.tsx`, you use `.or('title.ilike.%${query}%,...')`. This forces PostgreSQL to do a full table scan. Fine for 100 recipes, but it scales terribly. Look into Supabase Full Text Search (`to_tsvector`).
- **SEO / Metadata:** Your `layout.tsx` is missing a `metadataBase` configuration. Without it, your OpenGraph image URLs might resolve as relative paths, breaking social sharing previews.

### MEDIUM / LOW
- **TypeScript:** You are forcefully casting `(data as Recipe[])`. You should generate Supabase TypeScript definitions via the CLI and pass them to the client: `createClient<Database>(...)`.
- **Accessibility:** The search input in `search/page.tsx` has no `<label>` or `aria-label` for screen readers.

---

## D. Recipe Quality Strategy

**1. Generation at Scale**
- Do not write these by hand. Use Claude 3.5 Sonnet or GPT-4o with a **strict JSON schema prompt** that mirrors your database types. 
- Instruct the AI to cross-reference 3 traditional recipes for the target dish and output an "averaged, optimized, and verified" version.

**2. Quality Checklist (Automate this)**
Before a recipe is marked `published = true`, run a script that verifies:
1. **Math Check:** `prep_time_minutes` + `cook_time_minutes` = Total time mentioned in text.
2. **Ingredient Check:** Every ingredient in the JSON array *must* appear in the instructions array. (AI often hallucinates ingredients and forgets to tell you when to add them).
3. **Yield Check:** Are the amounts realistic for the stated `servings`?

---

## E. Growth/SEO Strategy

**1. Ranking in 2026**
- **E-E-A-T is everything.** Google aggressively filters out "AI recipe spam". To rank, your site needs to look like it has a human pulse. Add a small "Verified by Chef [Name]" or "Tested in the Zaffaron Kitchen" badge to the pages.
- **Zero Cumulative Layout Shift (CLS):** Your images currently use `fill` with an aspect ratio container. This is good, but make sure the container doesn't collapse before the image loads.

**2. Content Strategy**
- **Don't target primary keywords.** You will not outrank NYT Cooking for "Lasagna Recipe".
- **Target Long-Tail & Niche:** Aim for "Authentic Persian Fesenjan for Beginners" or "Dairy-Free Authentic Carbonara".
- **Internal Linking:** Bots don't use search bars. You need heavily interlinked category pages (`/cuisine/persian`, `/category/dinner`) accessible from the homepage so Googlebot can crawl the entire site efficiently. The current UI relies heavily on the Search bar to find non-homepage recipes.