export interface RecipeVariationSection {
  title: string;
  items: { heading: string; body: string }[];
}

export const RECIPE_VARIATIONS_BY_SLUG: Record<string, RecipeVariationSection[]> = {
  'authentic-persian-kabab-koobideh': [
    {
      title: 'Oven Method (No Grill)',
      items: [
        {
          heading: 'Best setup',
          body:
            'Use a preheated sheet pan and very high heat, then finish with a short broil for color. If you have metal skewers that fit in your oven, you can rest them on the edges of a roasting pan so heat circulates.',
        },
        {
          heading: 'How to bake',
          body:
            'Shape the koobideh mixture into long logs (or onto skewers). Place on a parchment-lined tray, bake at 475°F (245°C) until browned and mostly cooked through, then broil briefly to char the top. Flip once for even browning.',
        },
        {
          heading: 'Juiciness & binding tips',
          body:
            'Chill the shaped kebabs before baking so they hold their form. If the mix looks wet, squeeze onion juice harder and knead longer—cohesion matters more in the oven because there is no skewer grip from direct flame.',
        },
        {
          heading: 'Smoke / grill flavor shortcut (optional)',
          body:
            'For a smoky note, finish with a quick torch on the surface or serve with heavily charred tomatoes/peppers. (Avoid liquid smoke—easy to overdo.)',
        },
      ],
    },
  ],
};

export function getRecipeVariations(slug: string): RecipeVariationSection[] {
  return RECIPE_VARIATIONS_BY_SLUG[slug] || [];
}
