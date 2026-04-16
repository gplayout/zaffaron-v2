/**
 * Heritage Card Generator
 * Creates a beautiful OG-sized image (1200x630) for vault recipe sharing.
 * Uses sharp + SVG for server-side rendering (no browser needed).
 */
import sharp from "sharp";

interface CardData {
  title: string;
  attributionName?: string;
  cuisine?: string;
  ingredientCount: number;
  stepCount: number;
}

// Cuisine → emoji flag map
const CUISINE_FLAGS: Record<string, string> = {
  persian: "🇮🇷",
  turkish: "🇹🇷",
  afghan: "🇦🇫",
  lebanese: "🇱🇧",
  azerbaijani: "🇦🇿",
  indian: "🇮🇳",
  moroccan: "🇲🇦",
  greek: "🇬🇷",
  italian: "🇮🇹",
  mexican: "🇲🇽",
  japanese: "🇯🇵",
  korean: "🇰🇷",
  chinese: "🇨🇳",
  thai: "🇹🇭",
  ethiopian: "🇪🇹",
  brazilian: "🇧🇷",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + "…";
}

export async function generateHeritageCard(data: CardData): Promise<Buffer> {
  const title = escapeXml(truncate(data.title, 60));
  const attribution = data.attributionName
    ? escapeXml(truncate(data.attributionName, 40))
    : "";
  const cuisine = data.cuisine?.toLowerCase() || "";
  const flag = CUISINE_FLAGS[cuisine] || "🍽️";

  const cuisineLabel = cuisine ? cuisine.charAt(0).toUpperCase() + cuisine.slice(1) : '';

  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#451a03;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1c1917;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0c0a09;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#d97706;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="glow" cx="20%" cy="40%" r="60%">
      <stop offset="0%" style="stop-color:#78350f;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#1c1917;stop-opacity:0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  
  <!-- Accent bar top -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>
  
  <!-- Decorative circles -->
  <circle cx="1050" cy="120" r="250" fill="#292524" opacity="0.3"/>
  <circle cx="1080" cy="150" r="180" fill="#292524" opacity="0.2"/>
  <circle cx="120" cy="550" r="120" fill="#292524" opacity="0.2"/>
  
  <!-- Small saffron strands (decorative) -->
  <line x1="950" y1="80" x2="980" y2="140" stroke="#d97706" stroke-width="2" opacity="0.4"/>
  <line x1="970" y1="70" x2="1000" y2="130" stroke="#f59e0b" stroke-width="2" opacity="0.3"/>
  <line x1="990" y1="90" x2="1020" y2="150" stroke="#d97706" stroke-width="1.5" opacity="0.35"/>
  
  <!-- Chef hat icon (simplified) -->
  <g transform="translate(80, 60)" opacity="0.6">
    <path d="M30 48a2 2 0 0 0 2-2v-10c0-1-.6-1.7-1.5-2.1a8 8 0 0 0-4.3-15.2 10 10 0 0 0-18.4 0 8 8 0 0 0-4.3 15.2c-.9.4-1.5 1.1-1.5 2V46a2 2 0 0 0 2 2Z" fill="#d97706" stroke="none"/>
    <line x1="6" y1="38" x2="30" y2="38" stroke="#451a03" stroke-width="2"/>
  </g>
  
  <!-- Heart icon -->
  <g transform="translate(130, 70)" opacity="0.5">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#d97706" stroke="none" transform="scale(1.2)"/>
  </g>
  
  <!-- Category/Cuisine badge -->
  ${cuisineLabel ? `
  <rect x="80" y="140" width="${cuisineLabel.length * 14 + 40}" height="36" rx="18" fill="#d97706" opacity="0.2"/>
  <text x="100" y="164" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#d97706" letter-spacing="1">
    ${escapeXml(cuisineLabel.toUpperCase())} CUISINE
  </text>
  ` : ''}
  
  <!-- Title -->
  <text x="80" y="260" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#fafaf9" letter-spacing="-1">
    ${title}
  </text>
  
  <!-- Attribution -->
  ${attribution ? `
  <text x="80" y="330" font-family="Georgia, serif" font-size="30" fill="#d97706" font-style="italic">
    Recipe by ${attribution}
  </text>
  ` : ''}
  
  <!-- Divider line -->
  <line x1="80" y1="370" x2="400" y2="370" stroke="#d97706" stroke-width="2" opacity="0.4"/>
  
  <!-- Stats -->
  <text x="80" y="420" font-family="system-ui, sans-serif" font-size="22" fill="#a8a29e">
    ${data.ingredientCount} ingredients · ${data.stepCount} steps
  </text>
  
  <!-- Family heritage message -->
  <text x="80" y="500" font-family="Georgia, serif" font-size="20" fill="#78716c" font-style="italic">
    A family recipe, preserved forever
  </text>
  
  <!-- Branding -->
  <text x="80" y="580" font-family="system-ui, sans-serif" font-size="16" fill="#57534e" letter-spacing="2">
    ZAFFARON FAMILY VAULT
  </text>
  <text x="1120" y="580" font-family="system-ui, sans-serif" font-size="16" fill="#57534e" text-anchor="end">
    zaffaron.com/vault
  </text>
  
  <!-- Accent bar bottom -->
  <rect x="0" y="622" width="1200" height="8" fill="url(#accent)"/>
</svg>`;

  const buffer = await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .jpeg({ quality: 85 })
    .toBuffer();

  return buffer;
}
