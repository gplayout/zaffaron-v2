import { writeFileSync, mkdirSync } from 'fs';
mkdirSync('compare-images', { recursive: true });

const key = process.env.GOOGLE_AI_KEY;

const dishes = [
  { slug: 'fesenjan', prompt: `A real photograph of authentic Persian Fesenjān (فسنجان). A thick, dark brown-mahogany stew made from ground walnuts and pomegranate molasses. Chicken pieces (bone-in thighs) partially submerged in the thick dark sauce. Glossy, oily sheen. Garnished with pomegranate seeds and walnut pieces. Served in a traditional ceramic bowl next to fluffy white basmati rice with saffron. Shot in a Persian home kitchen, natural window daylight, 45-degree angle, Canon EOS R5, 85mm f/1.4, warm tones. Real food photograph.` },
  { slug: 'zereshk-polo', prompt: `A real photograph of authentic Persian Zereshk Polo ba Morgh (زرشک پلو با مرغ). A large oval platter with fluffy saffron-yellow basmati rice covered with bright RED barberries (zereshk) scattered on top. Golden saffron chicken pieces arranged beside the rice. Slivered pistachios scattered. A piece of golden tahdig on the side. Shot in a Persian home, natural light, overhead angle, Canon EOS R5, warm golden tones. Real food blog photograph.` },
  { slug: 'joojeh-kabab', prompt: `A real photograph of authentic Persian Joojeh Kabab (جوجه کباب). Bright saffron-yellow grilled chicken pieces on flat metal skewers with charred grill marks. Served on a long plate with lavash flatbread, grilled tomatoes, raw white onion slices, and saffron basmati rice with butter. Fresh lemon wedge, sumac sprinkled. Shot at a Persian restaurant, natural light, 45-degree angle, Canon EOS R5, warm tones. Real food photograph.` },
  { slug: 'tahdig', prompt: `A real photograph of authentic Persian Tahdig (ته‌دیگ). A perfectly golden, crispy rice crust flipped upside down on a round plate, showing gorgeous golden-brown crackling surface. Circular rice cake with perfectly even golden crust. Some pieces broken off showing contrast between crispy golden bottom and fluffy white rice. Saffron strands visible. Shot from overhead, natural light, Canon EOS R5, sharp detail on crispy texture. Real food photograph.` }
];

const url = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-001:predict?key=' + key;

for (const dish of dishes) {
  console.log(`📸 Imagen 4 Ultra: ${dish.slug}...`);
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instances: [{ prompt: dish.prompt }], parameters: { sampleCount: 1, aspectRatio: '16:9' } }) });
    const j = await r.json();
    if (j.error) { console.log(`  ❌ ${j.error.message?.substring(0, 100)}`); continue; }
    if (j.predictions?.[0]?.bytesBase64Encoded) {
      const buf = Buffer.from(j.predictions[0].bytesBase64Encoded, 'base64');
      writeFileSync(`compare-images/${dish.slug}-imagen4ultra.png`, buf);
      console.log(`  ✅ Saved (${(buf.length / 1024).toFixed(0)}KB)`);
    }
  } catch (e) { console.error(`  ❌ ${e.message.substring(0, 100)}`); }
  await new Promise(r => setTimeout(r, 5000));
}
console.log('\n🏁 Done!');
