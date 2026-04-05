export interface RecipeFaqItem {
  question: string;
  answer: string;
}

/**
 * Hand-curated FAQs for high-priority recipes (SEO / People Also Ask).
 *
 * Rule: Only add FAQs we can answer confidently from the recipe itself.
 * Keep answers concise (2-4 sentences) and practical.
 */
export const RECIPE_FAQ_BY_SLUG: Record<string, RecipeFaqItem[]> = {
  // Top priority: currently striking distance
  'authentic-persian-kabab-koobideh': [
    {
      question: 'Why does koobideh fall off the skewer?',
      answer:
        'The mixture is usually too wet or not kneaded enough. Squeeze excess juice from grated onion, chill the mixture well, and knead until it becomes sticky and cohesive so it grips the skewer.',
    },
    {
      question: 'Can I make kabab koobideh in the oven?',
      answer:
        'Yes. Shape the kebab mixture onto skewers or as long logs on a lined baking tray, then bake under high heat and finish with broil to char. You will not get the exact charcoal flavor, but you can get juicy, well-browned kebabs.',
    },
    {
      question: 'What meat ratio works best for koobideh?',
      answer:
        'A classic approach is a mix of beef and lamb with enough fat to stay juicy. If you use very lean meat, the kebabs can dry out and may not bind as well.',
    },
    {
      question: 'What should I serve with koobideh?',
      answer:
        'The classic pairing is saffron rice (chelo), grilled tomatoes and peppers, and a simple salad like Shirazi. Flatbread, sumac, and torshi (pickles) also work great.',
    },
  ],

  // Alternative koobideh variants (keep light for now)
  'chelo-kebab-koobideh': [
    {
      question: 'Is Chelo Kebab Koobideh different from Koobideh?',
      answer:
        'Koobideh refers to the minced-meat kebab itself. Chelo Kebab Koobideh is the full plate: koobideh served with Persian steamed rice (chelo) and typical sides like grilled tomatoes.',
    },
  ],
};

export function getRecipeFaq(slug: string): RecipeFaqItem[] {
  return RECIPE_FAQ_BY_SLUG[slug] || [];
}
