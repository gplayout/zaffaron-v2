# Opus 4.6 Final Merged Audit — Zaffaron v2 Upgrade Plan
**Date:** 2026-03-10 | **Auditors verified:** GPT 5.4 + Gemini 3.1 Pro
**Verifier:** Claude Opus 4.6 (code-level verification against actual files)

---

## Verification Summary

| Finding | GPT | Gemini | Opus Verdict |
|---------|-----|--------|--------------|
| Double DB fetch | ❌ Claims bug | ❌ Claims bug | ✅ **FALSE** — `get-recipe.ts` already uses `cache()` |
| Homepage `select("*")` overfetch | ❌ Bug | — | ✅ **TRUE** — confirmed in `page.tsx` |
| Category/cuisine not linked | ❌ Both | ❌ Both | ✅ **TRUE** — plain text in both card and detail |
| Tags are dead pills | ❌ GPT | — | ✅ **TRUE** — no links, just spans |
| No skip link | ❌ GPT | — | ✅ **TRUE** — not in layout.tsx |
| No breadcrumbs | ❌ Both | ❌ Both | ✅ **TRUE** — not in recipe page |
| Image alt uses title not image_alt | ❌ Both | ❌ Both | ✅ **TRUE** — `alt={recipe.title}` |
| No visible author/date/verification | ❌ GPT | — | ✅ **TRUE** — not rendered |
| JSON-LD missing datePublished/Modified | ❌ Both | ❌ Both | ✅ **TRUE** — not in RecipeJsonLd |
| Author as Organization not Person | ❌ Both | ❌ Both | ✅ **TRUE** — hardcoded Organization |
| HowTo schema dangerous | ❌ Both | ❌ Both | ✅ **TRUE** — remove from plan |
| AggregateRating placeholder bad | ❌ GPT | — | ✅ **TRUE** — remove from plan |
| FAQ JSON-LD without visible FAQ | ❌ GPT | — | ✅ **TRUE** — remove until FAQ content exists |
| Sitemap priorities low-value | ❌ GPT | — | ✅ **TRUE** — Google ignores these |
| Homepage limit 24 no archive | ❌ GPT | — | ✅ **TRUE** — 16 recipes hidden |
| LCP risk (no priority on cards) | — | ❌ Gemini | ✅ **TRUE** — no priority prop |
| Low contrast text | ❌ GPT | ❌ Gemini | ✅ **LIKELY** — `text-stone-400` on `bg-stone-50` |
| Gemini says add AggregateRating | — | ❌ Says prepare | ❌ **WRONG** — do NOT add fake ratings |
| Recipe `revalidate=60` too aggressive | ❌ GPT | — | ⚠️ **MINOR** — acceptable for now |

**Score: GPT 5.4 found 15 real issues, 1 false (DB cache). Gemini found 10 real issues, 1 wrong (AggregateRating), 1 false (DB cache).**

---

## FINAL EXECUTION PLAN (Merged + Verified)

### Phase 0: Foundation Fixes (30 min)
_No new features, just fix what's broken_

1. **Homepage: stop `select("*")`** — select only card fields
2. **Homepage: order by `published_at`** not `created_at`
3. **Homepage: semantic list** — `<section>` + `<ul>` + `<li>`
4. **Layout: add skip link** — `<a href="#main-content" className="sr-only focus:not-sr-only">`
5. **Layout: add `id="main-content"`** to `<main>`
6. **Focus styles** — add `focus-visible:ring-2 focus-visible:ring-amber-600` to cards + links
7. **Footer: increase text size** — `text-xs` → `text-sm`, improve contrast
8. **RecipeCard: add `priority` prop** — first 4 cards get `priority={true}` for LCP

### Phase 1: Types + Data Model (15 min)
_Update TypeScript to match DB schema v2_

9. **Update `types/index.ts`** — add: `image_alt`, `author`, `published_at`, `verification_status`, `tips`, `storage_notes`, `serve_with`, `substitutions`, `source_urls`, `category_slug`, `cuisine_slug`
10. **Set `published_at`** for all 40 recipes (= `created_at` for now)
11. **Set `verification_status`** = "verified" for all 40
12. **Set `author`** = "Zaffaron Kitchen" for all 40
13. **Set `category_slug` and `cuisine_slug`** for all 40

### Phase 2: Recipe Page Enhancement (1 hour)
_Make recipe pages competitive_

14. **Visible breadcrumbs** — `Home > Persian > Stews > Ghormeh Sabzi` with links
15. **BreadcrumbList JSON-LD** on every recipe page
16. **Author/date/verification block** — visible under title
17. **Link cuisine/category** — in both card and detail page
18. **Use `image_alt`** — `alt={recipe.image_alt || recipe.title}` everywhere
19. **Improve RecipeJsonLd:**
    - Add `datePublished`, `dateModified`, `keywords`, `@id`, `url`, `inLanguage`
    - Change author to `Person` type
    - Add `publisher.logo`
    - Add `name` to HowToStep
20. **Improve `generateMetadata`:**
    - Add `openGraph.url`, `publishedTime`, `modifiedTime`
    - Add image alt in OG
    - Add default OG fallback image
21. **Tips section** — render `tips` if exists
22. **Substitutions section** — render `substitutions` if exists
23. **Storage notes section** — render `storage_notes` if exists
24. **"Pairs Well With" section** — render `serve_with` if exists, link to matching recipes
25. **Tags → links or remove** — either link to `/tag/[slug]` or remove dead pills
26. **Print button** — simple `window.print()` with `@media print` CSS

### Phase 3: Hub Pages + Archives (1 hour)
_Make the site crawlable and build topical authority_

27. **`/recipes` archive page** — all recipes, crawlable
28. **`/cuisine/[slug]` pages** — Persian, Middle Eastern, etc. with SEO description
29. **`/category/[slug]` pages** — stew, rice, kebab, etc. with SEO description
30. **Homepage: link to hubs** — category tabs/chips at top
31. **Homepage: "View all recipes" link** → `/recipes`
32. **Related recipes section** on recipe page — same cuisine/category

### Phase 4: SEO Polish (30 min)

33. **Default OG image** — create 1200x630 Zaffaron branded image
34. **Favicon + apple-touch-icon + manifest.json**
35. **Sitemap: include hub pages**
36. **robots.txt: verify hub pages crawlable**

### Phase 5: Data Enrichment (AI-assisted, ~$5)
_Fill remaining empty fields for all 40 recipes_

37. **Populate `tips`** for all 40 recipes
38. **Populate `substitutions`** for all 40
39. **Populate `storage_notes`** for all 40
40. **Populate `serve_with`** for all 40 (cross-reference with existing recipes)
41. **Populate `source_urls`** for all 40

---

## REMOVED FROM PLAN (bad ideas)

| Item | Reason |
|------|--------|
| HowTo JSON-LD (D9) | Google forbids Recipe + HowTo together |
| AggregateRating placeholder | Fake ratings = spam penalty |
| FAQ JSON-LD without visible FAQ | Google rejects invisible structured data |
| Sitemap priorities | Google ignores them |
| Ingredient checkboxes | Premature — fix foundation first |
| Step highlighting | Premature |
| Dark mode | Phase 2+ at earliest |
| Micro-animations | Phase 2+ |
| Hamburger menu | Not needed yet with few nav items |
| World cuisine filters | Conflicts with Persian-first strategy |
| Serving scaler | Requires schema redesign, defer |
| Nutrition card | Only have calories, defer until real data |

---

## DEFERRED (good ideas, wrong time)

| Item | When |
|------|------|
| Ingredient checkboxes | After Phase 5 |
| Step highlighting | After Phase 5 |
| Jump to Recipe button | After long-form intros exist |
| FAQ visible + JSON-LD | After FAQ content is written |
| Ingredient glossary pages | Phase 2 |
| Dark mode | Phase 2 |
| Email newsletter | Phase 2 |
| Serving scaler | Phase 2 (needs ingredient schema redesign) |

---

## Cost & Time Estimate

| Phase | Time | Cost |
|-------|------|------|
| Phase 0: Foundation | 30 min | $0 |
| Phase 1: Types + Data | 15 min | $0 |
| Phase 2: Recipe Page | 1 hour | $0 |
| Phase 3: Hub Pages | 1 hour | $0 |
| Phase 4: SEO Polish | 30 min | $0 |
| Phase 5: Data Enrichment | 30 min | ~$5 AI |
| **TOTAL** | **~4 hours** | **~$5** |

---

## Rule: DO NOT TOUCH
- ❌ `image_url` — images are DONE
- ❌ Image generation pipeline
- ❌ `image_source` field
- ❌ Supabase Storage bucket

---

_Verified by Opus 4.6 against actual source code. Both GPT and Gemini audits were mostly correct with 1-2 false findings each. This plan merges all valid findings into a single prioritized execution order._
