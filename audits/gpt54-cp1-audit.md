# Zaffaron live audit — 6 rich recipe pages

Date: 2026-03-11 10:50 PDT  
Auditor: GPT-5.4 subagent  
Scope: live production pages only, inspected via browser + source/DOM + JSON-LD + image review

## Brutal verdict
The upgrade is **real**, but it is **not finished**.

These pages are materially better than the old thin recipe pages, but they still fail the promise of the new 35+ field system in a few obvious places:

- **Cost estimate does not render on any of the 6 pages.**
- **Occasions do not render as a real section on any of the 6 pages**; they show up only as unlabeled pills/tags at the bottom.
- **Regional variations are mostly filler** — usually just region names with zero explanation of what actually changes.
- **Structured data is only “basic recipe schema,” not rich-schema parity** with the on-page model.
- **5 of the 6 hero images look AI-generated**. They match the dish, but several undercut trust on a “Tested Recipe” site.
- **One page has a hard factual/schema bug:** Joojeh Kabab says **43 minutes total** while the instructions require **at least 4 hours of marination**.

If I were scoring the current live state for these 6 pages only: **7/10**. Good enough to ship publicly, **not good enough to call complete**.

---

## Global findings across all 6 pages

### 1) Section rendering: not all promised fields are live
What renders consistently:
- dietary badges
- nutrition card
- cultural background
- flavor chips
- equipment
- ingredients
- substitutions
- instructions
- common mistakes
- storage
- make ahead
- regional variations

What does **not** fully render as promised:
- **Cost estimate:** missing on all 6 pages
- **Occasions:** data appears only as bottom tags/chips, **not** as a labeled section
- **Allergens:** inconsistent handling; 5/6 pages show a `Contains:` line, but **Ghormeh Sabzi shows no explicit allergen state at all**

### 2) JSON-LD is present, but still shallow / semantically sloppy
All 6 pages include:
- `Recipe` JSON-LD
- `BreadcrumbList` JSON-LD
- canonical URL
- title and meta description

But the schema layer still has clear gaps:
- `author` is modeled as **`Person: "Zaffaron Kitchen"`**, which looks semantically wrong. That should likely be an `Organization` unless there is a real person by that name.
- No `publisher.logo`.
- No `suitableForDiet` even though the pages visibly show dietary badges like Gluten-Free / Vegetarian / Dairy-Free.
- No schema parity for the richer content system (cost, occasions, equipment/tooling, etc.).

### 3) SEO is mostly okay, but not polished
Good:
- titles are generally in a healthy length range (~51–61 chars)
- meta descriptions are generally in a healthy range (~137–144 chars)
- breadcrumbs exist

Weak spots:
- breadcrumb labels are lowercase/generic (`persian`, `stew`, `kebab`, etc.) and feel machine-generated instead of editorially polished
- title pattern is inconsistent: some pages include `Recipe`, others do not
- some H1/title naming is inconsistent (`Khoresh Fesenjan` in title vs `Fesenjān` in H1)

### 4) Layout / responsive
I did not find catastrophic responsive breakage on sampled desktop/mobile views.

Checked mobile overflow on live pages including Ghormeh Sabzi, Fesenjan, and Koobideh:
- **no horizontal overflow detected** at ~390px width

But there are still UX issues:
- breadcrumb/meta text is very small and low-emphasis on mobile
- the pages are very long and dense, with only a single jump button at the top
- bottom occasion/tag chips feel like metadata dump, not a designed content section

### 5) Nutrition math
All 6 pages pass the basic macro-calorie sanity check:

`calories ≈ protein*4 + carbs*4 + fat*9`

No major nutrition-math failures found.

---

## Per-page audits

## 1) Ghormeh Sabzi
URL: https://zaffaron.com/recipe/ghormeh-sabzi-stew

### What’s good
- Culturally this is the **strongest page** in the set.
- Core method is authentic: fried herbs, dried limes, long simmer, lamb, kidney beans, served with rice.
- Image is the best of the six and looks like a **real photo**, not obvious AI.
- Title/meta are clean.
- Nutrition math passes: **421 vs 424**.

### Issues
- **Allergen rendering is inconsistent here.** This page shows dietary badges (`Gluten-Free`, `Dairy-Free`, `Nut-Free`, `Halal`) but **no explicit allergen line** / no “contains none” state. If allergens are a required field, this page fails that requirement.
- **Cost estimate missing.**
- **Occasions are not a real section** — only unlabeled bottom tags.
- **Regional variations are weak filler** (`Tehran`, `Shiraz`) with no explanation of what actually changes.
- Minor authenticity nit: defaulting to **canned beans** and **plain chives** makes the recipe a bit Western-convenience / simplified compared with how many Iranians describe sabzi ghormeh ingredients.
- Hero copy says `creamy red beans`, which reads like marketing copy, not Persian food language.

### Verdict
**Good page. Not perfect.** Biggest live problem is the missing explicit allergen state plus the global missing cost/occasion rendering.

---

## 2) Tahdig-e Berenj-e Zaferani
URL: https://zaffaron.com/recipe/tahdig-crispy-saffron-rice

### What’s good
- Core technique is culturally sound: parboil, drain, saffron/yogurt base, steam with towel-wrapped lid, flip at the end.
- All major recipe sections are present except cost/real occasions section.
- Nutrition math passes: **375 vs 372**.
- SEO title/meta are fine.

### Issues
- **Image looks AI-generated.** It is the correct dish, but the crust is too perfect, the dome too uniform, and the barberries look pasted on.
- **Regional variations section is weak to the point of being misleading.** Tahdig variations are usually discussed as **potato / bread / yogurt / lettuce / mixed rice crust styles**, not as vague `Tehran` and `Gilan` labels with no explanation.
- **Cost estimate missing.**
- **Occasions not rendered as a proper section.**
- Flavor/metadata presentation still feels machine-generated rather than editorially curated.

### Verdict
Solid cooking logic, but the page still feels a little factory-made — especially the image and the fake-thin regional variation section.

---

## 3) Khoresh Fesenjan / Fesenjān
URL: https://zaffaron.com/recipe/khoresh-fesenjan-stew

### What’s good
- Culturally credible overall: walnuts + pomegranate molasses + slow simmer + sweet-sour balancing is correct.
- Chicken version is acceptable, even if duck/fowl is more traditional in some regions.
- Nutrition math passes: **746 vs 752** (close enough).
- Meta description is good.

### Issues
- **Image looks AI-generated.** Correct dish, but the chicken shape is slightly melted/amorphous and the sauce sheen is too perfect.
- **Title pattern is inconsistent** with the rest of the site: this page omits `Recipe` while others include it.
- H1/title naming is slightly inconsistent (`Khoresh Fesenjan` in title vs `Fesenjān (Khoresh-e Fesenjān / ...)` in H1).
- **Regional variations are empty-calorie content.** Listing `Gilan` and `Tehran and Central Iran` without saying *how* the flavor profile differs is not useful.
- **Cost estimate missing.**
- **Occasions not rendered as a proper section.**

### Verdict
Good bones, but still a factory page in places. The image and thin “regional variations” section are the biggest trust killers.

---

## 4) Joojeh Kabab
URL: https://zaffaron.com/recipe/joojeh-kabab-saffron-chicken

### What’s good
- The base recipe is culturally recognizable: saffron, onion, lemon, yogurt marinade, grilled skewers, serve with chelow/tomato/sumac.
- Image is the correct dish.
- Nutrition math passes: **495 vs 489**.

### Hard failure
- **Time/schema bug:** the page says:
  - `Prep 25m`
  - `Cook 18m`
  - `43 min total`
- But the instructions explicitly require:
  - **`marinate at least 4 hours, ideally 8–12 hours`**
- That means the visible page timing **and** the JSON-LD timing are objectively wrong.
- This is the clearest live data bug in the set.

### Other issues
- **Image looks AI-generated.** Correct plating, but the chicken texture is waxy/too uniform.
- The optional **mayonnaise** reads like a modern shortcut, not an “authentic” default. It’s fine as a hack note, but it weakens the authenticity claim.
- **Cost estimate missing.**
- **Occasions not rendered as a proper section.**
- Regional variation section is again too thin to be useful.

### Verdict
This page has the worst **hard factual error** in the set because the published total time is false.

---

## 5) Kashk-e Bademjan
URL: https://zaffaron.com/recipe/kashk-e-bademjan

### What’s good
- Core dish identity is right: fried eggplant, kashk, mint oil, onions, walnuts.
- Meta description is now a sane length.
- Nutrition math passes: **220 vs 224**.

### Issues
- **Hero copy oversells the method.** It calls the dish `smoky`, but the main recipe method is **fried eggplant**, not charred/broiled/smoked eggplant. The smoky version only appears as a tip.
- `mezze-style spread` is a bit culturally off-tone / Westernized framing for a Persian appetizer page.
- **Image looks AI-generated.** Correct dish, but the kashk swirl is too perfect and the garnish looks decorative in an AI way.
- **Cost estimate missing.**
- **Occasions not rendered as a proper section.**
- Regional variations again are too thin.

### Verdict
Good page, but the copy is slightly more Westernized / stylized than the dish deserves.

---

## 6) Koobideh Kebab
URL: https://zaffaron.com/recipe/koobideh-kebab

### What’s good
- Core identity is right: ground meat, onion, mixing for bind, shaping on wide skewers, fast high-heat grilling.
- Nutrition math passes: **329 vs 328**.
- SEO title/meta are fine.

### Issues
- **Image looks AI-generated.** Correct dish, but the metal skewers and meat texture have obvious CG/AI smoothness.
- **Instruction quality bug:** the page says to **soak wide metal koobideh skewers in ice-cold water**. That is nonsense / cargo-cult text borrowed from wooden-skewer recipes. Metal skewers do not need “soaking.”
- **Bad substitution:** `saffron threads → turmeric + rosewater` is not a real saffron substitute for koobideh. That is flavor cosplay, not an authentic replacement.
- **Cost estimate missing.**
- **Occasions not rendered as a proper section.**
- Regional variations again are too thin to be useful.

### Verdict
Usable page, but this is exactly the kind of factory-generated nonsense detail (`soak metal skewers`) that makes expert readers stop trusting the site.

---

## Structured-data / SEO summary table

| Recipe | Title OK | Meta OK | Breadcrumbs present | JSON-LD present | Main schema issue |
|---|---:|---:|---:|---:|---|
| Ghormeh Sabzi | Yes | Yes | Yes | Yes | Missing `suitableForDiet`; no explicit allergen state on page |
| Tahdig | Yes | Yes | Yes | Yes | Basic-only schema; no rich parity |
| Fesenjan | Mostly | Yes | Yes | Yes | Inconsistent title pattern + basic-only schema |
| Joojeh Kabab | Yes | Yes | Yes | Yes | **Incorrect prep/total time in JSON-LD** |
| Kashk-e Bademjan | Yes | Yes | Yes | Yes | Basic-only schema; no rich parity |
| Koobideh | Yes | Yes | Yes | Yes | Basic-only schema; questionable author typing |

---

## Nutrition math table

| Recipe | Listed cal | Macro cal | Delta | Result |
|---|---:|---:|---:|---|
| Ghormeh Sabzi | 421 | 424 | -3 | Pass |
| Tahdig | 375 | 372 | +3 | Pass |
| Fesenjan | 746 | 752 | -6 | Pass |
| Joojeh Kabab | 495 | 489 | +6 | Pass |
| Kashk-e Bademjan | 220 | 224 | -4 | Pass |
| Koobideh | 329 | 328 | +1 | Pass |

---

## Priority fixes

### P0 — fix immediately
1. **Joojeh Kabab time fields**: visible UI + JSON-LD must include the mandatory marination time.
2. **Render cost estimate** on all rich recipe pages.
3. **Render occasions as an actual labeled section**, not anonymous chips.
4. **Standardize allergen handling** so “no allergens” still renders explicitly.

### P1 — next pass
5. Fix semantically sloppy schema:
   - `author` type
   - `publisher.logo`
   - `suitableForDiet`
6. Rewrite the weak `Regional Variations` entries so they explain actual differences.
7. Remove obviously fake instruction text like **soaking metal skewers**.

### P2 — trust/polish
8. Replace or improve the most obviously AI-looking hero images (Tahdig, Fesenjan, Joojeh, Kashk-e Bademjan, Koobideh).
9. Standardize title pattern (`Recipe` or no `Recipe`, but consistent).
10. Improve breadcrumb capitalization / editorial polish.

---

## Bottom line
These pages are **substantially improved**, but they are **not yet a clean win**.

The live site now looks like a serious recipe site, but the remaining misses are exactly the kind that reveal a factory pipeline:
- missing promised sections,
- thin filler sections,
- AI-ish images,
- one hard time/schema error,
- and a few telltale fake-cook details.

If the bar is “good enough to be publicly live,” this passes.  
If the bar is Mehdi’s rule — **10/10 before moving on** — it does **not** pass yet.
