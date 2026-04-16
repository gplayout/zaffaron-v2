# Zaffaron SEO, Structured Data & Performance Audit
**Auditor:** Opus (Subagent)
**Date:** April 15, 2026

## 1. CRITICAL (Must fix before next deploy)
*   **Sitemap Mismatch & Leakage**: The database purportedly has 1,650 recipes, but `/sitemap.xml` lists **1,894** `<loc>` entries under `/recipe/`. Draft, unpublished, or duplicate recipes are leaking into the sitemap. This dilutes crawl equity and could cause Google to index unfinished pages.
*   **Missing Ingredients in Sitemap**: The project specs state that `ingredients` are a core page type, but there are **0** ingredient URLs in `/sitemap.xml`. Google will struggle to discover and index these pages without XML sitemap inclusion.
*   **Crawl Trap Risk on Internal Search/Filters**: `robots.txt` explicitly blocks AI bots but uses a blanket `Allow: /` for regular crawlers. It does *not* disallow `/search` or `/filter` routes. This is a massive SEO risk. Googlebot will crawl every combination of search queries (e.g., `?q=chicken`), generating thousands of thin/duplicate content pages that drain your crawl budget.
    *   *Fix*: Add `Disallow: /search` and `Disallow: /*?q=*` to `robots.txt`.

## 2. HIGH (Fix this week)
*   **Calendar OG Image is Missing**: The `/calendar/nowruz` page successfully sets a page-specific `og:title`, but `og:image` is completely `undefined`. When users share these event pages on WhatsApp or Twitter, the cards will look broken or fallback to an unoptimized default (or nothing at all).
*   **Category Pages Lack JSON-LD & Pagination Tags**:
    *   Pages like `/category/kebab` and `/category/soup` have **0 JSON-LD tags**. They should feature an `ItemList` or `CollectionPage` schema, as well as `BreadcrumbList`.
    *   While the body contains pagination links (e.g., `?page=2`), the `<head>` is missing `<link rel="next" href="...">` and `<link rel="prev" href="...">`. Without these, Google struggles to consolidate ranking signals across paginated series.
*   **Recipe JSON-LD Author Type**: `RecipeJsonLd.tsx` sets the author to `{"@type": "Organization", "name": "Zaffaron Kitchen"}`. While technically valid, Google's rich snippet guidelines strongly prefer a `Person` entity for recipe authors. This is a common trigger for GSC warnings.

## 3. MEDIUM (Fix this month)
*   **Canonical URL Handling on Pagination**: If `/category/kebab?page=2` hardcodes the canonical URL to the base `/category/kebab` instead of self-referencing `?page=2`, Google will drop page 2+ from the index entirely, meaning recipes only listed on deeper pages won't get crawled via category routes. Verify that paginated pages self-canonicalize.
*   **Missing Video Property in Recipe Schema**: `RecipeJsonLd.tsx` does not output a `video` field. Even if you don't host videos yet, Google Search Console will flag this as "Missing field 'video' (optional)". It's worth noting for the roadmap.

## 4. LOW (Backlog)
*   **Form Label Accessibility**: The newsletter input relies purely on `aria-label` and `placeholder`. For strict WCAG compliance, add a visually hidden `<label class="sr-only" for="newsletter-email">` element. Screen readers sometimes mishandle `aria-label` on inputs without explicit label nodes.
*   **Explicit Googlebot Directive**: While `User-Agent: *` followed by `Allow: /` works fine, some enterprise SEO auditing tools will flag the lack of an explicit `User-Agent: Googlebot` block. Adding it can quiet down automated SEO reports.

## 5. POSITIVE (What's actually good)
*   **Flawless Heading Hierarchy**: The homepage structure is textbook perfect. Exactly one `<h1>` ("Authentic Recipes from Every Kitchen"), semantic `<h2>` tags for sections (e.g., "Editor's Picks", "Persian Recipes"), and `<h3>` tags for individual recipe cards. This is highly accessible and great for screen readers.
*   **Brilliant Recipe Prep Time Logic**: In `RecipeJsonLd.tsx`, capping `activePrepMinutes` to 120 minutes is an incredibly smart SEO optimization. Google's recipe carousel heavily penalizes recipes with 12+ hour prep times (due to marinating/soaking), treating them as "too difficult". Capping it ensures visibility in "Quick" or "Under 2 hours" rich snippet filters.
*   **JSON-LD ISO Formatting**: Time values like `PT120M` are perfectly mapped. The dietary badges seamlessly inject schemas like `https://schema.org/VegetarianDiet` only when appropriate.
*   **Proactive AI Scraping Defense**: Your `robots.txt` effectively blocks `GPTBot`, `ClaudeBot`, `anthropic-ai`, and `Google-Extended`. This protects your 1,650 verified recipes from being swallowed for free by LLM training runs.
