# Zaffaron v2 — Merged Audit (2026-03-12)
## Auditors: GPT 5.4 + Gemini 3.1 Pro

### CRITICAL
1. Hardcoded secrets in scripts (service_role, DB password, API keys) — rotate + purge git history
2. schema.sql vs actual DB mismatch (category_slug, cuisine_slug, image_alt, JSONB fields missing)

### HIGH
3. XSS in JSON-LD via dangerouslySetInnerHTML — escape `</script>` tags
4. Fake taxonomy pages render 200 instead of 404 — `notFound()` or `dynamicParams = false`
5. Tips rendering broken — array shows as raw JSON in UI
6. Category/cuisine labels saved as slugs, not display names
7. Search uses `ilike '%term%'` — no index, full table scan
8. `npm run lint` fails — 12 errors, 17 warnings

### MEDIUM
9. No pagination on /recipes, category, cuisine pages
10. TypeScript `as any` throughout recipe page
11. Search page has no metadata export
12. `select("*")` overfetching in search + get-recipe
13. Related recipes only checks cuisine, not category
14. `difficulty: expert` in prompt but not in TS type or DB CHECK
15. `@tailwindcss/typography` not installed but `prose` classes used

### LOW
16. Manifest icons 404 on live site
17. Unused deps (openai, @google/genai in package.json)
18. README is boilerplate

### Ratings
| Category | GPT 5.4 | Gemini 3.1 |
|---|---|---|
| Architecture | 6 | 7 |
| SEO | 6 | 9 |
| Performance | 6 | 8 |
| Security | 2 | 7 |
| Code Quality | 5 | 5 |
| Scalability | 5 | 6 |
| Deploy | 4 | 9 |

### Fix Priority
1. Taxonomy 404 + Tips bug + Labels (user-facing)
2. XSS escape (security)
3. Lint/type fixes
4. Pagination
5. Search FTS
6. Ratings/Reviews system
7. Secret cleanup in scripts
