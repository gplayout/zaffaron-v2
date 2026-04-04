/**
 * Cuisine Registry — Single source of truth for all cuisines
 * 
 * Adding a new cuisine:
 * 1. Add entry here
 * 2. Generate recipes via pipeline with matching cuisine_slug
 * 3. Hub page auto-generates from this data
 */

export interface CuisineInfo {
  slug: string;
  name: string;
  emoji: string;
  region: string;
  description: string;
  /** Longer cultural context for hub page */
  cultural_context: string;
  /** Key ingredients that define this cuisine */
  pantry_essentials: string[];
  /** Sub-categories specific to this cuisine */
  sub_categories: string[];
  /** Related/adjacent cuisines (for cross-linking) */
  related_cuisines: string[];
  /** Expansion phase (0=founding, 1=neighbors, 2=saffron belt, 3=global) */
  phase: number;
  /** Is this cuisine currently active (has recipes)? */
  active: boolean;
}

export const CUISINES: CuisineInfo[] = [
  // ═══ Phase 0: Founding ═══
  {
    slug: "persian",
    name: "Persian",
    emoji: "🇮🇷",
    region: "Iran & Central Asia",
    description: "Discover the rich flavors of Persian cuisine — from aromatic herb stews to jeweled saffron rice, succulent kebabs, and traditional sweets.",
    cultural_context: "Persian cuisine is one of the world's oldest and most sophisticated culinary traditions, stretching back over 5,000 years. Built on a foundation of saffron, dried limes, barberries, and fresh herbs, it celebrates the balance of sweet, sour, and savory in every dish. From the elaborate rice dishes (polo) to the slow-cooked stews (khoresh), Persian cooking is an art form passed down through generations.",
    pantry_essentials: ["Saffron", "Dried limes (limoo amani)", "Barberries (zereshk)", "Advieh spice blend", "Rosewater", "Turmeric", "Basmati rice", "Fresh herbs (parsley, cilantro, dill, fenugreek)", "Verjuice (ab-ghooreh)", "Pomegranate molasses"],
    sub_categories: ["Rice Dishes (Polo)", "Stews (Khoresh)", "Kebabs", "Soups (Ash)", "Appetizers & Dips", "Breads (Nan)", "Sweets & Desserts", "Pickles (Torshi)"],
    related_cuisines: ["turkish", "afghan", "azerbaijani", "kurdish", "iraqi"],
    phase: 0,
    active: true,
  },

  // ═══ Phase 1: Neighbors ═══
  {
    slug: "turkish",
    name: "Turkish",
    emoji: "🇹🇷",
    region: "Turkey & Anatolia",
    description: "Explore Turkish cuisine — from smoky kebabs and flaky böreks to rich mezes, aromatic pilafs, and legendary baklava.",
    cultural_context: "Turkish cuisine sits at the crossroads of Mediterranean, Central Asian, and Middle Eastern traditions. Shaped by the Ottoman Empire's vast reach, it's a cuisine of incredible diversity — from the olive oil dishes of the Aegean coast to the fiery kebabs of southeastern Anatolia. Turkish breakfast (kahvaltı) is legendary, and the tradition of meze dining is an art of communal eating.",
    pantry_essentials: ["Sumac", "Aleppo pepper (pul biber)", "Pomegranate molasses", "Tahini", "Bulgur wheat", "Turkish pepper paste (biber salçası)", "Dried mint", "Nigella seeds", "Yogurt", "Pistachios"],
    sub_categories: ["Kebabs & Grills", "Mezes & Appetizers", "Böreks & Pastries", "Pilafs & Rice", "Soups (Çorba)", "Breakfast (Kahvaltı)", "Desserts & Sweets", "Salads"],
    related_cuisines: ["persian", "lebanese", "greek", "azerbaijani", "kurdish"],
    phase: 1,
    active: true,
  },
  {
    slug: "afghan",
    name: "Afghan",
    emoji: "🇦🇫",
    region: "Afghanistan",
    description: "Discover Afghan cuisine — hearty rice dishes, tender lamb, savory dumplings, and the legendary Kabuli Palaw.",
    cultural_context: "Afghan cuisine is the unsung hero of Central Asian cooking. Sharing deep roots with Persian and Indian traditions, it has a distinct identity built around generous rice dishes, slow-braised meats, and hand-crafted dumplings (mantu, aushak). Kabuli Palaw — fragrant rice with carrots, raisins, and lamb — is the national dish and a symbol of Afghan hospitality.",
    pantry_essentials: ["Cardamom", "Cumin", "Coriander", "Basmati rice", "Lamb/goat", "Dried fruits (raisins, apricots)", "Carrots", "Fresh cilantro", "Yogurt", "Green chutney"],
    sub_categories: ["Rice Dishes (Palaw)", "Dumplings (Mantu, Aushak)", "Kebabs", "Soups (Shorwa)", "Breads (Nan)", "Salads & Sides", "Desserts"],
    related_cuisines: ["persian", "indian", "uzbek", "tajik"],
    phase: 1,
    active: true,
  },
  {
    slug: "lebanese",
    name: "Lebanese",
    emoji: "🇱🇧",
    region: "Lebanon & Levant",
    description: "Explore Lebanese cuisine — from creamy hummus and smoky baba ganoush to fragrant rice, grilled meats, and fresh tabbouleh.",
    cultural_context: "Lebanese cuisine is the crown jewel of the Levant — a vibrant, fresh, and generous tradition built around meze culture. The Lebanese table is never about a single dish; it's a symphony of small plates, fresh herbs, olive oil, and grilled meats. From the seaside fish restaurants of Byblos to the mountain village kibbeh, Lebanese food celebrates ingredients in their purest form.",
    pantry_essentials: ["Tahini", "Sumac", "Za'atar", "Pomegranate molasses", "Olive oil", "Bulgur wheat", "Pine nuts", "Fresh mint", "Lemon", "Flatbread (pita/khubz)"],
    sub_categories: ["Meze & Dips", "Grills & Kebabs", "Rice & Grains", "Salads", "Soups & Stews", "Pastries & Pies", "Desserts", "Breakfast"],
    related_cuisines: ["syrian", "palestinian", "turkish", "persian", "greek"],
    phase: 1,
    active: true,
  },
  {
    slug: "azerbaijani",
    name: "Azerbaijani",
    emoji: "🇦🇿",
    region: "Azerbaijan & South Caucasus",
    description: "Discover Azerbaijani cuisine — saffron-infused pilafs, aromatic kebabs, herb-filled kutabs, and sweet tea traditions.",
    cultural_context: "Azerbaijani cuisine blends Persian, Turkish, and Caucasian traditions into something uniquely its own. Saffron-rich pilafs (plov) are the centerpiece, served alongside fragrant kebabs and fresh herb platters. The tradition of tea drinking and the art of making kutab (stuffed flatbreads) reflect a culture that values both hospitality and craftsmanship.",
    pantry_essentials: ["Saffron", "Sumac", "Fresh herbs (dill, cilantro, tarragon)", "Lamb", "Walnuts", "Pomegranate", "Dried fruits", "Yogurt", "Butter", "Chestnuts"],
    sub_categories: ["Pilafs (Plov)", "Kebabs", "Kutabs & Flatbreads", "Soups (Piti)", "Dolma", "Salads & Sides", "Desserts & Sweets"],
    related_cuisines: ["persian", "turkish", "georgian", "kurdish"],
    phase: 1,
    active: true,
  },

  // ═══ Phase 2: Saffron Belt ═══
  {
    slug: "indian",
    name: "Indian",
    emoji: "🇮🇳",
    region: "India & South Asia",
    description: "Explore the vast world of Indian cuisine — from creamy curries and fragrant biryanis to crispy dosas, tandoori dishes, and aromatic dal.",
    cultural_context: "Indian cuisine is not one cuisine but hundreds — a vast tapestry of regional traditions spanning the subcontinent. From the rich Mughlai flavors of the north to the coconut-laced dishes of Kerala, from Rajasthani desert cooking to Bengali fish preparations, India's food heritage is among the world's most diverse and deeply documented.",
    pantry_essentials: ["Garam masala", "Turmeric", "Cumin", "Coriander", "Cardamom", "Basmati rice", "Ghee", "Ginger-garlic paste", "Chili powder", "Mustard seeds"],
    sub_categories: ["Curries", "Biryanis & Rice", "Tandoori & Grills", "Dal & Lentils", "Breads (Naan, Roti)", "Snacks & Street Food", "Desserts (Mithai)", "Chutneys & Pickles"],
    related_cuisines: ["pakistani", "persian", "afghan", "bangladeshi", "sri-lankan"],
    phase: 2,
    active: true,
  },
  {
    slug: "moroccan",
    name: "Moroccan",
    emoji: "🇲🇦",
    region: "Morocco & North Africa",
    description: "Discover Moroccan cuisine — slow-cooked tagines, fluffy couscous, aromatic spice blends, and the art of Moroccan hospitality.",
    cultural_context: "Moroccan cuisine is a masterclass in patience and spice. The tagine — both the dish and the conical clay pot it's cooked in — is the heart of Moroccan cooking, slow-braising meats with dried fruits, preserved lemons, and complex spice blends like ras el hanout. Moroccan food reflects Arab, Berber, Andalusian, and French influences, creating one of the world's most layered culinary traditions.",
    pantry_essentials: ["Ras el hanout", "Preserved lemons", "Harissa", "Saffron", "Cumin", "Couscous", "Dates", "Almonds", "Olive oil", "Fresh cilantro and parsley"],
    sub_categories: ["Tagines", "Couscous", "Soups (Harira)", "Salads & Mezes", "Pastries (Pastilla, Msemen)", "Grills & Kebabs", "Desserts", "Teas & Drinks"],
    related_cuisines: ["tunisian", "algerian", "lebanese", "spanish", "persian"],
    phase: 2,
    active: true,
  },
  {
    slug: "greek",
    name: "Greek",
    emoji: "🇬🇷",
    region: "Greece & Mediterranean",
    description: "Explore Greek cuisine — fresh Mediterranean salads, grilled seafood, flaky spanakopita, and the simplicity of olive oil and lemon.",
    cultural_context: "Greek cuisine celebrates simplicity — the best olive oil, the freshest tomatoes, the finest feta. It's a Mediterranean tradition that values quality ingredients over complex technique. From the islands' seafood to the mainland's lamb dishes, Greek food is about gathering, sharing, and savoring life's simple pleasures.",
    pantry_essentials: ["Olive oil", "Feta cheese", "Lemon", "Oregano", "Honey", "Phyllo dough", "Yogurt", "Kalamata olives", "Garlic", "Fresh dill"],
    sub_categories: ["Salads & Mezes", "Grilled Meats & Seafood", "Pies (Pita)", "Soups & Stews", "Pasta & Rice", "Breads", "Desserts & Pastries"],
    related_cuisines: ["turkish", "lebanese", "italian", "mediterranean"],
    phase: 2,
    active: true,
  },

  // ═══ Phase 3: Global (not yet active) ═══
  {
    slug: "italian",
    name: "Italian",
    emoji: "🇮🇹",
    region: "Italy",
    description: "Explore Italian cuisine — from hand-made pasta and wood-fired pizza to rich risottos, fresh antipasti, and timeless desserts.",
    cultural_context: "Italian cuisine is built on a philosophy of simplicity and respect for ingredients. Each of Italy's 20 regions has its own distinct culinary identity, from the butter-rich dishes of Lombardy to the seafood of Sicily. The Italian kitchen doesn't hide behind complexity — it elevates the best ingredients with minimal intervention.",
    pantry_essentials: ["Olive oil", "San Marzano tomatoes", "Parmigiano-Reggiano", "Fresh basil", "Garlic", "Pasta (various shapes)", "Arborio rice", "Prosciutto", "Mozzarella", "Red wine vinegar"],
    sub_categories: ["Pasta", "Pizza", "Risotto", "Antipasti", "Soups", "Seafood", "Meat & Poultry", "Desserts"],
    related_cuisines: ["greek", "french", "spanish", "mediterranean"],
    phase: 3,
    active: false,
  },
  {
    slug: "mexican",
    name: "Mexican",
    emoji: "🇲🇽",
    region: "Mexico",
    description: "Discover Mexican cuisine — from smoky salsas and handmade tortillas to rich moles, fresh ceviches, and vibrant street food.",
    cultural_context: "Mexican cuisine is a UNESCO Intangible Cultural Heritage — and for good reason. It's one of the world's most complex culinary traditions, with roots in ancient Mesoamerican cooking blended with Spanish colonial influences. From the mole negro of Oaxaca to the seafood of Baja California, Mexican food is far more diverse than most people realize.",
    pantry_essentials: ["Dried chilies (ancho, guajillo, chipotle)", "Cumin", "Corn tortillas", "Limes", "Cilantro", "Avocado", "Black beans", "Tomatillos", "Queso fresco", "Epazote"],
    sub_categories: ["Tacos & Tortillas", "Salsas & Sauces", "Moles", "Soups (Pozole, Menudo)", "Rice & Beans", "Street Food", "Seafood", "Desserts"],
    related_cuisines: ["central-american", "tex-mex", "spanish", "peruvian"],
    phase: 3,
    active: false,
  },
];

/** Get all active cuisines */
export function getActiveCuisines(): CuisineInfo[] {
  return CUISINES.filter(c => c.active);
}

/** Get cuisine by slug */
export function getCuisine(slug: string): CuisineInfo | undefined {
  return CUISINES.find(c => c.slug === slug);
}

/** Get all cuisines for a given phase */
export function getCuisinesByPhase(phase: number): CuisineInfo[] {
  return CUISINES.filter(c => c.phase === phase);
}

/** Get all cuisine slugs (for sitemap, generateStaticParams, etc.) */
export function getAllCuisineSlugs(): string[] {
  return CUISINES.map(c => c.slug);
}
