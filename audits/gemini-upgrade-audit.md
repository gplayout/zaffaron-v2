# Zaffaron v2 - Upgrade Plan Audit & Code Review
**Auditor**: Gemini 3.1 Pro (via OpenClaw)
**Date**: 2026-03-10

## Executive Summary
The overall trajectory of `UPGRADE-PLAN.md` is excellent and aligns with modern recipe SEO and E-E-A-T guidelines. However, there are critical SEO errors in the plan (such as combining Recipe and HowTo schemas) and several key missing elements from the codebase that are required to compete with top-tier recipe sites like Serious Eats or NYT Cooking.

Here is the detailed, 10-point critical review with exact code-level recommendations.

---

### 1. What's MISSING that a top recipe site needs?
- **Dietary Flags**: Top sites highlight if a recipe is Vegan, Gluten-Free, Halal, etc. `types/index.ts` is missing this.
- **Serving Scaler (1x, 2x, 3x)**: Crucial for user experience. Requires storing ingredients as discrete numerical values + fractions, not just strings (`"1 cup"`).
- **Aggregate Ratings**: Even without comments, star ratings are mandatory for Google Rich Snippets.
- **Yield Context**: `servings: 4` is good, but `yield: "1 9-inch pie"` or `"4 bowls"` is better for Schema.org context.
- **Resting/Marinating Time**: Persian food often requires soaking (rice) or marinating (kebabs). `prep_time` and `cook_time` are insufficient. You need `rest_time_minutes`.

### 2. What's WRONG or over-engineered?
- **Schema Conflict (SEO Penalty Risk)**: `UPGRADE-PLAN.md` (Step D9) says: *"HowTo structured data — for step-by-step recipes (in addition to Recipe schema)."* **DO NOT DO THIS.** Google's documentation explicitly states: *"If your page is about a recipe, use Recipe structured data, not HowTo."* Using both can cause confusion or lead to a manual action penalty.
- **Database Fetch Duplication**: In `src/app/recipe/[slug]/page.tsx`, `getRecipeBySlug(slug)` is called in `generateMetadata` AND `RecipePage`. Next.js `fetch` is auto-memoized, but if `getRecipeBySlug` uses the Supabase client directly without React `cache()`, it will hit the database twice per page render.
- **Data before UI (Over-engineering)**: Phase A suggests backfilling all data before building UI. It is much faster to build the UI conditionally (`{recipe.tips && <Tips data={recipe.tips} />}`), test it on 1-2 recipes, and *then* run the data ingestion script.

### 3. Priority order — agree or disagree?
**Disagree.** 
The current order: Data (A) → UI (B) → Hubs (C) → SEO (D) → Polish (E).
**Recommended Order:**
1. **SEO & Meta (Current Phase D) + Schema:** This is foundational. You should not add new UI without the corresponding Schema.org JSON-LD updates.
2. **Hub Pages + Internal Linking (Current Phase C):** Essential for crawling. Recipe pages are currently orphaned from category hubs.
3. **Recipe Page UI (Current Phase B) + Data (Current Phase A) TOGETHER:** Build the UI components for Tips/Storage alongside updating the database for a few test recipes.

### 4. Accessibility (a11y) issues in current code
- **Image Alt Texts**: `RecipeCard.tsx` and `recipe/[slug]/page.tsx` use `alt={recipe.title}`. You already plan to add `image_alt` to the DB. You must update `types/index.ts` to include `image_alt: string` and change the code to `alt={recipe.image_alt || recipe.title}`.
- **Color Contrast**: In `page.tsx`, `text-stone-400` on `bg-stone-50` and the difficulty badge `bg-amber-100 text-amber-700` may fail WCAG AA contrast checks. Verify with a contrast checker.
- **Interactive Checkboxes**: When adding the ingredient checkboxes (Step A9), ensure they use `<button role="checkbox" aria-checked="false">` or native `<input type="checkbox">` so screen readers announce state changes.

### 5. SEO issues in current code
- **Missing Internal Links**: `recipe/[slug]/page.tsx` renders `recipe.cuisine` and `recipe.category` as plain text. These **MUST** be links to `/cuisine/[slug]` and `/category/[slug]`. Topically linking recipes to their parent hubs is the #1 way to build SEO authority.
- **Missing Breadcrumbs**: Mentioned in the plan, but utterly crucial to implement in UI + `BreadcrumbList` JSON-LD.
- **Keywords/Tags**: `recipe.tags` exist in the DB but are not exposed in the `<meta name="keywords">` or, more importantly, the `keywords` field in `RecipeJsonLd`.

### 6. Schema.org compliance gaps (Code-Level)
The `RecipeJsonLd` component in `src/app/recipe/[slug]/page.tsx` needs an overhaul:
- **Author Type**: Google prefers a `Person` for recipes to establish E-E-A-T.
  ```typescript
  author: { "@type": "Person", name: recipe.author || "Zaffaron Kitchen" }
  ```
- **Missing Dates**: Critical for freshness.
  ```typescript
  datePublished: recipe.created_at,
  dateModified: recipe.updated_at,
  ```
- **Missing Keywords**:
  ```typescript
  keywords: recipe.tags.join(", "),
  ```
- **Missing AggregateRating**: Even if you don't have reviews yet, prepare the schema for it.
- **Image Aspect Ratios**: Google Recipe guidelines recommend providing images in 1x1, 4:3, and 16:9 ratios. Currently, it just passes the raw URL.

### 7. Mobile UX concerns
- **Jump to Recipe**: On mobile, long SEO intros (which are coming according to the plan) destroy the UX. Add a floating or top-anchored "Jump to Recipe" button linking to `<section id="recipe-card">`.
- **Ingredient/Step Tracking**: When implementing "Step highlighting" (Step A10), ensure the tap target is large enough (min 44x44px) for mobile users.

### 8. Performance concerns
- **Double DB Query**: As mentioned, wrap `getRecipeBySlug` in React's `cache()` to prevent double fetching during ISR regeneration.
  ```typescript
  import { cache } from 'react';
  export const getRecipeBySlug = cache(async (slug: string) => { /* fetch logic */ });
  ```

### 9. Google Core Web Vitals risks
- **LCP Risk in Homepage**: In `src/app/page.tsx`, the `RecipeCard` components map over recipes. `Image` inside `RecipeCard` does not have `priority`. The first 2-4 images above the fold will drag down your LCP.
  *Fix:* Pass an `index` to `RecipeCard` and conditionally add priority.
  ```tsx
  // page.tsx
  {items.map((recipe, i) => (
    <RecipeCard key={recipe.id} recipe={recipe} priority={i < 4} />
  ))}
  // RecipeCard.tsx
  <Image priority={priority} ... />
  ```

### 10. Recipe JSON-LD completeness check
**Current State:** 60% complete. Valid, but missing rich features.
**Required Additions to `RecipeJsonLd`:**
```typescript
{
  // ... existing fields ...
  "datePublished": recipe.created_at,
  "dateModified": recipe.updated_at,
  "keywords": recipe.tags.join(", "),
  "author": {
    "@type": "Person",
    "name": recipe.author || "Zaffaron"
  },
  "recipeInstructions": recipe.instructions.map((s: Instruction) => ({
    "@type": "HowToStep",
    "name": `Step ${s.step}`, // Add name
    "text": s.text,
    "url": `https://zaffaron.com/recipe/${recipe.slug}#step-${s.step}` // Add anchor linking
  }))
}
```

### Actionable Next Steps for Developer
1. **Delete** Step D9 (HowTo Schema) from `UPGRADE-PLAN.md` immediately to avoid SEO penalties.
2. **Update** `types/index.ts` to include `image_alt`, `author`, `rest_time_minutes`, and `dietary_flags`.
3. **Refactor** `RecipeJsonLd` using the snippet provided in Section 10.
4. **Wrap** your Supabase fetchers in React `cache()`.
5. **Hyperlink** categories and cuisines in the `RecipePage` component immediately to fix the orphan page SEO issue.
