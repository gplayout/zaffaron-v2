// Generate all recipe images with Gemini 3 Pro Image
// Reads recipes from Supabase, generates image, uploads to Storage, updates DB
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabase = createClient(
  'https://givukaorkjkksslrzuum.supabase.co',
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GOOGLE_KEY = process.env.GOOGLE_AI_KEY;
const MODEL = 'gemini-3-pro-image-preview';

function buildPrompt(recipe) {
  const ingredients = recipe.ingredients?.slice(0, 6).map(i => i.item).join(', ') || '';
  const category = recipe.category || '';
  
  let plating = '';
  if (category === 'stew' || recipe.title?.toLowerCase().includes('stew') || recipe.title?.toLowerCase().includes('broth')) {
    plating = 'Served in a deep traditional ceramic bowl alongside fluffy white basmati rice with golden saffron tahdig (crispy rice crust).';
  } else if (category === 'rice' || recipe.title?.toLowerCase().includes('polo') || recipe.title?.toLowerCase().includes('rice')) {
    plating = 'Served on a large oval platter, Persian style, showing the rice with toppings beautifully arranged.';
  } else if (category === 'kebab' || recipe.title?.toLowerCase().includes('kabab') || recipe.title?.toLowerCase().includes('kebab')) {
    plating = 'Served on a long flat plate with lavash bread, grilled tomatoes, raw onion slices, and saffron basmati rice with butter.';
  } else if (category === 'soup' || recipe.title?.toLowerCase().includes('soup') || recipe.title?.toLowerCase().includes('ash')) {
    plating = 'Served in a deep ceramic bowl with traditional garnishes (kashk, fried onions, mint) on top.';
  } else if (category === 'dessert' || recipe.title?.toLowerCase().includes('sweet') || recipe.title?.toLowerCase().includes('pudding') || recipe.title?.toLowerCase().includes('cookie')) {
    plating = 'Served on an ornate plate or in a traditional Persian serving dish with tea glasses nearby.';
  } else if (category === 'drink' || recipe.title?.toLowerCase().includes('drink') || recipe.slug?.includes('doogh')) {
    plating = 'Served in a tall glass with condensation visible on the glass, ice cubes, fresh mint garnish.';
  } else if (category === 'appetizer' || recipe.title?.toLowerCase().includes('dip') || recipe.title?.toLowerCase().includes('salad')) {
    plating = 'Served in a small rustic ceramic bowl with flatbread on the side.';
  } else {
    plating = 'Beautifully plated in traditional Persian serving ware.';
  }

  return `Generate a photorealistic image: A real photograph of authentic ${recipe.cuisine || 'Persian'} ${recipe.title}. This dish contains: ${ingredients}. ${recipe.description || ''}

PLATING: ${plating}

PHOTOGRAPHY: Shot in a warm home kitchen with natural window daylight. Canon EOS R5, 85mm f/1.4 lens, 45-degree angle, shallow depth of field, warm golden tones. Magazine-quality editorial food photography. Absolutely photorealistic, NOT an illustration. No text, no watermarks.`;
}

async function generateImage(prompt, retries = 2) {
  // P0.4 fix 2026-04-26 (Kimi F-kimi-01): use x-goog-api-key header instead of URL query param
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GOOGLE_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
        })
      });
      
      if (r.status === 429) {
        const wait = (i + 1) * 15;
        console.log(`  ⏳ Rate limited, waiting ${wait}s...`);
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }
      
      const j = await r.json();
      if (j.error) throw new Error(j.error.message);
      
      const imgPart = j.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imgPart) return Buffer.from(imgPart.inlineData.data, 'base64');
      throw new Error('No image in response');
    } catch (e) {
      if (i === retries) throw e;
      console.log(`  ⚠️ Retry ${i+1}: ${e.message.substring(0, 60)}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

async function uploadToStorage(buffer, slug) {
  const fileName = `${slug}-${Date.now()}.png`;
  
  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(fileName, buffer, { contentType: 'image/png', upsert: true });

  if (error) throw new Error(`Upload: ${error.message}`);

  const { data } = supabase.storage.from('recipe-images').getPublicUrl(fileName);
  return data.publicUrl;
}

async function main() {
  // Get ALL published recipes (overwrite old Flux images too)
  const { data: recipes, error } = await supabase
    .from('recipes_v2')
    .select('*')
    .eq('published', true)
    .order('created_at');

  if (error) { console.error('DB error:', error.message); process.exit(1); }

  console.log(`🎨 Generating ${recipes.length} images with Gemini 3 Pro Image\n`);

  let done = 0, failed = 0;
  for (const recipe of recipes) {
    console.log(`📸 ${recipe.title} (${recipe.slug})`);
    try {
      const prompt = buildPrompt(recipe);
      const buffer = await generateImage(prompt);
      console.log(`  Size: ${(buffer.length / 1024).toFixed(0)}KB`);
      
      const publicUrl = await uploadToStorage(buffer, recipe.slug);
      
      const { error: dbErr } = await supabase
        .from('recipes_v2')
        .update({
          image_url: publicUrl,
          image_source: 'ai-generated:gemini-3-pro-image',
          image_alt: `${recipe.title} - authentic ${recipe.cuisine || 'Persian'} dish`,
        })
        .eq('slug', recipe.slug);

      if (dbErr) throw new Error(`DB: ${dbErr.message}`);
      console.log(`  ✅ Done!`);
      done++;
    } catch (e) {
      console.error(`  ❌ ${e.message.substring(0, 100)}`);
      failed++;
    }
    await new Promise(r => setTimeout(r, 8000)); // 8s between for rate limit safety
  }

  console.log(`\n📊 Done: ${done} success, ${failed} failed out of ${recipes.length}`);
}

main();
