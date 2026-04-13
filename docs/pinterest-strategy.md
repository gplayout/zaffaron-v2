# Zaffaron Pinterest Growth Strategy

## Why Pinterest?
- **500M+ monthly active users**, 80% use Pinterest for food ideas
- **Recipe Rich Pins** automatically pull: title, ingredients, cook time, serving size
- **Evergreen traffic** — pins get clicks for months/years (unlike Instagram/TikTok)
- **Food is #1 category** on Pinterest
- **Zero cost** — organic reach still works (unlike Facebook/Instagram)

## Setup Checklist
- [ ] Business account created
- [ ] Website claimed + verified
- [ ] Rich Pins enabled (validate at https://developers.pinterest.com/tools/url-debugger/)
- [ ] Profile optimized (bio, profile pic = Zaffaron logo)

## Board Strategy (Start with 10 boards)

### Core Cuisine Boards:
1. **Persian Recipes | زعفرون** — ghormeh sabzi, tahdig, kebabs
2. **Turkish Recipes** — köfte, pide, baklava
3. **Lebanese & Levantine** — fattoush, hummus, shawarma
4. **Indian Recipes** — biryani, tikka, samosa
5. **Moroccan Recipes** — tagine, couscous, harira

### Category Boards:
6. **Easy Weeknight Dinners** — under 30 min recipes
7. **Rice & Grain Dishes** — tahdig, biryani, pilaf
8. **Kebabs & Grilled Meats** — all cuisines
9. **Healthy Mediterranean Recipes** — salads, soups, grains
10. **Desserts & Sweets** — baklava, halva, gulab jamun

### Future (Phase 2):
- Halal Hacks for Global Classics
- Meal Prep & Batch Cooking
- Seasonal (Ramadan, Nowruz, Eid)

## Pin Design Rules
- **Vertical: 1000x1500px** (2:3 ratio — Pinterest optimal)
- **Title overlay** on image (recipe name, bold, readable)
- **Zaffaron logo** watermark (bottom corner, subtle)
- **Rich colors** — food photography, warm tones
- **Text:** "Easy", "30 min", "Authentic" — trigger words

## Posting Schedule
- **5-10 pins per day** (mix of new + re-pins)
- **Best times:** 8-11 PM, weekends
- **Batch create:** Generate pin images for top 50 recipes first
- **Use Tailwind or Pinterest scheduler** for automation

## Pin Description Template
```
{Recipe Name} — {Short hook}. {1 sentence description}. 
Made with {key ingredient}. Ready in {time}. Serves {number}.

🔗 Full recipe at zaffaron.com

#PerisanFood #RecipeName #Cuisine #EasyRecipe #AuthenticRecipe
```

## Rich Pins Setup
1. Validate URL: https://developers.pinterest.com/tools/url-debugger/
2. Our Recipe JSON-LD schema already has all required fields ✅
3. Pinterest reads: name, image, ingredients, prepTime, cookTime, recipeYield
4. Once validated → all recipe URLs auto-get Rich Pin treatment

## KPIs (Month 1)
- Pinterest impressions: >10,000
- Pin clicks: >500
- Website sessions from Pinterest: >200
- Follower count: >100

## Pin Image Generation Plan
- Use existing recipe images (Supabase storage)
- Overlay title text programmatically (script with sharp/canvas)
- Generate pin images for top 100 recipes by traffic potential
- Store in `/public/pins/` or Supabase storage

## Keyword Research (Top Pinterest food searches)
- "easy dinner recipes"
- "persian food"
- "kebab recipe"
- "saffron rice"
- "mediterranean diet recipes"
- "halal recipes"
- "biryani recipe"
- "healthy meal prep"
