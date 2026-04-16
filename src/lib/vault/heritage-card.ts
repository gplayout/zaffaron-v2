/**
 * Heritage Card Generator v3
 * Beautiful OG-sized image (1200x630) for vault recipe sharing.
 * Uses sharp + SVG — warm, handmade feel, no food photos needed.
 */
// Heritage card uses sharp for SVG→JPEG rendering.
// NOTE: This file is NOT imported in any API route or server action.
// It's only used by standalone scripts to avoid Vercel bundler issues.
import sharp from "sharp";

interface CardData {
  title: string;
  attributionName?: string;
  cuisine?: string;
  ingredientCount: number;
  stepCount: number;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function truncate(s: string, maxLen: number): string {
  return s.length <= maxLen ? s : s.slice(0, maxLen - 1) + "…";
}

export async function generateHeritageCard(data: CardData): Promise<Buffer> {
  const title = escapeXml(truncate(data.title, 55));
  const attribution = data.attributionName ? escapeXml(truncate(data.attributionName, 40)) : "";
  const cuisine = data.cuisine ? data.cuisine.charAt(0).toUpperCase() + data.cuisine.slice(1) : "";

  const svg = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Warm vignette background -->
    <radialGradient id="bg" cx="35%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#2b1b16"/>
      <stop offset="55%" stop-color="#1b1412"/>
      <stop offset="100%" stop-color="#0f0c0b"/>
    </radialGradient>
    <!-- Warm light glow -->
    <radialGradient id="glow" cx="30%" cy="25%" r="55%">
      <stop offset="0%" stop-color="rgba(255,196,140,0.22)"/>
      <stop offset="100%" stop-color="rgba(255,196,140,0)"/>
    </radialGradient>
    <!-- Accent gradient -->
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <!-- Linen texture -->
    <pattern id="linen" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="transparent"/>
      <path d="M0 1H6 M0 4H6 M1 0V6 M4 0V6" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <!-- Wobble filter for handmade feel -->
    <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="1" seed="3"/>
      <feDisplacementMap in="SourceGraphic" scale="2"/>
    </filter>
  </defs>

  <!-- Background layers -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#linen)" opacity="0.5"/>

  <!-- Accent bars -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>
  <rect x="0" y="622" width="1200" height="8" fill="url(#accent)"/>

  <!-- Recipe card frame (handmade feel) -->
  <g transform="translate(60,55)">
    <rect x="0" y="0" width="1080" height="520" rx="24"
          fill="rgba(255,248,235,0.04)" stroke="rgba(255,236,210,0.25)"
          stroke-width="2.5" filter="url(#wobble)"/>
    <rect x="16" y="16" width="1048" height="488" rx="18"
          fill="none" stroke="rgba(255,236,210,0.12)" stroke-width="1.5"
          stroke-dasharray="6 10"/>
  </g>

  <!-- Kitchen doodles (corners) -->
  <g opacity="0.15" fill="none" stroke="#ffd7b0" stroke-width="3" stroke-linecap="round">
    <!-- Heart (top-right) -->
    <path d="M1080 70 C1080 55,1095 45,1105 55 C1115 45,1130 55,1130 70 C1130 90,1105 105,1105 105 C1105 105,1080 90,1080 70Z" fill="#ffd7b0"/>
    <!-- Spoon (bottom-left) -->
    <ellipse cx="130" cy="530" rx="15" ry="10"/>
    <line x1="145" y1="530" x2="190" y2="560"/>
  </g>

  <!-- Cuisine badge -->
  ${cuisine ? `
  <rect x="100" y="120" width="${cuisine.length * 12 + 50}" height="32" rx="16" fill="rgba(217,119,6,0.2)"/>
  <text x="125" y="141" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="#d97706" letter-spacing="1.5">
    ${escapeXml(cuisine.toUpperCase())} CUISINE
  </text>
  ` : ""}

  <!-- Title -->
  <text x="100" y="230" font-family="Georgia,serif" font-size="48" font-weight="bold" fill="#fef3e2" letter-spacing="-0.5">
    ${title}
  </text>

  <!-- Attribution -->
  ${attribution ? `
  <text x="100" y="290" font-family="Georgia,serif" font-size="26" fill="#d97706" font-style="italic">
    Recipe by ${attribution}
  </text>
  ` : ""}

  <!-- Divider -->
  <line x1="100" y1="325" x2="380" y2="325" stroke="#d97706" stroke-width="1.5" opacity="0.4"/>

  <!-- Stats -->
  <text x="100" y="375" font-family="system-ui,sans-serif" font-size="20" fill="#a8a29e">
    ${data.ingredientCount} ingredients · ${data.stepCount} steps
  </text>

  <!-- Heritage message -->
  <text x="100" y="445" font-family="Georgia,serif" font-size="18" fill="#78716c" font-style="italic">
    A family recipe, preserved forever ♡
  </text>

  <!-- Branding -->
  <text x="100" y="540" font-family="system-ui,sans-serif" font-size="14" fill="#57534e" letter-spacing="2">
    ZAFFARON FAMILY VAULT
  </text>
  <text x="1100" y="540" font-family="system-ui,sans-serif" font-size="14" fill="#57534e" text-anchor="end">
    zaffaron.com/vault
  </text>
</svg>`;

  return sharp(Buffer.from(svg)).resize(1200, 630).jpeg({ quality: 90 }).toBuffer();
}
