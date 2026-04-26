// Phase B: Generate images for unpublished recipes and publish them
// Uses Gemini 3 Pro Image (locked model)
// Usage: node phase-b-images.mjs [--limit=N] [--dry-run]
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://givukaorkjkksslrzuum.supabase.co',
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GOOGLE_KEY = process.env.GOOGLE_AI_KEY;
const MODEL = 'gemini-3-pro-image-preview';

const args = process.argv.slice(2);
const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '999');
const dryRun = args.includes('--dry-run');

function buildPrompt(recipe) {
  const ingredients = recipe.ingredients?.slice(0, 6).map(i => i.item).join(', ') || '';
  const cat = recipe.category_slug || recipe.category || '';
  const cuisine = recipe.cuisine_slug || recipe.cuisine || 'Persian';
  
  let plating = '';
  const t = (recipe.title || '').toLowerCase();
  if (['stew'].includes(cat) || t.includes('stew') || t.includes('broth')) {
    plating = 'Served in a deep traditional ceramic bowl alongside fluffy white basmati rice with golden saffron tahdig.';
  } else if (['rice'].includes(cat) || t.includes('polo') || t.includes('rice')) {
    plating = 'Served on a large oval platter, Persian style, rice with toppings beautifully arranged.';
  } else if (['kebab'].includes(cat) || t.includes('kabab') || t.includes('kebab')) {
    plating = 'Served on a long flat plate with lavash bread, grilled tomatoes, raw onion, and saffron rice.';
  } else if (['soup'].includes(cat) || t.includes('soup') || t.includes('ash')) {
    plating = 'Served in a deep ceramic bowl with traditional garnishes on top.';
  } else if (['dessert','sweet'].includes(cat) || t.includes('sweet') || t.includes('pudding') || t.includes('cookie') || t.includes('cake')) {
    plating = 'Served on an ornate plate with tea glasses nearby.';
  } else if (['drink'].includes(cat) || t.includes('drink') || t.includes('doogh') || t.includes('sharbat')) {
    plating = 'Served in a tall glass with condensation, ice cubes, fresh mint garnish.';
  } else if (['appetizer','salad'].includes(cat) || t.includes('dip') || t.includes('salad')) {
    plating = 'Served in a small rustic ceramic bowl with flatbread on the side.';
  } else if (['bread','breakfast'].includes(cat)) {
    plating = 'Served on a wooden board with traditional accompaniments.';
  } else {
    plating = 'Beautifully plated in traditional serving ware.';
  }

  return `Generate a photorealistic image: A real photograph of authentic ${cuisine} ${recipe.title}. This dish contains: ${ingredients}. ${recipe.description || ''}

PLATING: ${plating}

PHOTOGRAPHY: Shot in a warm home kitchen with natural window daylight. Canon EOS R5, 85mm f/1.4 lens, 45-degree angle, shallow depth of field, warm golden tones. Magazine-quality editorial food photography. Absolutely photorealistic, NOT an illustration. No text, no watermarks.`;
}

async function generateImage(prompt, retries = 5) {
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
        const wait = (i + 1) * 30;
        console.log(`  ⏳ Rate limited, waiting ${wait}s...`);
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }
      
      const j = await r.json();
      if (j.error) throw new Error(j.error.message);
      
      const parts = j.candidates?.[0]?.content?.parts;
      if (!parts || !parts.length) throw new Error('No parts in response (likely rate limited)');
      const imgPart = parts.find(p => p.inlineData);
      if (imgPart) return Buffer.from(imgPart.inlineData.data, 'base64');
      throw new Error('No image in response parts');
    } catch (e) {
      if (i === retries) throw e;
      console.log(`  ⚠️ Retry ${i+1}: ${e.message.substring(0, 80)}`);
      await new Promise(r => setTimeout(r, 5000 * (i + 1)));
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
  if (!GOOGLE_KEY) { console.error('❌ Set GOOGLE_AI_KEY env'); process.exit(1); }
  
  // Get unpublished recipes that have text but no image
  const { data: recipes, error } = await supabase
    .from('recipes_v2')
    .select('*')
    .eq('published', false)
    .is('image_url', null)
    .order('created_at')
    .limit(limit);

  if (error) { console.error('❌ DB error:', error.message); process.exit(1); }
  if (!recipes.length) { console.log('✅ No unpublished recipes without images!'); return; }

  console.log(`🎨 Phase B: ${recipes.length} recipes need images\n`);
  if (dryRun) { console.log('DRY RUN — not generating'); return; }

  let done = 0, failed = 0, totalCost = 0;
  const failures = [];

  for (const recipe of recipes) {
    const num = done + failed + 1;
    console.log(`[${num}/${recipes.length}] 📸 ${recipe.title}`);
    try {
      const prompt = buildPrompt(recipe);
      const buffer = await generateImage(prompt);
      console.log(`  ✓ Image: ${(buffer.length / 1024).toFixed(0)}KB`);
      
      const publicUrl = await uploadToStorage(buffer, recipe.slug);
      
      const { error: dbErr } = await supabase
        .from('recipes_v2')
        .update({
          image_url: publicUrl,
          image_source: 'ai-generated:gemini-3-pro-image',
          image_alt: `${recipe.title} - authentic ${recipe.cuisine_slug || recipe.cuisine || 'Persian'} dish`,
          published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', recipe.id);

      if (dbErr) throw new Error(`DB update: ${dbErr.message}`);
      
      done++;
      // Rough cost: ~$0.04/image for Gemini 3 Pro Image
      totalCost += 0.04;
      console.log(`  ✅ Published! (${done} done, ${failed} failed)`);
      
      // Pacing: 8s between requests to avoid rate limits
      await new Promise(r => setTimeout(r, 8000));
    } catch (e) {
      failed++;
      failures.push({ slug: recipe.slug, error: e.message });
      console.log(`  ❌ Failed: ${e.message.substring(0, 80)}`);
      // Longer wait after failure
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Done: ${done} | ❌ Failed: ${failed} | 💰 Est. cost: $${totalCost.toFixed(2)}`);
  console.log(`📊 Total published: ${417 + done}`);
  if (failures.length) {
    console.log(`\n❌ Failures:`);
    failures.forEach(f => console.log(`  - ${f.slug}: ${f.error}`));
  }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
