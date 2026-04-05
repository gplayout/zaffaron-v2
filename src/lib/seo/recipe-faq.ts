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
  'chelo-goosht-semnani': [
    {
      question: 'What is Chelo Goosht?',
      answer:
        'Chelo Goosht is a traditional Persian dish of tender braised lamb served with fluffy steamed rice (chelo), often finished with saffron and paired with crisp tahdig. This Semnani version is known for its warm spices and rich, comforting braise.',
    },
    {
      question: 'What cut of lamb is best for Chelo Goosht?',
      answer:
        'Bone-in, collagen-rich cuts work best for a silky braise—lamb neck or shank are ideal. They stay juicy through long cooking and create a deep, gelatinous sauce that tastes incredible with rice.',
    },
    {
      question: 'Can I make Chelo Goosht ahead of time?',
      answer:
        'Yes—braises actually taste better the next day. Make the lamb and sauce ahead, chill, then gently reheat; cook the rice fresh for the best texture.',
    },
    {
      question: 'How do I prevent dry or tough lamb?',
      answer:
        'Keep the heat low and steady, and cook until the meat is truly tender—rushing the braise at high heat can tighten the fibers. If the pot looks dry, add a little water or stock to maintain a gentle simmer.',
    },
  ],

  'esnak-holandi-chicken-toast-sandwich': [
    {
      question: 'What is Esnak Holandi?',
      answer:
        'Esnak Holandi is an Iranian street-food style toasted sandwich—crispy on the outside with a warm, creamy filling (often chicken and potatoes) and melty cheese. It is usually pressed in a sandwich maker for a sealed, golden crust.',
    },
    {
      question: 'Can I make esnak without a sandwich press?',
      answer:
        'Yes. Use a skillet or grill pan and press the sandwich with a heavy pan or spatula. Toast on medium heat so the filling heats through before the bread over-browns.',
    },
    {
      question: 'What cheese works best for esnak?',
      answer:
        'A good melting cheese is key—Gouda, mozzarella, or a mild cheddar work well. If you want a more authentic deli-style stretch, mix a melty cheese with a small amount of creamier cheese.',
    },
    {
      question: 'How do I keep the filling from leaking out?',
      answer:
        'Don’t overfill, and leave a small border around the edges. Press and toast long enough for the bread to seal; slightly thicker slices of bread also help.',
    },
  ],

  'samboseh-sabzi-persian-herb-samosas': [
    {
      question: 'What is Samboseh Sabzi?',
      answer:
        'Samboseh Sabzi is a Persian-style samosa filled with aromatic herbs (often with leeks/green onions) and spices, then fried until crisp. It’s a popular street snack, especially in southern Iran.',
    },
    {
      question: 'Can I bake samboseh instead of frying?',
      answer:
        'Yes—brush with oil and bake until deep golden, flipping once for even color. It won’t be exactly like fried samboseh, but it can still be crisp and delicious.',
    },
    {
      question: 'How do I keep samboseh crispy?',
      answer:
        'Make sure the oil is hot enough before frying and avoid overcrowding the pan. Drain on a rack (not paper towels) so steam doesn’t soften the crust.',
    },
    {
      question: 'What can I serve with samboseh?',
      answer:
        'A bright dipping sauce is perfect—tamarind sauce, lemony yogurt, or a spicy herb chutney. It also pairs well with pickles and fresh herbs.',
    },
  ],

  'fondou-ye-gojeh-farangi': [
    {
      question: 'What is Fondou-ye Gojeh Farangi?',
      answer:
        'Fondou-ye Gojeh Farangi is a Persian-style tomato fondue: tomatoes slowly cooked down with butter and aromatics until silky and concentrated. It’s rich, savory, and meant to be scooped with bread or served alongside simple sides.',
    },
    {
      question: 'How do I make tomato fondue thicker?',
      answer:
        'Cook it uncovered longer so water evaporates, and keep the heat low to prevent scorching. Using ripe tomatoes (or a mix of fresh plus a little tomato paste) also helps deepen body and flavor.',
    },
    {
      question: 'Can I make it ahead?',
      answer:
        'Yes. It reheats well—warm gently over low heat and add a small splash of water if it’s too thick after chilling.',
    },
    {
      question: 'What should I serve with it?',
      answer:
        'Crusty bread or flatbread is classic. It also works as a warm side for eggs, grilled chicken, or a rice plate when you want a tomato-forward sauce.',
    },
  ],

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
