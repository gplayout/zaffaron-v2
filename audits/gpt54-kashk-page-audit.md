# Zaffaron Audit — Kashk-e Bademjan Page

**URL:** https://zaffaron.com/recipe/kashk-e-bademjan-persian-eggplant-and-whey-dip  
**Audited:** 2026-03-11  
**Output:** Brutally honest page audit across content, SEO, UX, missing content, accessibility, and performance.

---

## Executive verdict

This page is **clean, usable, and better than the average bloated recipe blog**, but it is **not yet a serious organic search contender** for `kashk-e bademjan recipe`, and it leaves a lot of trust/SEO value on the table.

**Big picture:**
- **Content:** mostly solid, culturally respectful, and clearly written.
- **But:** there is a **real authenticity mismatch**: the copy promises a **smoky** eggplant dip, while the method **steams/simmers eggplant in a pot with water**. That is not smoky. Either roast/fry the eggplant or stop selling it as smoky.
- **SEO:** baseline is okay, but the page is under-optimized. The title does not target recipe intent strongly enough, the meta description is wildly too long, internal linking is weak, and the template ignores richer SEO fields that already exist in the project schema.
- **UX:** easy enough to cook from, visually calm, mobile is fine.
- **Missing content:** the live template renders only a fraction of the recipe richness available in the project’s richer recipe schema/demo record.
- **Accessibility:** decent foundation, but some low-contrast helper text and inconsistent focus styling need cleanup.
- **Performance:** not bad overall, but there is unnecessary JS/prefetch noise for what is basically a static article.

**Bottom line:**
**Good page. Not a finished page.** It can serve users now, but it is **underpowered for ranking** and **under-expressive for a premium recipe brand**.

---

## Method / evidence reviewed

I checked:
1. The **live rendered page** in browser (desktop + mobile width).
2. The **raw HTML/head/meta/JSON-LD**.
3. A quick **SERP spot-check** for `kashk e bademjan recipe`.
4. The local page template: `src/app/recipe/[slug]/page.tsx`.
5. The local rich recipe demo data: `scripts/demo-recipe-full.json`.

---

## Priority findings

| Priority | Finding | Why it matters |
|---|---|---|
| **HIGH** | Page claims **smoky** flavor, but method only cooks eggplant with water in a pot | Content trust + culinary accuracy issue |
| **HIGH** | **Meta description is ~481 chars** and will be truncated badly | Weak SERP snippet control |
| **HIGH** | **Title is not recipe-intent optimized** (`Kashk-e Bademjan (کشک بادمجان) — Zaffaron`) | Harder to compete for `kashk e bademjan recipe` |
| **HIGH** | **Internal linking is extremely weak**; no related recipes, tags are not links | Limits crawl depth, discovery, and ranking support |
| **HIGH** | Rich fields exist in project schema/demo data but are **not rendered** | Missed UX, trust, and SEO differentiation |
| **HIGH** | **No visible allergen disclosure** despite dairy + walnuts | User safety/trust issue |
| **MEDIUM** | JSON-LD is decent but **thin** (only calories, no full nutrition, no FAQ, no author/person detail depth) | Leaves structured data upside unused |
| **MEDIUM** | Helper note text uses low-contrast styling (`text-stone-400` on light background) | Accessibility issue |
| **MEDIUM** | Focus treatment is inconsistent; most links/buttons rely on browser default | Accessibility/polish issue |
| **MEDIUM** | Recipe page ships **too much JS/prefetch chatter** for a mostly static page | Performance inefficiency |
| **LOW** | Step times sum to about **70 min**, while page says **75 min total** | Small trust/detail issue |

---

# 1) Content accuracy audit

## What’s accurate / good

- **Kashk is described correctly.** The page says **fermented whey/curd**, not yogurt. Good. That matters.
- The overall dish framing is culturally respectful: Persian appetizer/dip, mint oil, onions, garlic, kashk, optional walnuts — all credible.
- Ingredient quantities are generally **plausible**:
  - 3 medium eggplants
  - 2 onions
  - 5 cloves garlic
  - 1 cup kashk
  - 2 tbsp dried mint
  - optional walnuts
  These are assertive but still believable in a Persian-home-style range.
- The page responsibly labels the sour cream workaround as **non-traditional**. Good.
- Instructions are **clear enough for a home cook** to execute without guessing too much.

## Content problems

### 1. **"Smoky" is not supported by the method** — **HIGH**
The intro promises a **smoky, jammy** result.

But the method says:
- cut eggplant into chunks
- put in a pot with **1/4 cup water**
- cover and cook until soft

That produces **soft eggplant**, not smoky eggplant.

**Brutal truth:** this is the biggest culinary credibility problem on the page.

**Fix one of these:**
- **Option A:** change method to roast/char/fry eggplant first
- **Option B:** keep the lighter method, but rewrite copy to say **silky / savory / jammy**, not smoky

### 2. **This is a lighter variation, not the strongest “authentic flagship” version** — **MEDIUM/HIGH**
Many classic Kashk-e Bademjan recipes fry the eggplant or roast it first, then mash/combine. Water-cooking is a valid lighter home variation, but it gives less depth.

If Zaffaron wants to position itself as **premium/authentic**, the page should either:
- explicitly say this is a **lighter stovetop version**, or
- upgrade the method to a more traditional flavor-forward approach.

### 3. **Missing explicit sourcing note for kashk** — **MEDIUM**
The page explains what kashk is, which is good, but it should go one step further for English-speaking readers:
- where to buy it
- common forms (liquid, dried, reconstituted)
- how salty it can be

That would reduce user confusion and bounce.

### 4. **Time math is slightly inconsistent** — **LOW**
Step times shown on page total roughly **70 minutes**, but the stat box says **75 min total**.

Small issue, but small trust leaks add up.

## Content verdict

**Verdict:** **Mostly good**, but not fully convincing as an “authoritative authentic” page until the eggplant method/copy mismatch is fixed.

---

# 2) SEO audit

## Current SEO elements checked

### Title
Current title:
- **`Kashk-e Bademjan (کشک بادمجان) — Zaffaron`**

**Problem:** it does **not explicitly target “recipe”** or the English search intent strongly enough.

For a niche keyword, you want the title to work harder.

**Better:**
- `Kashk-e Bademjan Recipe (Persian Eggplant Dip)`
- `Kashk-e Bademjan Recipe | Persian Eggplant & Kashk Dip`

### Meta description
Current meta description is basically the whole intro and is about **481 characters**.

That is way too long.

**What happens:** Google will truncate it hard, and you lose control of snippet messaging.

**This should be ~150–160 chars.**

The project already has a better version in the rich demo data:
- `Make authentic Kashk-e Bademjan: silky Persian eggplant dip with fermented kashk, caramelized onions, garlic, and fragrant mint oil. Gluten-free.`

That is much stronger.

### Canonical URL
- **Present and correct**
- Canonical points to the live recipe URL

Good.

### JSON-LD schema
Present:
- `Recipe`
- `BreadcrumbList`

Good baseline.

What’s good:
- recipe URL / mainEntityOfPage
- title / description
- times
- yield
- category / cuisine
- ingredients
- HowToStep instructions with step anchors
- basic nutrition calories
- breadcrumb schema

What’s weak / missing:
- only **calories**, not full nutrition
- no FAQ schema
- no video schema
- no aggregateRating / reviewCount (fine if no real reviews exist; do **not** fake this)
- author typed as **Person** with name `Zaffaron Kitchen`, which reads more like a brand/editorial kitchen than a real person
- publisher has no logo object

### Breadcrumbs
- Visible breadcrumbs exist
- Breadcrumb schema exists

Good.

### Heading hierarchy
Observed:
- **H1:** 1
- **H2s:** Ingredients, Instructions, Tips, How to Store, Pairs Well With
- **H3:** Substitutions

This is **clean and valid**.

### Keyword usage
Current keyword signals are mixed:
- URL is decent
- H1 is fine for brand voice
- body mentions dish name and context
- but title/meta are not search-maximized

**Main miss:** the page underuses the exact intent phrase **“kashk-e bademjan recipe”**.

### Internal linking
This is a major weakness.

Visible/internal links are basically:
- home
- search
- cuisine page
- category page
- footer legal pages

That’s thin.

**Worse:** the bottom tags are **not links**. They are just visual spans, so they provide **zero internal-link equity** and zero discovery value.

For a recipe site, this is leaving money on the floor.

### Competitiveness for `kashk-e bademjan recipe`
Quick SERP check surfaced established pages from:
- Cooking With Ayeh
- Unicorns in the Kitchen
- Mission Food Adventure
- Persian Mama
- others

These competitors already have:
- stronger exact-match titles
- older domains / more authority
- more search-established recipe patterns

**Brutal verdict:**
This page is **not currently competitive for top positions** unless Zaffaron brings stronger site authority, better internal links, and tighter metadata.

It may index. It may rank somewhere. But it does **not** look like a top-3 recipe result yet.

## SEO-specific code/template issue
From `src/app/recipe/[slug]/page.tsx`:
- `generateMetadata()` uses `recipe.title` and `recipe.description`
- it does **not** use richer dedicated fields like `seo_title` / `seo_description`

That means the site is already carrying richer schema ambition, but the recipe page is still behaving like a minimum viable template.

## SEO verdict

**Verdict:** **Baseline-correct but strategically weak.**

---

# 3) UI/UX audit

## What works

- The page is **clean**, calm, and readable.
- It avoids the usual recipe-blog garbage: no giant memoir, no ad clutter, no chaos. Good.
- Desktop layout is sensible:
  - Ingredients left
  - Instructions right
- Mobile layout stacks well and remains readable.
- Hero image is strong and appetizing.
- The stat pills (time, servings, calories) are easy to scan.
- Print button is useful.

## UX weaknesses

### 1. **Good-looking, but a bit too thin for a premium recipe experience** — **MEDIUM**
The page feels tidy, but also slightly underpowered.

For an unfamiliar Persian dish, many users would benefit from visible blocks like:
- what kashk is / where to get it
- common mistakes
- equipment list
- make-ahead advice
- related recipes

Right now the page is usable, but still a bit bare.

### 2. **No related recipes / onward path** — **HIGH**
Huge missed UX and SEO opportunity.

A user finishes this page and has nowhere meaningful to go except:
- Persian hub
- Appetizer hub
- search

There should be a related section like:
- Mirza Ghasemi
- Borani Bademjan
- Mast-o-Khiar
- Dolmeh
- Persian appetizer collection

### 3. **Tags at the bottom are decorative, not functional** — **MEDIUM/HIGH**
They look like navigation, but they are not.
That creates expectation with no payoff.

### 4. **No step photos / ingredient guidance for an unfamiliar dish** — **MEDIUM**
For a culturally specific recipe, even one extra visual or explainer would help users who do not know:
- what kashk looks like
- what mint oil should look like
- how soft the eggplant should get

## Can a user cook from this page?

**Yes.**
This is important: the page is not broken.
A reasonably confident home cook can make the dish from this page.

But it is **not yet optimized for the anxious first-timer**, and it is **not yet memorable enough** to feel like the best version of this page on the web.

## UX verdict

**Verdict:** **Functional and clean, but not rich or sticky enough.**

---

# 4) Missing content audit

This is where the page leaves the most value on the table.

The project’s richer schema/demo recipe data for this dish includes fields like:
- `cultural_significance`
- `seo_title`
- `seo_description`
- `dietary_info`
- `nutrition_per_serving`
- `flavor_profile`
- `equipment`
- `occasions`
- `cost_estimate`
- `common_mistakes`
- `regional_variations`
- `make_ahead`

The live page currently renders only a subset:
- description
- ingredients
- substitutions
- instructions
- tips
- storage notes
- serve with
- tags
- calories only

## Missing from visible page

### **HIGH priority missing content**
- **Allergen disclosure**: the recipe contains **dairy** and **tree nuts (walnuts)**, but that is not surfaced clearly.
- **Common mistakes**: this dish badly needs them because mint burns fast and kashk can split.
- **Make-ahead notes**: useful for entertaining; available in richer data but not shown.
- **Equipment list**: novice cooks should not have to infer pot/skillet/masher.
- **Related recipes**: not a schema field, but strategically missing.

### **MEDIUM priority missing content**
- **Full nutrition per serving**: calories alone is thin.
- **Flavor profile**: tangy / savory / minty / jammy / mild would help discovery and user fit.
- **Occasions**: Nowruz / family gatherings / mezze spread / dinner party appetizer.
- **Cost estimate**: helpful conversion/trust feature.
- **Regional variations**: this is especially valuable for a heritage-focused brand.
- **Cultural significance**: Zaffaron should absolutely win here if it wants to be more than a generic recipe site.

### Visible-but-underused
- **Dietary info** is only rendered as bottom hashtags like `#vegetarian` and `#gluten-free`.
  That is weak.
  These should be prominent badges near the title/stats.

## Missing-content verdict

**Verdict:** the template is rendering maybe **60% of a decent recipe page**, while the project’s broader schema suggests Zaffaron wants to ship **90%+ pages**.

---

# 5) Accessibility audit

## What’s good

- **Skip link exists** and is keyboard-focusable.
- Landmarks are present:
  - header/banner
  - main
  - footer
  - breadcrumb nav
- Main recipe image has useful alt text.
- Decorative SVG icons are marked `aria-hidden`.
- Heading hierarchy is sane.
- The search icon link has an `aria-label`.

That is a solid foundation.

## Accessibility issues

### 1. **Low-contrast helper text** — **MEDIUM**
Ingredient note text uses `text-stone-400` on a very light background.

That is too faint for small body text.

Example impact:
- note text like `(about 1.2–1.4 kg total...)`
- nuance text inside ingredient lines

This is exactly the kind of text older users or low-vision users struggle with.

### 2. **Focus styles are inconsistent** — **MEDIUM**
Footer links have explicit `focus-visible` styling.
Most other interactive elements do not.

Meaning:
- keyboard focus is not consistently designed
- users may fall back to browser-default outline behavior

Not catastrophic, but sloppy.

### 3. **Emoji in headings may be noisy for some assistive tech** — **LOW**
Headings like:
- `💡 Tips`
- `🧊 How to Store`
- `🍽️ Pairs Well With`

are visually friendly, but some screen reader experiences can sound slightly noisy or repetitive depending on verbosity settings.

This is not a dealbreaker. Just worth being intentional about.

### 4. **No visible allergen section** — **HIGH from usability/safety perspective**
Not classic WCAG-only accessibility, but absolutely a practical accessibility/trust problem.
For recipes, dietary and allergen clarity matters.

## Accessibility verdict

**Verdict:** **better than average foundation**, but not polished enough yet for a premium accessibility standard.

---

# 6) Performance audit

## What’s good

- The page is not obviously heavy or slow in basic lab inspection.
- Hero image is served through `next/image` and preloaded.
- CSS footprint looks modest.
- The page benefits from static-style rendering and a very simple visual layout.

## Performance concerns

### 1. **Too much JS for a mostly static recipe page** — **MEDIUM**
Observed resource transfer was roughly:
- **~395 KB total**
- **~198 KB JS**
- **~126 KB image transfer**

That is not horrific, but for a page that is mostly text + one image, **JS is still doing too much**.

### 2. **Duplicate App Router `_rsc` prefetch chatter** — **MEDIUM**
Performance entries showed a lot of repeated fetches to internal routes like:
- `/`
- `/search`
- `/cuisine/persian`
- `/category/appetizer`
- `/about`
- `/privacy`
- `/editorial-policy`

with many repeated `_rsc` requests.

For a simple recipe detail page, that is unnecessary network noise.

### 3. **LCP is probably the hero image or title block** — **LOW/MEDIUM watch item**
The page is visually simple, so LCP risk is not awful.
Still:
- hero image is the likely LCP candidate
- image quality is fine, but keep watching source image dimensions and compression

## Performance verdict

**Verdict:** **basically okay**, but not as lean as a mostly static article page should be.

---

# What is working well

To be fair, these things are genuinely good:

- Correct explanation of **kashk**
- Clean page structure
- Readable layout
- Valid heading hierarchy
- Strong hero image
- Decent Recipe JSON-LD baseline
- Visible breadcrumbs + breadcrumb schema
- Mobile layout is acceptable
- Skip link exists
- Page is actually cookable

This is not a bad page.
It is just **not fully weaponized** yet.

---

# Recommended fixes in order

## 1) Fix the authenticity/copy mismatch — **HIGH**
Either:
- roast/fry the eggplant for genuine depth, **or**
- remove “smoky” language from the copy.

## 2) Use proper SEO fields — **HIGH**
Update metadata generation to use:
- `seo_title`
- `seo_description`

instead of raw `title` / `description` only.

## 3) Rewrite the title for search intent — **HIGH**
Recommended direction:
- `Kashk-e Bademjan Recipe (Persian Eggplant Dip)`

## 4) Replace the bloated meta description — **HIGH**
Target ~150–160 chars.

## 5) Add related recipe links — **HIGH**
At minimum 3–6 related internal links.

## 6) Turn tags into actual links or remove the fake affordance — **HIGH**
Right now they look useful but do nothing.

## 7) Surface allergens + dietary badges clearly — **HIGH**
Show:
- Vegetarian
- Gluten-Free
- Contains Dairy
- Contains Tree Nuts
- Halal (if you want to surface it)

## 8) Render richer recipe fields — **HIGH/MEDIUM**
Best next sections to add:
- Common mistakes
- Make ahead
- Equipment
- Full nutrition
- Cultural significance
- Regional variations

## 9) Improve text contrast for helper notes — **MEDIUM**
Do not use ultra-light gray for important ingredient notes.

## 10) Audit/trim duplicate prefetch behavior — **MEDIUM**
Recipe pages should be closer to static article efficiency.

---

# Final scorecard

## Content accuracy: **7/10**
Good foundation, but the smoky/authenticity mismatch is real.

## SEO: **5.5/10**
Technically not broken, strategically under-optimized.

## UI/UX: **7/10**
Clean and usable, but too thin and not sticky enough.

## Missing content: **4.5/10**
A lot of valuable structured recipe richness is still not visible.

## Accessibility: **7/10**
Good base, needs polish.

## Performance: **7/10**
Fine, but should be leaner.

---

# Brutal one-line summary

**This page is clean and respectable, but right now it feels like a well-dressed MVP, not the authoritative Persian recipe result that deserves to outrank the incumbents.**
