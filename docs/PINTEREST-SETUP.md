# Pinterest Setup (Zaffaron)

## Goal
Automate publishing Zaffaron recipe pins (image + title + description + destination link) to Pinterest boards to drive traffic and SEO.

## Pinterest Account
- Username: `mehdi6995`
- Display: **Zaffaron**
- Profile link: https://www.pinterest.com/mehdi6995/

## Boards + IDs
These are fetched via Pinterest API v5 `/boards`.

| Board | board_id |
|---|---:|
| Zaffaron Recipes | 1102748727449258673 |
| Persian Recipes | 1102748727449258677 |
| Desserts | 1102748727449258694 |
| Appetizers & Salads | 1102748727449258799 |
| Chicken Recipes | 1102748727449258800 |
| Rice & Tahdig | 1102748727449260106 |
| Vegetarian | 1102748727449260112 |
| Drinks & Cocktails | 1102748727449260115 |

## Pinterest Developer App
- App name: **Zaffaron Recipe Publisher**
- App ID: **1560296**
- Redirect URI: `http://localhost:8085/`

### Access Tier
- Trial access limitation discovered during implementation:
  - **Trial apps cannot create pins in production**.
  - Production pin create returns 403 (code 29) instructing to use the sandbox API.
- Standard access upgrade request submitted:
  - Status shown in Pinterest developer console: **Upgrade to Standard access pending**.

## Local Environment Variables
Stored in: `.env.local` (DO NOT COMMIT)

Required:
- `PINTEREST_ACCESS_TOKEN`
- `PINTEREST_REFRESH_TOKEN`
- `PINTEREST_APP_ID`
- `PINTEREST_APP_SECRET`
- `PINTEREST_BOARD_MAP` (JSON)

## Scripts
### OAuth helper
- `scripts/pinterest-oauth.mjs`
  - Starts a local server on port 8085.
  - Opens Pinterest OAuth and exchanges code for token.
  - Saves tokens to `.env.local` and writes `scripts/pinterest-token.json`.

### Autopilot pin publisher
- `scripts/pinterest-autopilot.mjs`
  - Queries Supabase `recipes_v2` for published recipes.
  - Creates pins via Pinterest API v5.
  - Saves `pinterest_pin_id` back to Supabase.

### DB migration
- `scripts/pinterest-migration.sql`
  - Adds tracking columns:
    - `pinterest_pin_id`
    - `pinterest_pinned_at`

## Next Steps (after Standard approved)
1. Run the DB migration.
2. Update/confirm category-to-board mapping:
   - DB categories include: `main`, `rice`, `stew`, `soup`, `appetizer`, `kebab`, `dessert`, `drink`, etc.
   - Create additional boards or map categories appropriately.
3. Run `pinterest-autopilot.mjs` first with `--dry-run --limit=3`, then live.
4. Monitor rate limits + pin visibility.
