# Zaffaron v2 — Audit Package

## Context
We're building a recipe website from scratch. The goal is to create a clean, SEO-optimized recipe site that eventually becomes a marketplace ("Uber for Home Cooks"). This is a fresh start after a previous attempt failed due to over-engineering (428 scripts, 13-language pipelines, broken deployments — all for 0 users).

## Business Vision
1. **Phase 1 (now):** Recipe site with 100+ verified English recipes → rank on Google → organic traffic
2. **Phase 2 (after 1000+ monthly visitors):** Add cook marketplace — local cooks list services on recipe pages, buyers connect via WhatsApp
3. **Phase 3:** Scale with in-app ordering, sponsorships, mobile app

## Current State
- **Live at:** https://zaffaron.com
- **Stack:** Next.js 16.1.6 + React 19 + Tailwind v4 + Supabase + Vercel
- **Database:** Supabase PostgreSQL, single table `recipes_v2`
- **Content:** 10 seed recipes (Persian, Indian, Italian, Thai, French, Mexican, Japanese, Middle Eastern, Greek)
- **Pages:** Homepage (grid), Recipe detail (`/recipe/[slug]`), Search, Sitemap, Robots
- **No images yet** (placeholder emoji)
- **No authentication, no admin panel, no translation**

## What We Need Audited

### 1. Plan Review (PLAN.md)
- Is the Phase 1 plan realistic and complete?
- Are the exit criteria correct?
- Is anything missing that will bite us later?
- Is the step ordering optimal?
- Should any step be split or merged?
- Is the "What We Are NOT Doing" list correct?

### 2. Architecture Review
- Is Next.js 16 + Supabase the right choice for this use case?
- Is the single-table DB schema correct and future-proof?
- Should we use SSG, ISR, or SSR for recipe pages?
- Are there SEO mistakes in the current implementation?
- Image strategy: Unsplash, AI-generated, user-uploaded, or stock?

### 3. Code Review
- Review all source files for correctness, security, and best practices
- Check Supabase RLS policies
- Check for SEO issues (meta tags, structured data, canonical URLs)
- Check for performance issues (bundle size, image loading, caching)
- Check for accessibility issues
- Check TypeScript strictness

### 4. Recipe Quality Strategy
- How should we generate and verify recipes at scale?
- What's the quality bar? (accuracy of measurements, cooking times, technique descriptions)
- Should we have a structured verification checklist per recipe?

### 5. Growth Strategy
- SEO strategy for recipe sites in 2026
- What makes a recipe site rank?
- Content calendar recommendations
- Social media integration approach

## Files for Review
All source files are included below.

---

## PLAN.md
(see PLAN.md in the project root)

## schema.sql
(see schema.sql in the project root — defines recipes_v2 table)

## Source Files
(13 files total — all in src/)
