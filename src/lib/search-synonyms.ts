/**
 * Food search synonym groups.
 * When a user searches for ANY term in a group, we expand the query to include ALL terms.
 * This ensures "kabob", "kabab", "kebab", "kebob" all return the same comprehensive results.
 */
const SYNONYM_GROUPS: string[][] = [
  // Grilled meat variants
  ["kabab", "kabob", "kebab", "kebob", "kabeb"],
  // Specific kebab types
  ["koobideh", "kubideh", "koubideh", "kobideh"],
  ["joojeh", "jujeh", "jouje"],
  ["chenjeh", "chanje", "changeh"],
  // Rice dishes
  ["polo", "polow", "pilaf", "pilav", "palaw", "pulao"],
  ["tahdig", "tadig", "tah dig", "ta dig"],
  ["tahchin", "tachin", "tah chin"],
  ["biryani", "biriyani", "beriani"],
  ["chelow", "chelo", "chelou"],
  // Meatballs
  ["kofte", "kufte", "kofteh", "koofteh", "kofta", "koftah", "kufteh"],
  // Stews
  ["khoresht", "khoresh", "khoreshe", "khorest", "khoreshte"],
  ["ghormeh", "gormeh", "qormeh", "ghorme", "qorme"],
  ["fesenjan", "fesenjaan", "fesenjon", "fesenjoon"],
  // Soups
  ["ash", "aash", "ashe"],
  // Bread
  ["naan", "nan", "noon"],
  ["lavash", "lavosh", "lavas"],
  ["sangak", "sangag"],
  // Dips/sides
  ["hummus", "houmous", "humus", "hommos"],
  ["falafel", "felafel"],
  ["baba ganoush", "baba ghanoush", "baba ganouj"],
  ["tzatziki", "cacik", "cacık"],
  ["dolma", "dolmeh", "dolmah"],
  ["kuku", "kookoo", "kukoo"],
  // Desserts
  ["baklava", "baklawa", "baghlavah", "baqlava"],
  ["halva", "halvah", "halwa"],
  ["sholeh", "shole", "sholezard"],
  ["bastani", "bastoni"],
  // Ingredients
  ["saffron", "zaffaron", "zaferan", "za'faran"],
  ["sumac", "sumak", "somagh"],
  ["kashk", "kask"],
  ["barberry", "zereshk"],
  ["pomegranate", "anar", "anaar"],
  ["yogurt", "yoghurt", "mast"],
  // Cuisines
  ["persian", "iranian"],
  ["turkish", "turkiye"],
  ["lebanese", "levantine"],
  ["moroccan", "maghreb"],
];

// Build lookup map: term → all synonyms in its group
const synonymMap = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  const lower = group.map((t) => t.toLowerCase());
  for (const term of lower) {
    synonymMap.set(term, lower);
  }
}

/**
 * Expand a search query by replacing known food terms with OR-joined synonym groups.
 * Returns the expanded query suitable for FTS `|` (OR) syntax.
 *
 * Example: "chicken kabob" → "chicken (kabab | kabob | kebab | kebob | kabeb)"
 */
export function expandSynonyms(query: string): string {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const expanded: string[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    if (seen.has(word)) continue;
    seen.add(word);

    const group = synonymMap.get(word);
    if (group && group.length > 1) {
      // Mark all synonyms as seen to avoid double-expanding
      for (const syn of group) seen.add(syn);
      // Join with OR for FTS
      expanded.push(`(${group.join(" | ")})`);
    } else {
      expanded.push(word);
    }
  }

  return expanded.join(" & ");
}

/**
 * Get all synonym variants for a single term.
 * Returns the group if found, otherwise [term] itself.
 */
export function getSynonyms(term: string): string[] {
  return synonymMap.get(term.toLowerCase()) || [term.toLowerCase()];
}
