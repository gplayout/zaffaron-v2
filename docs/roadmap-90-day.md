# Zaffaron: 90-Day Strategic Roadmap

**Vision:** The #1 multicultural recipe site globally — trusted, loved, profitable, respectful.
**Current State:** 1,718 published recipes, 14 users, ~0 traffic. "Halal Hacks" strategy approved. Next.js 16/Supabase stack.

This roadmap moves Zaffaron from a secure, content-rich repository to a high-traffic, monetizable community, culminating in the Marketplace MVP.

---

## Phase 1: Indexing, SEO & Discovery (Days 1 - 30)
*Goal: Get the 1,718 existing recipes indexed, rankable, and drive the first 1,000 organic visitors.*

**1. SEO & Growth (THIS WEEK)**
*   **Action 1:** Google Search Console (GSC) setup. Submit XML sitemap immediately.
*   **Action 2:** **Recipe Schema Validation.** Run pages through Google's Rich Results Test. Without perfect `Recipe` schema (ingredients, time, calories, images), you will not get rich snippets. This is life or death for food blogs.
*   **Action 3:** Category Page SEO. Ensure programmatic pages like `/recipes/persian` or `/recipes/halal-hacks` have strong H1s and description text, not just a grid of links.

**2. Tech Debt & Infrastructure**
*   **Action 1:** Image Optimization. Audit Vercel/Next.js image caching. 1,718 recipes means thousands of images; ensure WebP/AVIF delivery to ace Core Web Vitals.
*   **Action 2:** Redis/Caching for FTS. Postgres FTS is great, but as traffic hits, cache top searches (e.g., "biryani", "ghormeh sabzi") to save DB read costs on Supabase.

**3. Marketing (Zero-Budget)**
*   **Action 1:** **Pinterest Automation.** Pinterest is the #1 organic engine for food. Build a script to auto-generate and pin 5-10 recipe images daily linking back to Zaffaron.
*   **Action 2:** Reddit Seed Strategy. Provide genuine value in `r/cooking`, `r/AskCulinary`, and `r/halal` by answering questions and organically dropping Zaffaron links as the source.

---

## Phase 2: "Halal Hacks" & Community Building (Days 31 - 60)
*Goal: Scale to 10,000 MAU, deploy the new content strategy, and lock in user retention.*

**1. Content Strategy**
*   **Action 1:** Finish the remaining ~120 recipes in the RecipeOps pipeline.
*   **Action 2:** Launch **"Halal Hacks for Global Classics"**. (e.g., Alcohol-Free Tiramisu, Halal Beef Wellington, Bacon-less Carbonara with smoked beef/turkey). 
*   **Action 3:** Batch-create short-form video (TikTok/Reels/Shorts) for the top 5 Halal Hacks. Even AI voiceovers over high-quality prep photos can go viral.

**2. Community (14 -> 1,000 Users)**
*   **Action 1:** The "Save to Box" feature. Users can browse anonymously, but clicking "Save Recipe" triggers a seamless Google/Email Auth modal.
*   **Action 2:** Lead Magnet Newsletter. "10 Halal Hacks for Michelin-Star Classics" eBook in exchange for emails. 
*   **Action 3:** Enable "I Made This" photo uploads + reviews to build User-Generated Content (UGC), which boosts SEO massively.

**3. Early Monetization**
*   **Action 1:** Affiliate Links. Do NOT clutter with Adsense yet. Inject Amazon Associate links for specialized gear/ingredients (e.g., Saffron threads, Tagine pots, specific spices) directly into the ingredient lists.

---

## Phase 3: The Marketplace MVP & Moat (Days 61 - 90)
*Goal: Prove the revenue model and establish the competitive moat.*

**1. Marketplace Build (Monetization)**
*   **Action 1:** Build the "Cook Application" portal. Allow local chefs/grandmas to apply to cook Zaffaron recipes for their local area.
*   **Action 2:** Implement Stripe Connect for split payments.
*   **Action 3:** Launch a hyper-local beta (e.g., one city/neighborhood) for ordering home-cooked meals from the platform. 

**2. Competitive Moat**
*   **Action 1:** **The Cultural/Dietary Graph.** Refine the Postgres search so users can filter by "Halal", "Dairy-Free", "Under 30 mins", AND "Persian". Most big sites (AllRecipes) suck at niche multicultural tagging. This is your software moat.
*   **Action 2:** **Trust & Verification.** The Marketplace creates a two-sided network effect. Cooks bring their customers; customers browse for recipes. The moat becomes the community of verified local cooks, which AI-only sites cannot replicate.

---

## KPIs to Track
*   **Month 1:** Pages Indexed in GSC, Core Web Vitals score, Pinterest Impressions.
*   **Month 2:** Organic Search Traffic, User Signups (target: 1,000), Email List Size.
*   **Month 3:** Marketplace Cook Applications (target: 50), First 10 successful meal orders.