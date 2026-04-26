// Generate 5 Iranian dishes with Gemini 3 Pro Image (Nano Banana Pro)
import { writeFileSync, mkdirSync } from 'fs';
mkdirSync('compare-images', { recursive: true });

const key = process.env.GOOGLE_AI_KEY;

const dishes = [
  {
    slug: 'ghormeh-sabzi',
    prompt: `Generate a photorealistic image: A real photograph of authentic Persian Ghormeh Sabzi (قورمه‌سبزی). The stew is DARK GREEN (almost black-green) from slow-cooked herbs (parsley, cilantro, fenugreek, chives). Chunks of tender lamb visible. RED kidney beans clearly visible. Small dried limes (limoo amani) in the stew. Oil separation on surface showing it's fully cooked. Served in a deep ceramic bowl. Next to it: fluffy long-grain basmati rice with golden saffron tahdig (crispy rice crust). Shot in a Persian home kitchen, natural window daylight, 45-degree angle, Canon EOS R5, 85mm f/1.4, warm tones. Real food blog photograph.`
  },
  {
    slug: 'fesenjan',
    prompt: `Generate a photorealistic image: A real photograph of authentic Persian Fesenjān (فسنجان). A thick, dark brown-mahogany stew made from ground walnuts and pomegranate molasses. Chicken pieces (bone-in thighs) partially submerged in the thick dark sauce. The sauce has a glossy, oily sheen. Garnished with pomegranate seeds (arils) and a few walnut pieces on top. Served in a traditional ceramic bowl. Next to it: fluffy white basmati rice with saffron. Shot in a Persian home kitchen, natural window daylight, 45-degree angle, Canon EOS R5, 85mm f/1.4, warm tones. Real food photograph.`
  },
  {
    slug: 'zereshk-polo',
    prompt: `Generate a photorealistic image: A real photograph of authentic Persian Zereshk Polo ba Morgh (زرشک پلو با مرغ). A large oval platter with fluffy saffron-yellow basmati rice covered with bright RED barberries (zereshk) scattered on top. Golden saffron chicken pieces arranged beside the rice. The barberries are jewel-like, small, bright red and slightly caramelized. Slivered pistachios scattered. A piece of golden tahdig (crispy rice) on the side. Shot in a Persian home, natural light, overhead angle, Canon EOS R5, warm golden tones. Real food blog photograph.`
  },
  {
    slug: 'joojeh-kabab',
    prompt: `Generate a photorealistic image: A real photograph of authentic Persian Joojeh Kabab (جوجه کباب). Bright saffron-yellow grilled chicken pieces on flat metal skewers, showing charred grill marks. The chicken is vibrant yellow-orange from saffron and turmeric marinade. Served on a long plate with lavash flatbread, grilled tomatoes (charred), raw white onion slices, and a mound of saffron basmati rice with butter pat melting on top. Fresh lemon wedge on the side. Sumac powder sprinkled. Shot at a Persian restaurant or home, natural light, 45-degree angle, Canon EOS R5, warm tones. Real food photograph.`
  },
  {
    slug: 'tahdig',
    prompt: `Generate a photorealistic image: A real photograph of authentic Persian Tahdig (ته‌دیگ). A perfectly golden, crispy rice crust flipped upside down on a round plate, showing its gorgeous golden-brown crackling surface. The tahdig is circular, like a rice cake, with a perfectly even golden crust. Some pieces broken off showing the contrast between crispy golden bottom and fluffy white rice on top. A few saffron strands visible. The plate is on a Persian-style tablecloth. Shot from directly overhead, natural light, Canon EOS R5, 50mm, sharp detail on the crispy texture. Real food photograph.`
  }
];

for (const dish of dishes) {
  console.log(`📸 Google: ${dish.slug}...`);
  try {
    // P0.4 fix 2026-04-26 (Kimi F-kimi-01): use x-goog-api-key header instead of URL query param
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: dish.prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
      })
    });
    const j = await r.json();
    if (j.error) { console.log(`  ❌ ${j.error.message?.substring(0, 100)}`); continue; }
    for (const p of j.candidates?.[0]?.content?.parts || []) {
      if (p.inlineData) {
        const buf = Buffer.from(p.inlineData.data, 'base64');
        writeFileSync(`compare-images/${dish.slug}-google.png`, buf);
        console.log(`  ✅ Saved (${(buf.length / 1024).toFixed(0)}KB)`);
      }
    }
  } catch (e) {
    console.error(`  ❌ ${e.message.substring(0, 100)}`);
  }
  await new Promise(r => setTimeout(r, 5000));
}
console.log('\n🏁 Done!');
