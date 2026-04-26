/**
 * 5-Gate Validator — Reusable module for RecipeOps pipeline
 * Returns { passed: boolean, issues: Array<{gate, field, msg}> }
 */

const FARSI_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

function farsiOutsideParens(text) {
  if (!text) return false;
  const stripped = text.replace(/\([^)]*\)/g, '');
  return FARSI_RE.test(stripped);
}

export function validateRecipe(r) {
  const issues = [];

  // ═══ GATE 1: Schema ═══
  if (!r.title || r.title.trim().length < 3)
    issues.push({ gate: 1, field: 'title', msg: 'Missing or too short' });
  if (!r.slug || r.slug.trim().length < 3)
    issues.push({ gate: 1, field: 'slug', msg: 'Missing or too short' });
  if (!r.description || r.description.trim().length < 20)
    issues.push({ gate: 1, field: 'description', msg: 'Too short (<20)' });
  if (!Array.isArray(r.ingredients) || r.ingredients.length === 0)
    issues.push({ gate: 1, field: 'ingredients', msg: 'Empty' });
  if (!Array.isArray(r.instructions) || r.instructions.length === 0)
    issues.push({ gate: 1, field: 'instructions', msg: 'Empty' });
  if (typeof r.prep_time_minutes !== 'number' || r.prep_time_minutes < 0)
    issues.push({ gate: 1, field: 'prep_time_minutes', msg: 'Invalid' });
  if (typeof r.cook_time_minutes !== 'number' || r.cook_time_minutes < 0)
    issues.push({ gate: 1, field: 'cook_time_minutes', msg: 'Invalid' });
  if (typeof r.servings !== 'number' || r.servings < 1 || r.servings > 100)
    issues.push({ gate: 1, field: 'servings', msg: 'Invalid' });
  if (!['easy', 'medium', 'hard', 'expert'].includes(r.difficulty))
    issues.push({ gate: 1, field: 'difficulty', msg: `Invalid: ${r.difficulty}` });

  // Ingredient structure
  if (Array.isArray(r.ingredients)) {
    r.ingredients.forEach((ing, i) => {
      if (!ing.item || !ing.item.trim())
        issues.push({ gate: 1, field: `ingredients[${i}].item`, msg: 'Missing' });
      if (typeof ing.step === 'number') {} // step is for instructions
    });
  }

  // Instruction structure
  if (Array.isArray(r.instructions)) {
    r.instructions.forEach((inst, i) => {
      if (!inst.text || inst.text.trim().length < 10)
        issues.push({ gate: 1, field: `instructions[${i}].text`, msg: 'Too short' });
      if (typeof inst.step !== 'number')
        issues.push({ gate: 1, field: `instructions[${i}].step`, msg: 'Missing step number' });
    });
  }

  // ═══ GATE 2: Language Purity ═══
  const engFields = {
    description: r.description,
    seo_title: r.seo_title,
    seo_description: r.seo_description,
    cultural_significance: r.cultural_significance,
    image_alt: r.image_alt,
    storage_notes: r.storage_notes,
    make_ahead: r.make_ahead,
  };
  for (const [field, val] of Object.entries(engFields)) {
    if (val && FARSI_RE.test(val))
      issues.push({ gate: 2, field, msg: 'Contains Farsi/Arabic' });
  }
  if (r.title && farsiOutsideParens(r.title))
    issues.push({ gate: 2, field: 'title', msg: 'Farsi outside parentheses' });

  if (Array.isArray(r.instructions)) {
    r.instructions.forEach((inst, i) => {
      if (inst.text && FARSI_RE.test(inst.text))
        issues.push({ gate: 2, field: `instructions[${i}]`, msg: 'Farsi in instruction' });
    });
  }
  if (Array.isArray(r.ingredients)) {
    r.ingredients.forEach((ing, i) => {
      if (ing.item && FARSI_RE.test(ing.item))
        issues.push({ gate: 2, field: `ingredients[${i}]`, msg: 'Farsi in ingredient' });
    });
  }

  // ═══ GATE 3: Content Quality ═══
  if (Array.isArray(r.instructions) && r.instructions.length > 0) {
    const last = r.instructions[r.instructions.length - 1];
    if (last?.text) {
      const t = last.text.trim();
      if (t.length > 20) {
        // F-kimi-8 (2026-04-26): broaden truncation detection.
        // Pre-fix: only allowed [.!?)"’] OR endsWith('minutes'). Falsely flagged
        // valid sentences ending with 'seconds', 'serve', 'enjoy', etc., causing
        // review queue bloat. Now: explicit truncation signals (ellipsis, trailing
        // dash) override valid endings; valid endings include broader cooking
        // instruction word allowlist.
        const TRUNCATION_RE = /\u2026$|\.{3,}$|---$|--$|-$/; // …, ..., ---, --, -
        const ENDING_WORDS = ['minutes','seconds','hours','serve','serving','served','ready','enjoy','done','hot','warm','cool','cold','top','side','guests','taste','immediately','plated','rest','set','through','tender'];
        const tLower = t.toLowerCase();
        const endsWithTruncationSignal = TRUNCATION_RE.test(t);
        const endsWithValidPunct = /[.!?)"\u2019]$/.test(t);
        const endsWithValidWord = ENDING_WORDS.some(w => tLower.endsWith(w));
        if (endsWithTruncationSignal || (!endsWithValidPunct && !endsWithValidWord)) {
          issues.push({ gate: 3, field: 'instructions', msg: 'Last step may be truncated' });
        }
      }
    }
  }
  const totalTime = (r.prep_time_minutes || 0) + (r.cook_time_minutes || 0);
  if (totalTime === 0) issues.push({ gate: 3, field: 'time', msg: 'Zero total time' });
  if (totalTime > 1440) issues.push({ gate: 3, field: 'time', msg: 'Unrealistic (>24h)' });
  if (r.nutrition_per_serving?.calories && (r.nutrition_per_serving.calories < 10 || r.nutrition_per_serving.calories > 5000))
    issues.push({ gate: 3, field: 'nutrition', msg: 'Unrealistic calories' });

  // ═══ GATE 4: Image ═══
  if (!r.image_url || !r.image_url.trim())
    issues.push({ gate: 4, field: 'image_url', msg: 'Missing' });
  if (!r.image_alt || r.image_alt.trim().length < 5)
    issues.push({ gate: 4, field: 'image_alt', msg: 'Missing or too short' });

  // ═══ GATE 5: Publish Integrity ═══
  if (r.published && !r.image_url)
    issues.push({ gate: 5, field: 'published', msg: 'Published without image' });
  if (!r.seo_title || r.seo_title.trim().length < 10)
    issues.push({ gate: 5, field: 'seo_title', msg: 'Missing or too short' });
  if (!r.seo_description || r.seo_description.trim().length < 30)
    issues.push({ gate: 5, field: 'seo_description', msg: 'Missing or too short' });
  if (r.seo_title && r.seo_title.length > 70)
    issues.push({ gate: 5, field: 'seo_title', msg: 'Too long' });
  if (r.seo_description && r.seo_description.length > 170)
    issues.push({ gate: 5, field: 'seo_description', msg: 'Too long' });
  if (!r.category_slug) issues.push({ gate: 5, field: 'category_slug', msg: 'Missing' });
  if (!r.cuisine_slug) issues.push({ gate: 5, field: 'cuisine_slug', msg: 'Missing' });

  return {
    passed: issues.length === 0,
    issues,
    gatesFailed: [...new Set(issues.map(i => i.gate))],
  };
}
