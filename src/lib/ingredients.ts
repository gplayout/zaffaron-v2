/**
 * Ingredient Encyclopedia — Registry
 * Single source of truth for all ingredient pages.
 */

export interface IngredientInfo {
  slug: string;
  name: string;
  /** Local names by language/culture — extensible for any future cuisine */
  localNames: Record<string, string>;
  emoji: string;
  category: "spice" | "grain" | "condiment" | "dairy" | "herb" | "nut" | "other";
  cuisines: string[]; // which cuisines use it heavily
  description: string;
  history: string;
  buyingGuide: string;
  storage: string;
  substitutes: Array<{ name: string; note: string }>;
  affiliateSearchTerm: string; // for Amazon/grocery links
  recipeCount?: number; // populated at build time
}

export const INGREDIENTS: IngredientInfo[] = [
  {
    slug: "saffron",
    name: "Saffron",
    localNames: {
      persian: "زعفران (Za'farān)",
      arabic: "الزعفران (Az-Za'farān)",
      hindi: "केसर (Kesar)",
      turkish: "Safran",
      azerbaijani: "Zəfəran",
      greek: "Κρόκος (Krókos)",
      moroccan: "الزعفران الحر (Za'fran l-Hor)",
      spanish: "Azafrán",
      italian: "Zafferano",
    },
    emoji: "🧡",
    category: "spice",
    cuisines: ["persian", "indian", "moroccan", "azerbaijani", "afghan"],
    description: "The world's most precious spice — hand-harvested crimson stigmas of Crocus sativus. Saffron gives dishes a luminous golden hue, a haunting floral-honey aroma, and a subtle bittersweet depth that no other ingredient can replicate.",
    history: "Saffron has been cultivated for over 3,500 years, with origins traced to Bronze Age Greece or Persia. Iran produces over 90% of the world's saffron, primarily from the Khorasan province. The spice was worth more than gold in medieval Europe and was used in royal Persian rice dishes (chelow), Indian biryanis, Moroccan tagines, and Spanish paella. The name comes from Arabic 'za'farān' (زعفران), meaning 'yellow.'",
    buyingGuide: "Look for **Grade I / Sargol or Negin** saffron — deep crimson threads with no yellow or white tips. Good saffron smells like honey and hay, never musty. Test: place a thread in warm water — real saffron slowly releases golden color over 10-15 minutes (fake saffron colors water immediately). Buy from reputable Iranian, Spanish, or Kashmiri sources. Price: genuine saffron costs $8-15 per gram — if it's cheaper, it's likely adulterated.",
    storage: "Store in an airtight container away from light and heat. Wrapped in foil inside a glass jar is ideal. Properly stored, saffron retains potency for 2-3 years. Never refrigerate (moisture damage). Grind only what you need — whole threads last longer than powder.",
    substitutes: [
      { name: "Saffron powder", note: "Use ¼ the amount of threads. Easier to find but often lower quality." },
      { name: "Turmeric + pinch of paprika", note: "Gives color but not the flavor. Only for visual approximation." },
      { name: "Safflower (substitute saffron)", note: "Gives color, zero flavor. Often sold as 'saffron' in markets — beware." },
    ],
    affiliateSearchTerm: "saffron threads premium grade",
  },
  {
    slug: "sumac",
    name: "Sumac",
    localNames: {
      persian: "سماق (Somāq)",
      arabic: "السماق (As-Summāq)",
      turkish: "Sumak",
      azerbaijani: "Sumaq",
      kurdish: "سوماخ (Sumakh)",
    },
    emoji: "🔴",
    category: "spice",
    cuisines: ["persian", "turkish", "lebanese", "azerbaijani"],
    description: "A deep burgundy-red spice made from ground dried sumac berries, delivering a bright, tangy, lemony sourness. Sumac is the secret weapon of Middle Eastern and Persian cooking — it adds acidity without liquid, making it perfect for dry rubs, salads, and grilled meats.",
    history: "Sumac (Rhus coriaria) has been used as a souring agent in the Mediterranean and Middle East for thousands of years — long before lemons arrived from Southeast Asia. Ancient Romans used it as a condiment the way we use lemon today. In Persian cuisine, it's sprinkled on kebabs and rice; in Lebanese cooking, it's essential in fattoush salad and za'atar blend; Turkish cooks scatter it over grilled meats and onion salads.",
    buyingGuide: "Buy whole berries or coarsely ground sumac from Middle Eastern grocery stores. Good sumac is **deep burgundy/maroon**, slightly moist, and intensely tart when tasted. Avoid pale, dry, or brownish sumac — it's old. Some commercial brands add salt; check ingredients for pure sumac. Iranian and Turkish sumac are considered the finest.",
    storage: "Store in an airtight container away from light. Keeps full potency for 6-12 months. After a year, it fades in both color and tartness. Refrigeration extends life slightly but isn't necessary.",
    substitutes: [
      { name: "Lemon zest + pinch of salt", note: "Closest flavor match. Use 1 tsp zest for 1 tbsp sumac." },
      { name: "Za'atar blend", note: "Contains sumac already. Good for sprinkling, not for recipes needing pure sourness." },
      { name: "Amchur (dried mango powder)", note: "Indian equivalent — tart, fruity, dry. Works well in rubs." },
    ],
    affiliateSearchTerm: "sumac spice ground pure",
  },
  {
    slug: "dried-limes",
    name: "Dried Limes (Limoo Amani)",
    localNames: {
      persian: "لیمو عمانی (Limoo Amani)",
      arabic: "لومي (Loomi)",
      iraqi: "نومي بصرة (Noomi Basra)",
    },
    emoji: "🟤",
    category: "spice",
    cuisines: ["persian", "iraqi", "afghan"],
    description: "Small, hard, blackened limes that have been sun-dried until all moisture evaporates, concentrating their flavor into an intense, complex sourness — earthy, smoky, fermented, and deeply citric. They are the soul of many Persian stews and soups.",
    history: "Dried limes originated in Oman (hence 'limoo Amani' — 'Omani lime') and traveled the Persian Gulf trade routes to become essential in Iranian, Iraqi, and Gulf cooking. They're made by boiling small limes in salt water, then sun-drying them for weeks until hard and dark. The drying process creates complex flavors impossible to replicate with fresh citrus — a fermented, almost umami-like sourness.",
    buyingGuide: "Available at Middle Eastern grocery stores. **Black dried limes** are most intense (fully fermented); **brown/tan ones** are milder and more citrusy. Choose ones that feel light and hollow — heavy ones may be moldy inside. Avoid any with visible mold or off smell. Also sold as 'limoo omani', 'loomi', or 'black lime.'",
    storage: "Store whole limes in an airtight container in a cool, dark place. They last 1-2 years easily. Ground dried lime loses potency faster — grind as needed. Pierce before adding to stews (or they may burst); remove before serving.",
    substitutes: [
      { name: "Lime juice + lime zest", note: "Adds sourness but misses the smoky, fermented depth. Use 2 tbsp juice per 1 dried lime." },
      { name: "Tamarind paste", note: "Closer in complexity. Use 1 tbsp per dried lime." },
      { name: "Amchur + lemon juice", note: "Combination gets closer to the earthy-sour profile." },
    ],
    affiliateSearchTerm: "dried limes persian limoo amani",
  },
  {
    slug: "pomegranate-molasses",
    name: "Pomegranate Molasses",
    localNames: {
      persian: "رب انار (Rob-e Anār)",
      arabic: "دبس الرمان (Dibs Rummān)",
      turkish: "Nar Ekşisi",
      azerbaijani: "Narsharab",
    },
    emoji: "🍷",
    category: "condiment",
    cuisines: ["persian", "turkish", "lebanese", "azerbaijani"],
    description: "A thick, syrupy reduction of pomegranate juice — intensely tart, slightly sweet, and deeply fruity. It adds a complex sweet-sour dimension to marinades, stews, salads, and glazes across Middle Eastern and Caucasian cuisines.",
    history: "Pomegranate has been cultivated in Iran for over 4,000 years, and pomegranate molasses (rob-e anar) is one of the oldest condiments in Persian cooking. It's essential in fesenjan stew, used as a kebab marinade (kabab torsh), drizzled over hummus in Lebanon, and added to muhammara in Turkey and Syria. The fruit itself symbolizes prosperity and fertility in many Middle Eastern cultures.",
    buyingGuide: "Look for bottles with **only one ingredient: pomegranate juice** (or 'pomegranate concentrate'). Avoid brands with added sugar, citric acid, or corn syrup — they lack the complex tartness of pure molasses. Good pomegranate molasses should be **very thick, dark ruby-brown**, and taste intensely sour with a sweet finish. Iranian and Lebanese brands are generally best quality.",
    storage: "Refrigerate after opening — lasts 6-12 months. Unopened bottles keep for 1-2 years at room temperature. If it crystallizes, warm gently in hot water.",
    substitutes: [
      { name: "Balsamic vinegar reduction + honey", note: "Similar sweet-sour profile. Mix 3:1 balsamic:honey and reduce by half." },
      { name: "Cranberry juice reduction", note: "Reduce unsweetened cranberry juice to syrup consistency. Close in tartness." },
      { name: "Tamarind paste + touch of sugar", note: "Different fruit, similar function in cooking." },
    ],
    affiliateSearchTerm: "pomegranate molasses pure no sugar",
  },
  {
    slug: "rose-water",
    name: "Rose Water",
    localNames: {
      persian: "گلاب (Golāb)",
      arabic: "ماء الورد (Mā' al-Ward)",
      hindi: "गुलाब जल (Gulāb Jal)",
      turkish: "Gül Suyu",
      moroccan: "ماء الزهر (Mā' az-Zahr)",
      french: "Eau de Rose",
    },
    emoji: "🌹",
    category: "condiment",
    cuisines: ["persian", "indian", "moroccan", "turkish", "lebanese"],
    description: "A fragrant distillation of fresh rose petals in water — delicate, floral, and unmistakably romantic. Rose water transforms desserts, drinks, and even some savory dishes with its haunting perfume.",
    history: "Iran is the world's largest producer of rose water, with the ancient city of Kashan producing the finest golab (گلاب) from Damask roses every spring during the Golab-Giri festival. Rose water has been central to Persian confections (faloodeh, bastani, sholeh zard) for over 2,500 years. It spread along the Silk Road to India (gulab jamun, lassi), Morocco (pastilla, mint tea), and Turkey (Turkish delight). The word 'julep' comes from the Persian 'golab.'",
    buyingGuide: "Buy **food-grade rose water** (not cosmetic grade). The best comes from **Kashan, Iran** or **Taif, Saudi Arabia**. It should smell like fresh roses, not synthetic perfume. Quality rose water has a subtle pink tint and is never overpowering. Start with small amounts — too much makes food taste soapy. Brands: Sadaf, Cortas, or any Iranian import.",
    storage: "Store in a cool, dark place. Lasts 1-2 years unopened. After opening, keep tightly sealed — the aroma fades with exposure to air. No refrigeration needed.",
    substitutes: [
      { name: "Rose extract", note: "Much more concentrated — use ¼ the amount." },
      { name: "Orange blossom water", note: "Different floral note but works in most dessert recipes." },
      { name: "Vanilla extract", note: "Not floral, but provides aromatic depth in desserts as a last resort." },
    ],
    affiliateSearchTerm: "rose water food grade persian",
  },

  // ═══ Batch 2: Spices & Grains ═══
  {
    slug: "turmeric",
    name: "Turmeric",
    localNames: {
      persian: "زردچوبه (Zardchoobeh)",
      hindi: "हल्दी (Haldi)",
      arabic: "كركم (Kurkum)",
      turkish: "Zerdeçal",
      moroccan: "خرقوم (Kharqoum)",
      indonesian: "Kunyit",
      thai: "ขมิ้น (Khamin)",
    },
    emoji: "💛",
    category: "spice",
    cuisines: ["persian", "indian", "moroccan", "afghan", "azerbaijani", "turkish", "lebanese", "greek"],
    description: "A vibrant golden-yellow root with an earthy, warm, slightly bitter flavor. Turmeric is the workhorse spice of Asian and Middle Eastern cooking — it colors rice, stews, and marinades while offering well-documented anti-inflammatory properties.",
    history: "Turmeric (Curcuma longa) has been used in South Asia for over 4,500 years — first as a dye, then as medicine, and finally as a culinary spice. It reached Persia via ancient trade routes and became essential in Persian stews (khoresh), where it forms the base flavor alongside sautéed onions. In India, turmeric is sacred — used in wedding ceremonies, Ayurvedic medicine, and daily cooking. The Persian word 'zardchoobeh' literally means 'yellow wood.'",
    buyingGuide: "Buy **whole turmeric root** for maximum freshness, or **ground turmeric** for convenience. Good ground turmeric should be **bright golden-orange**, not pale or brownish. For quality: smell it — fresh turmeric smells earthy and warm, never musty. Indian and Persian grocery stores typically offer better quality than supermarket brands. Store-bought is usually adequate; for premium dishes, use Alleppey turmeric (higher curcumin content, deeper color).",
    storage: "Ground: 2-3 years in an airtight container away from light. Fresh root: wrap in paper towel, refrigerate (2-3 weeks) or freeze (6 months). Warning: turmeric stains everything — use gloves when handling fresh root.",
    substitutes: [
      { name: "Saffron (tiny pinch)", note: "For color only, not flavor. Much more expensive." },
      { name: "Annatto powder", note: "Gives similar golden color with milder flavor." },
      { name: "Curry powder", note: "Contains turmeric. Use ½ the amount but adds other spices." },
    ],
    affiliateSearchTerm: "turmeric powder organic ground",
  },
  {
    slug: "basmati-rice",
    name: "Basmati Rice",
    localNames: {
      persian: "برنج باسماتی (Berenj-e Basmati)",
      hindi: "बासमती चावल (Basmati Chawal)",
      urdu: "باسمتی چاول",
      afghan: "برنج (Berenj)",
      arabic: "أرز بسمتي",
    },
    emoji: "🍚",
    category: "grain",
    cuisines: ["persian", "indian", "afghan", "azerbaijani"],
    description: "The king of rice — long, slender grains that elongate dramatically when cooked, releasing a distinctive nutty, popcorn-like aroma. Basmati is the only acceptable rice for Persian chelow, Indian biryani, and Afghan palaw.",
    history: "Basmati has been cultivated in the foothills of the Himalayas for thousands of years. The word 'basmati' comes from Sanskrit 'vasmati' meaning 'fragrant.' India and Pakistan produce nearly all the world's basmati. In Persian cooking, the quality of rice determines the quality of the entire meal — aged basmati (1-2 years old) is prized because it cooks drier and fluffier. The Iranian rice varieties Tarom and Sadri are closely related to basmati.",
    buyingGuide: "Look for **aged basmati** (1-2 years) — grains should be long, uniform, and translucent white with minimal broken pieces. **Indian brands:** Tilda, Royal, Daawat are reliable. **For Persian cooking:** extra-long grain is preferred. Always **soak before cooking** (30-60 minutes for Persian, 20-30 for Indian) — soaking prevents breakage and ensures even cooking. Avoid 'quick-cook' or 'easy-cook' varieties — they're par-boiled and won't produce proper tahdig.",
    storage: "Uncooked: indefinite shelf life in a cool, dry place (technically improves with age). Keep sealed to prevent moisture and insects. Cooked: refrigerate within 1 hour, use within 2 days, or freeze for 3 months.",
    substitutes: [
      { name: "Jasmine rice", note: "Slightly sticky and floral — works for Indian dishes, NOT for Persian chelow/tahdig." },
      { name: "Iranian Tarom/Sadri rice", note: "Premium alternative, considered superior to basmati by many Iranians. Harder to find outside Iran." },
      { name: "Long-grain white rice", note: "Passable but lacks basmati's aroma and elongation. Last resort." },
    ],
    affiliateSearchTerm: "basmati rice extra long grain aged",
  },
  {
    slug: "zaatar",
    name: "Za'atar",
    localNames: {
      arabic: "زعتر (Za'tar)",
      lebanese: "زعتر بلدي (Za'tar Baladi)",
      turkish: "Zahter",
      hebrew: "זעתר (Za'atar)",
      persian: "آویشن (Avishan)",
    },
    emoji: "🌿",
    category: "spice",
    cuisines: ["lebanese", "turkish", "persian"],
    description: "Both a wild herb (related to oregano/thyme) and a beloved spice blend — the blend typically combines dried za'atar herb, sumac, toasted sesame seeds, and salt. It's the taste of Lebanese breakfast, Turkish bread, and Levantine hospitality.",
    history: "Za'atar is one of the oldest herb blends in the world, mentioned in the Old Testament and used in ancient Egyptian medicine. In Lebanon, mothers spread za'atar on flatbread for children before school — believed to sharpen the mind. Every family and region has their own ratio. Palestinian za'atar is heavy on sumac; Syrian versions add more sesame; Jordanian blends include cumin. The fresh herb (Origanum syriacum) grows wild across the Levant's hillsides.",
    buyingGuide: "Buy from **Lebanese or Middle Eastern grocery stores** — supermarket versions are often stale. Good za'atar should be **greenish-brown** (not gray), fragrant, and slightly moist from the sesame oil. Taste it: it should be simultaneously herby, tangy (sumac), and nutty (sesame). For the freshest blend, buy components separately and mix: 2 parts dried za'atar herb, 1 part sumac, 1 part toasted sesame, ½ part salt.",
    storage: "Airtight container, cool and dark. The blend keeps 6-12 months; sesame seeds go rancid first. Fresh herb (if you find it): use within a week, or dry it yourself.",
    substitutes: [
      { name: "Dried oregano + dried thyme + sumac + sesame", note: "DIY approximation: 1 tsp each oregano and thyme, 1 tsp sumac, 2 tsp toasted sesame, pinch of salt." },
      { name: "Italian herb blend + lemon zest", note: "Very rough approximation — misses the sumac tartness." },
    ],
    affiliateSearchTerm: "zaatar spice blend authentic lebanese",
  },
  {
    slug: "ras-el-hanout",
    name: "Ras el Hanout",
    localNames: {
      moroccan: "رأس الحانوت (Ras el-Hanout)",
      arabic: "رأس الحانوت",
      french: "Ras el-Hanout",
    },
    emoji: "✨",
    category: "spice",
    cuisines: ["moroccan"],
    description: "The name means 'head of the shop' — the spice merchant's best blend. A complex, aromatic North African spice mixture that can contain 10 to 30+ ingredients, including cardamom, cinnamon, cloves, coriander, cumin, nutmeg, peppercorns, rose petals, and turmeric.",
    history: "Ras el Hanout is Morocco's signature spice blend, with every spice shop and family guarding their own recipe. Historically, it included exotic ingredients like Spanish fly (a supposed aphrodisiac) and hashish — modern versions focus on aromatic warmth. The blend reflects Morocco's position at the crossroads of Berber, Arab, Andalusian, and Sub-Saharan African trade routes. It's essential in tagines, couscous, and mrouzia (festive lamb).",
    buyingGuide: "The best comes from **Moroccan spice shops** (souks) or specialty importers. Good ras el hanout should smell **warm, floral, and complex** — not like any single spice. Color ranges from golden-brown to reddish depending on the blend. Avoid pre-packaged versions with filler ingredients like flour or excessive salt. Look for blends listing **15+ spices**. Premium blends include rose petals and lavender.",
    storage: "Airtight container, away from light. Loses potency faster than single spices due to volatile oils from many ingredients — use within 6 months for best results. Buy in small quantities.",
    substitutes: [
      { name: "Garam masala + pinch of cinnamon and rose petals", note: "Closest approximation — warm, complex, aromatic." },
      { name: "Baharat (Middle Eastern spice blend)", note: "Simpler but similar warmth. Add a pinch of cardamom and cinnamon." },
      { name: "DIY: equal parts cumin, coriander, cinnamon, cardamom, black pepper + half parts ginger, turmeric, nutmeg, cloves", note: "Quick 9-spice approximation." },
    ],
    affiliateSearchTerm: "ras el hanout moroccan spice blend",
  },
  {
    slug: "tahini",
    name: "Tahini",
    localNames: {
      arabic: "طحينة (Ṭaḥīnah)",
      persian: "ارده (Ardeh)",
      turkish: "Tahin",
      hebrew: "טחינה (Techina)",
      greek: "Ταχίνι (Tachíni)",
    },
    emoji: "🫘",
    category: "condiment",
    cuisines: ["lebanese", "turkish", "greek", "persian"],
    description: "A silky paste made from ground toasted (or raw) sesame seeds — rich, nutty, slightly bitter, and extraordinarily versatile. Tahini is the backbone of hummus, the soul of halva, and a favorite drizzle over everything from grilled meats to roasted vegetables.",
    history: "Tahini is one of the oldest condiments, dating back over 4,000 years to ancient Mesopotamia. The word comes from Arabic 'ṭaḥana' (to grind). It's fundamental to Levantine cuisine (hummus, baba ganoush, halva), Turkish cooking (tahin-pekmez, a tahini-grape molasses breakfast dip), and Greek baking. In Iran, the related 'ardeh' (a thicker, sometimes sweetened version) is a traditional confection from Isfahan.",
    buyingGuide: "Buy **100% sesame seeds, no additives**. **Hulled tahini** (most common) is milder and smoother; **unhulled** is more bitter and nutritious. Stir well before use — oil separation is normal and a sign of quality (no emulsifiers). Best brands: Soom, Al Arz, Al Kanater. Middle Eastern grocery store brands are usually superior and cheaper than health-food store versions. Color should be **pale golden-beige**, not dark brown.",
    storage: "Unopened: pantry for 1 year. Opened: refrigerate for 6+ months (cold makes it thicker — bring to room temp before using). Stir in the oil that separates on top. Never discard the oil.",
    substitutes: [
      { name: "Sunflower seed butter", note: "Closest texture and nuttiness for nut-free needs. Slightly sweeter." },
      { name: "Cashew butter", note: "Creamy and mild. Works in hummus but changes the flavor profile." },
      { name: "Peanut butter (natural, unsweetened)", note: "Very different flavor but works in a pinch for sauces/dressings." },
    ],
    affiliateSearchTerm: "tahini paste pure sesame",
  },
];

/** Get all ingredients */
export function getAllIngredients(): IngredientInfo[] {
  return INGREDIENTS;
}

/** Get ingredient by slug */
export function getIngredient(slug: string): IngredientInfo | undefined {
  return INGREDIENTS.find(i => i.slug === slug);
}

/** Get all ingredient slugs */
export function getAllIngredientSlugs(): string[] {
  return INGREDIENTS.map(i => i.slug);
}
