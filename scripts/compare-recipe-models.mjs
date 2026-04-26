/**
 * Compare recipe generation quality across models
 * Same prompt, same dish, 4 models → compare output
 */
import { writeFileSync } from 'fs';

const RECIPE_PROMPT = `Generate a complete recipe JSON for "Ghormeh Sabzi" (Persian Herb Stew).

You are a culinary expert specializing in Persian cuisine. Generate an ACCURATE, AUTHENTIC recipe.

Output ONLY valid JSON matching this exact schema:
{
  "title": "string - English title with Persian name in parentheses",
  "description": "string - 2-3 sentences, cultural context, what makes this dish special",
  "cuisine": "Persian",
  "category": "Stew",
  "prep_time_minutes": number,
  "cook_time_minutes": number,
  "servings": number,
  "difficulty": "easy|medium|hard",
  "calories_per_serving": number or null,
  "ingredients": [
    {"item": "string", "amount": "string", "unit": "string", "note": "string or omit"}
  ],
  "instructions": [
    {"step": number, "text": "string - detailed instruction", "time_minutes": number or omit}
  ],
  "tags": ["string"],
  "tips": "string - 2-3 practical cooking tips, culturally accurate",
  "storage_notes": "string - how to store leftovers",
  "serve_with": "string - traditional accompaniments"
}

CRITICAL RULES:
- Ingredients must have EXACT quantities (no "to taste" for main ingredients)
- Fenugreek should be MAX 2 tablespoons dried (common error: too much = bitter)
- Dried limes (limoo amani) are ESSENTIAL - do not skip
- Herbs must be fried until DARK (not just wilted)
- Include kidney beans
- Total cook time should be 2.5-3 hours (this is a slow stew)
- Cultural accuracy matters more than creativity`;

const models = [
  {
    name: 'GPT 5.4',
    provider: 'openai',
    model: 'gpt-5.4',
    apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  },
  {
    name: 'GPT 5.2',
    provider: 'openai',
    model: 'gpt-5.2',
    apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  },
  {
    name: 'Gemini 3.1 Pro',
    provider: 'google',
    model: 'gemini-3.1-pro-preview',
    apiKey: process.env.GOOGLE_AI_KEY,
  },
  {
    name: 'Gemini 3 Pro',
    provider: 'google',
    model: 'gemini-3-pro',
    apiKey: process.env.GOOGLE_AI_KEY,
  },
];

async function callOpenAI(model, apiKey, prompt) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return { text: j.choices[0].message.content, tokens: j.usage };
}

async function callGoogle(model, apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  const text = j.candidates[0].content.parts[0].text;
  const tokens = j.usageMetadata;
  return { text, tokens };
}

const results = {};

for (const m of models) {
  console.log(`\n🔄 Testing ${m.name} (${m.model})...`);
  const start = Date.now();
  try {
    const { text, tokens } = m.provider === 'openai'
      ? await callOpenAI(m.model, m.apiKey, RECIPE_PROMPT)
      : await callGoogle(m.model, m.apiKey, RECIPE_PROMPT);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const recipe = JSON.parse(text);

    // Quality checks
    const checks = {
      has_title: !!recipe.title,
      has_description: recipe.description?.length > 50,
      ingredient_count: recipe.ingredients?.length || 0,
      has_exact_quantities: recipe.ingredients?.every(i => i.amount && i.amount !== 'to taste') || false,
      has_dried_limes: recipe.ingredients?.some(i => i.item?.toLowerCase().includes('lime') || i.item?.toLowerCase().includes('limoo')) || false,
      has_fenugreek: recipe.ingredients?.some(i => i.item?.toLowerCase().includes('fenugreek')) || false,
      fenugreek_amount_ok: true, // check below
      has_kidney_beans: recipe.ingredients?.some(i => i.item?.toLowerCase().includes('bean') || i.item?.toLowerCase().includes('kidney')) || false,
      step_count: recipe.instructions?.length || 0,
      total_time: (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0),
      has_tips: !!recipe.tips,
      has_storage: !!recipe.storage_notes,
      has_serve_with: !!recipe.serve_with,
      has_tags: recipe.tags?.length > 0,
    };

    // Check fenugreek quantity
    const feng = recipe.ingredients?.find(i => i.item?.toLowerCase().includes('fenugreek'));
    if (feng) {
      const amt = parseFloat(feng.amount);
      if (amt > 2 && feng.unit?.toLowerCase().includes('tbsp')) checks.fenugreek_amount_ok = false;
      if (amt > 30 && feng.unit?.toLowerCase().includes('g')) checks.fenugreek_amount_ok = false;
    }

    const passCount = Object.values(checks).filter(v => v === true || (typeof v === 'number' && v > 0)).length;

    results[m.name] = {
      recipe,
      checks,
      passCount,
      totalChecks: Object.keys(checks).length,
      elapsed,
      tokens,
    };

    console.log(`✅ ${m.name}: ${passCount}/${Object.keys(checks).length} checks | ${elapsed}s | ${checks.ingredient_count} ingredients | ${checks.step_count} steps`);

  } catch (err) {
    console.error(`❌ ${m.name}: ${err.message}`);
    results[m.name] = { error: err.message };
  }
}

// Save full results
writeFileSync('C:/Users/Mehdi/Desktop/zaffaron-v2/scripts/recipe-model-comparison.json',
  JSON.stringify(results, null, 2));

// Print comparison table
console.log('\n\n=== COMPARISON TABLE ===\n');
console.log('Model'.padEnd(20), 'Score'.padEnd(8), 'Ingredients'.padEnd(13), 'Steps'.padEnd(8), 'Time'.padEnd(8), 'Limes'.padEnd(7), 'Beans'.padEnd(7), 'Fenugreek OK'.padEnd(14), 'Tips'.padEnd(6), 'Speed');
console.log('-'.repeat(110));
for (const [name, r] of Object.entries(results)) {
  if (r.error) {
    console.log(name.padEnd(20), `ERROR: ${r.error}`);
    continue;
  }
  const c = r.checks;
  console.log(
    name.padEnd(20),
    `${r.passCount}/${r.totalChecks}`.padEnd(8),
    String(c.ingredient_count).padEnd(13),
    String(c.step_count).padEnd(8),
    `${c.total_time}m`.padEnd(8),
    (c.has_dried_limes ? '✅' : '❌').padEnd(7),
    (c.has_kidney_beans ? '✅' : '❌').padEnd(7),
    (c.fenugreek_amount_ok ? '✅' : '❌').padEnd(14),
    (c.has_tips ? '✅' : '❌').padEnd(6),
    `${r.elapsed}s`
  );
}

console.log('\n=== INGREDIENT DETAILS ===\n');
for (const [name, r] of Object.entries(results)) {
  if (r.error) continue;
  console.log(`\n--- ${name} ---`);
  r.recipe.ingredients?.forEach(i => {
    console.log(`  ${i.amount} ${i.unit} ${i.item}${i.note ? ` (${i.note})` : ''}`);
  });
}
