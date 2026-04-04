export interface TahdigScores {
  color: number;       // 0-10
  crispiness: number;  // 0-10
  evenness: number;    // 0-10
  shape: number;       // 0-10
  presentation: number; // 0-10
}

export interface TahdigResult {
  isTahdig: boolean;
  rejectReason?: string;
  scores: TahdigScores;
  overall: number;
  badge: { en: string; fa: string; emoji: string };
  commentary: { en: string; fa: string };
  tips: string[];
  criteria: { name: string; nameFa: string; score: number; note: string }[];
}

const WEIGHTS = {
  color: 0.25,
  crispiness: 0.25,
  evenness: 0.20,
  shape: 0.15,
  presentation: 0.15,
};

const BADGES: { min: number; en: string; fa: string; emoji: string }[] = [
  { min: 9.0, en: "Tahdig Royalty", fa: "سلطان تهدیگ", emoji: "👑" },
  { min: 8.0, en: "Golden Master", fa: "استاد طلایی", emoji: "🥇" },
  { min: 7.0, en: "Crispy Legend", fa: "افسانه ترد", emoji: "⭐" },
  { min: 6.0, en: "Solid Tahdig", fa: "تهدیگ قابل قبول", emoji: "🍚" },
  { min: 4.0, en: "Needs Practice", fa: "تمرین لازمه", emoji: "🔥" },
  { min: 0.0, en: "Burnt Offering", fa: "قربانی سوخته", emoji: "😅" },
];

export function computeOverall(scores: TahdigScores): number {
  const raw =
    scores.color * WEIGHTS.color +
    scores.crispiness * WEIGHTS.crispiness +
    scores.evenness * WEIGHTS.evenness +
    scores.shape * WEIGHTS.shape +
    scores.presentation * WEIGHTS.presentation;
  return Math.round(raw * 10) / 10;
}

export function getBadge(overall: number) {
  return BADGES.find((b) => overall >= b.min) || BADGES[BADGES.length - 1];
}

export const CRITERIA_NAMES: { key: keyof TahdigScores; en: string; fa: string }[] = [
  { key: "color", en: "Color", fa: "رنگ" },
  { key: "crispiness", en: "Crispiness", fa: "ترد بودن" },
  { key: "evenness", en: "Evenness", fa: "یکدستی" },
  { key: "shape", en: "Shape", fa: "شکل" },
  { key: "presentation", en: "Presentation", fa: "نمایش" },
];
