# GPT Upgrade Audit — Zaffaron v2

Date: 2026-03-10
Target: `UPGRADE-PLAN.md` reviewed against current code in:
- `src/app/page.tsx`
- `src/app/recipe/[slug]/page.tsx`
- `src/components/RecipeCard.tsx`
- `src/app/layout.tsx`
- `src/types/index.ts`
- `PLAN.md`

---

## Brutal summary

`UPGRADE-PLAN.md` is not bad, but it is too much **UI wishlist** and not enough **information architecture, trust, crawlability, and code hygiene**.

Right now the site is clean but thin:
- homepage is visually fine but overfetches and hides 16+ recipes behind a hard limit of 24
- recipe pages have the bare minimum content and bare minimum schema
- the plan prioritizes a bunch of low-value polish before fixing obvious SEO/accessibility/content gaps
- some items are actively wrong (`AggregateRating placeholder`), some are cargo-cult SEO (`sitemap priorities`), and some are gimmicks too early (ingredient checkboxes, step highlighting, dark mode, micro-animations)

`PLAN.md` is actually stronger than `UPGRADE-PLAN.md` on fundamentals. The upgrade plan should be rewritten to align with it.

---

## 1) What’s MISSING that a top recipe site needs?

### 1.1 Visible trust signals on recipe pages
Top recipe sites do not just *claim* recipes are tested — they show who wrote them, when they were published, when they were updated, and whether they were verified.

**Missing from current code and under-specified in `UPGRADE-PLAN.md`:**
- visible author line
- visible published/updated dates
- visible verification badge or editorial note
- link to editorial policy / about from recipe page

**Code recommendation:** add these fields to `Recipe` and render them directly under the title in `src/app/recipe/[slug]/page.tsx`.

```ts
// src/types/index.ts
export interface Recipe {
  // existing...
  author: string | null;
  published_at: string | null;
  verification_status: "draft" | "reviewed" | "verified";
  image_alt: string | null;
  category_slug: string;
  cuisine_slug: string;
}
```

```tsx
// src/app/recipe/[slug]/page.tsx
<p className="mt-3 text-sm text-stone-600">
  By {recipe.author ?? "Zaffaron Kitchen"} · Published {formatDate(recipe.published_at)} · Updated {formatDate(recipe.updated_at)}
</p>
{recipe.verification_status === "verified" && (
  <p className="mt-2 text-sm font-medium text-emerald-700">Tested in the Zaffaron Kitchen</p>
)}
```

---

### 1.2 Real internal linking, not just taxonomy pages
The plan includes category/cuisine hubs, but it misses a **real related-recipes system**. `serve_with` is not enough.

A serious recipe site needs:
- related recipes by cuisine/category/main ingredient
- reciprocal linking between related recipes
- linked tags only if they map to real landing pages

Right now `recipe.tags` render as dead hashtag pills in `src/app/recipe/[slug]/page.tsx`. That is wasted UI and wasted crawl value.

**Code recommendation:** either:
1. turn tags into real links to `/tag/[slug]` pages, or
2. remove them until those pages exist.

Better: add a `RelatedRecipes` section below instructions.

---

### 1.3 Long-form editorial content
Competing with Serious Eats / NYT Cooking is not about adding pills and hover effects. It is about **editorial depth**.

The current plan has `tips`, `substitutions`, `storage_notes`, `serve_with` — good — but it still misses:
- short intro / context section
- “Why this recipe works”
- “Common mistakes” / troubleshooting
- ingredient notes / sourcing notes
- FAQ content that is actually visible on page

If recipe pages stay as **title + stats + image + ingredients + instructions**, they will remain thin.

**Recommendation:** add either a markdown body or structured fields like:
- `intro`
- `why_it_works`
- `common_mistakes`
- `ingredient_notes`
- `faq`

Do not add FAQ JSON-LD unless the FAQ is visible on-page.

---

### 1.4 Crawlable archive strategy
Homepage currently loads only 24 recipes:

```ts
.limit(24)
```

That means 16+ recipes are not reachable from the homepage unless other pages link to them.

A top recipe site needs:
- `/recipes` archive page
- pagination or load-more with real URLs
- crawlable category/cuisine archives linked from the main nav/homepage

**Missing from `UPGRADE-PLAN.md`:** a dedicated **all-recipes archive** with crawlable pagination.

`Load More` alone is not enough unless it updates the URL or is backed by paginated routes.

---

### 1.5 Ingredient glossary / pantry guide pages
For Persian food, this matters a lot.

Topically strong recipe sites build authority with pages like:
- saffron guide
- dried lime guide
- barberries guide
- tahdig guide
- Persian rice guide

`PLAN.md` mentions ingredient guide pages. `UPGRADE-PLAN.md` misses that. That is a mistake.

---

### 1.6 Real Persian-first information architecture
`PLAN.md` correctly says: **lead with Persian cuisine**.
`UPGRADE-PLAN.md` drifts too quickly into “Persian / Middle Eastern / Indian / World”.

That weakens topical authority early.

A top site in this niche should win:
- Persian stews
- Persian rice dishes
- Persian kebabs
- Persian breakfasts
- Persian desserts

Then expand.

---

### 1.7 Better image metadata usage
The plan mentions `image_alt` but current code does not use it because `Recipe` type does not include it.

Current code:

```tsx
alt={recipe.title}
```

That is generic, repetitive, and weak for accessibility and image SEO.

**Recommendation:** add `image_alt` to the type and use it everywhere.

```tsx
alt={recipe.image_alt || recipe.title}
```

---

### 1.8 On-page breadcrumb UI
The plan mentions BreadcrumbList JSON-LD, but a good site also needs **visible breadcrumbs**.

That helps:
- users orient themselves
- keyboard/screen-reader navigation
- internal linking
- crawl depth

Right now there is no breadcrumb UI in `src/app/recipe/[slug]/page.tsx`.

---

## 2) What’s WRONG or over-engineered?

### 2.1 `AggregateRating placeholder` is wrong
This item in `UPGRADE-PLAN.md` should be deleted:

> Review/Rating placeholder — Schema.org AggregateRating (future, needs real user data)

Do **not** add placeholder ratings. Fake or empty review schema is spammy and can get ignored or penalized.

**Verdict:** remove entirely until real user reviews exist.

---

### 2.2 FAQ JSON-LD is wrong unless you also render visible FAQs
The plan says:

> FAQ JSON-LD — add FAQ structured data to recipe pages

That is only valid if the page visibly contains those FAQs and answers. Otherwise this is SEO theater.

**Verdict:** only do this after adding a real FAQ section to recipe pages.

---

### 2.3 Separate HowTo schema is probably unnecessary
Current recipe schema already uses `HowToStep` inside `recipeInstructions`:

```ts
recipeInstructions: recipe.instructions.map((s: Instruction) => ({
  "@type": "HowToStep",
  text: s.text,
}))
```

That is already the correct direction.

Adding a completely separate `HowTo` JSON-LD block is usually duplication unless the page is actually a standalone how-to guide.

**Verdict:** improve the existing `Recipe` schema instead of emitting a second parallel `HowTo` object.

---

### 2.4 Sitemap priorities are low-value busywork
The plan says:

> Sitemap priorities — homepage 1.0, hub pages 0.8, recipes 0.7

Google mostly ignores sitemap priority. This is not where wins come from.

**Verdict:** deprioritize. Spend that time on crawlable archives, internal linking, and page depth.

---

### 2.5 Ingredient checkboxes and step highlighting are too early
These are cute, not core.

Before building client-side cook mode widgets, fix:
- breadcrumbs
- related recipes
- author/date/verification
- archive pages
- better schema
- alt text
- semantic structure
- internal links

**Verdict:** move to the very end.

---

### 2.6 Dark mode is phase-1 fluff
A recipe site trying to establish search presence does not need dark mode before it needs trust pages, archives, and content depth.

**Verdict:** defer.

---

### 2.7 Hamburger menu is premature
The plan says mobile nav should become a hamburger menu.

That is not automatically better. If you only have a few destinations, a hidden menu can hurt discovery.

What you actually need first:
- visible links to key hubs
- searchable archive
- maybe horizontal category tabs

**Verdict:** don’t hide navigation just because mobile exists.

---

### 2.8 Nutrition card is fake unless you have real nutrition data
Current type only has:

```ts
calories_per_serving: number | null;
```

The plan wants a structured nutrition card with calories, protein, fat, carbs.

That requires real DB fields and real data.

**Verdict:** either add proper nutrition fields first or drop this from phase 1.

---

### 2.9 “World cuisines” too early conflicts with the actual strategy
`PLAN.md` says Persian-first. That is the right call.

`UPGRADE-PLAN.md` adds filters for Indian and World too early. That dilutes the niche before it has won the niche.

**Verdict:** narrow early. Expand later.

---

### 2.10 The cost estimate is fantasy
> Total: ~$5-10

If the plan includes real verification, cross-referencing, structured enrichment, taxonomy cleanup, and code work, the API cost might be low, but the **editorial labor is not**.

**Verdict:** the estimate is misleading. Cheap tokens are not the same thing as trustworthy food content.

---

## 3) Priority order — agree or disagree?

## Disagree with the current order.

The current order starts with bulk data enrichment and types, then recipe page enhancement, then hubs, then SEO polish.

That is backwards in important ways.

### Why it’s wrong
1. **You are enriching data before the final page architecture is locked.**
   You should decide what the page needs first, then enrich the data to support it.

2. **Technical fundamentals are under-prioritized.**
   `PLAN.md` correctly emphasizes caching/deduping DB calls, public-read security, image domain restrictions, metadata hygiene, and crawlability.

3. **The current site already has some SEO work.**
   Recipe JSON-LD and canonical URLs already exist. The real issue is that they are incomplete, not absent.

4. **Discovery is broken before polish is lacking.**
   The homepage shows 24 recipes and stops. That is a bigger problem than hover effects.

### Recommended order

#### Phase 0 — Foundation fixes
- fix public-read architecture and any service-role exposure
- dedupe recipe fetches (`generateMetadata` + page)
- restrict image domains in `next.config.ts`
- add default OG image, manifest, apple-touch-icon
- add skip link + focus styles + semantic list structure
- stop overfetching homepage data

#### Phase 1 — Taxonomy + data model
- lock category/cuisine slugs
- add `author`, `published_at`, `verification_status`, `image_alt`
- add `tips`, `substitutions`, `storage_notes`, `serve_with`
- add DB constraints and indexes

#### Phase 2 — Core recipe page information architecture
- visible breadcrumbs
- visible author/date/verification
- linked cuisine/category
- related recipes
- tips/substitutions/storage/serve-with
- print button / jump links

#### Phase 3 — Crawlable archives and hubs
- `/recipes`
- `/category/[slug]`
- `/cuisine/[slug]`
- homepage links into those hubs
- pagination / indexable archives

#### Phase 4 — Schema improvements tied to visible content
- improved Recipe JSON-LD
- BreadcrumbList JSON-LD
- FAQPage only if visible FAQ exists
- better OG/Twitter metadata

#### Phase 5 — Batch content enrichment
- fill the new fields for all recipes
- verify data quality against actual page needs

#### Phase 6 — Nice-to-have UI polish
- animations
- checkboxes
- step highlighting
- dark mode

---

## 4) Accessibility issues in current code

## 4.1 No skip link in `src/app/layout.tsx`
You have `header`, `main`, `footer`, which is good. But there is no skip link.

**Fix:**

```tsx
<body className={...}>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-stone-900"
  >
    Skip to content
  </a>
  ...
  <main id="main-content" className="mx-auto max-w-5xl px-4 py-8">
    {children}
  </main>
</body>
```

---

## 4.2 Weak keyboard focus styles
`RecipeCard` and footer links rely heavily on hover styling. There is no strong `focus-visible` treatment.

Current card link:

```tsx
className="group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
```

**Fix:**

```tsx
className="group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
```

Apply similar focus treatment to header/footer links.

---

## 4.3 Low-contrast small text
There are several likely weak contrast combinations for small text:
- `text-xs text-stone-400` in recipe step timing
- `text-xs text-stone-400` in footer
- `text-stone-400` tags and secondary metadata

For small text, this is risky.

**Fix:** move small text at least to `text-stone-600` or increase font size where needed.

Examples:

```tsx
<p className="mt-1 text-sm text-stone-600">{step.time_minutes} minutes</p>
```

```tsx
<div className="flex flex-wrap justify-center gap-4 text-sm text-stone-600">
```

---

## 4.4 Tiny footer links / touch targets
Footer links are `text-xs` and close together. On mobile this is annoying to tap.

**Fix:** use `text-sm`, more vertical padding, stronger contrast.

---

## 4.5 Homepage grid lacks semantic list structure
In `src/app/page.tsx`, the homepage renders a raw `<div>` grid of cards. Screen readers benefit from list semantics here.

**Fix:**

```tsx
<section aria-labelledby="latest-recipes">
  <h2 id="latest-recipes" className="sr-only">Latest recipes</h2>
  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((recipe) => (
      <li key={recipe.id}>
        <RecipeCard recipe={recipe} />
      </li>
    ))}
  </ul>
</section>
```

---

## 4.6 Image alt text is generic
Both card and recipe page use the recipe title as alt text.

That is barely acceptable, but not good.

**Fix:** use `image_alt` from the DB.

```tsx
alt={recipe.image_alt || recipe.title}
```

---

## 4.7 Missing breadcrumb navigation hurts orientation
This is both an SEO and accessibility issue.

**Fix:** render a real breadcrumb nav at the top of the recipe page.

```tsx
<nav aria-label="Breadcrumb" className="mb-4">
  <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
    <li><Link href="/">Home</Link></li>
    <li aria-hidden="true">›</li>
    <li><Link href={`/cuisine/${recipe.cuisine_slug}`}>{recipe.cuisine}</Link></li>
    <li aria-hidden="true">›</li>
    <li><Link href={`/category/${recipe.category_slug}`}>{recipe.category}</Link></li>
    <li aria-hidden="true">›</li>
    <li aria-current="page">{recipe.title}</li>
  </ol>
</nav>
```

---

## 5) SEO issues in current code

## 5.1 Homepage hides recipes after 24 with no crawlable path forward
Current homepage query:

```ts
.order("created_at", { ascending: false })
.limit(24)
```

Problems:
- not ordered by `published_at`
- no archive route shown here
- older recipes risk being buried

**Fix:**
- order by `published_at` desc
- add `/recipes` archive page
- link to category/cuisine pages from home
- add pagination or archive navigation

---

## 5.2 Homepage overfetches with `select("*")`
This is performance-related, but it also affects SEO indirectly via slower TTFB.

Cards do not need full recipe payloads like ingredients/instructions.

**Fix in `src/app/page.tsx`:**

```ts
const CARD_FIELDS = `
  id,
  slug,
  title,
  description,
  image_url,
  image_alt,
  prep_time_minutes,
  cook_time_minutes,
  servings,
  difficulty,
  category,
  category_slug,
  cuisine,
  cuisine_slug,
  calories_per_serving,
  published_at
`;

const { data: recipes, error } = await supabaseServer
  .from("recipes_v2")
  .select(CARD_FIELDS)
  .eq("published", true)
  .order("published_at", { ascending: false })
  .limit(24);
```

---

## 5.3 Category/cuisine text is not linked
In both `RecipeCard.tsx` and `recipe/[slug]/page.tsx`, category and cuisine are rendered as plain text.

That wastes internal linking opportunities.

**Fix:** use slug fields and make them links.

```tsx
<Link href={`/cuisine/${recipe.cuisine_slug}`}>{recipe.cuisine}</Link>
<Link href={`/category/${recipe.category_slug}`}>{recipe.category}</Link>
```

---

## 5.4 Recipe pages are thin
Current recipe page content is basically:
- title
- description
- stats
- image
- ingredients
- instructions
- tags

That is not enough for competitive recipe SEO in 2026.

**Needed visible content:**
- why this recipe works
- tips
- substitutions
- storage
- serve with
- common mistakes
- author + dates + verification
- related recipes

The plan partially covers this, but not strongly enough.

---

## 5.5 Metadata is too light
`generateMetadata()` currently sets:
- title
- description
- canonical
- basic OG title/description/type/images

Missing high-value metadata:
- `openGraph.url`
- `openGraph.siteName`
- `openGraph.images[].alt`
- `publishedTime`
- `modifiedTime`
- author metadata
- twitter image fallback
- default OG fallback image if `recipe.image_url` is absent

**Fix:**

```ts
const url = `https://zaffaron.com/recipe/${recipe.slug}`;
const ogImage = recipe.image_url || "https://zaffaron.com/og-default.jpg";

return {
  title: recipe.title,
  description: recipe.description,
  alternates: { canonical: url },
  openGraph: {
    url,
    title: recipe.title,
    description: recipe.description,
    type: "article",
    siteName: "Zaffaron",
    publishedTime: recipe.published_at ?? undefined,
    modifiedTime: recipe.updated_at,
    images: [{
      url: ogImage,
      alt: recipe.image_alt || recipe.title,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: recipe.title,
    description: recipe.description,
    images: [ogImage],
  },
};
```

---

## 5.6 Claims of “verified” and “tested” are not supported visibly
Homepage copy says:

> Every recipe tested. Every measurement exact. Every step clear.

Layout metadata says:

> Discover authentic, verified Persian recipes...

But the current recipe page does not show:
- who tested it
- what verified means
- source basis
- when it was updated

That weakens trust and E-E-A-T.

---

## 6) Schema.org compliance gaps

Current `RecipeJsonLd` is a decent start, but it is incomplete.

### Missing / weak fields
- `@id`
- `url`
- `mainEntityOfPage`
- `datePublished`
- `dateModified`
- `keywords`
- `inLanguage`
- `isAccessibleForFree`
- more specific `author` handling
- `publisher.logo`
- breadcrumb schema
- richer image object when possible

### Current author schema is too hardcoded
Current code always emits:

```ts
author: {
  "@type": "Organization",
  name: "Zaffaron",
  url: "https://zaffaron.com",
}
```

If recipes have an `author` field, use it.

### Recommended JSON-LD shape

```ts
const url = `https://zaffaron.com/recipe/${recipe.slug}`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  "@id": `${url}#recipe`,
  url,
  mainEntityOfPage: url,
  name: recipe.title,
  description: recipe.description,
  inLanguage: "en",
  isAccessibleForFree: true,
  datePublished: recipe.published_at ?? undefined,
  dateModified: recipe.updated_at,
  image: recipe.image_url
    ? [{
        "@type": "ImageObject",
        url: recipe.image_url,
        caption: recipe.image_alt || recipe.title,
      }]
    : undefined,
  author: {
    "@type": recipe.author ? "Person" : "Organization",
    name: recipe.author || "Zaffaron Kitchen",
  },
  publisher: {
    "@type": "Organization",
    name: "Zaffaron",
    url: "https://zaffaron.com",
    logo: {
      "@type": "ImageObject",
      url: "https://zaffaron.com/icon-512.png",
    },
  },
  keywords: recipe.tags?.join(", ") || undefined,
  recipeCategory: recipe.category,
  recipeCuisine: recipe.cuisine,
  prepTime: `PT${recipe.prep_time_minutes}M`,
  cookTime: `PT${recipe.cook_time_minutes}M`,
  totalTime: `PT${totalMinutes}M`,
  recipeYield: `${recipe.servings} servings`,
  recipeIngredient: recipe.ingredients.map(formatIngredient),
  recipeInstructions: recipe.instructions.map((step) => ({
    "@type": "HowToStep",
    name: `Step ${step.step}`,
    text: step.text,
  })),
};
```

### Important: do NOT add fake schema
Do **not** add:
- fake `AggregateRating`
- FAQ schema without visible FAQ content
- duplicate standalone `HowTo` unless there is a real separate how-to entity

### Also missing entirely
- `BreadcrumbList` JSON-LD on recipe pages

---

## 7) Mobile UX concerns

## 7.1 Recipe page lacks a fast path into the useful part
On mobile, users often want:
- ingredients
- instructions
- time/yield
- print/share

Current page makes them scroll through header + large hero image before cooking content. That is not terrible, but it is not optimized.

**Fix:** add a compact action row near the top:
- Jump to ingredients
- Jump to instructions
- Print
- Share

---

## 7.2 Stats chips can wrap awkwardly
This block:

```tsx
<div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
```

can turn into a messy stack on narrow screens.

**Fix:** either:
- use a 2-column grid on mobile, or
- reduce chip padding and gap, or
- prioritize which stats appear first

---

## 7.3 Footer navigation is too small on mobile
Already mentioned under accessibility, but this is also plain bad mobile UX.

---

## 7.4 Tags are wasted tap targets
Current tag pills at the bottom are not links. On mobile they look tappable but do nothing useful.

**Fix:** make them links or remove them.

---

## 7.5 No mobile discovery layer yet
Homepage has hero + grid. That is simple, but once recipe count grows, mobile users need a better browse layer:
- visible category tabs or chips
- “All recipes” link
- cuisine/category quick filters

Do this **before** building a hamburger menu.

---

## 8) Performance concerns

## 8.1 Homepage overfetches badly
`select("*")` on a recipe card grid is wasteful. You are pulling full recipe records when the UI only needs card fields.

This is the clearest performance mistake in the code shown.

---

## 8.2 Recipe page likely does duplicate DB work
`generateMetadata()` calls `getRecipeBySlug(slug)`.
The page component also calls `getRecipeBySlug(slug)`.

Unless `getRecipeBySlug` is cached internally, that is two DB hits for one request.

**Fix:** wrap the fetch in `cache()` or equivalent shared cache.

```ts
// src/lib/get-recipe.ts
import { cache } from "react";

export const getRecipeBySlug = cache(async (slug: string) => {
  // existing query
});
```

That alone is a real win.

---

## 8.3 `revalidate = 60` on homepage is probably too aggressive
For a mostly editorial recipe site, one-minute ISR on the homepage is probably unnecessary unless content changes constantly.

**Fix:** increase to 300-3600 or use on-demand revalidation when publishing.

---

## 8.4 Ordering by `created_at` is not ideal
This is less about raw speed and more about correctness + cache churn.

If a recipe is backfilled or migrated, `created_at` may not reflect editorial recency. Use `published_at` for user-facing ordering.

---

## 8.5 Types are too thin for the roadmap
`src/types/index.ts` currently does not support the roadmap. That leads to downstream hacks and weak metadata.

Current type is basically phase-0 only.

**Fix:** extend it now, with strict nullability and enums where appropriate.

---

## File-by-file recommendations

### `src/app/page.tsx`
- replace `select("*")` with explicit card fields
- order by `published_at`, not `created_at`
- add semantic list structure (`section > ul > li`)
- add link to `/recipes` or a crawlable archive page
- eventually link category and cuisine hubs from homepage

### `src/components/RecipeCard.tsx`
- add `focus-visible` ring styles
- use `image_alt`
- make cuisine/category linked, not plain text
- consider rendering each card as `<article>` for better semantics
- add fallback class if `recipe.difficulty` is unexpected

```ts
const difficultyClass = difficultyColor[recipe.difficulty] ?? "bg-stone-200 text-stone-700";
```

### `src/app/recipe/[slug]/page.tsx`
- add visible breadcrumbs
- add author/published/updated/verification block
- add linked cuisine/category hubs
- add tips/substitutions/storage/serve-with/related sections
- improve metadata and JSON-LD
- use `image_alt`
- reduce low-contrast text

### `src/app/layout.tsx`
- add skip link
- strengthen focus styles
- add manifest / apple-touch-icon / OG fallback metadata
- improve footer contrast and touch targets

### `src/types/index.ts`
Right now this file does not reflect the actual roadmap.

At minimum add:
- `image_alt`
- `author`
- `published_at`
- `verification_status`
- `source_urls`
- `tips`
- `storage_notes`
- `serve_with`
- `substitutions`
- `category_slug`
- `cuisine_slug`

---

## Final verdict

### What the plan gets right
- adding tips/substitutions/storage/serve-with is good
- category/cuisine hubs are necessary
- breadcrumbs are necessary
- OG fallback / favicon / canonical / alt text matter
- print/share are reasonable

### What the plan gets wrong
- too much low-value UI polish too early
- not enough trust/content architecture
- not enough emphasis on crawlable archives and internal linking
- suggests some bad schema ideas
- conflicts with the Persian-first strategy in `PLAN.md`

### If I had to rewrite the plan in one sentence
**Stop polishing the chrome and fix the spine: taxonomy, trust signals, archives, internal linking, schema quality, then enrich the recipes and only then add the fun UI stuff.**
