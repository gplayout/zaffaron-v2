# Tahdig Rater — Design Document
**Version:** 1.0 | **Date:** 2026-04-03

## 🎯 Goal
Viral growth tool: user uploads tahdig photo → AI rates it → shareable score card → friends try it too → viral loop

## 🧠 What Makes This GREAT (not just OK)

**Just OK:** Upload → number → share button
**GREAT:**
1. Beautiful animated score reveal (suspense → drumroll → score)
2. Witty AI commentary in English + Persian ("تهدیگ طلایی! مامانت افتخار می‌کنه!")
3. 5 specific criteria with visual bars (not just one number)
4. Title/badge system ("The Golden Master", "Crispy Legend", "Needs More Saffron")
5. Shareable card with photo + scores + badge + branding
6. "Rate your tahdig" CTA on every shared card → viral loop
7. Mobile-first (most users will photograph from phone)

## 📐 Architecture

### Pages
```
/tahdig              → Main page (SSR shell + client interactivity)
/tahdig/api/rate     → No — use Server Action instead (simpler)
```

### Flow
```
[Landing]  →  [Upload/Camera]  →  [Analyzing...]  →  [Score Reveal]  →  [Share]
   │              │                     │                  │               │
   │         drag+drop or          animated dots      5 criteria      shareable
   │         camera capture        "AI is judging     bars animate    PNG card
   │         + instant preview     your tahdig..."    in sequence     + social btns
   │                                                                     │
   │                                                                  [viral loop]
   └─── SEO landing text ────────────────────────────────────────────────┘
```

### Score Criteria (5 axes, each 0-10)
1. **Color** (رنگ) — How golden/saffron-colored? Burned? Pale?
2. **Crispiness** (ترد بودن) — Does it look crispy? Visible crust?
3. **Evenness** (یکدستی) — Uniform thickness? Even browning?
4. **Shape** (شکل) — Clean circle/form? Clean flip?
5. **Presentation** (نمایش) — Plating, garnish, overall beauty

**Overall = weighted average**: Color×0.25 + Crispy×0.25 + Even×0.20 + Shape×0.15 + Presentation×0.15

### Badge System
| Score | Badge EN | Badge FA |
|---|---|---|
| 9.0-10.0 | 👑 Tahdig Royalty | سلطان تهدیگ |
| 8.0-8.9 | 🥇 Golden Master | استاد طلایی |
| 7.0-7.9 | ⭐ Crispy Legend | افسانه ترد |
| 6.0-6.9 | 🍚 Solid Tahdig | تهدیگ قابل قبول |
| 4.0-5.9 | 🔥 Needs Practice | تمرین لازمه |
| 0.0-3.9 | 😅 Burnt Offering | قربانی سوخته |

### AI Prompt Strategy
- Use **Gemini 2.0 Flash** (cheap, fast, good vision)
- Structured JSON output
- First: verify it's actually tahdig (reject non-tahdig with funny message)
- Then: rate 5 criteria with brief reasoning
- Then: witty commentary in EN + FA
- Then: 3 specific tips to improve

### Share Card Design
```
┌─────────────────────────────┐
│  [Photo thumbnail]          │
│                             │
│  ⭐ 8.5 / 10               │
│  "Crispy Legend"            │
│                             │
│  Color      ████████░░ 8.0  │
│  Crispiness █████████░ 9.0  │
│  Evenness   ███████░░░ 7.0  │
│  Shape      █████████░ 9.0  │
│  Present.   ████████░░ 8.0  │
│                             │
│  "تهدیگت عالیه! فقط یکم    │
│   بیشتر زعفرون بزن"        │
│                             │
│  🍚 zaffaron.com/tahdig     │
│  Rate YOUR tahdig →         │
└─────────────────────────────┘
```

### Tech Stack
- **Upload:** `<input type="file" accept="image/*" capture="environment">` (opens camera on mobile)
- **Preview:** Client-side FileReader → img preview
- **Analysis:** Server Action → Gemini 2.0 Flash Vision
- **Score animation:** CSS keyframes + staggered reveal
- **Share card:** html-to-image library (dom-to-image-more or @vercel/og)
- **Social share:** Web Share API (mobile) + copy link + direct share URLs
- **Rate limit:** 10 requests/hour per IP via headers

### File Structure
```
src/app/tahdig/
├── page.tsx              ← Landing + Upload + Results (main page)
├── actions.ts            ← Server action: Gemini Vision analysis
├── components/
│   ├── TahdigUploader.tsx    ← Drag+drop / camera upload
│   ├── TahdigAnalyzing.tsx   ← Loading animation
│   ├── TahdigResult.tsx      ← Score display with animations
│   ├── TahdigShareCard.tsx   ← Shareable card (for screenshot/download)
│   └── TahdigShareButtons.tsx ← Social share buttons
├── lib/
│   ├── scoring.ts            ← Badge logic, weighted average
│   └── prompts.ts            ← Gemini prompt templates
└── layout.tsx                ← SEO metadata
```

### Rate Limiting
- Server action checks `x-forwarded-for` header
- Simple in-memory Map with TTL (resets on deploy, acceptable for viral tool)
- 10 rates per hour per IP
- Show "Wait X minutes" message if exceeded

### SEO
- Title: "Tahdig Rater — How Good Is Your Tahdig? | Zaffaron"
- Description: "Upload your tahdig photo and let AI rate it. Get scores on color, crispiness, shape, and more. Share your results!"
- OG image: pre-made hero image of a perfect tahdig with "Rate Your Tahdig" overlay
- Schema: WebApplication

### Privacy
- Photos are NOT stored — sent to Gemini, scored, discarded
- No user tracking beyond rate limiting
- Clear privacy note on page

## 🚫 What NOT to Build (v1)
- No leaderboard (v2)
- No user accounts required
- No photo storage/gallery
- No history
- No payments
These can all come later if it takes off.

## ⏱️ Estimated Timeline
- Design doc: ✅ (this)
- Server action + Gemini prompt: 30 min
- Upload component: 20 min
- Score result + animation: 40 min
- Share card generation: 30 min
- Share buttons: 15 min
- SEO + landing copy: 15 min
- Testing + polish: 30 min
- **Total: ~3 hours**
