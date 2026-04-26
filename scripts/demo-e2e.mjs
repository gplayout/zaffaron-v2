/**
 * End-to-end demo: Generate rich recipe + image + DB insert
 * Recipe: Kashk-e Bademjan
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_KEY = process.env.GOOGLE_AI_KEY;
const supabase = createClient(
  'https://givukaorkjkksslrzuum.supabase.co',
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PROMPT = `You are a world-class culinary expert. Generate a COMPLETE recipe with FULL metadata for: "Kashk-e Bademjan (Persian Eggplant and Whey Dip)"

Output ONLY valid JSON with ALL these fields:
{
  "title": "English (Persian name)",
  "slug": "url-slug",
  "description": "4 rich sentences",
  "cuisine": "Persian", "cuisine_slug": "persian",
  "category": "Appetizer", "category_slug": "appetizer",
  "prep_time_minutes": number, "cook_time_minutes": number,
  "servings": number, "difficulty": "easy|medium|hard",
  "ingredients": [{"item": "", "amount": "", "unit": "", "note": ""}],
  "instructions": [{"step": 1, "text": "detailed", "time_minutes": number}],
  "tags": [], "tips": "3 tips with newlines",
  "storage_notes": "", "serve_with": "",
  "substitutions": [{"original": "", "substitute": ""}],
  "cultural_significance": "3 sentences",
  "seo_title": "50-60 chars", "seo_description": "150-160 chars",
  "dietary_info": {"tags": [], "allergens": [], "vegetarian": true, "vegan": false, "gluten_free": true, "dairy_free": false, "nut_free": false, "halal": true},
  "nutrition_per_serving": {"calories": 0, "protein_g": 0, "fat_g": 0, "saturated_fat_g": 0, "carbs_g": 0, "fiber_g": 0, "sugar_g": 0, "sodium_mg": 0},
  "flavor_profile": {"taste": [], "texture": [], "aroma": [], "spice_level": "none|mild|medium|hot"},
  "equipment": [],
  "occasions": [],
  "cost_estimate": {"per_serving_usd": 0, "total_usd": 0, "tier": "budget|moderate|premium"},
  "common_mistakes": [{"mistake": "", "why": "", "fix": ""}],
  "regional_variations": [{"region": "", "difference": ""}],
  "make_ahead": "",
  "image_prompt": "detailed photo description for AI image generation",
  "author": "Zaffaron Kitchen", "verification_status": "verified"
}
CRITICAL: Kashk is fermented whey/curd, NOT yogurt. Be culturally accurate.`;

// STEP 1: Generate recipe
console.log('⏳ Step 1: Generating recipe with GPT 5.2...');
const r1 = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
  body: JSON.stringify({
    model: 'gpt-5.2',
    messages: [{ role: 'user', content: PROMPT }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  }),
});
const j1 = await r1.json();
if (j1.error) { console.error('GPT ERROR:', j1.error.message); process.exit(1); }
const recipe = JSON.parse(j1.choices[0].message.content);
console.log(`✅ Recipe: ${recipe.title} | ${recipe.ingredients?.length} ing | ${recipe.instructions?.length} steps`);
writeFileSync('scripts/demo-recipe-full.json', JSON.stringify(recipe, null, 2));

// STEP 2: Generate image
console.log('\n⏳ Step 2: Generating image with Gemini 3 Pro Image...');
const imgPrompt = recipe.image_prompt || 'Photorealistic food photo of Persian Kashk-e Bademjan, smoky eggplant dip with kashk drizzle, fried onions and mint garnish';
const r2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${GOOGLE_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: `Generate a photorealistic food photo: ${imgPrompt}` }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  }),
});
const j2 = await r2.json();
const imgPart = j2.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
let imageUrl = null;
if (imgPart) {
  const buf = Buffer.from(imgPart.inlineData.data, 'base64');
  const filename = `recipes/${recipe.slug}.jpg`;
  const { error: upErr } = await supabase.storage.from('recipe-images').upload(filename, buf, { contentType: 'image/jpeg', upsert: true });
  if (upErr) console.log('Upload error:', upErr.message);
  else {
    imageUrl = supabase.storage.from('recipe-images').getPublicUrl(filename).data.publicUrl;
    console.log(`✅ Image: ${imageUrl}`);
  }
} else {
  console.log('❌ No image generated');
}

// STEP 3: Insert to DB (UNPUBLISHED)
console.log('\n⏳ Step 3: DB insert (unpublished)...');
const dbRow = {
  slug: recipe.slug,
  title: recipe.title,
  description: recipe.description,
  image_url: imageUrl,
  image_alt: `${recipe.title} - authentic Persian recipe`,
  image_source: 'ai-generated:gemini-3-pro-image',
  prep_time_minutes: recipe.prep_time_minutes,
  cook_time_minutes: recipe.cook_time_minutes,
  servings: recipe.servings,
  difficulty: recipe.difficulty,
  category: recipe.category,
  category_slug: recipe.category_slug,
  cuisine: recipe.cuisine,
  cuisine_slug: recipe.cuisine_slug,
  calories_per_serving: recipe.nutrition_per_serving?.calories || null,
  ingredients: recipe.ingredients,
  instructions: recipe.instructions,
  tags: recipe.tags,
  tips: recipe.tips,
  storage_notes: recipe.storage_notes,
  serve_with: recipe.serve_with,
  substitutions: recipe.substitutions,
  author: 'Zaffaron Kitchen',
  published: false,
  published_at: new Date().toISOString(),
  verification_status: 'verified',
};
const { error: dbErr } = await supabase.from('recipes_v2').upsert(dbRow, { onConflict: 'slug' });
if (dbErr) console.log('DB error:', dbErr.message);
else console.log('✅ DB inserted (unpublished)');

// SUMMARY
console.log(`\n${'='.repeat(60)}`);
console.log('DEMO COMPLETE');
console.log(`${'='.repeat(60)}`);
console.log(`Recipe: ${recipe.title}`);
console.log(`Slug: ${recipe.slug}`);
console.log(`Fields: ${Object.keys(recipe).length}`);
console.log(`Image: ${imageUrl ? '✅' : '❌'}`);
console.log(`DB: ${dbErr ? '❌' : '✅ (unpublished)'}`);
console.log(`\nFull JSON saved: scripts/demo-recipe-full.json`);
